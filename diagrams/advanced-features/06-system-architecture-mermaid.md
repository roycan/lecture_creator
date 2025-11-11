# System Architecture - Complete Web Application (Mermaid)

## Purpose
Component diagram showing the complete architecture of the sari-sari store web application, including all layers, data flows, and external integrations.

## Rendering
**VS Code:** Built-in Mermaid support (preview Markdown files)  
**GitHub:** Renders automatically in `.md` files  
**Online:** [mermaid.live](https://mermaid.live)

## Diagram

```mermaid
graph TB
    subgraph Client["🌐 CLIENT LAYER (Browser)"]
        Browser[Web Browser]
        HTML[HTML/EJS Templates]
        CSS[CSS Stylesheets]
        JS[Client-Side JavaScript]
        
        HTML --> Browser
        CSS --> Browser
        JS --> Browser
    end
    
    subgraph CDN["☁️ CDN / EXTERNAL LIBRARIES"]
        Bootstrap[Bootstrap CSS/JS]
        DataTables[DataTables Library]
        QRScanner[HTML5-QRCode Library]
        jQueryCDN[jQuery CDN]
    end
    
    subgraph Server["🖥️ SERVER LAYER (Node.js/Express)"]
        Express[Express Server<br/>Port 3000]
        
        subgraph Middleware["Middleware Stack"]
            Static[express.static<br/>Serve public files]
            Session[express-session<br/>Session management]
            Flash[connect-flash<br/>Flash messages]
            Auth[Authentication<br/>requireAuth middleware]
            RBAC[Authorization<br/>requireRole middleware]
            BodyParser[body-parser<br/>Parse form data]
        end
        
        subgraph Routes["Route Handlers"]
            AuthRoutes[Auth Routes<br/>/login, /register, /logout]
            ProductRoutes[Product Routes<br/>/products, /products/add]
            CartRoutes[Cart Routes<br/>/cart, /cart/add]
            OrderRoutes[Order Routes<br/>/orders, /checkout]
            AdminRoutes[Admin Routes<br/>/admin/audit, /admin/users]
            APIRoutes[API Routes<br/>/api/products/lookup]
        end
        
        subgraph Utils["Utility Modules"]
            QRGen[QR Generator<br/>generateProductCode]
            AuditLog[Audit Logger<br/>logAudit function]
            EmailSender[Email Sender<br/>sendOrderConfirmation]
        end
    end
    
    subgraph Database["💾 DATABASE LAYER (SQLite)"]
        SQLite[(SQLite Database<br/>store.db)]
        
        subgraph Tables["Database Tables"]
            Users[users<br/>id, username, password_hash,<br/>role, created_at]
            Products[products<br/>id, name, price, stock,<br/>qr_code, created_by]
            Orders[orders<br/>id, user_id, total,<br/>status, created_at]
            OrderItems[order_items<br/>id, order_id, product_id,<br/>quantity, price]
            AuditLogs[audit_log<br/>id, user_id, action,<br/>table_name, old_data, new_data]
            QRScans[qr_scans<br/>id, product_id, qr_code,<br/>scanned_at, ip_address]
            Sessions[sessions<br/>sid, sess, expire<br/>(connect-sqlite3)]
        end
    end
    
    subgraph External["🔌 EXTERNAL SERVICES"]
        SMTP[SMTP Server<br/>Email notifications]
        FileSystem[File System<br/>Uploaded files,<br/>CSV imports,<br/>Backups]
    end
    
    %% Client to CDN
    Browser -.->|Load libraries| Bootstrap
    Browser -.->|Load libraries| DataTables
    Browser -.->|Load libraries| QRScanner
    Browser -.->|Load libraries| jQueryCDN
    
    %% Client to Server
    Browser -->|HTTP Requests<br/>GET, POST| Express
    Express -->|HTTP Responses<br/>HTML, JSON, Redirects| Browser
    
    %% Server flow
    Express --> Middleware
    Middleware --> Routes
    Routes --> Utils
    
    %% Routes to specific endpoints
    AuthRoutes --> Auth
    ProductRoutes --> Auth
    ProductRoutes --> RBAC
    CartRoutes --> Auth
    OrderRoutes --> Auth
    AdminRoutes --> RBAC
    
    %% Utils interactions
    QRGen -.->|Generate codes| ProductRoutes
    AuditLog -.->|Log changes| ProductRoutes
    AuditLog -.->|Log changes| AdminRoutes
    EmailSender -.->|Send emails| OrderRoutes
    
    %% Server to Database
    AuthRoutes -->|SELECT, INSERT| Users
    ProductRoutes -->|SELECT, INSERT, UPDATE| Products
    CartRoutes -->|SELECT| Products
    OrderRoutes -->|INSERT| Orders
    OrderRoutes -->|INSERT| OrderItems
    OrderRoutes -->|UPDATE| Products
    AdminRoutes -->|SELECT| AuditLogs
    APIRoutes -->|SELECT| Products
    APIRoutes -->|INSERT| QRScans
    Session -->|Store sessions| Sessions
    AuditLog -->|INSERT| AuditLogs
    
    %% Database relationships
    Orders -.->|user_id FK| Users
    OrderItems -.->|order_id FK| Orders
    OrderItems -.->|product_id FK| Products
    Products -.->|created_by FK| Users
    AuditLogs -.->|user_id FK| Users
    QRScans -.->|product_id FK| Products
    
    %% External services
    EmailSender -->|Send via SMTP| SMTP
    ProductRoutes -->|Read CSV| FileSystem
    AdminRoutes -->|Write backup JSON| FileSystem
    
    %% Styling
    classDef clientStyle fill:#E3F2FD,stroke:#0288D1,stroke-width:2px
    classDef serverStyle fill:#E8F5E9,stroke:#4CAF50,stroke-width:2px
    classDef dbStyle fill:#FFF3E0,stroke:#F57C00,stroke-width:2px
    classDef externalStyle fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px
    classDef cdnStyle fill:#E0F2F1,stroke:#00897B,stroke-width:2px
    
    class Browser,HTML,CSS,JS clientStyle
    class Express,Middleware,Routes,Utils,Static,Session,Flash,Auth,RBAC,BodyParser serverStyle
    class Express,AuthRoutes,ProductRoutes,CartRoutes,OrderRoutes,AdminRoutes,APIRoutes serverStyle
    class QRGen,AuditLog,EmailSender serverStyle
    class SQLite,Tables,Users,Products,Orders,OrderItems,AuditLogs,QRScans,Sessions dbStyle
    class SMTP,FileSystem externalStyle
    class Bootstrap,DataTables,QRScanner,jQueryCDN cdnStyle
```

## Key Insights

1. **Four-layer architecture:**
   - **Client Layer:** Browser with HTML/CSS/JS
   - **CDN Layer:** External libraries (Bootstrap, DataTables, etc.)
   - **Server Layer:** Node.js/Express with middleware and routes
   - **Database Layer:** SQLite with 7 tables

2. **Data flow:**
   - Solid arrows = Direct interactions (HTTP requests, database queries)
   - Dashed arrows = Indirect dependencies (foreign keys, utility functions, CDN loads)

3. **Security layers:**
   - Middleware stack processes every request
   - Authentication checks (requireAuth)
   - Authorization checks (requireRole)
   - Session management with database storage

4. **Key integrations:**
   - External SMTP for emails
   - File system for CSV imports and JSON backups
   - CDN libraries for client-side functionality

## Code Mapping

### Application Entry Point

```javascript
// app.js - Main application file
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const SqliteStore = require('connect-sqlite3')(session);
const db = require('./database');

const app = express();

// ====================
// MIDDLEWARE STACK (in order!)
// ====================

// 1. Static files (serve CSS, JS, images)
app.use(express.static('public'));

// 2. Body parser (parse form data)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 3. Session management
app.use(session({
  store: new SqliteStore({ db: 'sessions.db' }),
  secret: 'your-secret-key-here-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7  // 1 week
  }
}));

// 4. Flash messages
app.use(flash());

// 5. Make flash messages and user available in all templates
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.user || null;
  next();
});

// 6. View engine
app.set('view engine', 'ejs');

// ====================
// ROUTES
// ====================

// Public routes (no auth required)
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// Protected routes (auth required)
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const apiRoutes = require('./routes/api');

app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/api', apiRoutes);

// Admin routes (manager role required)
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

// ====================
// ERROR HANDLING
// ====================

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: err.message });
});

// ====================
// START SERVER
// ====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
```

### Middleware Modules

```javascript
// middleware/auth.js
function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Please log in to access this page');
    return res.redirect('/login');
  }
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user) {
      req.flash('error', 'Please log in');
      return res.redirect('/login');
    }
    
    if (req.session.user.role !== role) {
      req.flash('error', 'Access denied');
      return res.redirect('/');
    }
    
    next();
  };
}

module.exports = { requireAuth, requireRole };
```

### Database Schema

```javascript
// database.js
const Database = require('better-sqlite3');
const db = new Database('store.db');

db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Products table
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL,
    qr_code TEXT UNIQUE,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );
  
  -- Orders table
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  
  -- Order items table
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
  
  -- Audit log table
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
  );
  
  -- QR scans table
  CREATE TABLE IF NOT EXISTS qr_scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    qr_code TEXT NOT NULL,
    scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
  
  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_products_qr_code ON products(qr_code);
  CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
  CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
  CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
`);

module.exports = db;
```

### Route Example: Products

```javascript
// routes/products.js
const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAuth, requireRole } = require('../middleware/auth');
const { generateProductCode } = require('../utils/qr-generator');
const { logAudit } = require('../utils/audit');

// List all products (public)
router.get('/', requireAuth, (req, res) => {
  const products = db.prepare(`
    SELECT id, name, price, stock, qr_code
    FROM products
    ORDER BY name
  `).all();
  
  res.render('products/list', { products });
});

// Show add product form (manager only)
router.get('/add', requireAuth, requireRole('manager'), (req, res) => {
  res.render('products/add');
});

// Create product (manager only)
router.post('/', requireAuth, requireRole('manager'), (req, res) => {
  const qrCode = generateProductCode();
  
  const result = db.prepare(`
    INSERT INTO products (name, price, stock, qr_code, created_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    req.body.name,
    req.body.price,
    req.body.stock,
    qrCode,
    res.locals.user.id
  );
  
  // Log audit
  logAudit(
    db,
    res.locals.user.id,
    'CREATE',
    'products',
    result.lastInsertRowid,
    null,
    {
      name: req.body.name,
      price: req.body.price,
      stock: req.body.stock,
      qr_code: qrCode
    },
    req.ip
  );
  
  req.flash('success', 'Product added successfully!');
  res.redirect('/products');
});

// Update product (manager only)
router.post('/:id/edit', requireAuth, requireRole('manager'), (req, res) => {
  // Get old data FIRST
  const old = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  
  if (!old) {
    req.flash('error', 'Product not found');
    return res.redirect('/products');
  }
  
  // Update
  db.prepare(`
    UPDATE products
    SET name = ?, price = ?, stock = ?
    WHERE id = ?
  `).run(req.body.name, req.body.price, req.body.stock, req.params.id);
  
  // Log audit
  logAudit(
    db,
    res.locals.user.id,
    'UPDATE',
    'products',
    req.params.id,
    { name: old.name, price: old.price, stock: old.stock },
    { name: req.body.name, price: req.body.price, stock: req.body.stock },
    req.ip
  );
  
  req.flash('success', 'Product updated!');
  res.redirect('/products');
});

module.exports = router;
```

### Utility Modules

```javascript
// utils/qr-generator.js
const { v4: uuidv4 } = require('uuid');

function generateProductCode() {
  const year = new Date().getFullYear();
  const uniqueId = uuidv4().slice(0, 8).toUpperCase();
  return `PROD-${year}-${uniqueId}`;
}

module.exports = { generateProductCode };
```

```javascript
// utils/audit.js
function logAudit(db, userId, action, tableName, recordId, oldData, newData, ipAddress) {
  db.prepare(`
    INSERT INTO audit_log (
      user_id, action, table_name, record_id,
      old_data, new_data, ip_address, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
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

module.exports = { logAudit };
```

```javascript
// utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendOrderConfirmation(order, userEmail) {
  const mailOptions = {
    from: '"Sari-Sari Store" <noreply@sarisaristore.com>',
    to: userEmail,
    subject: `Order Confirmation #${order.id}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Order #${order.id}</p>
      <p>Total: ₱${order.total.toFixed(2)}</p>
      <p>Status: ${order.status}</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

module.exports = { sendOrderConfirmation };
```

## Common Mistakes

1. **Wrong middleware order:**
   ```javascript
   // ❌ Flash after session won't work
   app.use(flash());
   app.use(session(...));  // Too late! Flash needs session
   
   // ✅ Correct order
   app.use(session(...));
   app.use(flash());
   ```

2. **Not using foreign keys:**
   ```sql
   -- ❌ No referential integrity
   CREATE TABLE orders (
     id INTEGER PRIMARY KEY,
     user_id INTEGER  -- No FK constraint
   );
   
   -- ✅ With foreign keys
   CREATE TABLE orders (
     id INTEGER PRIMARY KEY,
     user_id INTEGER,
     FOREIGN KEY (user_id) REFERENCES users(id)
   );
   ```

3. **Hardcoding secrets:**
   ```javascript
   // ❌ Secret in code (exposed in Git!)
   app.use(session({ secret: 'my-secret-123' }));
   
   // ✅ Use environment variables
   app.use(session({ secret: process.env.SESSION_SECRET }));
   ```

4. **Not indexing foreign keys:**
   ```sql
   -- ❌ Slow JOINs (no index on user_id)
   SELECT * FROM orders WHERE user_id = ?;
   
   -- ✅ Add index
   CREATE INDEX idx_orders_user_id ON orders(user_id);
   ```

5. **Missing error handling:**
   ```javascript
   // ❌ Crashes on database error
   app.post('/products', (req, res) => {
     db.prepare('INSERT...').run(...);
     res.redirect('/products');
   });
   
   // ✅ Catch errors
   app.post('/products', (req, res) => {
     try {
       db.prepare('INSERT...').run(...);
       res.redirect('/products');
     } catch (err) {
       req.flash('error', 'Failed to create product');
       res.redirect('/products/add');
     }
   });
   ```

## Related Concepts
- Web App Basics Part 2C: All sections (complete architecture)
- Express middleware chain
- Database normalization and foreign keys
- MVC architecture pattern
- RESTful API design
