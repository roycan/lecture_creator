# SQLite Setup Guide

Complete guide for setting up SQLite with better-sqlite3 in your Node.js projects

---

## Table of Contents

- [Installation](#installation)
- [Basic Setup](#basic-setup)
- [Database File Management](#database-file-management)
- [Railway Deployment](#railway-deployment)
- [Common Issues](#common-issues)
- [Migration from JSON](#migration-from-json)

---

## Installation

### Step 1: Install better-sqlite3

```bash
npm install better-sqlite3
```

**Why better-sqlite3?**
- ✅ Synchronous API (easier to use than async)
- ✅ Faster than other SQLite libraries
- ✅ Type-safe prepared statements
- ✅ Built-in transaction support
- ✅ Active maintenance

### Step 2: Verify Installation

Create a test file `test-db.js`:

```javascript
const Database = require('better-sqlite3');

try {
  const db = new Database('test.db');
  console.log('✓ SQLite connected successfully');
  
  // Test query
  const result = db.prepare('SELECT sqlite_version()').get();
  console.log('SQLite version:', result['sqlite_version()']);
  
  db.close();
  console.log('✓ Database closed');
} catch (error) {
  console.error('✗ Error:', error.message);
}
```

Run:
```bash
node test-db.js
```

Expected output:
```
✓ SQLite connected successfully
SQLite version: 3.45.0
✓ Database closed
```

---

## Basic Setup

### Project Structure

```
my-app/
├── app.js                 # Main application
├── database/
│   ├── setup-database.js  # Schema creation
│   ├── seed-data.js       # Sample data (optional)
│   └── db-connection.js   # Database instance (optional)
├── data/
│   └── database.db        # SQLite file (gitignored)
├── views/
│   └── ...
├── package.json
├── .gitignore
└── README.md
```

### Setup Script: `database/setup-database.js`

```javascript
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database path
const dbPath = path.join(dataDir, 'database.db');

// Open connection
const db = new Database(dbPath);

// Enable foreign keys (important!)
db.pragma('foreign_keys = ON');

console.log('Creating tables...');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    adviser TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    student_id TEXT NOT NULL UNIQUE,
    section_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
  );
`);

// Create indexes
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_students_section_id ON students(section_id);
  CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
`);

console.log('✓ Database setup complete');

// Optional: Insert sample data
const sectionStmt = db.prepare('INSERT INTO sections (name, adviser) VALUES (?, ?)');
const sections = [
  ['10-A', 'Ms. Garcia'],
  ['10-B', 'Mr. Santos'],
  ['10-C', 'Mrs. Cruz']
];

const insertSections = db.transaction(() => {
  sections.forEach(section => sectionStmt.run(...section));
});

insertSections();

console.log('✓ Sample data inserted');

db.close();
console.log('✓ Database closed');
```

Run setup:
```bash
node database/setup-database.js
```

### Main Application: `app.js`

```javascript
const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3000;

// Database connection
const dbPath = path.join(__dirname, 'data', 'database.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  const students = db.prepare(`
    SELECT 
      students.id,
      students.name,
      students.student_id,
      sections.name as section_name
    FROM students
    INNER JOIN sections ON students.section_id = sections.id
    ORDER BY students.name
  `).all();

  res.render('index', { students });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  console.log('\nDatabase closed');
  process.exit();
});
```

---

## Database File Management

### .gitignore Setup

**Always gitignore your database file!**

`.gitignore`:
```gitignore
# Database files
data/
*.db
*.db-shm
*.db-wal

# Node modules
node_modules/

# Environment variables
.env

# OS files
.DS_Store
Thumbs.db
```

**Why gitignore database.db?**
- 🔒 May contain sensitive data (user info, passwords)
- 📦 Binary files don't merge well in git
- 🔄 Each developer should have their own local database
- 🚀 Production database is separate from development

### Development vs Production

```javascript
// Environment-based database path
const isDevelopment = process.env.NODE_ENV !== 'production';

const dbPath = isDevelopment
  ? path.join(__dirname, 'data', 'database.db')      // Local file
  : path.join('/data', 'database.db');               // Railway volume

const db = new Database(dbPath);
```

### Backup Database

```javascript
// backup-database.js
const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('data/database.db');
const backupPath = `backups/database-${Date.now()}.db`;

// Create backup directory
if (!fs.existsSync('backups')) {
  fs.mkdirSync('backups', { recursive: true });
}

// Create backup
db.backup(backupPath)
  .then(() => {
    console.log(`✓ Backup created: ${backupPath}`);
    db.close();
  })
  .catch(error => {
    console.error('✗ Backup failed:', error);
  });
```

---

## Railway Deployment

### Step 1: Add Volume

In Railway dashboard:
1. Click your service
2. Go to **Variables** tab
3. Add volume:
   - **Mount path:** `/data`
   - **Name:** `app-database`

### Step 2: Update Database Path

```javascript
// app.js
const path = require('path');
const fs = require('fs');

// Use /data volume in production
const dataDir = process.env.RAILWAY_ENVIRONMENT 
  ? '/data' 
  : path.join(__dirname, 'data');

// Ensure directory exists (for local development)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.db');
const db = new Database(dbPath);
```

### Step 3: Setup Database on Deploy

Add to `package.json`:

```json
{
  "scripts": {
    "start": "node app.js",
    "setup": "node database/setup-database.js",
    "deploy": "npm run setup && npm start"
  }
}
```

In Railway:
- **Start Command:** `npm run deploy`

### Step 4: Check Database Status

Add a status route:

```javascript
app.get('/db-status', (req, res) => {
  try {
    const count = db.prepare('SELECT COUNT(*) as count FROM students').get();
    const dbPath = db.name;
    
    res.json({
      status: 'connected',
      students: count.count,
      path: dbPath,
      environment: process.env.RAILWAY_ENVIRONMENT || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});
```

Visit: `https://your-app.railway.app/db-status`

---

## Common Issues

### Issue 1: Database is Locked

**Error:**
```
SqliteError: database is locked
```

**Cause:** Another process has an exclusive lock on the database.

**Solutions:**

1. **Close other connections:**
```javascript
// Only create ONE database instance
const db = new Database('database.db');

// Don't do this:
const db1 = new Database('database.db');
const db2 = new Database('database.db');  // ✗ Multiple connections
```

2. **Use WAL mode:**
```javascript
db.pragma('journal_mode = WAL');
```

3. **Add timeout:**
```javascript
const db = new Database('database.db', { timeout: 5000 });
```

### Issue 2: Foreign Key Constraint Failed

**Error:**
```
SqliteError: FOREIGN KEY constraint failed
```

**Cause:** Foreign keys not enabled or invalid reference.

**Solutions:**

1. **Enable foreign keys:**
```javascript
db.pragma('foreign_keys = ON');
```

2. **Check reference exists:**
```javascript
// Before inserting student
const section = db.prepare('SELECT id FROM sections WHERE id = ?').get(sectionId);
if (!section) {
  return res.status(400).send('Invalid section');
}

// Now insert student
db.prepare('INSERT INTO students (name, section_id) VALUES (?, ?)').run(name, sectionId);
```

### Issue 3: Module Not Found

**Error:**
```
Error: Cannot find module 'better-sqlite3'
```

**Solutions:**

1. **Install dependency:**
```bash
npm install better-sqlite3
```

2. **Rebuild native module:**
```bash
npm rebuild better-sqlite3
```

3. **Check package.json:**
```json
{
  "dependencies": {
    "better-sqlite3": "^9.0.0"
  }
}
```

### Issue 4: Database File Not Found

**Error:**
```
SqliteError: unable to open database file
```

**Solutions:**

1. **Create directory first:**
```javascript
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
```

2. **Use absolute paths:**
```javascript
const dbPath = path.join(__dirname, 'data', 'database.db');
```

3. **Check permissions:**
```bash
ls -la data/
chmod 755 data/
```

### Issue 5: Prepared Statement Already Finalized

**Error:**
```
Error: The database connection is not open
```

**Cause:** Database was closed but statement is still being used.

**Solution:**

```javascript
// Don't close database prematurely
const db = new Database('database.db');

// Use prepared statements
const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
const user = stmt.get(1);

// Only close at application shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit();
});
```

---

## Migration from JSON

### Before (JSON File)

```javascript
// Read JSON file
const students = JSON.parse(fs.readFileSync('data/students.json', 'utf8'));

// Add student
students.push({ id: Date.now(), name: 'Juan Cruz' });
fs.writeFileSync('data/students.json', JSON.stringify(students, null, 2));

// Find student
const student = students.find(s => s.id === 123);

// Update student
const index = students.findIndex(s => s.id === 123);
students[index].name = 'New Name';
fs.writeFileSync('data/students.json', JSON.stringify(students, null, 2));

// Delete student
const filtered = students.filter(s => s.id !== 123);
fs.writeFileSync('data/students.json', JSON.stringify(filtered, null, 2));
```

### After (SQLite)

```javascript
// No file reading needed!

// Add student
const result = db.prepare('INSERT INTO students (name) VALUES (?)').run('Juan Cruz');
const newId = result.lastInsertRowid;

// Find student
const student = db.prepare('SELECT * FROM students WHERE id = ?').get(123);

// Update student
db.prepare('UPDATE students SET name = ? WHERE id = ?').run('New Name', 123);

// Delete student
db.prepare('DELETE FROM students WHERE id = ?').run(123);
```

**Benefits:**
- ⚡ 40x faster searches
- 🔒 Safer (prepared statements)
- 🔗 Relationships (foreign keys)
- 🎯 Complex queries (WHERE, JOIN, ORDER BY)
- 💾 Automatic persistence

See `diagram-src/database-basics/08-migration-strategy.md` for complete migration guide.

---

## Best Practices

### 1. One Database Connection

```javascript
// ✓ Good: Single connection
const db = new Database('database.db');

// Use everywhere in your app
app.locals.db = db;
```

### 2. Enable Foreign Keys

```javascript
// ✓ Always enable foreign keys
db.pragma('foreign_keys = ON');
```

### 3. Use Prepared Statements

```javascript
// ✗ Bad: String concatenation (SQL injection risk!)
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✓ Good: Prepared statement
const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
```

### 4. Handle Errors

```javascript
try {
  db.prepare('INSERT INTO students (name) VALUES (?)').run(name);
} catch (error) {
  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    res.status(400).send('Student already exists');
  } else {
    res.status(500).send('Database error');
  }
}
```

### 5. Use Transactions

```javascript
const transferMoney = db.transaction((fromId, toId, amount) => {
  db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(amount, fromId);
  db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(amount, toId);
});

// All-or-nothing execution
transferMoney(1, 2, 100);
```

### 6. Close Connection on Shutdown

```javascript
process.on('SIGINT', () => {
  db.close();
  console.log('Database closed');
  process.exit();
});
```

---

## Quick Start Checklist

- [ ] Install better-sqlite3: `npm install better-sqlite3`
- [ ] Create `database/setup-database.js` script
- [ ] Add `data/` to `.gitignore`
- [ ] Enable foreign keys: `db.pragma('foreign_keys = ON')`
- [ ] Create tables with proper constraints
- [ ] Add indexes on foreign keys
- [ ] Use prepared statements (? placeholders)
- [ ] Handle errors with try-catch
- [ ] Close database on shutdown
- [ ] For Railway: Add volume mount at `/data`

---

## Resources

- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Railway Volumes Guide](https://docs.railway.app/reference/volumes)
- SQL Cheat Sheet: `support-materials/sql-cheat-sheet.md`
- Diagrams: `diagram-src/database-basics/`

---

**Ready to start?** Run `node database/setup-database.js` to create your database!
