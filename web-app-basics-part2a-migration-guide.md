# Web App Basics - Part 2A Migration Guide
## Upgrading from JSON Files to SQLite Database

**Target Audience:** Grade 9 Students  
**Prerequisites:** Part 1 completed, Part 2A lecture read  
**Duration:** 2-3 days

---

## 🎯 What This Guide Covers

This guide shows you **step-by-step** how to upgrade your Part 1 mini-projects from JSON files to SQLite databases.

**By the end, you'll be able to:**
- Convert JSON file operations to SQL queries
- Migrate existing JSON data to SQLite
- Update Express routes to use database
- Test and verify everything works
- Deploy the upgraded project to Railway

---

## 🔄 Section 1: Why Upgrade?

### What You Had (Part 1 - JSON)

**Your Part 1 mini-projects used JSON files:**
```
data/
  └── students.json  ← All data in one file
```

**Characteristics:**
- ✅ Simple to understand
- ✅ Easy to read/write
- ✅ Good for learning
- ❌ Can't handle multiple users safely
- ❌ Slow with lots of data
- ❌ No relationships between data
- ❌ No data validation

---

### What You'll Get (Part 2A - SQLite)

**Your upgraded projects will use SQLite:**
```
data/
  └── students.db  ← Structured database
```

**Characteristics:**
- ✅ Safe for multiple users
- ✅ Fast, even with thousands of records
- ✅ Can relate data (students ↔ sections)
- ✅ Built-in validation rules
- ✅ Prevents duplicate entries
- ✅ Professional and production-ready

**Real Talk:** This upgrade transforms your hobby project into something you can actually sell to clients!

---

## 📋 Section 2: Before You Start

### Checklist

Before upgrading, make sure you have:

- [ ] Completed Part 1 mini-project (Barangay Directory, Class List, or Store Inventory)
- [ ] Read `web-app-basics-part2a-lecture.md` 
- [ ] Understand basic SQL (SELECT, INSERT, UPDATE, DELETE)
- [ ] Node.js and npm installed
- [ ] Your Part 1 project files backed up (copy the folder!)

**⚠️ IMPORTANT: Backup First!**

```bash
# Make a copy of your project before starting
cp -r barangay-directory-v1 barangay-directory-v2
cd barangay-directory-v2
```

---

## 💻 Section 3: Side-by-Side Code Comparison

Let's compare how common operations change from JSON to SQLite.

### Setup & Dependencies

**Part 1 (JSON):**
```javascript
// No special dependencies
const fs = require('fs');
```

**Part 2A (SQLite):**
```bash
# Install better-sqlite3
npm install better-sqlite3
```

```javascript
// Import database library
const Database = require('better-sqlite3');
const db = new Database('data/myapp.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');
```

---

### 1. Reading All Data

**Part 1 (JSON):**
```javascript
// Read from JSON file
function getStudents() {
  const data = fs.readFileSync('data/students.json', 'utf8');
  return JSON.parse(data);
}

// In your route
app.get('/', (req, res) => {
  const students = getStudents();
  res.render('index', { students });
});
```

**Part 2A (SQLite):**
```javascript
// Read from database
app.get('/', (req, res) => {
  const students = db.prepare('SELECT * FROM students').all();
  res.render('index', { students });
});
```

**What changed:**
- ❌ No more `fs.readFileSync()`
- ❌ No more `JSON.parse()`
- ✅ Direct database query
- ✅ Faster and safer

---

### 2. Reading One Item by ID

**Part 1 (JSON):**
```javascript
app.get('/student/:id', (req, res) => {
  const students = getStudents();
  const student = students.find(s => s.id == req.params.id);
  
  if (!student) {
    return res.status(404).send('Student not found');
  }
  
  res.render('view', { student });
});
```

**Part 2A (SQLite):**
```javascript
app.get('/student/:id', (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  
  if (!student) {
    return res.status(404).send('Student not found');
  }
  
  res.render('view', { student });
});
```

**What changed:**
- ❌ No need to load entire file
- ❌ No need to use `Array.find()`
- ✅ Database finds it instantly
- ✅ Prepared statement (safe from SQL injection)

---

### 3. Searching/Filtering Data

**Part 1 (JSON):**
```javascript
app.get('/search', (req, res) => {
  const query = req.query.q.toLowerCase();
  const students = getStudents();
  
  const results = students.filter(s => 
    s.name.toLowerCase().includes(query)
  );
  
  res.render('search', { results, query });
});
```

**Part 2A (SQLite):**
```javascript
app.get('/search', (req, res) => {
  const query = req.query.q;
  
  const results = db.prepare(`
    SELECT * FROM students 
    WHERE LOWER(name) LIKE LOWER(?)
  `).all(`%${query}%`);
  
  res.render('search', { results, query });
});
```

**What changed:**
- ❌ No need to load entire file
- ❌ No need to manually filter with JavaScript
- ✅ Database does the searching (much faster!)
- ✅ Case-insensitive with `LOWER()`

---

### 4. Adding Data

**Part 1 (JSON):**
```javascript
function saveStudents(students) {
  fs.writeFileSync('data/students.json', JSON.stringify(students, null, 2));
}

app.post('/add', (req, res) => {
  const students = getStudents();
  
  // Generate new ID
  const newId = students.length > 0 
    ? Math.max(...students.map(s => s.id)) + 1 
    : 1;
  
  const newStudent = {
    id: newId,
    name: req.body.name,
    age: parseInt(req.body.age),
    section: req.body.section
  };
  
  students.push(newStudent);
  saveStudents(students);
  
  res.redirect('/');
});
```

**Part 2A (SQLite):**
```javascript
app.post('/add', (req, res) => {
  db.prepare(`
    INSERT INTO students (name, age, section)
    VALUES (?, ?, ?)
  `).run(
    req.body.name,
    parseInt(req.body.age),
    req.body.section
  );
  
  res.redirect('/');
});
```

**What changed:**
- ❌ No need to read entire file
- ❌ No need to manually generate ID (AUTOINCREMENT does it!)
- ❌ No need to push to array
- ❌ No need to save back to file
- ✅ Single database operation
- ✅ Much simpler code!

---

### 5. Updating Data

**Part 1 (JSON):**
```javascript
app.post('/edit/:id', (req, res) => {
  const students = getStudents();
  const index = students.findIndex(s => s.id == req.params.id);
  
  if (index === -1) {
    return res.status(404).send('Student not found');
  }
  
  students[index] = {
    id: students[index].id, // Keep same ID
    name: req.body.name,
    age: parseInt(req.body.age),
    section: req.body.section
  };
  
  saveStudents(students);
  res.redirect('/');
});
```

**Part 2A (SQLite):**
```javascript
app.post('/edit/:id', (req, res) => {
  db.prepare(`
    UPDATE students 
    SET name = ?, age = ?, section = ?
    WHERE id = ?
  `).run(
    req.body.name,
    parseInt(req.body.age),
    req.body.section,
    req.params.id
  );
  
  res.redirect('/');
});
```

**What changed:**
- ❌ No need to find index
- ❌ No need to reconstruct object
- ❌ No need to save entire file
- ✅ Direct update in database
- ✅ Cleaner code

---

### 6. Deleting Data

**Part 1 (JSON):**
```javascript
app.post('/delete/:id', (req, res) => {
  const students = getStudents();
  const filtered = students.filter(s => s.id != req.params.id);
  saveStudents(filtered);
  res.redirect('/');
});
```

**Part 2A (SQLite):**
```javascript
app.post('/delete/:id', (req, res) => {
  db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
  res.redirect('/');
});
```

**What changed:**
- ❌ No need to filter array
- ❌ No need to save entire file
- ✅ Single DELETE command
- ✅ Much faster

---

### 7. Counting/Statistics

**Part 1 (JSON):**
```javascript
app.get('/stats', (req, res) => {
  const students = getStudents();
  
  const stats = {
    total: students.length,
    average: students.reduce((sum, s) => sum + s.grade, 0) / students.length,
    highest: Math.max(...students.map(s => s.grade)),
    lowest: Math.min(...students.map(s => s.grade))
  };
  
  res.render('stats', { stats });
});
```

**Part 2A (SQLite):**
```javascript
app.get('/stats', (req, res) => {
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      AVG(grade) as average,
      MAX(grade) as highest,
      MIN(grade) as lowest
    FROM students
  `).get();
  
  res.render('stats', { stats });
});
```

**What changed:**
- ❌ No manual calculations
- ✅ Database does math for you
- ✅ Much faster with large datasets

---

## 🏗️ Section 4: Complete Migration Walkthrough

Let's upgrade **Barangay Directory** from v1 (JSON) to v2 (SQLite) step-by-step.

### Step 1: Create v2 Folder

```bash
# Copy your v1 project
cp -r barangay-directory-v1 barangay-directory-v2
cd barangay-directory-v2
```

---

### Step 2: Install SQLite

```bash
npm install better-sqlite3
```

**Update `package.json`:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "ejs": "^3.1.9",
    "better-sqlite3": "^9.0.0"
  }
}
```

---

### Step 3: Create Database Setup Script

Create `database/setup-database.js`:

```javascript
const Database = require('better-sqlite3');
const db = new Database('data/barangay.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('📁 Creating tables...');

// Create barangays table
db.exec(`
  CREATE TABLE IF NOT EXISTS barangays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    captain TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('✅ Barangays table created');

// Create residents table (with foreign key)
db.exec(`
  CREATE TABLE IF NOT EXISTS residents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0),
    address TEXT NOT NULL,
    barangay_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barangay_id) REFERENCES barangays(id) ON DELETE CASCADE
  )
`);

console.log('✅ Residents table created');

// Insert sample barangays
const insertBarangay = db.prepare(`
  INSERT INTO barangays (name, captain) VALUES (?, ?)
`);

const sanRoque = insertBarangay.run('San Roque', 'Pedro Martinez');
const santolan = insertBarangay.run('Santolan', 'Maria Santos');
const batasan = insertBarangay.run('Batasan Hills', 'Juan Reyes');

console.log('✅ Sample barangays inserted');

// Insert sample residents
const insertResident = db.prepare(`
  INSERT INTO residents (name, age, address, barangay_id)
  VALUES (?, ?, ?, ?)
`);

insertResident.run('Juan Dela Cruz', 35, '123 Main Street', sanRoque.lastInsertRowid);
insertResident.run('Maria Santos', 28, '456 Oak Avenue', sanRoque.lastInsertRowid);
insertResident.run('Pedro Reyes', 42, '789 Pine Road', santolan.lastInsertRowid);
insertResident.run('Ana Garcia', 31, '321 Elm Street', santolan.lastInsertRowid);
insertResident.run('Carlos Lopez', 25, '654 Maple Drive', batasan.lastInsertRowid);
insertResident.run('Rosa Martinez', 38, '987 Cedar Lane', batasan.lastInsertRowid);

console.log('✅ Sample residents inserted');
console.log('');
console.log('🎉 Database setup complete!');
console.log('📊 Summary:');
console.log('   - 3 barangays');
console.log('   - 6 residents');
console.log('');
console.log('Run: npm start');

db.close();
```

**Add to `package.json` scripts:**
```json
{
  "scripts": {
    "setup": "node database/setup-database.js",
    "start": "node app.js"
  }
}
```

**Run setup:**
```bash
npm run setup
```

---

### Step 4: Update .gitignore

**Create/update `.gitignore`:**
```
node_modules/
data/*.db
data/*.db-journal
.env
```

**Why?** Database files shouldn't be in Git. Let Railway create them fresh.

---

### Step 5: Update app.js

**Old `app.js` (JSON version):**
```javascript
const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

// ... routes with fs.readFileSync(), JSON.parse(), etc.
```

**New `app.js` (SQLite version):**
```javascript
const express = require('express');
const Database = require('better-sqlite3');
const app = express();
const PORT = process.env.PORT || 3000;

// Setup database
const db = new Database('data/barangay.db');
db.pragma('foreign_keys = ON');

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// HOME - List all residents with barangay info
app.get('/', (req, res) => {
  const search = req.query.search || '';
  const barangay = req.query.barangay || '';
  
  let query = `
    SELECT 
      residents.id,
      residents.name,
      residents.age,
      residents.address,
      barangays.name as barangay_name,
      barangays.captain as barangay_captain
    FROM residents
    INNER JOIN barangays ON residents.barangay_id = barangays.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (search) {
    query += ` AND (LOWER(residents.name) LIKE LOWER(?) OR LOWER(residents.address) LIKE LOWER(?))`;
    params.push(`%${search}%`, `%${search}%`);
  }
  
  if (barangay) {
    query += ` AND barangays.name = ?`;
    params.push(barangay);
  }
  
  query += ` ORDER BY barangays.name, residents.name`;
  
  const residents = db.prepare(query).all(...params);
  const barangays = db.prepare('SELECT name FROM barangays ORDER BY name').all();
  
  res.render('index', { residents, barangays, search, selectedBarangay: barangay });
});

// VIEW RESIDENT
app.get('/resident/:id', (req, res) => {
  const resident = db.prepare(`
    SELECT 
      residents.*,
      barangays.name as barangay_name,
      barangays.captain as barangay_captain
    FROM residents
    INNER JOIN barangays ON residents.barangay_id = barangays.id
    WHERE residents.id = ?
  `).get(req.params.id);
  
  if (!resident) {
    return res.status(404).send('Resident not found');
  }
  
  res.render('view', { resident });
});

// ADD RESIDENT - Show form
app.get('/add', (req, res) => {
  const barangays = db.prepare('SELECT * FROM barangays ORDER BY name').all();
  res.render('add', { barangays });
});

// ADD RESIDENT - Handle submission
app.post('/add', (req, res) => {
  db.prepare(`
    INSERT INTO residents (name, age, address, barangay_id)
    VALUES (?, ?, ?, ?)
  `).run(
    req.body.name,
    parseInt(req.body.age),
    req.body.address,
    parseInt(req.body.barangay_id)
  );
  
  res.redirect('/');
});

// EDIT RESIDENT - Show form
app.get('/edit/:id', (req, res) => {
  const resident = db.prepare('SELECT * FROM residents WHERE id = ?').get(req.params.id);
  const barangays = db.prepare('SELECT * FROM barangays ORDER BY name').all();
  
  if (!resident) {
    return res.status(404).send('Resident not found');
  }
  
  res.render('edit', { resident, barangays });
});

// EDIT RESIDENT - Handle submission
app.post('/edit/:id', (req, res) => {
  db.prepare(`
    UPDATE residents 
    SET name = ?, age = ?, address = ?, barangay_id = ?
    WHERE id = ?
  `).run(
    req.body.name,
    parseInt(req.body.age),
    req.body.address,
    parseInt(req.body.barangay_id),
    req.params.id
  );
  
  res.redirect('/');
});

// DELETE RESIDENT
app.post('/delete/:id', (req, res) => {
  db.prepare('DELETE FROM residents WHERE id = ?').run(req.params.id);
  res.redirect('/');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
```

---

### Step 6: Update Views (EJS Templates)

**Most views stay the same!** Just ensure form fields match database columns.

**Example: `views/add.ejs` (Barangay dropdown):**

```html
<div class="field">
  <label class="label">Barangay</label>
  <div class="control">
    <div class="select is-fullwidth">
      <select name="barangay_id" required>
        <option value="">Select barangay...</option>
        <% barangays.forEach(barangay => { %>
          <option value="<%= barangay.id %>"><%= barangay.name %></option>
        <% }); %>
      </select>
    </div>
  </div>
</div>
```

**Key change:** Use `barangay.id` as value (foreign key), display `barangay.name`.

---

### Step 7: Test Everything

```bash
# Run the app
npm start
```

**Test checklist:**
- [ ] Home page loads and shows residents
- [ ] Search works
- [ ] Filter by barangay works
- [ ] View resident details
- [ ] Add new resident
- [ ] Edit existing resident
- [ ] Delete resident
- [ ] All residents show barangay name (from JOIN)

---

### Step 8: Deploy to Railway

**Railway setup stays mostly the same!**

**Important changes:**

1. **Ensure database file is created on Railway:**

Add to your `app.js` (before creating database):

```javascript
const fs = require('fs');

// Ensure data directory exists
if (!fs.existsSync('data')) {
  fs.mkdirSync('data', { recursive: true });
}

const db = new Database('data/barangay.db');
```

2. **Run setup on first Railway deploy:**

Update `package.json`:

```json
{
  "scripts": {
    "start": "node database/setup-database.js && node app.js"
  }
}
```

This ensures database is created on Railway before app starts.

3. **Push to GitHub and deploy:**

```bash
git add .
git commit -m "Upgrade to SQLite database"
git push
```

Railway will automatically detect changes and redeploy!

---

## ✅ Section 5: Migration Checklist

Use this checklist for upgrading any Part 1 project:

### Planning Phase
- [ ] Read Part 2A lecture
- [ ] Backup Part 1 project
- [ ] Create v2 folder

### Setup Phase
- [ ] Install better-sqlite3
- [ ] Create `database/` folder
- [ ] Create `data/` folder
- [ ] Update `.gitignore`

### Database Phase
- [ ] Design table schemas (draw on paper first!)
- [ ] Create `setup-database.js`
- [ ] Define tables with proper data types
- [ ] Add constraints (NOT NULL, CHECK, UNIQUE)
- [ ] Add foreign keys if using relationships
- [ ] Insert sample data
- [ ] Test: Run `npm run setup`

### Code Migration Phase
- [ ] Update `app.js` imports (add better-sqlite3)
- [ ] Initialize database connection
- [ ] Replace all `getItems()` with `SELECT` queries
- [ ] Replace all `saveItems()` with `INSERT`/`UPDATE` queries
- [ ] Replace all `Array.find()` with `SELECT WHERE`
- [ ] Replace all `Array.filter()` with `SELECT WHERE`
- [ ] Use prepared statements (? placeholders) everywhere
- [ ] Test each route individually

### View Phase
- [ ] Update forms if schema changed
- [ ] Update dropdowns for foreign keys
- [ ] Update display fields if using JOINs
- [ ] Test all forms submit correctly

### Testing Phase
- [ ] Run locally, test all features
- [ ] Check for SQL errors in console
- [ ] Verify data is saved correctly
- [ ] Test search/filter functionality
- [ ] Test edge cases (empty fields, special characters)

### Deployment Phase
- [ ] Update `package.json` start script
- [ ] Ensure data directory creation on Railway
- [ ] Push to GitHub
- [ ] Deploy to Railway
- [ ] Test production site
- [ ] Verify database persists between deploys

---

## 🎓 Section 6: Upgrading Your Chosen Mini-Project

Choose one of your Part 1 projects and upgrade it!

### Option A: Barangay Directory

**What to add in v2:**
- Two tables: `barangays` and `residents`
- Foreign key: `residents.barangay_id → barangays.id`
- JOIN query to show resident with barangay name
- Filter by barangay dropdown

**See complete example:** `practice-apps/barangay-directory-v2/`

---

### Option B: Class List

**What to add in v2:**
- Two tables: `sections` and `students`
- Foreign key: `students.section_id → sections.id`
- JOIN query to show student with section info
- Filter by section dropdown
- Calculate average grade per section

**Schema:**

```sql
CREATE TABLE sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  adviser TEXT NOT NULL,
  room TEXT
);

CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 5 AND age <= 100),
  section_id INTEGER NOT NULL,
  grade INTEGER CHECK (grade >= 0 AND grade <= 100),
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE RESTRICT
);
```

**See complete example:** `practice-apps/class-list-v2/`

---

### Option C: Store Inventory

**What to add in v2:**
- Two tables: `categories` and `products`
- Foreign key: `products.category_id → categories.id`
- JOIN query to show product with category name
- Filter by category dropdown
- Calculate total inventory value
- Low stock alerts

**Schema:**

```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category_id INTEGER NOT NULL,
  price REAL NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  low_stock_threshold INTEGER DEFAULT 10,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);
```

**See complete example:** `practice-apps/store-inventory-v2/`

---

## 🎨 Section 7: Customization Ideas

Make the project yours! Try adding:

### Easy Customizations
- Change colors/styling (edit `public/css/style.css`)
- Add more sample data in `setup-database.js`
- Add additional search filters
- Change sort order (ORDER BY different columns)

### Medium Customizations
- Add more fields to tables (email, phone, birthday)
- Add pagination (show 10 items per page)
- Add sorting buttons (sort by name, date, etc.)
- Add dashboard with statistics

### Advanced Customizations
- Add a third table with relationships
- Implement soft delete (mark as deleted, don't actually delete)
- Add date range filters
- Export data to CSV
- Add data validation (email format, phone format)

---

## 🐛 Section 8: Common Migration Problems

### Problem: "SQLITE_ERROR: no such table"

**Cause:** Forgot to run setup script  
**Solution:**
```bash
npm run setup
```

---

### Problem: "FOREIGN KEY constraint failed"

**Cause:** Trying to insert barangay_id that doesn't exist  
**Solution:** Make sure parent record exists first

```javascript
// WRONG
insertResident.run('Juan', 25, 'Address', 999); // Barangay 999 doesn't exist!

// RIGHT
const barangays = db.prepare('SELECT id FROM barangays WHERE name = ?').get('San Roque');
insertResident.run('Juan', 25, 'Address', barangays.id);
```

---

### Problem: "Database file not persisting on Railway"

**Cause:** Database created outside `/data` path  
**Solution:** Ensure database is in `data/` folder

```javascript
// WRONG
const db = new Database('myapp.db');

// RIGHT
const db = new Database('data/myapp.db');
```

And add volume mount in Railway:
- Mount Path: `/app/data`
- This persists between deploys

---

### Problem: "Can't see joined data in view"

**Cause:** Forgot to include barangay fields in SELECT  
**Solution:** Select columns from both tables

```javascript
// WRONG
SELECT residents.* FROM residents
INNER JOIN barangays ON residents.barangay_id = barangays.id

// RIGHT
SELECT 
  residents.*,
  barangays.name as barangay_name,
  barangays.captain as barangay_captain
FROM residents
INNER JOIN barangays ON residents.barangay_id = barangays.id
```

---

### Problem: Views show `[object Object]` or `undefined`

**Cause:** Field name changed from JSON to SQL  
**Solution:** Update EJS templates to match database column names

**Example:**
```html
<!-- If your SQL returns "barangay_name" not "barangay" -->
<%= resident.barangay_name %>  ✅
<%= resident.barangay %>       ❌ undefined
```

---

## 🚀 Section 9: What's Next?

**Congratulations!** You've successfully upgraded your project from JSON to SQLite! 🎉

### Your Skills Now
- ✅ Can build database-driven web applications
- ✅ Can handle relationships between data
- ✅ Can write secure SQL queries
- ✅ Can deploy production-ready apps

### Next Steps

**Immediate:**
1. Deploy your upgraded project to Railway
2. Share the link with friends/family
3. Add it to your portfolio

**Part 2B (Coming Next):**
- User authentication (login/logout)
- Password hashing (secure passwords)
- Session management
- Role-based access (admin vs user)
- Protected routes

**Part 2C (Advanced Features):**
- CSV export/import
- QR code generation
- API integration (REST Countries, Exchange Rates)
- Audit logging
- DataTables.js for sorting/pagination

---

## 📚 Additional Resources

### Reference Materials
- **Part 2A Lecture:** `web-app-basics-part2a-lecture.md`
- **SQL Cheat Sheet:** `support-materials/sql-cheat-sheet.md`
- **SQLite Setup Guide:** `support-materials/sqlite-setup-guide.md`
- **Schema Templates:** `support-materials/schema-templates/`

### Example Projects
- **Barangay Directory v2:** `practice-apps/barangay-directory-v2/`
- **Class List v2:** `practice-apps/class-list-v2/`
- **Store Inventory v2:** `practice-apps/store-inventory-v2/`

### Tools
- **DB Browser for SQLite:** [sqlitebrowser.org](https://sqlitebrowser.org/)
- **Railway Documentation:** [docs.railway.app](https://docs.railway.app/)

---

## 💭 Reflection Questions

1. What was the hardest part of the migration?
2. What surprised you about SQLite compared to JSON?
3. How much simpler is your code now?
4. What feature would you add next?
5. How would you explain the upgrade to a classmate?

**Discuss with your classmates or write in your journal!**

---

## 🎯 Final Checklist

Before moving to Part 2B, make sure you've:

- [ ] Read Part 2A lecture thoroughly
- [ ] Completed at least one project migration (JSON → SQLite)
- [ ] Tested all CRUD operations locally
- [ ] Deployed upgraded project to Railway
- [ ] Verified database persists on Railway
- [ ] Can explain foreign keys and JOINs to a classmate
- [ ] Comfortable writing SELECT, INSERT, UPDATE, DELETE
- [ ] Always use ? placeholders (never string concatenation!)

**If you checked all boxes, you're ready for Part 2B! 🚀**

---

**Happy coding, and welcome to the world of database-driven applications!** 🎉

*Last updated: November 11, 2025*
