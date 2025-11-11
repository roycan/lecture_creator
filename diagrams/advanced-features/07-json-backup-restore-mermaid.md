# JSON Backup & Restore - Database Export/Import (Mermaid)

## Purpose
Flowchart showing the complete workflow for exporting database to JSON (backup) and importing JSON back to database (restore), with transaction safety and error handling.

## Rendering
**VS Code:** Built-in Mermaid support  
**GitHub:** Renders automatically  
**Online:** [mermaid.live](https://mermaid.live)

## Diagram

```mermaid
flowchart TD
    Start([Manager wants to<br/>backup/restore database]) --> ChooseAction{What action?}
    
    %% BACKUP FLOW
    ChooseAction -->|Backup| InitBackup[GET /admin/backup/export]
    
    InitBackup --> GetTables[Query all tables:<br/>• users<br/>• products<br/>• orders<br/>• order_items<br/>• audit_log]
    
    GetTables --> BuildJSON[Build JSON structure:<br/><br/>backupData = &#123;<br/>  metadata: &#123;timestamp, version&#125;,<br/>  users: [...],<br/>  products: [...],<br/>  orders: [...],<br/>  order_items: [...],<br/>  audit_log: [...]<br/>&#125;]
    
    BuildJSON --> CheckEmpty{Any data<br/>to backup?}
    
    CheckEmpty -->|No data| ErrorEmpty[Flash error:<br/>'No data to backup'<br/>Redirect]
    
    CheckEmpty -->|Has data| FormatJSON[Format JSON:<br/>JSON.stringify<br/>backupData, null, 2]
    
    FormatJSON --> SaveFile[Save to file system:<br/>backup_2024-11-11_14-30-00.json<br/><br/>fs.writeFileSync<br/>backupsDir + filename,<br/>jsonString]
    
    SaveFile --> DownloadBackup[Send to browser:<br/>res.download filename<br/><br/>Manager saves file locally]
    
    DownloadBackup --> BackupSuccess[✅ Backup complete]
    
    %% RESTORE FLOW
    ChooseAction -->|Restore| ShowUploadForm[GET /admin/backup/restore<br/><br/>Show file upload form]
    
    ShowUploadForm --> UploadFile[POST /admin/backup/restore<br/><br/>Manager uploads<br/>backup JSON file]
    
    UploadFile --> ReadFile[Read uploaded file:<br/>const jsonString =<br/>  fs.readFileSync<br/>  req.file.path, 'utf-8']
    
    ReadFile --> ParseJSON[Parse JSON:<br/>const backupData =<br/>  JSON.parse jsonString]
    
    ParseJSON --> ValidateJSON{Valid JSON<br/>structure?}
    
    ValidateJSON -->|Invalid| ErrorInvalidJSON[Flash error:<br/>'Invalid backup file'<br/>Redirect]
    
    ValidateJSON -->|Valid| ValidateSchema{Has required<br/>tables?}
    
    ValidateSchema -->|Missing tables| ErrorMissingTables[Flash error:<br/>'Backup missing required data'<br/>Redirect]
    
    ValidateSchema -->|All tables present| ConfirmRestore{Confirm<br/>restore?}
    
    ConfirmRestore -->|Cancel| CancelRestore[Flash info:<br/>'Restore cancelled'<br/>Redirect]
    
    ConfirmRestore -->|Confirm| StartTransaction[🔒 BEGIN TRANSACTION]
    
    StartTransaction --> ClearTables[Clear existing data:<br/>DELETE FROM order_items;<br/>DELETE FROM orders;<br/>DELETE FROM products;<br/>DELETE FROM users;<br/><br/>⚠️ Order matters!<br/>Foreign keys!]
    
    ClearTables --> RestoreUsers[Restore users:<br/>INSERT INTO users<br/>VALUES ...<br/><br/>backupData.users.forEach]
    
    RestoreUsers --> RestoreProducts[Restore products:<br/>INSERT INTO products<br/>VALUES ...<br/><br/>backupData.products.forEach]
    
    RestoreProducts --> RestoreOrders[Restore orders:<br/>INSERT INTO orders<br/>VALUES ...<br/><br/>backupData.orders.forEach]
    
    RestoreOrders --> RestoreOrderItems[Restore order_items:<br/>INSERT INTO order_items<br/>VALUES ...<br/><br/>backupData.order_items.forEach]
    
    RestoreOrderItems --> RestoreAudit[Restore audit_log:<br/>INSERT INTO audit_log<br/>VALUES ...<br/><br/>backupData.audit_log.forEach]
    
    RestoreAudit --> CommitTransaction[✅ COMMIT TRANSACTION]
    
    CommitTransaction --> LogRestore[Log restore action:<br/>logAudit db, userId,<br/>'RESTORE', 'database',<br/>0, null,<br/>&#123;rowsRestored: total&#125;,<br/>req.ip]
    
    LogRestore --> RestoreSuccess[✅ Restore complete<br/><br/>Flash success:<br/>'Database restored!<br/>X rows imported'<br/>Redirect]
    
    %% ERROR HANDLING
    RestoreUsers -->|Error| RollbackError[❌ ROLLBACK TRANSACTION]
    RestoreProducts -->|Error| RollbackError
    RestoreOrders -->|Error| RollbackError
    RestoreOrderItems -->|Error| RollbackError
    RestoreAudit -->|Error| RollbackError
    
    RollbackError --> LogError[Log error:<br/>console.error<br/>Error details]
    
    LogError --> ErrorRestore[Flash error:<br/>'Restore failed.<br/>Database unchanged.'<br/>Redirect]
    
    %% Styling
    classDef backupStyle fill:#90EE90,stroke:#4CAF50,stroke-width:2px
    classDef restoreStyle fill:#87CEEB,stroke:#0288D1,stroke-width:2px
    classDef transactionStyle fill:#FFD700,stroke:#F57C00,stroke-width:3px
    classDef errorStyle fill:#FFB6C1,stroke:#D32F2F,stroke-width:2px
    classDef decisionStyle fill:#E1BEE7,stroke:#7B1FA2,stroke-width:2px
    
    class InitBackup,GetTables,BuildJSON,FormatJSON,SaveFile,DownloadBackup,BackupSuccess backupStyle
    class ShowUploadForm,UploadFile,ReadFile,ParseJSON,RestoreUsers,RestoreProducts,RestoreOrders,RestoreOrderItems,RestoreAudit,LogRestore,RestoreSuccess restoreStyle
    class StartTransaction,CommitTransaction,ClearTables transactionStyle
    class ErrorEmpty,ErrorInvalidJSON,ErrorMissingTables,RollbackError,LogError,ErrorRestore errorStyle
    class ChooseAction,CheckEmpty,ValidateJSON,ValidateSchema,ConfirmRestore decisionStyle
```

## Key Insights

1. **Two distinct workflows:**
   - **Backup (green):** Export all tables → Format JSON → Save file → Download
   - **Restore (blue):** Upload file → Parse JSON → Validate → Clear tables → Insert data → Commit

2. **Transaction safety (yellow):**
   - BEGIN TRANSACTION before clearing tables
   - All inserts happen within transaction
   - COMMIT only if all succeed
   - ROLLBACK on any error (database unchanged)

3. **Deletion order matters:**
   - Must delete child tables before parent tables (foreign keys!)
   - Order: order_items → orders → products/audit_log → users

4. **Three validation checks:**
   - Is JSON parseable?
   - Does it have required structure?
   - Does user confirm restore (destructive action)?

## Code Mapping

### Backup Route

```javascript
// routes/admin.js
const fs = require('fs');
const path = require('path');

// Ensure backups directory exists
const backupsDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir);
}

// GET /admin/backup/export
app.get('/admin/backup/export', requireAuth, requireRole('manager'), (req, res) => {
  try {
    // Query all tables
    const users = db.prepare('SELECT * FROM users').all();
    const products = db.prepare('SELECT * FROM products').all();
    const orders = db.prepare('SELECT * FROM orders').all();
    const orderItems = db.prepare('SELECT * FROM order_items').all();
    const auditLog = db.prepare('SELECT * FROM audit_log').all();
    
    // Check if any data exists
    const totalRows = users.length + products.length + orders.length + 
                      orderItems.length + auditLog.length;
    
    if (totalRows === 0) {
      req.flash('error', 'No data to backup');
      return res.redirect('/admin');
    }
    
    // Build backup object
    const backupData = {
      metadata: {
        version: '1.0',
        timestamp: new Date().toISOString(),
        exportedBy: res.locals.user.username,
        totalRows: totalRows
      },
      users: users,
      products: products,
      orders: orders,
      order_items: orderItems,
      audit_log: auditLog
    };
    
    // Format as pretty JSON
    const jsonString = JSON.stringify(backupData, null, 2);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `backup_${timestamp}.json`;
    const filepath = path.join(backupsDir, filename);
    
    // Write to file
    fs.writeFileSync(filepath, jsonString, 'utf-8');
    
    // Log backup action
    logAudit(
      db,
      res.locals.user.id,
      'BACKUP',
      'database',
      0,
      null,
      { filename, totalRows },
      req.ip
    );
    
    // Send file to browser for download
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        req.flash('error', 'Failed to download backup');
        return res.redirect('/admin');
      }
      
      req.flash('success', `Backup created: ${totalRows} rows exported`);
    });
    
  } catch (error) {
    console.error('Backup error:', error);
    req.flash('error', 'Failed to create backup');
    res.redirect('/admin');
  }
});
```

### Restore Routes

```javascript
const multer = require('multer');

// Configure multer for file upload
const upload = multer({
  dest: path.join(__dirname, '../uploads'),
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB limit
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) === '.json') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files allowed'));
    }
  }
});

// GET /admin/backup/restore (show form)
app.get('/admin/backup/restore', requireAuth, requireRole('manager'), (req, res) => {
  res.render('admin/restore', {
    warning: 'This will replace ALL current data. Make sure you have a backup first!'
  });
});

// POST /admin/backup/restore (process upload)
app.post('/admin/backup/restore', 
  requireAuth, 
  requireRole('manager'), 
  upload.single('backupFile'),
  (req, res) => {
    try {
      // Check if file uploaded
      if (!req.file) {
        req.flash('error', 'Please select a backup file');
        return res.redirect('/admin/backup/restore');
      }
      
      // Read file
      const jsonString = fs.readFileSync(req.file.path, 'utf-8');
      
      // Parse JSON
      let backupData;
      try {
        backupData = JSON.parse(jsonString);
      } catch (parseError) {
        req.flash('error', 'Invalid JSON file');
        return res.redirect('/admin/backup/restore');
      }
      
      // Validate structure
      if (!backupData.users || !backupData.products || !backupData.orders) {
        req.flash('error', 'Backup file missing required data');
        return res.redirect('/admin/backup/restore');
      }
      
      // Restore data using transaction
      const restoreTransaction = db.transaction(() => {
        // Clear existing data (order matters - foreign keys!)
        db.prepare('DELETE FROM order_items').run();
        db.prepare('DELETE FROM orders').run();
        db.prepare('DELETE FROM audit_log').run();
        db.prepare('DELETE FROM qr_scans').run();
        db.prepare('DELETE FROM products').run();
        db.prepare('DELETE FROM users').run();
        
        // Restore users
        const insertUser = db.prepare(`
          INSERT INTO users (id, username, password_hash, role, created_at)
          VALUES (?, ?, ?, ?, ?)
        `);
        backupData.users.forEach(user => {
          insertUser.run(user.id, user.username, user.password_hash, 
                         user.role, user.created_at);
        });
        
        // Restore products
        const insertProduct = db.prepare(`
          INSERT INTO products (id, name, price, stock, qr_code, created_by, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        backupData.products.forEach(product => {
          insertProduct.run(product.id, product.name, product.price, 
                           product.stock, product.qr_code, 
                           product.created_by, product.created_at);
        });
        
        // Restore orders
        const insertOrder = db.prepare(`
          INSERT INTO orders (id, user_id, total, status, created_at)
          VALUES (?, ?, ?, ?, ?)
        `);
        backupData.orders.forEach(order => {
          insertOrder.run(order.id, order.user_id, order.total, 
                         order.status, order.created_at);
        });
        
        // Restore order items
        const insertOrderItem = db.prepare(`
          INSERT INTO order_items (id, order_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?, ?)
        `);
        backupData.order_items.forEach(item => {
          insertOrderItem.run(item.id, item.order_id, item.product_id, 
                             item.quantity, item.price);
        });
        
        // Restore audit log
        if (backupData.audit_log) {
          const insertAudit = db.prepare(`
            INSERT INTO audit_log (id, user_id, action, table_name, record_id,
                                   old_data, new_data, ip_address, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          backupData.audit_log.forEach(log => {
            insertAudit.run(log.id, log.user_id, log.action, log.table_name,
                           log.record_id, log.old_data, log.new_data,
                           log.ip_address, log.created_at);
          });
        }
      });
      
      // Execute transaction (all or nothing)
      restoreTransaction();
      
      // Count restored rows
      const totalRows = backupData.users.length + backupData.products.length +
                       backupData.orders.length + backupData.order_items.length;
      
      // Log restore action
      logAudit(
        db,
        res.locals.user.id,
        'RESTORE',
        'database',
        0,
        null,
        { 
          filename: req.file.originalname,
          rowsRestored: totalRows,
          backupTimestamp: backupData.metadata?.timestamp
        },
        req.ip
      );
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      req.flash('success', `Database restored! ${totalRows} rows imported.`);
      res.redirect('/admin');
      
    } catch (error) {
      console.error('Restore error:', error);
      
      // Clean up uploaded file if exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      req.flash('error', `Restore failed: ${error.message}. Database unchanged.`);
      res.redirect('/admin/backup/restore');
    }
  }
);
```

### Restore Form Template

```ejs
<!-- views/admin/restore.ejs -->
<!DOCTYPE html>
<html>
<head>
  <title>Restore Database</title>
  <style>
    .warning-box {
      background: #FFEBEE;
      border: 2px solid #D32F2F;
      color: #D32F2F;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .upload-box {
      border: 2px dashed #333;
      padding: 40px;
      text-align: center;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <h1>⚠️ Restore Database from Backup</h1>
  
  <div class="warning-box">
    <h2>⚠️ WARNING</h2>
    <p><strong><%= warning %></strong></p>
    <ul>
      <li>All current data will be deleted</li>
      <li>This action cannot be undone</li>
      <li>Make sure you have a recent backup</li>
      <li>Only use backup files from this system</li>
    </ul>
  </div>
  
  <form action="/admin/backup/restore" method="POST" enctype="multipart/form-data"
        onsubmit="return confirm('Are you SURE you want to restore? All current data will be lost!')">
    
    <div class="upload-box">
      <h3>Select Backup File</h3>
      <input type="file" name="backupFile" accept=".json" required>
      <p><small>Only .json backup files are accepted (max 10MB)</small></p>
    </div>
    
    <button type="submit" style="background: #D32F2F; color: white; padding: 15px 30px;">
      🔄 Restore Database
    </button>
    
    <a href="/admin">
      <button type="button">← Cancel</button>
    </a>
  </form>
</body>
</html>
```

## Common Mistakes

1. **Wrong deletion order:**
   ```javascript
   // ❌ Deleting parent before child (foreign key error!)
   db.prepare('DELETE FROM users').run();
   db.prepare('DELETE FROM orders').run();  // Error: orders reference users!
   
   // ✅ Delete child before parent
   db.prepare('DELETE FROM order_items').run();
   db.prepare('DELETE FROM orders').run();
   db.prepare('DELETE FROM products').run();
   db.prepare('DELETE FROM users').run();
   ```

2. **Not using transactions:**
   ```javascript
   // ❌ No transaction (partial restore on error!)
   db.prepare('DELETE FROM users').run();
   backupData.users.forEach(u => {
     db.prepare('INSERT INTO users...').run(...);  // If error here, users table is empty!
   });
   
   // ✅ Use transaction (all or nothing)
   const restore = db.transaction(() => {
     db.prepare('DELETE FROM users').run();
     backupData.users.forEach(u => {
       db.prepare('INSERT INTO users...').run(...);
     });
   });
   restore();  // Rolls back on error
   ```

3. **Not validating JSON structure:**
   ```javascript
   // ❌ No validation (crashes on malformed JSON)
   const backupData = JSON.parse(jsonString);
   backupData.users.forEach(...);  // Crashes if users is undefined!
   
   // ✅ Validate structure
   const backupData = JSON.parse(jsonString);
   if (!backupData.users || !Array.isArray(backupData.users)) {
     throw new Error('Invalid backup: missing users data');
   }
   ```

4. **Forgetting to clean up uploaded files:**
   ```javascript
   // ❌ Uploaded files accumulate in uploads/ folder
   app.post('/restore', upload.single('file'), (req, res) => {
     const data = fs.readFileSync(req.file.path);
     // ... process ...
     res.redirect('/admin');
     // File still exists in uploads/!
   });
   
   // ✅ Delete after processing
   app.post('/restore', upload.single('file'), (req, res) => {
     const data = fs.readFileSync(req.file.path);
     // ... process ...
     fs.unlinkSync(req.file.path);  // Clean up
     res.redirect('/admin');
   });
   ```

5. **Not confirming destructive action:**
   ```javascript
   // ❌ No confirmation (accidental restore!)
   <form action="/restore" method="POST">
     <button type="submit">Restore</button>
   </form>
   
   // ✅ JavaScript confirmation
   <form action="/restore" method="POST"
         onsubmit="return confirm('Delete all data and restore?')">
     <button type="submit">Restore</button>
   </form>
   ```

## Related Concepts
- Web App Basics Part 2C: Section 10 (JSON Backup/Restore)
- Database transactions
- File uploads with multer
- JSON serialization
- Foreign key constraints
