# Audit Log Flow Diagram (Graphviz)

## Purpose
Show how audit logging captures WHO did WHAT, WHEN, tracking all database changes for accountability.

## Rendering
Use Graphviz Online (dreampuf.github.io/GraphvizOnline) or `dot` command.

## Diagram

```dot
digraph AuditLogFlow {
  rankdir=TB;
  node [shape=box, style="rounded,filled", fontname="Arial"];
  
  // Nodes
  User [label="User\n(Manager)", shape=person, fillcolor="#FFE4B5"];
  Browser [label="Browser\n(Form Submit)", fillcolor="#E0F2F7"];
  Route [label="Express Route\n(/products/:id/edit)", fillcolor="#87CEEB"];
  Validation [label="Validate\nInput", fillcolor="#FFF9C4"];
  GetOldData [label="Get Old Data\nfrom Database", fillcolor="#E1BEE7"];
  UpdateDB [label="Update Product\nin Database", fillcolor="#C8E6C9"];
  LogAudit [label="Log Audit Entry\n(helper function)", fillcolor="#FFD700"];
  AuditTable [label="Insert to\naudit_log table", fillcolor="#F8BBD0"];
  Redirect [label="Redirect to\nProduct List", fillcolor="#B3E5FC"];
  ViewAudit [label="Admin Views\nAudit Trail", fillcolor="#C5CAE9"];
  
  // Flow
  User -> Browser [label="  Edit product\n  price: 35 → 40"];
  Browser -> Route [label="  POST /products/5/edit"];
  Route -> Validation [label="  Check fields"];
  
  Validation -> GetOldData [label="  Valid"];
  GetOldData -> UpdateDB [label="  Old data:\n  {price: 35, stock: 100}"];
  UpdateDB -> LogAudit [label="  Update success\n  New data:\n  {price: 40, stock: 100}"];
  
  LogAudit -> AuditTable [label="  logAudit(db, userId=3,\n  action='UPDATE',\n  table='products',\n  recordId=5,\n  oldData='{\"price\":35}',\n  newData='{\"price\":40}',\n  ip='192.168.1.10')"];
  
  AuditTable -> Redirect [label="  Audit recorded"];
  Redirect -> Browser [label="  302 redirect"];
  Browser -> User [label="  Success message"];
  
  // Admin reviewing logs
  ViewAudit -> AuditTable [label="  Query:\n  SELECT * FROM audit_log\n  ORDER BY created_at DESC"];
  
  // Styling
  Validation [shape=diamond, fillcolor="#FFF59D"];
  
  // Grouping
  subgraph cluster_db {
    label="Database Operations";
    style=filled;
    color="#E8F5E9";
    GetOldData;
    UpdateDB;
    AuditTable;
  }
  
  subgraph cluster_audit {
    label="Audit System";
    style=filled;
    color="#FFF3E0";
    LogAudit;
    ViewAudit;
  }
}
```

## What Gets Logged

### Audit Log Table Schema

```sql
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,          -- WHO did it
  action TEXT NOT NULL,               -- WHAT they did (CREATE/UPDATE/DELETE)
  table_name TEXT NOT NULL,           -- WHICH table affected
  record_id INTEGER NOT NULL,         -- WHICH record changed
  old_data TEXT,                      -- Data BEFORE change (JSON)
  new_data TEXT,                      -- Data AFTER change (JSON)
  ip_address TEXT,                    -- From where
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- WHEN
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Example Entries

```
| id | user_id | action | table_name | record_id | old_data             | new_data             | ip_address    | created_at          |
|----|---------|--------|------------|-----------|----------------------|----------------------|---------------|---------------------|
| 1  | 3       | CREATE | products   | 5         | null                 | {"name":"Skyflakes", | 192.168.1.10  | 2025-11-11 10:30:00 |
|    |         |        |            |           |                      |  "price":35}         |               |                     |
| 2  | 3       | UPDATE | products   | 5         | {"price":35}         | {"price":40}         | 192.168.1.10  | 2025-11-11 14:20:00 |
| 3  | 3       | DELETE | products   | 5         | {"name":"Skyflakes", | null                 | 192.168.1.10  | 2025-11-11 16:45:00 |
|    |         |        |            |           |  "price":40}         |                      |               |                     |
```

## Helper Function

```javascript
function logAudit(db, userId, action, tableName, recordId, oldData, newData, ipAddress) {
  db.prepare(`
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_data, new_data, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    action,
    tableName,
    recordId,
    oldData ? JSON.stringify(oldData) : null,
    newData ? JSON.stringify(newData) : null,
    ipAddress
  );
}
```

## Usage in Routes

### CREATE (New Product)
```javascript
app.post('/products', requireAdmin, (req, res) => {
  const result = db.prepare('INSERT INTO products (name, price) VALUES (?, ?)').run(
    req.body.name,
    req.body.price
  );
  
  logAudit(
    db,
    res.locals.user.id,      // WHO
    'CREATE',                // WHAT
    'products',              // WHERE
    result.lastInsertRowid,  // WHICH
    null,                    // No old data
    { name: req.body.name, price: req.body.price }, // New data
    req.ip                   // From where
  );
  
  res.redirect('/products');
});
```

### UPDATE (Edit Product)
```javascript
app.post('/products/:id/edit', requireAdmin, (req, res) => {
  // Get old data BEFORE update
  const oldData = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  
  // Perform update
  db.prepare('UPDATE products SET name = ?, price = ? WHERE id = ?').run(
    req.body.name,
    req.body.price,
    req.params.id
  );
  
  // Log with old and new data
  logAudit(
    db,
    res.locals.user.id,
    'UPDATE',
    'products',
    req.params.id,
    { name: oldData.name, price: oldData.price },  // Old values
    { name: req.body.name, price: req.body.price }, // New values
    req.ip
  );
  
  res.redirect('/products');
});
```

### DELETE (Remove Product)
```javascript
app.post('/products/:id/delete', requireAdmin, (req, res) => {
  // Get data BEFORE delete
  const oldData = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  
  // Delete record
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  
  // Log deletion
  logAudit(
    db,
    res.locals.user.id,
    'DELETE',
    'products',
    req.params.id,
    { name: oldData.name, price: oldData.price }, // Preserve deleted data
    null,                                         // No new data
    req.ip
  );
  
  res.redirect('/products');
});
```

## Viewing Audit Trail

```javascript
app.get('/admin/audit', requireAdmin, (req, res) => {
  const logs = db.prepare(`
    SELECT 
      a.*,
      u.name as user_name
    FROM audit_log a
    JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT 100
  `).all();
  
  res.render('admin/audit', { logs: logs });
});
```

## Benefits

1. **Accountability:** Know WHO made each change
2. **History:** See WHAT was changed (before/after)
3. **Troubleshooting:** Track down when bugs were introduced
4. **Compliance:** Required for regulated industries (healthcare, finance)
5. **Undo:** Can restore old data if needed

## Security Considerations

- ⚠️ DON'T log passwords or sensitive data
- ⚠️ DON'T allow users to edit audit logs (admin-only view)
- ✅ DO regularly archive old logs (performance)
- ✅ DO create indices on frequently queried columns

## Related Concepts
- Web App Basics Part 2C: Section 6 (Audit Logging)
- Database triggers (alternative approach)
- Compliance and regulatory requirements
- Data retention policies
