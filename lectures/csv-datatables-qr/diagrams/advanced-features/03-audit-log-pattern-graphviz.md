# Audit Log Pattern - Capturing Old Data (Graphviz)

## Purpose
Emphasizes the critical "Get OLD data FIRST" pattern that students frequently forget when implementing audit logging for UPDATE and DELETE operations.

## Rendering
**VS Code:** Install "Graphviz Preview" extension  
**Online:** Copy code to [dreampuf.github.io/GraphvizOnline](https://dreampuf.github.io/GraphvizOnline)  
**CLI:** `dot -Tpng 03-audit-log-pattern-graphviz.md -o audit-log.png`

## Diagram

```dot
digraph AuditLogPattern {
  rankdir=LR;
  node [shape=box, style="rounded,filled", fontname="Arial", fontsize=11];
  edge [fontname="Arial", fontsize=10];
  
  // Request
  request [label="POST /products/:id/edit\n(Manager edits price:\n35 → 40)", shape=oval, fillcolor="#E0F7FA"];
  
  // CRITICAL STEP 1
  get_old [label="1. Get OLD data\nBEFORE update\n\nconst old = db.prepare(\n  'SELECT * FROM products\n   WHERE id = ?'\n).get(req.params.id);\n\nold = {id:5, name:'Skyflakes',\n      price:35, stock:100}", fillcolor="#FF6B6B", fontcolor="white", style="filled,bold", penwidth=4];
  
  // Step 2
  update_db [label="2. Update database\n\ndb.prepare(\n  'UPDATE products\n   SET price = ?\n   WHERE id = ?'\n).run(req.body.price,\n      req.params.id);\n\n(Price now 40 in DB)", fillcolor="#87CEEB"];
  
  // Step 3
  log_audit [label="3. Log audit entry\n\nlogAudit(\n  db,\n  userId: 3,\n  action: 'UPDATE',\n  table: 'products',\n  recordId: 5,\n  oldData: {price: 35},\n  newData: {price: 40},\n  ip: '192.168.1.10'\n);", fillcolor="#4ECDC4"];
  
  // Insert audit
  insert_audit [label="INSERT INTO audit_log\n(user_id, action, table_name,\n record_id, old_data, new_data,\n ip_address, created_at)\nVALUES\n(3, 'UPDATE', 'products', 5,\n '{\"price\":35}',\n '{\"price\":40}',\n '192.168.1.10',\n '2025-11-11 14:20:00')", fillcolor="#90EE90"];
  
  // Flash and redirect
  flash_redirect [label="4. Flash success\n   & redirect\n\nreq.flash('success',\n  'Price updated!');\nres.redirect('/products');", fillcolor="#90EE90"];
  
  // What happens if you forget step 1
  wrong_way [label="❌ WRONG WAY:\nSkipping step 1", shape=octagon, fillcolor="#FFB6C1", style="filled,bold"];
  
  update_first [label="Update database first\n(without getting old data)", fillcolor="#FFB6C1"];
  
  try_get_old [label="Try to get old data\n(but it's already changed!)", fillcolor="#FFB6C1"];
  
  lost_data [label="Old data LOST FOREVER\n\nAudit log shows:\nold_data: {price: 40}\nnew_data: {price: 40}\n\n(Both same! Useless!)", fillcolor="#FF6B6B", fontcolor="white", style="filled,bold"];
  
  // Flow - Correct way
  request -> get_old [label="  Correct\n  approach", color="#4CAF50", penwidth=2];
  get_old -> update_db [color="#4CAF50", penwidth=2];
  update_db -> log_audit [color="#4CAF50", penwidth=2];
  log_audit -> insert_audit [color="#4CAF50", penwidth=2];
  insert_audit -> flash_redirect [color="#4CAF50", penwidth=2];
  
  // Flow - Wrong way
  request -> wrong_way [label="  Common\n  mistake", color="#D32F2F", penwidth=2, style=dashed];
  wrong_way -> update_first [color="#D32F2F", penwidth=2, style=dashed];
  update_first -> try_get_old [color="#D32F2F", penwidth=2, style=dashed];
  try_get_old -> lost_data [color="#D32F2F", penwidth=2, style=dashed];
  
  // Emphasis box
  emphasis [label="⚠️ CRITICAL RULE ⚠️\n\nALWAYS get OLD data\nBEFORE modifying database!\n\nOrder matters:\n1. SELECT (get old)\n2. UPDATE/DELETE\n3. Log audit (old + new)", shape=box, fillcolor="#FFD700", style="filled,bold", penwidth=3];
  
  get_old -> emphasis [style=invis];
  
  // Subgraphs
  subgraph cluster_correct {
    label="✅ Correct Pattern (Preserves History)";
    style=filled;
    color="#E8F5E9";
    {get_old; update_db; log_audit; insert_audit; flash_redirect;}
  }
  
  subgraph cluster_wrong {
    label="❌ Wrong Pattern (Loses History)";
    style=filled;
    color="#FFEBEE";
    {wrong_way; update_first; try_get_old; lost_data;}
  }
}
```

## Key Insights

1. **Order is CRITICAL:** Get old data → Update DB → Log audit (never reorder!)

2. **Why "old data first" matters:**
   - Once you UPDATE, the old value is gone from database
   - SELECT after UPDATE returns the NEW value
   - Audit log becomes useless (old = new)

3. **Visual emphasis:**
   - Red box with thick border = Critical step (get old data)
   - Green arrows = Correct flow
   - Red dashed arrows = Wrong flow (common mistake)

4. **Three audit patterns:**
   - **CREATE:** No old data (null), capture new data
   - **UPDATE:** Capture old AND new data
   - **DELETE:** Capture old data, no new data (null)

## Code Mapping

### ✅ CORRECT: UPDATE with Audit Log

```javascript
app.post('/products/:id/edit', requireAdmin, (req, res) => {
  // Step 1: Get OLD data FIRST (before any changes)
  const oldData = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  
  if (!oldData) {
    req.flash('error', 'Product not found');
    return res.redirect('/products');
  }
  
  // Step 2: Update database
  db.prepare('UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?').run(
    req.body.name,
    req.body.price,
    req.body.stock,
    req.params.id
  );
  
  // Step 3: Log audit with old AND new data
  logAudit(
    db,
    res.locals.user.id,      // WHO changed it
    'UPDATE',                // WHAT action
    'products',              // WHICH table
    req.params.id,           // WHICH record
    {                        // OLD values (preserved!)
      name: oldData.name,
      price: oldData.price,
      stock: oldData.stock
    },
    {                        // NEW values
      name: req.body.name,
      price: req.body.price,
      stock: req.body.stock
    },
    req.ip                   // FROM where
  );
  
  req.flash('success', 'Product updated successfully!');
  res.redirect('/products');
});
```

### ✅ CORRECT: DELETE with Audit Log

```javascript
app.post('/products/:id/delete', requireAdmin, (req, res) => {
  // Step 1: Get OLD data FIRST (preserve before deletion!)
  const oldData = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  
  if (!oldData) {
    req.flash('error', 'Product not found');
    return res.redirect('/products');
  }
  
  // Step 2: Delete from database
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  
  // Step 3: Log audit with old data (new data is null - record deleted)
  logAudit(
    db,
    res.locals.user.id,
    'DELETE',
    'products',
    req.params.id,
    {                        // OLD values (preserved for recovery!)
      name: oldData.name,
      price: oldData.price,
      stock: oldData.stock
    },
    null,                    // NEW values = null (record gone)
    req.ip
  );
  
  req.flash('success', `Product "${oldData.name}" deleted`);
  res.redirect('/products');
});
```

### ✅ CORRECT: CREATE with Audit Log

```javascript
app.post('/products', requireAdmin, (req, res) => {
  // Step 1: Insert into database
  const result = db.prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)').run(
    req.body.name,
    req.body.price,
    req.body.stock
  );
  
  // Step 2: Log audit (no old data - new record!)
  logAudit(
    db,
    res.locals.user.id,
    'CREATE',
    'products',
    result.lastInsertRowid,  // New record ID
    null,                    // OLD values = null (didn't exist before)
    {                        // NEW values
      name: req.body.name,
      price: req.body.price,
      stock: req.body.stock
    },
    req.ip
  );
  
  req.flash('success', 'Product added successfully!');
  res.redirect('/products');
});
```

### ❌ WRONG: UPDATE without preserving old data

```javascript
app.post('/products/:id/edit', requireAdmin, (req, res) => {
  // ❌ MISTAKE: Update FIRST
  db.prepare('UPDATE products SET price = ? WHERE id = ?').run(
    req.body.price,
    req.params.id
  );
  
  // ❌ MISTAKE: Get data AFTER update (too late!)
  const data = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  
  // ❌ USELESS AUDIT LOG: old_data = new_data (both show new value!)
  logAudit(
    db,
    res.locals.user.id,
    'UPDATE',
    'products',
    req.params.id,
    { price: data.price },    // Shows 40 (new value)
    { price: data.price },    // Shows 40 (same!)
    req.ip
  );
  
  // Result: Audit log is meaningless!
  // Can't see what changed or revert if needed
});
```

## Common Mistakes

1. **Updating before capturing old data:**
   - 70% of students make this mistake initially
   - Result: Audit log shows `old_data = new_data`
   - Can't track what actually changed

2. **Not capturing enough fields:**
   ```javascript
   // ❌ Only logs price change
   logAudit(db, userId, 'UPDATE', 'products', id,
     { price: oldData.price },
     { price: req.body.price }
   );
   // Problem: What if name or stock also changed?
   
   // ✅ Log all relevant fields
   logAudit(db, userId, 'UPDATE', 'products', id,
     { name: oldData.name, price: oldData.price, stock: oldData.stock },
     { name: req.body.name, price: req.body.price, stock: req.body.stock }
   );
   ```

3. **Forgetting to log deletes:**
   ```javascript
   // ❌ No audit log - can't see who deleted what
   app.post('/products/:id/delete', (req, res) => {
     db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
     res.redirect('/products');
   });
   
   // ✅ Always log deletes (preserves deleted data!)
   app.post('/products/:id/delete', (req, res) => {
     const old = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
     db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
     logAudit(db, userId, 'DELETE', 'products', req.params.id, old, null, req.ip);
     res.redirect('/products');
   });
   ```

4. **Not checking if record exists:**
   ```javascript
   // ❌ Crashes if product doesn't exist
   const old = db.prepare('SELECT...').get(id);
   db.prepare('UPDATE...').run(...);  // old might be undefined!
   
   // ✅ Check first
   const old = db.prepare('SELECT...').get(id);
   if (!old) {
     req.flash('error', 'Product not found');
     return res.redirect('/products');
   }
   db.prepare('UPDATE...').run(...);
   ```

## Related Concepts
- Web App Basics Part 2C: Section 6 (Audit Logging)
- Database triggers (alternative audit approach)
- Immutable data structures
- Event sourcing pattern
- Compliance requirements (GDPR, HIPAA, SOX)
