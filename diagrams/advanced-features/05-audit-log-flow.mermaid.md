# Audit Log Flow Diagram (Mermaid Alternative)

## Purpose
Show how audit logging captures WHO did WHAT, WHEN, tracking all database changes for accountability.

## Rendering
Use Mermaid Live Editor (mermaid.live) or VS Code Mermaid extension.

## Diagram

```mermaid
flowchart TD
    User([Manager]) -->|Edit product<br/>price: 35 → 40| Browser[Browser Form]
    Browser -->|POST /products/5/edit| Route[Express Route Handler]
    
    Route --> Validate{Validate<br/>Input}
    Validate -->|Invalid| Error[Return error]
    Validate -->|Valid| GetOld[Get OLD data<br/>from database]
    
    GetOld -->|SELECT * FROM products<br/>WHERE id = 5| OldData["Old Data:<br/>{price: 35, stock: 100}"]
    
    OldData --> Update[Update product<br/>in database]
    Update -->|UPDATE products<br/>SET price = 40| Success[Update successful]
    
    Success --> LogAudit[Call logAudit helper]
    
    LogAudit -->|Parameters:<br/>- userId: 3<br/>- action: 'UPDATE'<br/>- table: 'products'<br/>- recordId: 5<br/>- oldData: {price:35}<br/>- newData: {price:40}<br/>- ip: 192.168.1.10| InsertAudit
    
    InsertAudit[INSERT INTO audit_log] --> AuditSaved[Audit entry created]
    
    AuditSaved --> Redirect[Redirect to /products]
    Redirect --> UserFeedback[Show success message]
    
    Admin([Administrator]) -->|View audit trail| ViewAudit[GET /admin/audit]
    ViewAudit -->|SELECT * FROM audit_log<br/>JOIN users<br/>ORDER BY created_at DESC| DisplayLogs[Display log entries]
    
    DisplayLogs --> AdminView[Admin sees:<br/>- WHO: Manager<br/>- WHAT: Updated price<br/>- WHEN: 2025-11-11 14:20<br/>- FROM: 35 → 40]
    
    style GetOld fill:#E1BEE7
    style Update fill:#C8E6C9
    style LogAudit fill:#FFD700
    style InsertAudit fill:#F8BBD0
    style Validate fill:#FFF59D
    style Error fill:#FFB6C1
```

## Audit Log Schema

```sql
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,          -- WHO
  action TEXT NOT NULL,               -- WHAT (CREATE/UPDATE/DELETE)
  table_name TEXT NOT NULL,           -- WHERE
  record_id INTEGER NOT NULL,         -- WHICH record
  old_data TEXT,                      -- BEFORE (JSON)
  new_data TEXT,                      -- AFTER (JSON)
  ip_address TEXT,                    -- FROM where
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- WHEN
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## The 5 W's of Audit Logging

| W | Column | Example | Purpose |
|---|--------|---------|---------|
| **WHO** | `user_id` | 3 (Manager) | Accountability |
| **WHAT** | `action` | UPDATE | Type of change |
| **WHERE** | `table_name` | products | Which data |
| **WHICH** | `record_id` | 5 (Skyflakes) | Specific record |
| **WHEN** | `created_at` | 2025-11-11 14:20 | Timestamp |

**Bonus:** `old_data` + `new_data` = See exactly what changed!

## logAudit Helper Function

```javascript
function logAudit(db, userId, action, tableName, recordId, oldData, newData, ipAddress) {
  db.prepare(`
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_data, new_data, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    action,  // 'CREATE', 'UPDATE', or 'DELETE'
    tableName,
    recordId,
    oldData ? JSON.stringify(oldData) : null,
    newData ? JSON.stringify(newData) : null,
    ipAddress
  );
}
```

## Usage Patterns

### CREATE (New Record)
```javascript
app.post('/products', requireAdmin, (req, res) => {
  const result = db.prepare('INSERT INTO products (name, price) VALUES (?, ?)').run(
    req.body.name, req.body.price
  );
  
  logAudit(db, res.locals.user.id, 'CREATE', 'products', result.lastInsertRowid,
    null,  // No old data
    { name: req.body.name, price: req.body.price },
    req.ip
  );
});
```

**Audit entry:**
```
WHO: Manager (id=3)
WHAT: CREATE
WHERE: products table
WHICH: record id=5
OLD: null
NEW: {"name":"Skyflakes","price":35}
WHEN: 2025-11-11 10:30:00
FROM: 192.168.1.10
```

---

### UPDATE (Edit Record)
```javascript
app.post('/products/:id/edit', requireAdmin, (req, res) => {
  // 1. Get OLD data first
  const old = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  
  // 2. Perform update
  db.prepare('UPDATE products SET name = ?, price = ? WHERE id = ?').run(
    req.body.name, req.body.price, req.params.id
  );
  
  // 3. Log with old AND new data
  logAudit(db, res.locals.user.id, 'UPDATE', 'products', req.params.id,
    { name: old.name, price: old.price },  // OLD values
    { name: req.body.name, price: req.body.price },  // NEW values
    req.ip
  );
});
```

**Audit entry:**
```
WHO: Manager (id=3)
WHAT: UPDATE
WHERE: products table
WHICH: record id=5
OLD: {"name":"Skyflakes","price":35}
NEW: {"name":"Skyflakes","price":40}    ← Price changed!
WHEN: 2025-11-11 14:20:00
FROM: 192.168.1.10
```

---

### DELETE (Remove Record)
```javascript
app.post('/products/:id/delete', requireAdmin, (req, res) => {
  // 1. Get data BEFORE deleting (preserve it!)
  const old = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  
  // 2. Delete record
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  
  // 3. Log deletion with old data
  logAudit(db, res.locals.user.id, 'DELETE', 'products', req.params.id,
    { name: old.name, price: old.price },  // Preserve deleted data
    null,  // No new data
    req.ip
  );
});
```

**Audit entry:**
```
WHO: Manager (id=3)
WHAT: DELETE
WHERE: products table
WHICH: record id=5
OLD: {"name":"Skyflakes","price":40}    ← Data preserved!
NEW: null
WHEN: 2025-11-11 16:45:00
FROM: 192.168.1.10
```

---

## Viewing Audit Trail

```javascript
app.get('/admin/audit', requireAdmin, (req, res) => {
  const logs = db.prepare(`
    SELECT 
      a.*,
      u.name as user_name,
      u.role as user_role
    FROM audit_log a
    JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT 100
  `).all();
  
  res.render('admin/audit', { logs: logs });
});
```

**Display with DataTables:**
```html
<table id="auditTable" class="table">
  <thead>
    <tr>
      <th>When</th>
      <th>Who</th>
      <th>Action</th>
      <th>Table</th>
      <th>Changes</th>
    </tr>
  </thead>
  <tbody>
    <% logs.forEach(log => { %>
      <tr>
        <td><%= new Date(log.created_at).toLocaleString() %></td>
        <td><%= log.user_name %> (<%= log.user_role %>)</td>
        <td><span class="tag is-<%= log.action === 'DELETE' ? 'danger' : log.action === 'CREATE' ? 'success' : 'warning' %>">
          <%= log.action %>
        </span></td>
        <td><%= log.table_name %> #<%= log.record_id %></td>
        <td>
          <% if (log.old_data) { %>
            <strong>Before:</strong> <%= log.old_data %><br>
          <% } %>
          <% if (log.new_data) { %>
            <strong>After:</strong> <%= log.new_data %>
          <% } %>
        </td>
      </tr>
    <% }); %>
  </tbody>
</table>
```

## Benefits

| Benefit | Example Use Case |
|---------|------------------|
| **Accountability** | "Who changed the price of Skyflakes?" |
| **History** | "What was the price before it was updated?" |
| **Troubleshooting** | "When did this product get deleted?" |
| **Compliance** | Required for regulated industries |
| **Undo/Restore** | Can restore old values from `old_data` |

## Performance Tips

```javascript
// 1. Add indices for common queries
db.exec(`
  CREATE INDEX idx_audit_user_id ON audit_log(user_id);
  CREATE INDEX idx_audit_created_at ON audit_log(created_at);
  CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
`);

// 2. Archive old logs (keep last 90 days active)
db.exec(`
  CREATE TABLE audit_log_archive AS 
  SELECT * FROM audit_log WHERE created_at < date('now', '-90 days')
`);
db.exec(`DELETE FROM audit_log WHERE created_at < date('now', '-90 days')`);

// 3. Limit query results
const logs = db.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100').all();
```

## Security Considerations

- ⚠️ **DON'T** log passwords or sensitive data
- ⚠️ **DON'T** allow users to modify audit logs (read-only)
- ✅ **DO** require admin role to view logs
- ✅ **DO** regularly archive old logs
- ✅ **DO** monitor for suspicious patterns

## Related Concepts
- Web App Basics Part 2C: Section 6 (Audit Logging)
- Database transactions and ACID properties
- Regulatory compliance (GDPR, HIPAA)
- Forensic analysis and incident response
