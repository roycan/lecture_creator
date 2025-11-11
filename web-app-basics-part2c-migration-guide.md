# Migration Guide: Upgrading to Part 2C (v3 → v4)
## Adding Advanced Features to Your Mini-Projects

**Target Audience:** Grade 9 students who completed Part 2A and 2B  
**Prerequisites:** Working v3 project with authentication (database + sessions + login)  
**Goal:** Add professional features (DataTables, flash messages, CSV, QR codes, audit logging)

---

## 📋 Overview

### What's New in v4?

| Feature | Benefit | Complexity | Priority |
|---------|---------|------------|----------|
| **DataTables.js** | Search, sort, paginate, export tables | Easy | HIGH |
| **Flash Messages** | User feedback across redirects | Easy | HIGH |
| **CSV Export** | Download data to Excel | Medium | MEDIUM |
| **CSV Import** | Bulk upload data | Medium | MEDIUM |
| **QR Codes** | Easy sharing and scanning | Easy | LOW |
| **Audit Logging** | Track all changes | Medium | MEDIUM |
| **JSON Backup** | Database disaster recovery | Medium | LOW |

**Recommendation:** Implement features in order of priority (HIGH → MEDIUM → LOW).

---

## 🎯 Migration Path

```
v2 (JSON files)
    ↓
v3 (SQLite + Authentication + Sessions)
    ↓
v4 (v3 + Advanced Features)
```

**Time estimate:** 2-4 hours per project (depending on features chosen)

---

## 📦 Step 0: Preparation

### Backup Your v3 Project

```bash
# Create backup folder
mkdir ../my-project-v3-backup
cp -r * ../my-project-v3-backup/

# Or use Git
git add .
git commit -m "v3 complete - before v4 upgrade"
git branch v3-stable  # Create safety branch
```

### Install New Packages

```bash
npm install connect-flash csv-writer csv-parse multer node-cron
```

**package.json will include:**
```json
{
  "dependencies": {
    "better-sqlite3": "^9.0.0",
    "bcrypt": "^5.1.0",
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "better-sqlite3-session-store": "^0.1.0",
    "ejs": "^3.1.9",
    "connect-flash": "^0.1.1",
    "csv-writer": "^1.6.0",
    "csv-parse": "^5.5.0",
    "multer": "^1.4.5-lts.1",
    "node-cron": "^3.0.2"
  }
}
```

---

## ✨ Step 1: Add Flash Messages

**Purpose:** Show success/error messages that persist across redirects

### 1.1 Configure Flash in app.js

**Add AFTER session middleware:**

```javascript
const session = require('express-session');
const flash = require('connect-flash');  // NEW

// ... session setup ...

app.use(flash());  // NEW: Must come after session

// Make flash messages available in all views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.info_msg = req.flash('info');
  res.locals.user = req.session.user || null;
  next();
});
```

### 1.2 Create Flash Message Partial

**File:** `views/partials/flash.ejs`

```html
<% if (success_msg && success_msg.length > 0) { %>
  <div class="notification is-success is-light" id="flash-success">
    <button class="delete" onclick="this.parentElement.remove()"></button>
    <% success_msg.forEach(msg => { %>
      <p><%= msg %></p>
    <% }); %>
  </div>
<% } %>

<% if (error_msg && error_msg.length > 0) { %>
  <div class="notification is-danger is-light" id="flash-error">
    <button class="delete" onclick="this.parentElement.remove()"></button>
    <% error_msg.forEach(msg => { %>
      <p><%= msg %></p>
    <% }); %>
  </div>
<% } %>

<% if (info_msg && info_msg.length > 0) { %>
  <div class="notification is-info is-light" id="flash-info">
    <button class="delete" onclick="this.parentElement.remove()"></button>
    <% info_msg.forEach(msg => { %>
      <p><%= msg %></p>
    <% }); %>
  </div>
<% } %>

<script>
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    document.getElementById('flash-success')?.remove();
    document.getElementById('flash-info')?.remove();
    // Keep errors visible longer
  }, 5000);
</script>
```

### 1.3 Include in All Main Views

**Add at top of each main layout (after navbar):**

```html
<%- include('../partials/navbar') %>
<%- include('../partials/flash') %>  <!-- NEW -->

<section class="section">
  <!-- Page content -->
</section>
```

### 1.4 Update Routes to Use Flash

**Example: Product creation**

```javascript
// BEFORE (v3)
app.post('/products', requireAdmin, (req, res) => {
  db.prepare('INSERT INTO products (name, price) VALUES (?, ?)').run(
    req.body.name,
    req.body.price
  );
  res.redirect('/products');  // Silent redirect
});

// AFTER (v4)
app.post('/products', requireAdmin, (req, res) => {
  try {
    db.prepare('INSERT INTO products (name, price) VALUES (?, ?)').run(
      req.body.name,
      req.body.price
    );
    req.flash('success', `Product "${req.body.name}" added successfully!`);  // NEW
    res.redirect('/products');
  } catch (error) {
    req.flash('error', 'Failed to add product: ' + error.message);  // NEW
    res.redirect('/products/new');
  }
});
```

**Update ALL routes that redirect:**
- Create operations → `req.flash('success', '...')`
- Update operations → `req.flash('success', '...')`
- Delete operations → `req.flash('success', '...')`
- Errors → `req.flash('error', '...')`
- Login → `req.flash('success', 'Welcome back!')`
- Logout → `req.flash('info', 'You have been logged out')`

---

## 📊 Step 2: Add DataTables.js

**Purpose:** Enhance tables with search, sort, pagination, and export

### 2.1 Update List View

**Example:** `views/products/list.ejs`

**Add CDN links in `<head>`:**

```html
<head>
  <title>Products - Store Inventory v4</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
  
  <!-- DataTables CSS -->
  <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
  <link rel="stylesheet" href="https://cdn.datatables.net/buttons/2.4.1/css/buttons.dataTables.min.css">
</head>
```

**Add ID to table:**

```html
<table id="productsTable" class="table is-fullwidth is-striped is-hoverable">
  <thead>
    <tr>
      <th>Name</th>
      <th>Price</th>
      <th>Stock</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <% products.forEach(product => { %>
      <tr>
        <td><%= product.name %></td>
        <td>₱<%= product.price.toFixed(2) %></td>
        <td><%= product.stock %></td>
        <td>
          <a href="/products/<%= product.id %>" class="button is-small is-info">View</a>
        </td>
      </tr>
    <% }); %>
  </tbody>
</table>
```

**Add scripts before `</body>`:**

```html
<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/buttons/2.4.1/js/dataTables.buttons.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="https://cdn.datatables.net/buttons/2.4.1/js/buttons.html5.min.js"></script>

<script>
  $(document).ready(function() {
    $('#productsTable').DataTable({
      pageLength: 25,
      order: [[0, 'asc']],  // Sort by name
      dom: 'Bfrtip',        // Show buttons
      buttons: ['copy', 'csv', 'excel'],
      columnDefs: [
        { orderable: false, targets: 3 }  // Disable sort on Actions column
      ]
    });
  });
</script>
```

### 2.2 Repeat for All List Views

- **Barangay Directory:** `views/residents/list.ejs` → `#residentsTable`
- **Class List:** `views/students/list.ejs` → `#studentsTable`
- **Store Inventory:** `views/products/list.ejs` → `#productsTable`

---

## 📥 Step 3: Add CSV Export

**Purpose:** Download data to Excel/Google Sheets

### 3.1 Create CSV Route

**File:** `routes/products.js` (or add to app.js)

```javascript
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');

app.get('/products/export/csv', requireAdmin, (req, res) => {
  const products = db.prepare('SELECT * FROM products').all();
  
  const filename = `products_${new Date().toISOString().split('T')[0]}.csv`;
  const filepath = path.join('temp', filename);
  
  // Create temp directory if needed
  if (!fs.existsSync('temp')) {
    fs.mkdirSync('temp');
  }
  
  const csvWriter = createCsvWriter({
    path: filepath,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'name', title: 'Product Name' },
      { id: 'price', title: 'Price' },
      { id: 'stock', title: 'Stock' },
      { id: 'created_at', title: 'Date Added' }
    ]
  });
  
  csvWriter.writeRecords(products)
    .then(() => {
      res.download(filepath, filename, (err) => {
        // Clean up temp file after download
        fs.unlinkSync(filepath);
        if (err) {
          req.flash('error', 'Download failed');
          res.redirect('/products');
        }
      });
    })
    .catch(error => {
      req.flash('error', 'CSV export failed: ' + error.message);
      res.redirect('/products');
    });
});
```

### 3.2 Add Export Button

**In list view:**

```html
<div class="level">
  <div class="level-left">
    <h1 class="title">Products</h1>
  </div>
  <div class="level-right">
    <a href="/products/new" class="button is-primary mr-2">➕ Add Product</a>
    <a href="/products/export/csv" class="button is-success">📥 Export CSV</a>  <!-- NEW -->
  </div>
</div>
```

---

## 📤 Step 4: Add CSV Import

**Purpose:** Bulk upload data from spreadsheet

### 4.1 Create Import Route

```javascript
const multer = require('multer');
const { parse } = require('csv-parse/sync');

const upload = multer({ dest: 'temp/' });

app.get('/products/import', requireAdmin, (req, res) => {
  res.render('products/import');
});

app.post('/products/import', requireAdmin, upload.single('csvFile'), (req, res) => {
  try {
    if (!req.file) {
      req.flash('error', 'No file uploaded');
      return res.redirect('/products/import');
    }
    
    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    const errors = [];
    const warnings = [];
    const validRows = [];
    
    records.forEach((row, index) => {
      const rowNum = index + 2; // +2 for header and 1-based
      
      // Validate required fields
      if (!row.name || !row.price) {
        errors.push(`Row ${rowNum}: Missing name or price`);
        return;
      }
      
      // Validate data types
      if (isNaN(parseFloat(row.price))) {
        errors.push(`Row ${rowNum}: Invalid price "${row.price}"`);
        return;
      }
      
      // Check duplicates
      const exists = db.prepare('SELECT id FROM products WHERE name = ?').get(row.name);
      if (exists) {
        warnings.push(`Row ${rowNum}: "${row.name}" already exists (skipped)`);
        return;
      }
      
      validRows.push(row);
    });
    
    // If errors, don't import anything
    if (errors.length > 0) {
      fs.unlinkSync(req.file.path);
      req.flash('error', `Import failed: ${errors.join('; ')}`);
      return res.redirect('/products/import');
    }
    
    // Import valid rows
    const insertStmt = db.prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)');
    validRows.forEach(row => {
      insertStmt.run(row.name, parseFloat(row.price), parseInt(row.stock || 0));
    });
    
    // Clean up temp file
    fs.unlinkSync(req.file.path);
    
    let message = `Successfully imported ${validRows.length} products`;
    if (warnings.length > 0) {
      message += `. Warnings: ${warnings.join('; ')}`;
    }
    req.flash('success', message);
    res.redirect('/products');
    
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    req.flash('error', 'Import failed: ' + error.message);
    res.redirect('/products/import');
  }
});
```

### 4.2 Create Import View

**File:** `views/products/import.ejs`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Import Products - CSV</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
</head>
<body>
  <%- include('../partials/navbar') %>
  <%- include('../partials/flash') %>
  
  <section class="section">
    <div class="container">
      <h1 class="title">Import Products from CSV</h1>
      
      <div class="box">
        <h2 class="subtitle">Instructions</h2>
        <ol>
          <li>Create a CSV file with columns: <code>name, price, stock</code></li>
          <li>First row should be headers</li>
          <li>Example: <code>Skyflakes,35.50,100</code></li>
          <li>Save as .csv file</li>
          <li>Upload below</li>
        </ol>
      </div>
      
      <form method="POST" action="/products/import" enctype="multipart/form-data">
        <div class="field">
          <label class="label">Choose CSV File</label>
          <div class="control">
            <div class="file has-name">
              <label class="file-label">
                <input class="file-input" type="file" name="csvFile" accept=".csv" required 
                       onchange="document.getElementById('fileName').textContent = this.files[0].name">
                <span class="file-cta">
                  <span class="file-label">Choose file…</span>
                </span>
                <span class="file-name" id="fileName">No file selected</span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="field">
          <div class="control">
            <button type="submit" class="button is-primary">📤 Upload and Import</button>
            <a href="/products" class="button">Cancel</a>
          </div>
        </div>
      </form>
    </div>
  </section>
</body>
</html>
```

### 4.3 Add Import Button

**In list view:**

```html
<a href="/products/import" class="button is-info mr-2">📤 Import CSV</a>
```

---

## 🏷️ Step 5: Add QR Codes (Optional)

**Purpose:** Generate scannable codes for easy sharing

### 5.1 Add QR Code to Detail View

**Example:** `views/products/detail.ejs`

**Add to page layout:**

```html
<div class="columns">
  <div class="column is-8">
    <!-- Existing product details -->
  </div>
  
  <div class="column is-4">
    <div class="box has-text-centered">
      <h3 class="title is-5">Product QR Code</h3>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=<%= encodeURIComponent('PRODUCT-' + product.id) %>" 
           alt="QR Code"
           style="max-width: 100%;">
      <p class="mt-3">
        <small>Scan to view this product</small>
      </p>
      <button class="button is-small is-primary mt-2" onclick="window.print()">
        🖨️ Print QR Code
      </button>
    </div>
  </div>
</div>
```

**That's it!** No server-side code needed. QR code generates dynamically.

---

## 📝 Step 6: Add Audit Logging

**Purpose:** Track WHO changed WHAT and WHEN

### 6.1 Create Audit Log Table

**Add to database initialization:**

```javascript
db.exec(`
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    old_data TEXT,
    new_data TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Add indices for performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_log(user_id);
  CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_log(created_at);
`);
```

### 6.2 Create Audit Helper Function

**File:** `helpers.js` (or add to app.js)

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

module.exports = { logAudit };
```

### 6.3 Update Routes to Log Changes

**CREATE example:**

```javascript
app.post('/products', requireAdmin, (req, res) => {
  const result = db.prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)').run(
    req.body.name,
    req.body.price,
    req.body.stock
  );
  
  // Log audit entry
  logAudit(
    db,
    res.locals.user.id,      // WHO
    'CREATE',                // WHAT
    'products',              // WHERE
    result.lastInsertRowid,  // WHICH
    null,                    // No old data
    { name: req.body.name, price: req.body.price, stock: req.body.stock },
    req.ip
  );
  
  req.flash('success', 'Product added successfully!');
  res.redirect('/products');
});
```

**UPDATE example:**

```javascript
app.post('/products/:id/edit', requireAdmin, (req, res) => {
  // Get OLD data first!
  const oldData = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  
  // Perform update
  db.prepare('UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?').run(
    req.body.name,
    req.body.price,
    req.body.stock,
    req.params.id
  );
  
  // Log with old AND new data
  logAudit(
    db,
    res.locals.user.id,
    'UPDATE',
    'products',
    req.params.id,
    { name: oldData.name, price: oldData.price, stock: oldData.stock },  // OLD
    { name: req.body.name, price: req.body.price, stock: req.body.stock },  // NEW
    req.ip
  );
  
  req.flash('success', 'Product updated successfully!');
  res.redirect('/products');
});
```

**DELETE example:**

```javascript
app.post('/products/:id/delete', requireAdmin, (req, res) => {
  // Get data BEFORE deleting (preserve it!)
  const oldData = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  
  // Delete
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  
  // Log deletion
  logAudit(
    db,
    res.locals.user.id,
    'DELETE',
    'products',
    req.params.id,
    { name: oldData.name, price: oldData.price, stock: oldData.stock },  // Preserve
    null,  // No new data
    req.ip
  );
  
  req.flash('success', 'Product deleted successfully!');
  res.redirect('/products');
});
```

### 6.4 Create Audit Trail Viewer

**Route:**

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

**View:** `views/admin/audit.ejs`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Audit Trail</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
  <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
</head>
<body>
  <%- include('../partials/navbar') %>
  
  <section class="section">
    <div class="container">
      <h1 class="title">Audit Trail</h1>
      <p class="subtitle">Track all changes made to the database</p>
      
      <table id="auditTable" class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>When</th>
            <th>Who</th>
            <th>Action</th>
            <th>Table</th>
            <th>Record</th>
            <th>Changes</th>
          </tr>
        </thead>
        <tbody>
          <% logs.forEach(log => { %>
            <tr>
              <td><%= new Date(log.created_at).toLocaleString() %></td>
              <td><%= log.user_name %> (<%= log.user_role %>)</td>
              <td>
                <span class="tag is-<%= log.action === 'DELETE' ? 'danger' : log.action === 'CREATE' ? 'success' : 'warning' %>">
                  <%= log.action %>
                </span>
              </td>
              <td><%= log.table_name %></td>
              <td>#<%= log.record_id %></td>
              <td>
                <% if (log.old_data) { %>
                  <details>
                    <summary>Before</summary>
                    <pre><%= log.old_data %></pre>
                  </details>
                <% } %>
                <% if (log.new_data) { %>
                  <details>
                    <summary>After</summary>
                    <pre><%= log.new_data %></pre>
                  </details>
                <% } %>
              </td>
            </tr>
          <% }); %>
        </tbody>
      </table>
    </div>
  </section>
  
  <script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
  <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
  <script>
    $(document).ready(function() {
      $('#auditTable').DataTable({
        order: [[0, 'desc']],  // Sort by date descending
        pageLength: 25
      });
    });
  </script>
</body>
</html>
```

---

## 💾 Step 7: Add JSON Backup (Optional)

**Purpose:** Full database export for disaster recovery

### 7.1 Create Backup Route

```javascript
app.get('/admin/backup/json', requireAdmin, (req, res) => {
  const backup = {
    metadata: {
      backup_date: new Date().toISOString(),
      app_version: '1.0.0',
      created_by: res.locals.user.name
    },
    users: db.prepare('SELECT * FROM users').all(),
    products: db.prepare('SELECT * FROM products').all(),
    categories: db.prepare('SELECT * FROM categories').all(),
    audit_log: db.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 1000').all()
    // Add all your tables here
  };
  
  const filename = `backup_${new Date().toISOString().split('T')[0]}.json`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.json(backup);
});
```

### 7.2 Add Backup Button

**In admin panel:**

```html
<a href="/admin/backup/json" class="button is-success">
  📥 Download JSON Backup
</a>
```

---

## 🎯 Project-Specific Examples

### Example 1: Barangay Directory v4

**Features to add:**
1. ✅ Flash messages (resident added/updated/deleted)
2. ✅ DataTables (search 5,000+ residents)
3. ✅ CSV export (generate reports)
4. ✅ QR codes (resident ID cards)
5. ✅ Audit logging (track profile changes)

**Key implementation:**

```javascript
// Resident QR code (views/residents/detail.ejs)
<img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=<%= encodeURIComponent('RESIDENT-' + resident.id) %>">

// CSV export (all residents)
app.get('/residents/export/csv', requireAdmin, (req, res) => {
  const residents = db.prepare('SELECT * FROM residents').all();
  // ... CSV writer code ...
});

// Audit log resident updates
app.post('/residents/:id/edit', requireAdmin, (req, res) => {
  const old = db.prepare('SELECT * FROM residents WHERE id = ?').get(req.params.id);
  // ... update ...
  logAudit(db, res.locals.user.id, 'UPDATE', 'residents', req.params.id, old, newData, req.ip);
});
```

---

### Example 2: Class List v4

**Features to add:**
1. ✅ Flash messages (grade updates, enrollment)
2. ✅ DataTables (search/filter students)
3. ✅ CSV import (bulk enroll students)
4. ✅ CSV export (generate grade reports)
5. ✅ Audit logging (track grade changes)

**Key implementation:**

```javascript
// CSV import students (with validation)
app.post('/students/import', requireAdmin, upload.single('csvFile'), (req, res) => {
  // Parse CSV
  const records = parse(fileContent, { columns: true });
  
  // Validate: student number unique, grade level valid
  records.forEach(row => {
    const exists = db.prepare('SELECT id FROM students WHERE student_number = ?').get(row.student_number);
    if (exists) {
      warnings.push(`Student ${row.student_number} already exists`);
      return;
    }
    validRows.push(row);
  });
  
  // Bulk insert
  const insert = db.prepare('INSERT INTO students (student_number, name, grade_level) VALUES (?, ?, ?)');
  validRows.forEach(row => insert.run(row.student_number, row.name, row.grade_level));
  
  req.flash('success', `Enrolled ${validRows.length} students`);
});

// Audit grade changes (old vs new)
app.post('/students/:id/grades', requireAdmin, (req, res) => {
  const old = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  db.prepare('UPDATE students SET grade = ? WHERE id = ?').run(req.body.grade, req.params.id);
  logAudit(db, res.locals.user.id, 'UPDATE', 'students', req.params.id,
    { grade: old.grade },
    { grade: req.body.grade },
    req.ip
  );
  req.flash('success', 'Grade updated successfully!');
});
```

---

### Example 3: Store Inventory v4

**Features to add:**
1. ✅ Flash messages (product added/sold/restocked)
2. ✅ DataTables (search products, export to Excel)
3. ✅ CSV import (import supplier price lists)
4. ✅ CSV export (inventory reports)
5. ✅ QR codes (product labels)
6. ✅ Audit logging (track price changes)
7. ✅ JSON backup (before major updates)

**Key implementation:**

```javascript
// Product labels with QR codes
app.get('/products/:id/label', requireAdmin, (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.render('products/label', { product: product });
});

// views/products/label.ejs (print-optimized)
<style>
  @media print {
    body { width: 4in; height: 2in; }  /* Label size */
  }
</style>
<div style="text-align: center;">
  <h2><%= product.name %></h2>
  <p style="font-size: 24px; font-weight: bold;">₱<%= product.price.toFixed(2) %></p>
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=<%= encodeURIComponent('PRODUCT-' + product.id) %>">
  <p><small>Stock: <%= product.stock %></small></p>
</div>
<script>window.print();</script>

// CSV import supplier prices (update existing products)
app.post('/products/import-prices', requireAdmin, upload.single('csvFile'), (req, res) => {
  const records = parse(fileContent, { columns: true });
  
  records.forEach(row => {
    const product = db.prepare('SELECT * FROM products WHERE name = ?').get(row.name);
    if (product) {
      // Log price change
      logAudit(db, res.locals.user.id, 'UPDATE', 'products', product.id,
        { price: product.price },
        { price: parseFloat(row.new_price) },
        req.ip
      );
      
      db.prepare('UPDATE products SET price = ? WHERE id = ?').run(row.new_price, product.id);
    }
  });
  
  req.flash('success', 'Prices updated from supplier list');
});
```

---

## ✅ Testing Checklist

### Flash Messages
- [ ] Success message shows after creating record
- [ ] Error message shows when validation fails
- [ ] Message disappears after 5 seconds
- [ ] Message persists across redirect
- [ ] Multiple messages stack correctly

### DataTables
- [ ] Search box filters records
- [ ] Column sorting works (ascending/descending)
- [ ] Pagination shows correct page numbers
- [ ] Export buttons download files
- [ ] Actions column doesn't sort

### CSV Export
- [ ] File downloads with correct name
- [ ] All columns exported correctly
- [ ] Opens in Excel/Google Sheets
- [ ] Data matches database

### CSV Import
- [ ] Upload form accepts .csv files
- [ ] Validation catches missing fields
- [ ] Validation catches invalid data types
- [ ] Duplicates are skipped or warned
- [ ] Success message shows row count
- [ ] Temp file is deleted

### QR Codes
- [ ] QR code displays on detail page
- [ ] Scanning redirects to correct record
- [ ] Print button works
- [ ] QR code is readable by phone apps

### Audit Logging
- [ ] CREATE actions logged with new data
- [ ] UPDATE actions logged with old + new data
- [ ] DELETE actions logged with old data (preserved)
- [ ] Audit trail shows WHO, WHAT, WHEN
- [ ] Audit trail is admin-only

### JSON Backup
- [ ] Backup downloads as .json file
- [ ] All tables included
- [ ] Metadata shows date and user
- [ ] File is valid JSON (can open in editor)

---

## 🐛 Troubleshooting

### Flash Messages Not Showing

**Problem:** Messages disappear  
**Cause:** Flash middleware not configured after session  
**Fix:** Ensure this order in app.js:
```javascript
app.use(session({ ... }));
app.use(flash());  // MUST be after session
```

---

### DataTables Not Working

**Problem:** Table doesn't get search box  
**Cause:** jQuery not loaded before DataTables  
**Fix:** Check script order:
```html
<script src="jquery.js"></script>          <!-- 1. jQuery FIRST -->
<script src="datatables.js"></script>      <!-- 2. DataTables SECOND -->
<script>$('#table').DataTable();</script>  <!-- 3. Initialize LAST -->
```

---

### CSV Import Fails

**Problem:** "Cannot read property 'path' of undefined"  
**Cause:** Form missing `enctype="multipart/form-data"`  
**Fix:**
```html
<form method="POST" action="/import" enctype="multipart/form-data">
```

---

### Audit Log Too Slow

**Problem:** Page takes 5+ seconds to load  
**Cause:** Too many audit entries, no indices  
**Fix:**
```javascript
// Add indices
db.exec('CREATE INDEX idx_audit_created_at ON audit_log(created_at)');
db.exec('CREATE INDEX idx_audit_user_id ON audit_log(user_id)');

// Limit query
const logs = db.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100').all();
```

---

## 📊 Performance Considerations

### DataTables: Client vs Server

**Use client-side (< 1000 rows):**
- Faster (no server requests)
- Simpler code
- Works offline

**Use server-side (> 1000 rows):**
```javascript
$('#table').DataTable({
  serverSide: true,
  ajax: '/api/products/search'
});

// Server route
app.get('/api/products/search', (req, res) => {
  const start = req.query.start || 0;
  const length = req.query.length || 25;
  const search = req.query.search.value || '';
  
  const data = db.prepare(`
    SELECT * FROM products 
    WHERE name LIKE ? 
    LIMIT ? OFFSET ?
  `).all(`%${search}%`, length, start);
  
  const total = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  
  res.json({
    data: data,
    recordsTotal: total,
    recordsFiltered: data.length
  });
});
```

---

## 🚀 Deployment Updates

### Railway Environment Variables

**Add to Railway dashboard:**
```
SESSION_SECRET=your-very-long-random-string-here
NODE_ENV=production
```

### Railway Deployment Checklist

- [ ] All new packages in package.json
- [ ] Flash messages work (test on Railway)
- [ ] DataTables CDN links load (check HTTPS)
- [ ] CSV uploads work (temp/ folder writable)
- [ ] QR codes display (external API accessible)
- [ ] Audit log performs well (indices created)
- [ ] JSON backup downloads

---

## 🎓 Summary

**Congratulations! Your v4 project now has:**
- ✅ Professional table management (DataTables)
- ✅ User-friendly feedback (flash messages)
- ✅ Data portability (CSV export/import)
- ✅ Easy sharing (QR codes)
- ✅ Full accountability (audit logging)
- ✅ Disaster recovery (JSON backups)

**You've built a production-ready web application!** 🎉

---

## 📚 Next Steps

1. **Test thoroughly** - Use the testing checklist
2. **Deploy to Railway** - Update environment variables
3. **Show your teacher** - Demo all new features
4. **Share with classmates** - Help others upgrade
5. **Build something new** - Apply these patterns to your own ideas!

---

**Last updated:** November 11, 2025  
**Guide version:** 1.0  
**Aligned with:** Web App Basics Part 2C Lecture

*Happy coding, and enjoy building amazing things!* 💻✨
