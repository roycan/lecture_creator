# Web App Basics - Part 2 Implementation Plan

**Created:** November 10, 2025  
**Status:** Planning Phase - Pre-Implementation  
**Target:** Grade 9 Students (Post Part 1 & AJAX/Fetch Lecture)

---

## 📋 Executive Summary

Part 2 builds on the solid foundation of Part 1 (Express, EJS, JSON, Bulma) and AJAX/Fetch lecture (Promises, async/await, client-side API calls) to create **production-ready web applications** with databases, authentication, and professional features.

**Strategic Split:** 3 phases for manageable complexity and high confidence
- **Part 2A:** Database & CRUD Operations (95% confidence)
- **Part 2B:** Authentication & Authorization (96% confidence)  
- **Part 2C:** Advanced Features & APIs (94% confidence)

**Overall Confidence:** 95%  
**Estimated Total Files:** ~170 files  
**Student Outcome:** Can confidently build and deploy small business web applications

---

## 🎯 Learning Continuity Check

### Prerequisites Confirmed

#### From AJAX/Fetch Lecture ✅
Students already know:
- `fetch()` API (client-side requests)
- Promises (`.then()` and `.catch()`)
- `async/await` syntax
- JSON parsing (`response.json()`)
- Error handling (try/catch)
- Loading states
- Real patterns: debouncing, caching, parallel requests

#### From Part 1 ✅
Students already know:
- Command line basics
- Node.js & Express fundamentals
- EJS templating
- Bulma CSS framework
- JSON file operations (read/write)
- Forms (GET/POST)
- Deployment (Railway)
- Project structure

### Concept Progression Map

```
AJAX/Fetch Lecture → Part 1 → Part 2A → Part 2B → Part 2C
─────────────────────────────────────────────────────────
fetch() from APIs  → Express routes → SQL queries → Auth middleware → Client fetch
Promises           → Server logic  → Database    → Sessions        → API integration
JSON parsing       → JSON files    → SQLite      → bcrypt hashing  → QR codes
Error handling     → Form handling → Transactions→ Protected routes → REST Countries
```

### No Knowledge Gaps Identified ✅

**Rationale:**
- Students comfortable with async operations (AJAX lecture)
- Students comfortable with server-side rendering (Part 1)
- Part 2 builds naturally on both foundations
- No new paradigms required
- Progressive complexity (database → auth → advanced)

---

## 📚 Part 2A: Database & CRUD Operations

**Duration:** 4-5 days  
**Confidence:** 95%  
**Why this confidence:** SQLite is simpler than PostgreSQL, CRUD is familiar pattern from JSON files

### Learning Objectives

By end of 2A, students will:
- Explain why databases > JSON files (concurrency, speed, relationships, integrity)
- Create SQLite databases with proper schemas
- Write SQL queries (SELECT, INSERT, UPDATE, DELETE)
- Implement complete CRUD operations
- Use prepared statements (SQL injection prevention)
- Handle database errors gracefully

### File Structure (~60 files)

```
practice-apps/
├── 07-sqlite-basics/          # Hello SQLite (read data)
├── 08-crud-simple/            # Single table CRUD
├── 09-crud-validation/        # CRUD with form validation
├── 10-relationships/          # Multiple tables with JOIN

mini-projects/ (UPGRADES from Part 1)
├── barangay-directory-v2/     # JSON → SQLite + full CRUD
├── class-list-v2/             # JSON → SQLite + full CRUD
├── store-inventory-v2/        # JSON → SQLite + full CRUD

diagram-src/database-basics/
├── 01-json-vs-database.md     # Visual comparison
├── 02-sql-operations.md       # CRUD visualized
├── 03-table-relationships.md  # Foreign keys, JOINs
├── 04-prepared-statements.md  # SQL injection prevention
├── 05-database-schema.md      # Table design patterns
├── 06-transaction-flow.md     # BEGIN/COMMIT/ROLLBACK
├── 07-error-handling.md       # Database error patterns
├── 08-migration-strategy.md   # JSON to SQLite migration

support-materials/
├── sql-cheat-sheet.md         # Quick SQL reference
├── sqlite-setup-guide.md      # Installation & setup
├── schema-templates/          # Ready-to-use table designs
│   ├── users.sql
│   ├── products.sql
│   └── transactions.sql
```

### Topics Covered

#### App 07: SQLite Basics
- Installing better-sqlite3
- Creating database file
- Reading data with SELECT
- Displaying in EJS template
- **Teaching moment:** Compare speed vs JSON

```javascript
// Simple read example
const db = require('better-sqlite3')('data.db');
const students = db.prepare('SELECT * FROM students').all();
res.render('list', { students });
```

#### App 08: CRUD Simple
- CREATE (INSERT INTO)
- READ (SELECT with WHERE)
- UPDATE (UPDATE SET WHERE)
- DELETE (DELETE FROM WHERE)
- **Teaching moment:** Prepared statements prevent SQL injection

```javascript
// Safe parameterized query
const stmt = db.prepare('INSERT INTO students (name, grade) VALUES (?, ?)');
stmt.run(req.body.name, req.body.grade);
```

#### App 09: CRUD with Validation
- Server-side validation (check empty fields, validate types)
- Flash messages for feedback
- Form error display
- **Teaching moment:** Never trust user input

```javascript
// Manual validation (NOT express-validator)
if (!req.body.name || !req.body.grade) {
  req.session.error = 'All fields required';
  return res.redirect('/add');
}
```

#### App 10: Relationships
- Foreign keys (one-to-many)
- JOIN queries (display related data)
- Dropdown selects (foreign key selection)
- **Teaching moment:** How tables relate (students → sections)

```javascript
// JOIN example
const query = `
  SELECT students.*, sections.name as section_name 
  FROM students 
  JOIN sections ON students.section_id = sections.id
`;
```

### Mini-Project Upgrades

**Same 3 projects from Part 1, now with database:**

1. **Barangay Directory v2**
   - residents table (id, name, address, birthday, contact)
   - households table (id, head_of_household)
   - Full CRUD for residents
   - List with search/filter

2. **Class List v2**
   - students table (id, name, student_number, section_id, grade)
   - sections table (id, name, adviser)
   - Full CRUD for students
   - Grade computation

3. **Store Inventory v2**
   - products table (id, name, price, stock, category_id)
   - categories table (id, name, description)
   - Full CRUD for products
   - Low stock alerts

### Key Teaching Principles (2A)

✅ **Simplicity over power:** Use better-sqlite3 (simpler API than node-sqlite3)  
✅ **Safety first:** Always use prepared statements  
✅ **Manual validation:** Clear if/else checks (NOT express-validator)  
✅ **Familiar patterns:** CRUD operations mirror JSON file operations from Part 1  
✅ **Visual learning:** Diagrams show data flow, table relationships, SQL syntax

### Risk Mitigation (2A)

**Potential Issue:** SQL syntax errors  
**Mitigation:** Provide SQL templates, clear examples, SQLite browser tool for testing

**Potential Issue:** Confusion about foreign keys  
**Mitigation:** Start with single table (App 08), introduce relationships gradually (App 10)

**Potential Issue:** Database file corruption  
**Mitigation:** Teach backup/restore early, show .db file in Git ignore

---

## 🔐 Part 2B: Authentication & Authorization

**Duration:** 3-4 days  
**Confidence:** 96%  
**Why this confidence:** Simplified to 2 roles, admin-assisted password reset, no email

### Learning Objectives

By end of 2B, students will:
- Implement user registration with password hashing (bcrypt)
- Create login/logout flow with sessions (express-session)
- Protect routes (require login)
- Implement role-based access (admin vs user)
- Force password change on first login
- Understand security fundamentals (never store plain passwords)

### File Structure (~50 files)

```
practice-apps/
├── 11-auth-basics/            # Registration + Login + Logout
├── 12-protected-routes/       # Middleware to require login
├── 13-role-based-access/      # Admin vs User permissions

mini-projects/ (ADD AUTH to Part 2A upgrades)
├── barangay-directory-v3/     # Add: login, admin creates residents
├── class-list-v3/             # Add: login, teachers manage students
├── store-inventory-v3/        # Add: login, managers manage products

diagram-src/authentication/
├── 01-password-hashing.md     # Why bcrypt, how it works
├── 02-session-flow.md         # Login → Session → Logout
├── 03-auth-middleware.md      # Route protection pattern
├── 04-role-system.md          # Admin vs User (2 roles only)
├── 05-registration-flow.md    # Signup process
├── 06-password-reset-flow.md  # Admin-assisted reset

support-materials/
├── auth-patterns.md           # Common authentication patterns
├── session-config-guide.md    # express-session setup
├── security-checklist.md      # Password storage, session secrets
```

### Topics Covered

#### App 11: Auth Basics
- User registration form
- Password hashing with bcrypt
- Login with session storage
- Logout (destroy session)
- **Teaching moment:** Never store plain passwords!

```javascript
// Registration
const bcrypt = require('bcrypt');
const hashedPassword = bcrypt.hashSync(req.body.password, 10);
db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(
  req.body.username, hashedPassword, 'user'
);

// Login
const user = db.prepare('SELECT * FROM users WHERE username = ?').get(req.body.username);
if (user && bcrypt.compareSync(req.body.password, user.password)) {
  req.session.userId = user.id;
  res.redirect('/dashboard');
}
```

#### App 12: Protected Routes
- Middleware to check if logged in
- Redirect to login if not authenticated
- Display user info in navbar (res.locals pattern)
- **Teaching moment:** Middleware = code that runs before routes

```javascript
// Middleware
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// Protected route
app.get('/dashboard', requireLogin, (req, res) => {
  res.render('dashboard');
});
```

#### App 13: Role-Based Access
- Two roles: admin & user
- Admin-only routes (middleware check)
- Different views based on role
- Admin can reset user passwords
- **Teaching moment:** 2 roles cover 90% of use cases

```javascript
// Admin middleware
function requireAdmin(req, res, next) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  if (user.role !== 'admin') {
    return res.status(403).send('Access denied');
  }
  next();
}

// Admin-only route
app.get('/admin/users', requireLogin, requireAdmin, (req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  res.render('admin/users', { users });
});
```

### User Context Pattern (res.locals)

**DRY principle:** Don't pass user to every render

```javascript
// Middleware to load user into res.locals
app.use((req, res, next) => {
  if (req.session.userId) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
    res.locals.user = user;
  }
  next();
});

// Now available in all templates
<% if (user) { %>
  <p>Welcome, <%= user.name %>!</p>
<% } %>
```

### Admin-Assisted Password Reset Flow

**Why this approach:**
- ✅ No email service needed
- ✅ Works offline (rural areas)
- ✅ Admin has control (small organizations)
- ✅ Simple to implement (2-3 routes)

**Flow:**
1. User forgets password → contacts admin (in person/phone)
2. Admin verifies identity (offline)
3. Admin logs in → User Management → Reset Password
4. Admin sets temp password (or generates random)
5. Admin gives temp password to user
6. User logs in → Forced to change password
7. User sets own password

```javascript
// Admin resets password
app.post('/admin/users/:id/reset-password', requireAdmin, (req, res) => {
  const tempPassword = 'TempPass' + Math.floor(Math.random() * 10000);
  const hashedPassword = bcrypt.hashSync(tempPassword, 10);
  
  db.prepare('UPDATE users SET password = ?, must_change_password = 1 WHERE id = ?')
    .run(hashedPassword, req.params.id);
  
  req.session.tempPasswordDisplay = tempPassword; // Show to admin
  res.redirect('/admin/users');
});

// Force password change middleware
app.use((req, res, next) => {
  if (req.session.userId && !req.path.startsWith('/change-password')) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
    if (user.must_change_password) {
      return res.redirect('/change-password');
    }
  }
  next();
});
```

### Database Schema

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- bcrypt hash
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user', -- 'admin' or 'user'
  must_change_password INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Mini-Project Auth Integration

**All 3 projects get authentication:**

1. **Barangay Directory v3**
   - Admin role: Barangay officials
   - User role: Residents (view only their data)
   - Admin can: CRUD residents, manage users
   - User can: View own info, request certificates

2. **Class List v3**
   - Admin role: Teachers
   - User role: Students (view only their grades)
   - Admin can: CRUD students, enter grades
   - User can: View own grades, attendance

3. **Store Inventory v3**
   - Admin role: Store manager
   - User role: Cashiers
   - Admin can: CRUD products, view all sales
   - User can: Record sales only

### Key Teaching Principles (2B)

✅ **Security first:** Emphasize bcrypt, never plain passwords  
✅ **Two roles only:** Admin & User (simple, clear, sufficient)  
✅ **No email complexity:** Admin-assisted password reset  
✅ **DRY pattern:** res.locals for user context  
✅ **Real-world aligned:** Matches how small organizations work

### Risk Mitigation (2B)

**Potential Issue:** Students forget to hash passwords  
**Mitigation:** Every example shows bcrypt, security-checklist.md, code comments

**Potential Issue:** Session configuration confusion  
**Mitigation:** Provide session-config-guide.md, copy-paste ready setup

**Potential Issue:** Role logic complexity  
**Mitigation:** Only 2 roles, simple if/else checks, clear middleware examples

---

## ⭐ Part 2C: Advanced Features & API Integration

**Duration:** 4-5 days  
**Confidence:** 94%  
**Why this confidence:** Students already know fetch from AJAX lecture, features are additive

### Learning Objectives

By end of 2C, students will:
- Implement search and filter functionality
- Add pagination (DataTables.js for client-side)
- Create flash messages for user feedback
- Export/import data (CSV, JSON backup)
- Integrate external APIs (QR codes, REST Countries)
- Implement audit logging (who did what, when)
- Use professional UI libraries (DataTables.js)

### File Structure (~60 files)

```
practice-apps/
├── 14-search-filter-pagination/  # Search, filter, DataTables.js
├── 15-flash-csv/                 # Flash messages, CSV export/import
├── 16-audit-qr/                  # Audit logging, QR code API
├── 17-api-integration/           # REST Countries API, full integration

mini-projects/ (ENHANCE Part 2B versions)
├── barangay-directory-v4/        # Add: search, CSV export, QR IDs, audit log
├── class-list-v4/                # Add: filter, CSV grades, country flags, audit
├── store-inventory-v4/           # Add: search, CSV inventory, QR labels, audit

diagram-src/advanced-features/
├── 01-search-patterns.md         # Search query patterns
├── 02-pagination-strategy.md     # Server vs client-side pagination
├── 03-csv-export-flow.md         # Data to CSV conversion
├── 04-csv-import-flow.md         # Bulk data upload
├── 05-audit-logging.md           # Audit log design
├── 06-datatables-integration.md  # DataTables.js setup
├── 07-qr-code-api.md            # QR code generation
├── 08-rest-countries-api.md     # Country data integration
├── 09-flash-messages.md         # User feedback patterns
├── 10-json-backup.md            # Backup/restore strategy

support-materials/
├── api-integration-guide.md      # How to use external APIs
├── datatables-setup.md           # DataTables.js quick start
├── csv-handling.md               # CSV import/export patterns
├── audit-log-schema.sql          # Audit table template
```

### Topics Covered

#### App 14: Search, Filter, Pagination
- Search by name/keyword (LIKE query)
- Filter by category/status (WHERE clause)
- **DataTables.js** for client-side sorting/pagination
- **Teaching moment:** When to use client vs server-side

```javascript
// Simple search
app.get('/search', (req, res) => {
  const query = req.query.q;
  const results = db.prepare('SELECT * FROM products WHERE name LIKE ?').all(`%${query}%`);
  res.render('results', { results, query });
});
```

```html
<!-- DataTables.js integration (client-side) -->
<link rel="stylesheet" href="https://cdn.datatables.net/1.11.5/css/jquery.dataTables.min.css">
<script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>

<script>
  $(document).ready(function() {
    $('#myTable').DataTable({
      pageLength: 10,
      order: [[0, 'asc']]
    });
  });
</script>
```

#### App 15: Flash Messages & CSV
- Flash messages with connect-flash
- CSV export (convert table to CSV)
- CSV import (parse and insert bulk data)
- **Teaching moment:** Data portability

```javascript
// Flash messages
const flash = require('connect-flash');
app.use(flash());

app.post('/add', (req, res) => {
  // ... add product ...
  req.flash('success', 'Product added successfully!');
  res.redirect('/products');
});

// CSV export
app.get('/export/csv', (req, res) => {
  const products = db.prepare('SELECT * FROM products').all();
  const csv = 'Name,Price,Stock\n' + products.map(p => 
    `${p.name},${p.price},${p.stock}`
  ).join('\n');
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
  res.send(csv);
});
```

#### App 16: Audit Logging & QR Codes
- Audit log table (action, user, timestamp, data)
- Log CREATE/UPDATE/DELETE operations
- **QR Code API** (no JavaScript needed!)
- **Teaching moment:** Accountability & compliance

```sql
-- Audit log schema
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  old_data TEXT, -- JSON string of old values
  new_data TEXT, -- JSON string of new values
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

```javascript
// Log delete operation
function logDelete(userId, tableName, recordId, oldData) {
  db.prepare(`
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_data) 
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, 'DELETE', tableName, recordId, JSON.stringify(oldData));
}

// Before deleting
const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
db.prepare('DELETE FROM products WHERE id = ?').run(id);
logDelete(req.session.userId, 'products', id, product);
```

```html
<!-- QR Code (just an img tag!) -->
<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=RESIDENT-<%= resident.id %>" 
     alt="QR Code for <%= resident.name %>">
```

#### App 17: REST Countries API Integration
- Fetch country data (client-side)
- Display country dropdown with flags
- **Teaching moment:** Apply AJAX skills to server-rendered apps

```html
<!-- Country selector with flags -->
<select id="country" name="country">
  <option>Loading countries...</option>
</select>

<script>
  // Students already learned this in AJAX lecture!
  fetch('https://restcountries.com/v3.1/all')
    .then(response => response.json())
    .then(countries => {
      const select = document.getElementById('country');
      select.innerHTML = countries
        .sort((a, b) => a.name.common.localeCompare(b.name.common))
        .map(c => `<option value="${c.name.common}">${c.flag} ${c.name.common}</option>`)
        .join('');
    })
    .catch(error => {
      console.error('Could not load countries:', error);
      select.innerHTML = '<option>Error loading countries</option>';
    });
</script>
```

### JSON Backup/Restore

**Why:** Disaster recovery, migration, testing

```javascript
// Backup database to JSON
app.get('/admin/backup', requireAdmin, (req, res) => {
  const backup = {
    users: db.prepare('SELECT * FROM users').all(),
    products: db.prepare('SELECT * FROM products').all(),
    // ... other tables ...
    backup_date: new Date().toISOString()
  };
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=backup.json');
  res.send(JSON.stringify(backup, null, 2));
});

// Restore from JSON
app.post('/admin/restore', requireAdmin, (req, res) => {
  const backup = JSON.parse(req.body.jsonData);
  
  db.transaction(() => {
    db.prepare('DELETE FROM users').run();
    backup.users.forEach(user => {
      db.prepare('INSERT INTO users (id, username, password, name, role) VALUES (?, ?, ?, ?, ?)')
        .run(user.id, user.username, user.password, user.name, user.role);
    });
    // ... restore other tables ...
  })();
  
  req.flash('success', 'Database restored from backup!');
  res.redirect('/admin');
});
```

### Mini-Project Enhancements

**All 3 projects get advanced features:**

1. **Barangay Directory v4**
   - Search residents by name
   - CSV export (resident list)
   - CSV import (bulk resident upload)
   - QR code for resident IDs
   - Audit log (who added/updated residents)
   - DataTables.js for sortable table

2. **Class List v4**
   - Filter students by section
   - CSV export (grades report)
   - Country selector for international students
   - QR code for student IDs
   - Audit log (grade changes)
   - DataTables.js for student list

3. **Store Inventory v4**
   - Search products by name/category
   - CSV export/import (inventory)
   - QR code for product labels
   - JSON backup/restore
   - Audit log (stock changes)
   - DataTables.js for product table

### Key Teaching Principles (2C)

✅ **Leverage prior learning:** Students already know fetch/async-await  
✅ **Progressive enhancement:** Each feature is optional, additive  
✅ **Professional tools:** DataTables.js shows when to delegate to libraries  
✅ **Real business value:** CSV export, audit logs, QR codes = client expectations  
✅ **Client-side delegation:** Some features better in browser (sorting, pagination)

### Risk Mitigation (2C)

**Potential Issue:** API downtime during demo  
**Mitigation:** Show both working and error states, have fallback data

**Potential Issue:** CSV parsing complexity  
**Mitigation:** Use simple CSV format (no commas in values), clear validation

**Potential Issue:** DataTables.js configuration  
**Mitigation:** Provide copy-paste ready setup, minimal options

---

## 📊 Overall Feasibility Assessment

### Confidence Breakdown

| Phase | Confidence | Risk Level | Mitigation Strength |
|-------|-----------|------------|---------------------|
| Part 2A | 95% | 🟢 Low | Strong (familiar CRUD pattern) |
| Part 2B | 96% | 🟢 Low | Strong (simplified to 2 roles) |
| Part 2C | 94% | 🟡 Medium | Strong (students know fetch) |
| **Overall** | **95%** | 🟢 **Low** | **Strong** |

### Concept Alignment Matrix

| Concept | AJAX Lecture | Part 1 | Part 2A | Part 2B | Part 2C |
|---------|-------------|--------|---------|---------|---------|
| Async/Promises | ✅ Taught | - | - | - | ✅ Applied |
| fetch() API | ✅ Taught | - | - | - | ✅ Applied |
| JSON | ✅ Taught | ✅ Used | ✅ Migrated from | - | ✅ Backup format |
| Forms | - | ✅ Taught | ✅ Enhanced | ✅ Auth forms | ✅ CSV upload |
| Express routes | - | ✅ Taught | ✅ DB routes | ✅ Protected | ✅ Advanced |
| EJS templates | - | ✅ Taught | ✅ Used | ✅ + User context | ✅ + APIs |
| Error handling | ✅ Taught | ✅ Basic | ✅ DB errors | ✅ Auth errors | ✅ API errors |

**No gaps identified!** Each concept builds naturally on prior learning.

### Progressive Complexity Validation

```
Part 0 (AJAX): Client-side data fetching
Part 1: Server-side rendering, JSON storage
Part 2A: Database storage (familiar CRUD pattern)
Part 2B: User sessions (layer on top of 2A)
Part 2C: Enhancement features (layer on top of 2B)
```

**Each phase adds ONE major concept:**
- 2A: Database (vs JSON files)
- 2B: Authentication (vs public access)
- 2C: Professional features (vs basic CRUD)

✅ **Validation: Progressive complexity is sound**

### Time Estimation

| Phase | Teaching Time | Practice Time | Total Time |
|-------|--------------|---------------|------------|
| Part 2A | 2-3 days | 2 days | 4-5 days |
| Part 2B | 1-2 days | 2 days | 3-4 days |
| Part 2C | 2 days | 2-3 days | 4-5 days |
| **Total** | **5-7 days** | **6-7 days** | **11-14 days** |

**Realistic for 2-3 week curriculum** ✅

### Student Load Assessment

**Practice apps:** 4 per phase × 3 phases = 12 apps  
**Mini-projects:** 3 projects × 4 versions (v1→v4) = 12 versions total  
**Practice files per phase:** ~20 files  
**Total student interaction:** ~60 practice files

**Assessment:** Manageable with clear progression ✅

---

## 🎯 Success Metrics

### Part 2A Success Criteria
- [ ] Student can explain why databases > JSON
- [ ] Student can write SELECT/INSERT/UPDATE/DELETE queries
- [ ] Student can implement full CRUD on single table
- [ ] Student understands SQL injection and uses prepared statements
- [ ] Student can create table relationships with foreign keys

### Part 2B Success Criteria
- [ ] Student can implement registration with bcrypt
- [ ] Student can create login/logout flow with sessions
- [ ] Student can protect routes with middleware
- [ ] Student understands 2-role system (admin vs user)
- [ ] Student can implement admin-assisted password reset

### Part 2C Success Criteria
- [ ] Student can add search functionality
- [ ] Student can export/import CSV data
- [ ] Student can integrate QR code API
- [ ] Student can integrate REST Countries API
- [ ] Student can implement audit logging
- [ ] Student understands when to use DataTables.js

### Overall Success Criteria
- [ ] Student completes all 3 mini-projects (v1→v4)
- [ ] Student deploys Part 2C projects to Railway
- [ ] Student can explain their project structure confidently
- [ ] Student can identify which projects they can take on (using project-scoping.md)
- [ ] Student portfolio has 3 production-ready apps

---

## 🚨 Risk Register

### High-Impact Risks (Addressed)

| Risk | Impact | Probability | Mitigation | Status |
|------|--------|-------------|------------|--------|
| SQL syntax errors | HIGH | Medium | SQL templates, clear examples | ✅ Mitigated |
| Password security mistakes | HIGH | Low | Security checklist, bcrypt examples | ✅ Mitigated |
| API downtime during demo | MEDIUM | Low | Show error handling, fallback data | ✅ Mitigated |
| Role logic confusion | MEDIUM | Low | Only 2 roles, clear middleware | ✅ Mitigated |
| Database corruption | MEDIUM | Low | Backup early and often, .gitignore .db | ✅ Mitigated |

### Low-Impact Risks (Monitored)

| Risk | Impact | Probability | Response |
|------|--------|-------------|----------|
| Student forgets concepts from Part 1 | LOW | Medium | Quick refresher at start of 2A |
| CSV parsing edge cases | LOW | Medium | Use simple CSV format, validate |
| DataTables.js configuration | LOW | Low | Copy-paste ready setup |

---

## 📋 Implementation Checklist

### Pre-Implementation (Current Phase)
- [x] Define Part 2A, 2B, 2C scope
- [x] Verify concept alignment with AJAX & Part 1
- [x] Assess feasibility and confidence levels
- [x] Identify potential risks and mitigations
- [x] Create project-scoping.md for students
- [ ] Get stakeholder approval on plan
- [ ] Lock in scope (no more changes!)

### Part 2A Implementation
- [ ] Create practice apps 07-10
- [ ] Upgrade mini-projects v1→v2 (add database)
- [ ] Create 8 database diagrams
- [ ] Create sql-cheat-sheet.md
- [ ] Create sqlite-setup-guide.md
- [ ] Create schema-templates/
- [ ] Test all database operations
- [ ] Verify Railway deployment compatibility

### Part 2B Implementation
- [ ] Create practice apps 11-13
- [ ] Upgrade mini-projects v2→v3 (add auth)
- [ ] Create 6 authentication diagrams
- [ ] Create auth-patterns.md
- [ ] Create session-config-guide.md
- [ ] Create security-checklist.md
- [ ] Test password reset flow
- [ ] Verify session persistence on Railway

### Part 2C Implementation
- [ ] Create practice apps 14-17
- [ ] Upgrade mini-projects v3→v4 (add advanced features)
- [ ] Create 10 advanced feature diagrams
- [ ] Create api-integration-guide.md
- [ ] Create datatables-setup.md
- [ ] Create csv-handling.md
- [ ] Test QR code and REST Countries APIs
- [ ] Verify all features work on Railway

### Post-Implementation
- [ ] Create comprehensive Part 2 lecture markdown
- [ ] Create implementation log
- [ ] Test complete learning path (Part 1→2A→2B→2C)
- [ ] Student pilot testing
- [ ] Gather feedback and iterate
- [ ] Document lessons learned

---

## 🎓 Pedagogical Approach

### Teaching Philosophy

**1. Build on Strengths**
- Students already comfortable with AJAX (fetch, async)
- Students already comfortable with Express (routes, EJS)
- Part 2 combines both strengths

**2. Progressive Complexity**
- One major new concept per phase
- Each phase builds on previous
- No paradigm shifts

**3. Practical First**
- Show working code immediately
- Explain theory through examples
- Real projects, not toy examples

**4. Visual Learning**
- ~24 diagrams across all phases
- Flow charts for complex processes
- Visual comparisons (JSON vs DB)

**5. Safe Experimentation**
- Practice apps before mini-projects
- Database migrations can be reverted
- Clear error messages guide learning

### Differentiation Strategies

**For Advanced Students:**
- Challenge: Add 3rd role (moderator)
- Challenge: Implement soft delete instead of audit log
- Challenge: Server-side pagination instead of DataTables.js
- Challenge: Add weather API to dashboard

**For Struggling Students:**
- Focus on single mini-project (choose favorite)
- Provide more code templates
- Pair programming with peers
- Extended office hours for auth concepts

---

## 💡 Innovation Highlights

### What Makes This Plan Unique

**1. Strategic API Selection**
- Only simple, no-auth APIs (QR, Countries)
- Leverages existing fetch knowledge
- High visual impact, low complexity

**2. Admin-Assisted Password Reset**
- Realistic for small organizations
- No email service complexity
- Teaches admin capabilities

**3. Audit Logging Over Soft Delete**
- Better compliance
- More educational value
- Teaches accountability

**4. DataTables.js Delegation**
- Professional UI, zero backend code
- Teaches when to use libraries
- Client-side performance

**5. Two-Role Simplicity**
- Covers 90% of use cases
- Easy to understand
- Extendable later if needed

---

## 📚 Dependencies

### NPM Packages Required

**Part 2A:**
- `better-sqlite3` - SQLite database
- `express` - Web framework (already have)
- `ejs` - Templating (already have)

**Part 2B:**
- `express-session` - Session management
- `bcrypt` - Password hashing
- `connect-flash` - Flash messages

**Part 2C:**
- No additional packages! (APIs via CDN/fetch)

**Total new dependencies:** 4 packages (small footprint)

### External Services

**Required:**
- Railway (already using from Part 1)

**Optional (free tier, no signup):**
- QR Server API (https://goqr.me/api/)
- REST Countries API (https://restcountries.com/)

**No paid services required** ✅

---

## 🔄 Iterative Improvements

### Post-Pilot Adjustments

**If confidence drops below 90% during implementation:**
1. Reduce scope (remove one advanced feature from 2C)
2. Increase practice time (add one more practice app)
3. Simplify mini-project requirements
4. Add more visual diagrams

**If students exceed expectations:**
1. Add stretch goals (weather API, email sending)
2. Introduce Part 3 concepts early
3. Student-led feature selection for final projects

---

## ✅ Final Approval Checklist

**Before proceeding to implementation, confirm:**

- [x] Concept progression is logical (AJAX → Part 1 → Part 2)
- [x] No knowledge gaps identified
- [x] Confidence levels are realistic (95%, 96%, 94%)
- [x] Risks are identified and mitigated
- [x] Student load is manageable (~12 apps, 3 projects)
- [x] Time estimates are realistic (2-3 weeks total)
- [x] Dependencies are minimal and stable
- [x] All features support project-scoping.md guidelines
- [ ] Stakeholder approval obtained
- [ ] Ready to begin Part 2A implementation

---

## 🎯 Next Steps

1. **Await approval** on this plan
2. **Lock scope** - no changes after approval
3. **Begin Part 2A implementation** - Apps 07-10, diagrams, support files
4. **Sequential rollout** - Complete 2A before starting 2B
5. **Continuous testing** - Verify each app works on Railway
6. **Documentation** - Update logs throughout implementation

---

**Ready to build production-ready web applications! 🚀**

*Last updated: November 10, 2025*  
*Status: Awaiting approval*
