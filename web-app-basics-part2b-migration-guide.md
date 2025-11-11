# Building Web Applications - Part 2B Migration Guide
## Adding Authentication to Your Projects

**Target Audience:** Grade 9 Students  
**Prerequisites:** Completed Part 2A projects (SQLite databases)  
**What You'll Build:** Upgrade your v2 projects to v3 with user authentication

---

## 🎯 What This Guide Covers

You'll learn to add authentication to your existing projects by:
- Adding a users table to your database
- Implementing registration and login
- Protecting routes with middleware
- Creating admin and user roles
- Building an admin panel for user management
- Adding password reset functionality

**Final Outcome:** Your projects will have professional user authentication with role-based access control!

---

## 📋 Migration Overview

### What Changes?

**From Part 2A (v2):** Open access, no users  
**To Part 2B (v3):** Authenticated, role-based access

### The Three Projects

1. **Barangay Directory v2 → v3**
   - Admin: Barangay officials (manage all residents)
   - User: Residents (view own info only)

2. **Class List v2 → v3**
   - Admin: Teachers (manage students, enter grades)
   - User: Students (view own grades only)

3. **Store Inventory v2 → v3**
   - Admin: Store managers (manage products, view reports)
   - User: Cashiers (record sales only)

---

## 🗂️ Step 1: Add Users Table

### Update Database Setup

Open your `database/setup-database.js` and add the users table:

```javascript
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const db = new Database('data/myapp.db');

db.pragma('foreign_keys = ON');

// YOUR EXISTING TABLES (keep these!)
db.exec(`
  CREATE TABLE IF NOT EXISTS residents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    address TEXT NOT NULL,
    barangay_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barangay_id) REFERENCES barangays(id) ON DELETE CASCADE
  )
`);

// ... other existing tables ...

// NEW: Users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    must_change_password INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('✅ Users table created');

// Create default admin account
const hashedPassword = bcrypt.hashSync('admin123', 10);
db.prepare(`
  INSERT OR IGNORE INTO users (username, password, name, role)
  VALUES (?, ?, ?, ?)
`).run('admin', hashedPassword, 'Administrator', 'admin');

console.log('✅ Default admin created (username: admin, password: admin123)');

db.close();
```

**Run the setup:**
```bash
npm install bcrypt express-session better-sqlite3-session-store
node database/setup-database.js
```

---

## ⚙️ Step 2: Configure Sessions in app.js

### Add Session Imports

At the top of your `app.js`:

```javascript
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const SqliteStore = require('better-sqlite3-session-store')(session);

const app = express();
const db = new Database('data/myapp.db');
db.pragma('foreign_keys = ON');
```

### Add Session Middleware

After your existing middleware setup:

```javascript
// Existing middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// NEW: Session configuration
app.use(session({
  store: new SqliteStore({
    client: db,
    expired: {
      clear: true,
      intervalMs: 900000
    }
  }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// NEW: Load user into res.locals
app.use((req, res, next) => {
  if (req.session.userId) {
    const user = db.prepare('SELECT id, username, name, role FROM users WHERE id = ?')
      .get(req.session.userId);
    res.locals.user = user;
  } else {
    res.locals.user = null;
  }
  next();
});

// NEW: Force password change middleware
app.use((req, res, next) => {
  const exemptPaths = ['/login', '/logout', '/change-password', '/register'];
  if (exemptPaths.includes(req.path)) {
    return next();
  }
  
  if (req.session.userId) {
    const user = db.prepare('SELECT must_change_password FROM users WHERE id = ?')
      .get(req.session.userId);
    
    if (user && user.must_change_password === 1) {
      return res.redirect('/change-password');
    }
  }
  
  next();
});
```

### Add Middleware Functions

Before your routes:

```javascript
// Middleware: Require login
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// Middleware: Require admin role
function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  
  const user = db.prepare('SELECT role FROM users WHERE id = ?')
    .get(req.session.userId);
  
  if (!user || user.role !== 'admin') {
    return res.status(403).render('error', {
      message: 'Access denied. Admin only.'
    });
  }
  
  next();
}
```

---

## 📝 Step 3: Create Authentication Views

### Create views/login.ejs

```html
<!DOCTYPE html>
<html>
<head>
  <title>Login - <%= title || 'My App' %></title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
</head>
<body>
  <section class="section">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-4">
          <div class="box">
            <h1 class="title">Login</h1>
            
            <% if (typeof error !== 'undefined') { %>
              <div class="notification is-danger">
                <%= error %>
              </div>
            <% } %>
            
            <form method="POST" action="/login">
              <div class="field">
                <label class="label">Username</label>
                <div class="control">
                  <input class="input" type="text" name="username" required autofocus>
                </div>
              </div>
              
              <div class="field">
                <label class="label">Password</label>
                <div class="control">
                  <input class="input" type="password" name="password" required>
                </div>
              </div>
              
              <div class="field">
                <div class="control">
                  <button class="button is-primary is-fullwidth" type="submit">
                    Login
                  </button>
                </div>
              </div>
            </form>
            
            <p class="has-text-centered mt-4">
              Don't have an account? <a href="/register">Register here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</body>
</html>
```

### Create views/register.ejs

```html
<!DOCTYPE html>
<html>
<head>
  <title>Register - <%= title || 'My App' %></title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
</head>
<body>
  <section class="section">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-5">
          <div class="box">
            <h1 class="title">Create Account</h1>
            
            <% if (typeof error !== 'undefined') { %>
              <div class="notification is-danger">
                <%= error %>
              </div>
            <% } %>
            
            <form method="POST" action="/register">
              <div class="field">
                <label class="label">Full Name</label>
                <div class="control">
                  <input class="input" type="text" name="name" required>
                </div>
              </div>
              
              <div class="field">
                <label class="label">Username</label>
                <div class="control">
                  <input class="input" type="text" name="username" required>
                </div>
                <p class="help">Use letters and numbers only</p>
              </div>
              
              <div class="field">
                <label class="label">Password</label>
                <div class="control">
                  <input class="input" type="password" name="password" required>
                </div>
                <p class="help">At least 6 characters</p>
              </div>
              
              <div class="field">
                <label class="label">Confirm Password</label>
                <div class="control">
                  <input class="input" type="password" name="confirmPassword" required>
                </div>
              </div>
              
              <div class="field">
                <div class="control">
                  <button class="button is-primary is-fullwidth" type="submit">
                    Register
                  </button>
                </div>
              </div>
            </form>
            
            <p class="has-text-centered mt-4">
              Already have an account? <a href="/login">Login here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</body>
</html>
```

### Create views/change-password.ejs

```html
<!DOCTYPE html>
<html>
<head>
  <title>Change Password - <%= title || 'My App' %></title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
</head>
<body>
  <section class="section">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-5">
          <div class="box">
            <h1 class="title">Change Password Required</h1>
            
            <div class="notification is-warning">
              You must change your password before continuing.
            </div>
            
            <% if (typeof error !== 'undefined') { %>
              <div class="notification is-danger">
                <%= error %>
              </div>
            <% } %>
            
            <form method="POST" action="/change-password">
              <div class="field">
                <label class="label">New Password</label>
                <div class="control">
                  <input class="input" type="password" name="newPassword" required>
                </div>
                <p class="help">At least 6 characters</p>
              </div>
              
              <div class="field">
                <label class="label">Confirm New Password</label>
                <div class="control">
                  <input class="input" type="password" name="confirmPassword" required>
                </div>
              </div>
              
              <div class="field">
                <div class="control">
                  <button class="button is-primary is-fullwidth" type="submit">
                    Change Password
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</body>
</html>
```

---

## 🔐 Step 4: Add Authentication Routes

Add these routes to your `app.js`:

```javascript
// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Show login form
app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/');
  }
  res.render('login', { title: 'Login' });
});

// Handle login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.render('login', { 
      title: 'Login',
      error: 'Username and password required' 
    });
  }
  
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (!user) {
    return res.render('login', { 
      title: 'Login',
      error: 'Invalid username or password' 
    });
  }
  
  const passwordMatch = bcrypt.compareSync(password, user.password);
  
  if (!passwordMatch) {
    return res.render('login', { 
      title: 'Login',
      error: 'Invalid username or password' 
    });
  }
  
  req.session.userId = user.id;
  
  if (user.must_change_password === 1) {
    return res.redirect('/change-password');
  }
  
  res.redirect('/');
});

// Show registration form
app.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

// Handle registration
app.post('/register', (req, res) => {
  const { username, password, confirmPassword, name } = req.body;
  
  if (!username || !password || !name) {
    return res.render('register', { 
      title: 'Register',
      error: 'All fields are required' 
    });
  }
  
  if (password.length < 6) {
    return res.render('register', { 
      title: 'Register',
      error: 'Password must be at least 6 characters' 
    });
  }
  
  if (password !== confirmPassword) {
    return res.render('register', { 
      title: 'Register',
      error: 'Passwords do not match' 
    });
  }
  
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.render('register', { 
      title: 'Register',
      error: 'Username already taken' 
    });
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  const result = db.prepare(`
    INSERT INTO users (username, password, name, role)
    VALUES (?, ?, ?, ?)
  `).run(username, hashedPassword, name, 'user');
  
  req.session.userId = result.lastInsertRowid;
  
  res.redirect('/');
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/login');
  });
});

// Show change password form
app.get('/change-password', requireLogin, (req, res) => {
  res.render('change-password', { title: 'Change Password' });
});

// Handle password change
app.post('/change-password', requireLogin, (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  
  if (!newPassword || !confirmPassword) {
    return res.render('change-password', { 
      title: 'Change Password',
      error: 'All fields required' 
    });
  }
  
  if (newPassword.length < 6) {
    return res.render('change-password', { 
      title: 'Change Password',
      error: 'Password must be at least 6 characters' 
    });
  }
  
  if (newPassword !== confirmPassword) {
    return res.render('change-password', { 
      title: 'Change Password',
      error: 'Passwords do not match' 
    });
  }
  
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  
  db.prepare(`
    UPDATE users 
    SET password = ?, must_change_password = 0 
    WHERE id = ?
  `).run(hashedPassword, req.session.userId);
  
  res.redirect('/');
});
```

---

## 🛡️ Step 5: Protect Your Existing Routes

Now protect your existing CRUD routes with middleware.

### Example: Barangay Directory

**BEFORE (Part 2A - no protection):**
```javascript
app.get('/residents', (req, res) => {
  const residents = db.prepare('SELECT * FROM residents').all();
  res.render('residents/list', { residents });
});
```

**AFTER (Part 2B - requires login):**
```javascript
app.get('/residents', requireLogin, (req, res) => {
  const residents = db.prepare('SELECT * FROM residents').all();
  res.render('residents/list', { residents, title: 'Residents' });
});
```

### Protect All CRUD Routes

Add `requireLogin` or `requireAdmin` to routes:

```javascript
// LIST - Anyone logged in can view
app.get('/residents', requireLogin, (req, res) => { /* ... */ });

// CREATE - Admin only
app.get('/residents/new', requireAdmin, (req, res) => { /* ... */ });
app.post('/residents', requireAdmin, (req, res) => { /* ... */ });

// EDIT - Admin only
app.get('/residents/:id/edit', requireAdmin, (req, res) => { /* ... */ });
app.post('/residents/:id', requireAdmin, (req, res) => { /* ... */ });

// DELETE - Admin only
app.post('/residents/:id/delete', requireAdmin, (req, res) => { /* ... */ });
```

---

## 👥 Step 6: Create Admin Panel

### Create views/admin/users.ejs

```html
<!DOCTYPE html>
<html>
<head>
  <title>User Management - <%= title || 'Admin Panel' %></title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
</head>
<body>
  <%- include('../partials/navbar') %>
  
  <section class="section">
    <div class="container">
      <h1 class="title">User Management</h1>
      
      <% if (typeof tempPassword !== 'undefined') { %>
        <div class="notification is-success">
          <strong>Temporary Password:</strong> <%= tempPassword %>
          <br>
          <small>Give this to the user. They will be forced to change it on login.</small>
        </div>
      <% } %>
      
      <table class="table is-fullwidth is-striped is-hoverable">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <% users.forEach(u => { %>
            <tr>
              <td><%= u.name %></td>
              <td><%= u.username %></td>
              <td>
                <span class="tag <%= u.role === 'admin' ? 'is-danger' : 'is-info' %>">
                  <%= u.role %>
                </span>
              </td>
              <td><%= new Date(u.created_at).toLocaleDateString() %></td>
              <td>
                <% if (u.id !== user.id) { %>
                  <form method="POST" action="/admin/users/<%= u.id %>/reset-password" style="display: inline;">
                    <button class="button is-small is-warning" type="submit">
                      Reset Password
                    </button>
                  </form>
                  
                  <form method="POST" action="/admin/users/<%= u.id %>/delete" 
                        style="display: inline;" 
                        onsubmit="return confirm('Delete <%= u.name %>?')">
                    <button class="button is-small is-danger" type="submit">
                      Delete
                    </button>
                  </form>
                <% } else { %>
                  <span class="tag is-light">You</span>
                <% } %>
              </td>
            </tr>
          <% }); %>
        </tbody>
      </table>
    </div>
  </section>
</body>
</html>
```

### Add Admin Routes

```javascript
// ============================================
// ADMIN ROUTES
// ============================================

// Admin dashboard
app.get('/admin', requireAdmin, (req, res) => {
  res.render('admin/dashboard', { title: 'Admin Dashboard' });
});

// User management
app.get('/admin/users', requireAdmin, (req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  res.render('admin/users', { users, title: 'User Management' });
});

// Reset user password
app.post('/admin/users/:id/reset-password', requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id);
  
  if (userId === req.session.userId) {
    return res.redirect('/admin/users');
  }
  
  const tempPassword = 'Temp' + Math.floor(Math.random() * 100000);
  const hashedPassword = bcrypt.hashSync(tempPassword, 10);
  
  db.prepare(`
    UPDATE users 
    SET password = ?, must_change_password = 1 
    WHERE id = ?
  `).run(hashedPassword, userId);
  
  const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  res.render('admin/users', { users, tempPassword, title: 'User Management' });
});

// Delete user
app.post('/admin/users/:id/delete', requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id);
  
  if (userId === req.session.userId) {
    return res.redirect('/admin/users');
  }
  
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  res.redirect('/admin/users');
});
```

---

## 🎨 Step 7: Update Navbar with User Info

### Create/Update views/partials/navbar.ejs

```html
<nav class="navbar is-primary" role="navigation">
  <div class="navbar-brand">
    <a class="navbar-item" href="/">
      <strong><%= title || 'My App' %></strong>
    </a>
  </div>

  <div class="navbar-menu">
    <div class="navbar-start">
      <% if (user) { %>
        <a class="navbar-item" href="/residents">
          Residents
        </a>
        
        <% if (user.role === 'admin') { %>
          <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link">
              Admin
            </a>
            <div class="navbar-dropdown">
              <a class="navbar-item" href="/admin/users">
                User Management
              </a>
              <a class="navbar-item" href="/residents/new">
                Add Resident
              </a>
            </div>
          </div>
        <% } %>
      <% } %>
    </div>

    <div class="navbar-end">
      <% if (user) { %>
        <div class="navbar-item">
          <span>Welcome, <strong><%= user.name %></strong>!</span>
        </div>
        
        <div class="navbar-item">
          <form method="POST" action="/logout">
            <button class="button is-light" type="submit">
              Logout
            </button>
          </form>
        </div>
      <% } else { %>
        <a class="navbar-item" href="/login">
          Login
        </a>
        <a class="navbar-item" href="/register">
          Register
        </a>
      <% } %>
    </div>
  </div>
</nav>
```

### Include Navbar in All Views

Update your existing views to include the navbar:

```html
<!DOCTYPE html>
<html>
<head>
  <title><%= title || 'My App' %></title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
</head>
<body>
  <%- include('partials/navbar') %>
  
  <!-- Your existing content here -->
  
</body>
</html>
```

---

## 🎯 Project-Specific Examples

### Barangay Directory v3: Role-Based Access

**Admin features:**
- Create, edit, delete residents
- Manage all barangays
- User management panel
- View all certificates

**User (Resident) features:**
- View own information only
- Request certificates
- Update own contact info (if allowed)

**Implementation:**

```javascript
// Residents list - show all or just own record
app.get('/residents', requireLogin, (req, res) => {
  let residents;
  
  if (res.locals.user.role === 'admin') {
    // Admin sees all residents
    residents = db.prepare('SELECT * FROM residents ORDER BY name').all();
  } else {
    // Regular user sees only their own record
    // Assume username matches resident name (or use a user_id foreign key)
    residents = db.prepare('SELECT * FROM residents WHERE name = ?')
      .all(res.locals.user.name);
  }
  
  res.render('residents/list', { residents, title: 'Residents' });
});

// Edit resident - admin only or own record
app.get('/residents/:id/edit', requireLogin, (req, res) => {
  const resident = db.prepare('SELECT * FROM residents WHERE id = ?')
    .get(req.params.id);
  
  if (!resident) {
    return res.status(404).send('Resident not found');
  }
  
  // Check authorization
  if (res.locals.user.role !== 'admin' && resident.name !== res.locals.user.name) {
    return res.status(403).send('You can only edit your own record');
  }
  
  const barangays = db.prepare('SELECT * FROM barangays').all();
  res.render('residents/edit', { resident, barangays, title: 'Edit Resident' });
});
```

---

### Class List v3: Teacher & Student Roles

**Admin (Teacher) features:**
- Add, edit, delete students
- Enter and update grades
- View all class sections
- Generate reports

**User (Student) features:**
- View own grades only
- View own attendance
- Cannot modify anything

**Implementation:**

```javascript
// Grades list - teacher sees all, student sees own
app.get('/grades', requireLogin, (req, res) => {
  let grades;
  
  if (res.locals.user.role === 'admin') {
    // Teacher sees all grades
    grades = db.prepare(`
      SELECT students.name, students.section, grades.subject, grades.score
      FROM students
      JOIN grades ON students.id = grades.student_id
      ORDER BY students.section, students.name
    `).all();
  } else {
    // Student sees only own grades
    grades = db.prepare(`
      SELECT students.name, students.section, grades.subject, grades.score
      FROM students
      JOIN grades ON students.id = grades.student_id
      WHERE students.name = ?
      ORDER BY grades.subject
    `).all(res.locals.user.name);
  }
  
  res.render('grades/list', { grades, title: 'Grades' });
});

// Add grade - teacher only
app.post('/grades', requireAdmin, (req, res) => {
  const { student_id, subject, score } = req.body;
  
  db.prepare(`
    INSERT INTO grades (student_id, subject, score, teacher_id)
    VALUES (?, ?, ?, ?)
  `).run(student_id, subject, score, req.session.userId);
  
  res.redirect('/grades');
});
```

---

### Store Inventory v3: Manager & Cashier Roles

**Admin (Manager) features:**
- Add, edit, delete products
- Manage categories
- View all sales
- Generate sales reports
- Manage users (cashiers)

**User (Cashier) features:**
- Record sales only
- View today's sales (own transactions)
- Cannot edit product prices
- Cannot delete products

**Implementation:**

```javascript
// Products list - everyone can view
app.get('/products', requireLogin, (req, res) => {
  const products = db.prepare(`
    SELECT products.*, categories.name as category_name
    FROM products
    LEFT JOIN categories ON products.category_id = categories.id
    ORDER BY products.name
  `).all();
  
  res.render('products/list', { products, title: 'Products' });
});

// Add product - manager only
app.get('/products/new', requireAdmin, (req, res) => {
  const categories = db.prepare('SELECT * FROM categories').all();
  res.render('products/new', { categories, title: 'Add Product' });
});

// Record sale - everyone can
app.post('/sales', requireLogin, (req, res) => {
  const { product_id, quantity } = req.body;
  
  // Get product price
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  
  if (!product || product.stock < quantity) {
    return res.status(400).send('Insufficient stock');
  }
  
  // Record sale
  db.prepare(`
    INSERT INTO sales (product_id, quantity, total_price, cashier_id)
    VALUES (?, ?, ?, ?)
  `).run(product_id, quantity, product.price * quantity, req.session.userId);
  
  // Update stock
  db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?')
    .run(quantity, product_id);
  
  res.redirect('/sales');
});

// Sales report - filtered by role
app.get('/sales', requireLogin, (req, res) => {
  let sales;
  
  if (res.locals.user.role === 'admin') {
    // Manager sees all sales
    sales = db.prepare(`
      SELECT sales.*, products.name as product_name, users.name as cashier_name
      FROM sales
      JOIN products ON sales.product_id = products.id
      JOIN users ON sales.cashier_id = users.id
      ORDER BY sales.created_at DESC
      LIMIT 50
    `).all();
  } else {
    // Cashier sees only own sales
    sales = db.prepare(`
      SELECT sales.*, products.name as product_name
      FROM sales
      JOIN products ON sales.product_id = products.id
      WHERE sales.cashier_id = ?
      ORDER BY sales.created_at DESC
      LIMIT 50
    `).all(req.session.userId);
  }
  
  res.render('sales/list', { sales, title: 'Sales History' });
});
```

---

## ✅ Migration Checklist

Use this checklist for each project:

### Database & Setup
- [ ] Install authentication packages (`bcrypt`, `express-session`, `better-sqlite3-session-store`)
- [ ] Add users table to `database/setup-database.js`
- [ ] Create default admin account
- [ ] Run setup script

### App Configuration
- [ ] Add session imports to `app.js`
- [ ] Configure session middleware
- [ ] Add user loading middleware (`res.locals.user`)
- [ ] Add force password change middleware
- [ ] Create `requireLogin` middleware function
- [ ] Create `requireAdmin` middleware function

### Views
- [ ] Create `views/login.ejs`
- [ ] Create `views/register.ejs`
- [ ] Create `views/change-password.ejs`
- [ ] Create `views/admin/users.ejs`
- [ ] Create/update `views/partials/navbar.ejs` with user info
- [ ] Update all existing views to include navbar

### Routes
- [ ] Add authentication routes (login, register, logout, change-password)
- [ ] Add admin routes (dashboard, user management, password reset)
- [ ] Protect existing CRUD routes with `requireLogin` or `requireAdmin`
- [ ] Add role-based filtering to list views

### Testing
- [ ] Test registration flow
- [ ] Test login with correct credentials
- [ ] Test login with wrong credentials
- [ ] Test logout
- [ ] Test admin can access admin panel
- [ ] Test regular user cannot access admin panel
- [ ] Test password reset flow
- [ ] Test force password change
- [ ] Test role-based data filtering

---

## 🐛 Troubleshooting

### "Cannot find module 'bcrypt'"
```bash
npm install bcrypt
```

### Session not persisting
Check session store configuration:
```javascript
const SqliteStore = require('better-sqlite3-session-store')(session);
app.use(session({
  store: new SqliteStore({ client: db }),
  // ... rest of config
}));
```

### User not showing in navbar
Verify user loading middleware is before your routes:
```javascript
app.use((req, res, next) => {
  if (req.session.userId) {
    res.locals.user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  } else {
    res.locals.user = null;
  }
  next();
});
```

### Can't access admin panel
Check user role in database:
```sql
SELECT * FROM users WHERE username = 'admin';
-- role should be 'admin', not 'user'
```

### Password change loop
Ensure you're setting `must_change_password = 0`:
```javascript
db.prepare('UPDATE users SET password = ?, must_change_password = 0 WHERE id = ?')
  .run(hashedPassword, userId);
```

---

## 🚀 What's Next?

**Congratulations!** Your projects now have professional authentication! 🎉

**Next steps:**
1. Test thoroughly with different user roles
2. Deploy to Railway (remember to set `SESSION_SECRET` environment variable!)
3. Move on to Part 2C for advanced features:
   - Search and filtering
   - CSV export/import
   - QR codes
   - Flash messages
   - Audit logging
   - External API integration

**Part 2C Preview:**
Your v3 projects will become v4 with features like:
- DataTables.js for advanced table management
- CSV bulk import for data migration
- QR codes for resident IDs
- Flash messages for better UX
- Audit logging for accountability
- REST Countries API for location data

---

## 📚 Additional Resources

- See `web-app-basics-part2b-lecture.md` for detailed authentication concepts
- See `support-materials/session-config-guide.md` for session troubleshooting
- See `support-materials/security-checklist.md` before deploying

---

**Ready for Part 2C advanced features!** 🚀

*Last updated: November 11, 2025*
