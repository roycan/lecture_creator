# Building Web Applications - Part 2A
## SQLite Databases and CRUD Operations

**Target Audience:** Grade 9 Students  
**Prerequisites:** Part 1 (Node.js, Express, EJS, JSON files, Railway deployment)  
**Duration:** 1 week

---

## 🎯 What You'll Learn

By the end of this lecture, you'll be able to:
- Explain why databases are better than JSON files for real applications
- Set up and use SQLite databases in your Node.js apps
- Write SQL queries to create, read, update, and delete data
- Use aggregate functions to generate reports and statistics
- Create relationships between tables using foreign keys
- Protect your app from SQL injection attacks
- Upgrade your Part 1 projects from JSON to SQLite

**Final Outcome:** You'll transform your JSON-based mini-projects into production-ready database applications!

---

## 🍔 Introduction: The JSON File Problem

Remember in Part 1 when we stored data in JSON files? It worked great for learning, but imagine this scenario:

### The Sari-Sari Store Problem

**Maria runs a sari-sari store** and uses your inventory app from Part 1. One busy Saturday:

- **10:00 AM:** Maria's daughter adds "Skyflakes" to inventory (reads JSON, adds item, saves JSON)
- **10:00 AM (same time!):** Maria adds "Lucky Me" (reads JSON, adds item, saves JSON)
- **Result:** One of them just overwrote the other's work! 💥

**The file got corrupted because two people tried to save at the exact same time.**

### More Problems with JSON Files

1. **Concurrent Access** - Two users can't safely write at the same time
2. **No Relationships** - Hard to link data (students to their sections, products to categories)
3. **Slow Searching** - Must load entire file to find one item
4. **No Validation** - Can't enforce rules (age must be positive, email must be unique)
5. **Memory Issues** - A file with 10,000 products loads everything into memory

**Real Talk:** JSON files are perfect for learning and small personal projects. But for real businesses with multiple users? We need a database!

---

## 📊 Section 1: Understanding Databases vs JSON Files

### What is a Database?

A **database** is like a smart filing cabinet that:
- Handles multiple people at once (no overwrites!)
- Connects related information (students ↔ sections ↔ grades)
- Finds things instantly (even with millions of records)
- Enforces rules (no duplicate IDs, age must be positive)
- Uses very little memory (loads only what you need)

### The Filing Cabinet Analogy

**JSON Files = Basic File Folder**
- One person opens it at a time
- Find something? Flip through every page
- Want related info? Look in different folders manually
- Someone writes wrong info? Too late, it's saved!

**Database = Smart Filing System**
- Multiple clerks work simultaneously
- Ask for what you need, get it instantly
- Automatically shows related files together
- Catches mistakes before saving ("Age can't be negative!")

![JSON vs Database Comparison](diagrams/database-basics/json-vs-database-2a.png)

### When to Use Each

**Use JSON files when:**
- ✅ Learning and experimenting
- ✅ Single-user personal projects
- ✅ Configuration files (settings, preferences)
- ✅ Less than 100 records
- ✅ No relationships between data

**Use a Database when:**
- ✅ Multiple users will access the app
- ✅ Data is related (customers → orders → items)
- ✅ Need fast searching and filtering
- ✅ More than 100 records
- ✅ Need data validation and integrity
- ✅ Building for real clients

---

## 🟢 Section 2: SQLite Basics

### What is SQLite?

**SQLite** is a database that:
- Lives in a single file (like `students.db`)
- Requires no separate server (unlike MySQL, PostgreSQL)
- Is fast, reliable, and battle-tested
- Powers apps you use daily (WhatsApp, Firefox, iOS apps)
- Is perfect for small to medium web apps

**Think of it as:** The Jollibee of databases - simple, reliable, gets the job done!

### Why SQLite for Grade 9 Students?

- ✅ **Simple:** One file, no complex setup
- ✅ **Free:** No costs, no limits
- ✅ **Fast:** Excellent performance for 99% of projects
- ✅ **Portable:** Copy the `.db` file = copy the entire database
- ✅ **Production-ready:** Used by millions of apps worldwide

### Installing SQLite (better-sqlite3)

We'll use **better-sqlite3**, a Node.js library that makes SQLite super easy.

**🎯 Try It: Install better-sqlite3**

1. **In your project folder:**
   ```bash
   npm install better-sqlite3
   ```

2. **Why "better-sqlite3"?**
   - Synchronous API (simpler code, easier to learn)
   - Faster than alternatives
   - More reliable
   - Better error messages

### Your First Database Query

**🎯 Try It: Hello Database!**

Create a file called `test-database.js`:

```javascript
// Import better-sqlite3
const Database = require('better-sqlite3');

// Create/open a database file
const db = new Database('test.db');

// Create a table
db.exec(`
  CREATE TABLE IF NOT EXISTS greetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL
  )
`);

// Insert data
db.prepare('INSERT INTO greetings (message) VALUES (?)').run('Hello from SQLite!');

// Read data
const greetings = db.prepare('SELECT * FROM greetings').all();
console.log(greetings);

// Close database
db.close();
```

**Run it:**
```bash
node test-database.js
```

**Output:**
```javascript
[
  { id: 1, message: 'Hello from SQLite!' }
]
```

**You just:**
1. Created a database file (`test.db`)
2. Created a table (`greetings`)
3. Inserted a row
4. Retrieved all rows
5. Displayed them

**Congratulations! You're using a real database! 🎉**

### Understanding the Code

```javascript
const db = new Database('test.db');
// Creates test.db if it doesn't exist
// Opens test.db if it already exists

db.exec(`CREATE TABLE ...`);
// exec() runs SQL commands without returning data
// Good for CREATE, DROP, ALTER

db.prepare('INSERT ...').run(...);
// prepare() creates a prepared statement (safe from SQL injection)
// run() executes it for INSERT, UPDATE, DELETE

db.prepare('SELECT ...').all();
// all() returns all matching rows as an array
// get() returns just the first row
// each() processes rows one by one
```

---

## 📝 Section 3: SQL Fundamentals - CRUD Operations

**SQL (Structured Query Language)** is how we talk to databases. Think of it as the "language" databases understand.

![Database Schema Overview](diagrams/database-basics/database-schema.png)

### Creating Tables

Before storing data, we need to create a **table** (like creating a spreadsheet with columns).

**🎯 Try It: Create a Students Table**

```javascript
const Database = require('better-sqlite3');
const db = new Database('school.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 5 AND age <= 100),
    section TEXT NOT NULL,
    grade INTEGER CHECK (grade >= 0 AND grade <= 100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('Table created successfully!');
```

### Understanding Table Structure

```sql
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Auto-generates 1, 2, 3...
  name TEXT NOT NULL,                     -- Required text field
  age INTEGER NOT NULL CHECK (age >= 5),  -- Number with validation
  section TEXT NOT NULL,                  -- Required text
  grade INTEGER,                          -- Optional number
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- Auto-sets current time
)
```

**Column Types:**
- `INTEGER` - Whole numbers (1, 42, -10)
- `REAL` - Decimals (3.14, 99.99)
- `TEXT` - Strings ("Juan", "Einstein")
- `DATETIME` - Dates and times

**Constraints:**
- `PRIMARY KEY` - Unique identifier for each row
- `AUTOINCREMENT` - Database assigns next number automatically
- `NOT NULL` - Field is required
- `CHECK (...)` - Validation rule
- `DEFAULT value` - If not provided, use this
- `UNIQUE` - No duplicates allowed

**Analogy:** Creating a table is like designing a form. Each column is a field, constraints are the validation rules.

![SQL CRUD Operations Overview](diagrams/database-basics/sql-operations-2a.png)

---

### 1. CREATE (INSERT) - Adding Data

**Adding one student:**

```javascript
const insert = db.prepare(`
  INSERT INTO students (name, age, section, grade)
  VALUES (?, ?, ?, ?)
`);

const result = insert.run('Juan Dela Cruz', 15, 'Einstein', 92);
console.log(`Inserted student with ID: ${result.lastInsertRowid}`);
```

**Adding multiple students:**

```javascript
const insertMany = db.prepare(`
  INSERT INTO students (name, age, section, grade)
  VALUES (?, ?, ?, ?)
`);

const students = [
  ['Maria Santos', 14, 'Einstein', 95],
  ['Pedro Reyes', 15, 'Newton', 88],
  ['Ana Garcia', 14, 'Einstein', 91]
];

// Use transaction for multiple inserts (faster and safer)
const insertManyStudents = db.transaction((studentList) => {
  for (const student of studentList) {
    insertMany.run(...student);
  }
});

insertManyStudents(students);
console.log('All students inserted!');
```

**Key Points:**
- ✅ Always use `?` placeholders (prevents SQL injection)
- ✅ Use transactions for multiple inserts
- ✅ `lastInsertRowid` gives you the new ID

---

### 2. READ (SELECT) - Getting Data

**Get all students:**

```javascript
const allStudents = db.prepare('SELECT * FROM students').all();
console.log(allStudents);
```

**Get one student:**

```javascript
const student = db.prepare('SELECT * FROM students WHERE id = ?').get(1);
console.log(student);
```

**Get specific columns:**

```javascript
const names = db.prepare('SELECT name, section FROM students').all();
console.log(names);
// Output: [{ name: 'Juan Dela Cruz', section: 'Einstein' }, ...]
```

**Filtering with WHERE:**

```javascript
// Students in Einstein section
const einstein = db.prepare('SELECT * FROM students WHERE section = ?').all('Einstein');

// Students with grade >= 90
const topStudents = db.prepare('SELECT * FROM students WHERE grade >= ?').all(90);

// Multiple conditions (AND)
const einsteinTopStudents = db.prepare(`
  SELECT * FROM students 
  WHERE section = ? AND grade >= ?
`).all('Einstein', 90);

// Multiple conditions (OR)
const einsteinOrNewton = db.prepare(`
  SELECT * FROM students 
  WHERE section = ? OR section = ?
`).all('Einstein', 'Newton');
```

**Searching with LIKE (pattern matching):**

```javascript
// Names starting with 'Juan'
const juanNames = db.prepare(`
  SELECT * FROM students WHERE name LIKE ?
`).all('Juan%');

// Names containing 'Santos'
const santosNames = db.prepare(`
  SELECT * FROM students WHERE name LIKE ?
`).all('%Santos%');

// Case-insensitive search
const search = db.prepare(`
  SELECT * FROM students WHERE LOWER(name) LIKE LOWER(?)
`).all('%cruz%');
```

**LIKE Patterns:**
- `'Juan%'` - Starts with "Juan"
- `'%Santos%'` - Contains "Santos"
- `'%Cruz'` - Ends with "Cruz"
- `'%'` is a wildcard (matches anything)

---

### 3. UPDATE - Changing Data

**Update one student:**

```javascript
const updateGrade = db.prepare(`
  UPDATE students 
  SET grade = ? 
  WHERE id = ?
`);

updateGrade.run(95, 1); // Set student #1's grade to 95
console.log('Grade updated!');
```

**Update multiple fields:**

```javascript
const updateStudent = db.prepare(`
  UPDATE students 
  SET name = ?, age = ?, section = ?, grade = ?
  WHERE id = ?
`);

updateStudent.run('Juan P. Dela Cruz', 16, 'Einstein', 93, 1);
```

**Update multiple students:**

```javascript
// Give everyone in Einstein section +5 bonus points
const bonusPoints = db.prepare(`
  UPDATE students 
  SET grade = grade + 5 
  WHERE section = ?
`);

const info = bonusPoints.run('Einstein');
console.log(`Updated ${info.changes} students`);
```

**⚠️ WARNING: Always use WHERE!**

```javascript
// BAD - Updates ALL students! 💥
UPDATE students SET grade = 100

// GOOD - Updates only student #1
UPDATE students SET grade = 100 WHERE id = 1
```

---

### 4. DELETE - Removing Data

**Delete one student:**

```javascript
const deleteStudent = db.prepare('DELETE FROM students WHERE id = ?');
deleteStudent.run(1);
console.log('Student deleted');
```

**Delete multiple students:**

```javascript
// Delete all students in Newton section
const deleteSection = db.prepare('DELETE FROM students WHERE section = ?');
const info = deleteSection.run('Newton');
console.log(`Deleted ${info.changes} students`);
```

**⚠️ WARNING: DELETE without WHERE removes EVERYTHING!**

```javascript
// BAD - Deletes ALL students! 💥
DELETE FROM students

// GOOD - Deletes only student #1
DELETE FROM students WHERE id = 1
```

**Safety Tip:** Before deleting, always SELECT first to see what you're about to delete!

```javascript
// Step 1: Check what will be deleted
const toDelete = db.prepare('SELECT * FROM students WHERE section = ?').all('Newton');
console.log('About to delete:', toDelete);

// Step 2: If it looks right, delete
if (confirm('Are you sure?')) {  // In a real app, show confirmation UI
  db.prepare('DELETE FROM students WHERE section = ?').run('Newton');
}
```

---

## 📊 Section 4: Aggregate Queries & Reports

Real applications need statistics and reports. SQL has powerful functions for this!

### Counting Records

**How many students total?**

```javascript
const count = db.prepare('SELECT COUNT(*) as total FROM students').get();
console.log(`Total students: ${count.total}`);
// Output: Total students: 45
```

**How many students per section?**

```javascript
const countBySection = db.prepare(`
  SELECT section, COUNT(*) as student_count
  FROM students
  GROUP BY section
`).all();

console.log(countBySection);
// Output: [
//   { section: 'Einstein', student_count: 23 },
//   { section: 'Newton', student_count: 22 }
// ]
```

**Analogy:** GROUP BY is like organizing laundry. You make separate piles (by color), then count each pile.

---

### Summing Values

**Total inventory value in a store:**

```javascript
// If you have products table with price and stock columns
const totalValue = db.prepare(`
  SELECT SUM(price * stock) as total_value
  FROM products
`).get();

console.log(`Total inventory value: ₱${totalValue.total_value}`);
// Output: Total inventory value: ₱125,450
```

**Total value by category:**

```javascript
const valueByCategory = db.prepare(`
  SELECT category, SUM(price * stock) as category_value
  FROM products
  GROUP BY category
`).all();

console.log(valueByCategory);
// Output: [
//   { category: 'Snacks', category_value: 45000 },
//   { category: 'Drinks', category_value: 80450 }
// ]
```

---

### Calculating Averages

**Class average grade:**

```javascript
const average = db.prepare('SELECT AVG(grade) as class_average FROM students').get();
console.log(`Class average: ${average.class_average.toFixed(2)}`);
// Output: Class average: 88.54
```

**Average grade per section:**

```javascript
const avgBySection = db.prepare(`
  SELECT section, AVG(grade) as avg_grade
  FROM students
  GROUP BY section
`).all();

console.log(avgBySection);
// Output: [
//   { section: 'Einstein', avg_grade: 91.3 },
//   { section: 'Newton', avg_grade: 85.7 }
// ]
```

**Average with filtering:**

```javascript
// Average grade of students who scored 80 or above
const topAverage = db.prepare(`
  SELECT AVG(grade) as top_average 
  FROM students 
  WHERE grade >= 80
`).get();
```

---

### Finding MIN and MAX

**Highest and lowest grades:**

```javascript
const extremes = db.prepare(`
  SELECT 
    MAX(grade) as highest,
    MIN(grade) as lowest
  FROM students
`).get();

console.log(`Highest: ${extremes.highest}, Lowest: ${extremes.lowest}`);
// Output: Highest: 98, Lowest: 72
```

**Most and least expensive products:**

```javascript
const priceRange = db.prepare(`
  SELECT 
    MAX(price) as most_expensive,
    MIN(price) as cheapest
  FROM products
`).get();
```

---

### Sorting Results (ORDER BY)

**Students sorted by grade (highest first):**

```javascript
const topToBottom = db.prepare(`
  SELECT name, grade 
  FROM students 
  ORDER BY grade DESC
`).all();

console.log(topToBottom);
// Output: [
//   { name: 'Maria Santos', grade: 98 },
//   { name: 'Ana Garcia', grade: 95 },
//   ...
// ]
```

**Sort by name alphabetically:**

```javascript
const alphabetical = db.prepare(`
  SELECT name, section 
  FROM students 
  ORDER BY name ASC
`).all();
```

**Multiple sorting (section, then grade):**

```javascript
const sectionThenGrade = db.prepare(`
  SELECT name, section, grade
  FROM students
  ORDER BY section ASC, grade DESC
`).all();
// Output: Einstein students first (sorted by grade), then Newton students (sorted by grade)
```

**Sort Keywords:**
- `ORDER BY column ASC` - Ascending (A→Z, 0→9, oldest→newest)
- `ORDER BY column DESC` - Descending (Z→A, 9→0, newest→oldest)

---

### Date Filtering

**Sales for January 2025:**

```javascript
const januarySales = db.prepare(`
  SELECT * FROM sales
  WHERE date BETWEEN '2025-01-01' AND '2025-01-31'
`).all();
```

**Sales after a specific date:**

```javascript
const recentSales = db.prepare(`
  SELECT * FROM sales
  WHERE date >= ?
`).all('2025-01-15');
```

**Students who registered this month:**

```javascript
const thisMonth = db.prepare(`
  SELECT * FROM students
  WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
`).all();
```

**Date Functions:**
- `BETWEEN date1 AND date2` - Date range
- `>= '2025-01-01'` - On or after
- `< '2025-02-01'` - Before
- `strftime('%Y-%m', date)` - Format dates for comparison

---

### Combining Aggregates and Filters

**Average grade of Einstein students who scored >= 85:**

```javascript
const einsteinTopAvg = db.prepare(`
  SELECT AVG(grade) as average
  FROM students
  WHERE section = 'Einstein' AND grade >= 85
`).get();
```

**Products below low stock threshold:**

```javascript
const lowStock = db.prepare(`
  SELECT 
    name,
    stock,
    low_stock_threshold,
    (stock * price) as value_at_risk
  FROM products
  WHERE stock <= low_stock_threshold
  ORDER BY value_at_risk DESC
`).all();

console.log(`${lowStock.length} products need restocking`);
```

**Real-World Example: Sales Dashboard**

```javascript
const dashboard = db.prepare(`
  SELECT 
    COUNT(*) as total_sales,
    SUM(amount) as total_revenue,
    AVG(amount) as average_sale,
    MAX(amount) as largest_sale,
    MIN(amount) as smallest_sale
  FROM sales
  WHERE date >= date('now', '-30 days')
`).get();

console.log('Last 30 Days Dashboard:');
console.log(`Total Sales: ${dashboard.total_sales}`);
console.log(`Total Revenue: ₱${dashboard.total_revenue}`);
console.log(`Average Sale: ₱${dashboard.average_sale.toFixed(2)}`);
```

---

## 🔗 Section 5: Table Relationships

Real apps have related data: students belong to sections, products belong to categories, residents live in barangays.

### The Problem: Repeated Data

**Bad approach (no relationships):**

```javascript
// residents table - repeating barangay info! 😱
[
  { id: 1, name: 'Juan', barangay_name: 'San Roque', barangay_captain: 'Pedro Cruz' },
  { id: 2, name: 'Maria', barangay_name: 'San Roque', barangay_captain: 'Pedro Cruz' },
  { id: 3, name: 'Ana', barangay_name: 'San Roque', barangay_captain: 'Pedro Cruz' }
]
```

**Problems:**
- Wastes space (repeating "San Roque" and "Pedro Cruz")
- If captain changes, must update 100 rows!
- Typos cause data inconsistency ("San Roke" vs "San Roque")

---

### The Solution: Foreign Keys

**Good approach (with relationships):**

**Table 1: barangays**
```javascript
[
  { id: 1, name: 'San Roque', captain: 'Pedro Cruz' },
  { id: 2, name: 'Santolan', captain: 'Maria Reyes' }
]
```

**Table 2: residents (linked to barangays)**
```javascript
[
  { id: 1, name: 'Juan', barangay_id: 1 },  // Links to San Roque
  { id: 2, name: 'Maria', barangay_id: 1 }, // Links to San Roque
  { id: 3, name: 'Ana', barangay_id: 2 }    // Links to Santolan
]
```

**Benefits:**
- ✅ No repeated data
- ✅ Change captain once, affects all residents
- ✅ No typos possible (either ID exists or it doesn't)

---

### Creating Tables with Foreign Keys

**🎯 Try It: Barangay Directory with Relationships**

```javascript
const Database = require('better-sqlite3');
const db = new Database('barangay.db');

// Create barangays table (the "parent")
db.exec(`
  CREATE TABLE IF NOT EXISTS barangays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    captain TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create residents table (the "child" - references barangays)
db.exec(`
  CREATE TABLE IF NOT EXISTS residents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0),
    address TEXT NOT NULL,
    barangay_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barangay_id) REFERENCES barangays(id) ON DELETE CASCADE
  )
`);

console.log('Tables with foreign keys created!');
```

**Understanding Foreign Keys:**

```sql
FOREIGN KEY (barangay_id) REFERENCES barangays(id) ON DELETE CASCADE
--           ↑              ↑                       ↑
--     Column in THIS table  Table.column it links to  What happens on delete
```

**ON DELETE options:**
- `CASCADE` - Delete residents when barangay is deleted
- `RESTRICT` - Prevent deleting barangay if it has residents
- `SET NULL` - Set barangay_id to NULL when barangay is deleted

---

### Inserting Related Data

```javascript
// First, insert barangays
const insertBarangay = db.prepare(`
  INSERT INTO barangays (name, captain) VALUES (?, ?)
`);

const sanRoque = insertBarangay.run('San Roque', 'Pedro Cruz');
const santolan = insertBarangay.run('Santolan', 'Maria Reyes');

console.log(`San Roque ID: ${sanRoque.lastInsertRowid}`);
console.log(`Santolan ID: ${santolan.lastInsertRowid}`);

// Then, insert residents (using barangay IDs)
const insertResident = db.prepare(`
  INSERT INTO residents (name, age, address, barangay_id)
  VALUES (?, ?, ?, ?)
`);

insertResident.run('Juan Dela Cruz', 35, '123 Main St', sanRoque.lastInsertRowid);
insertResident.run('Maria Santos', 28, '456 Oak Ave', sanRoque.lastInsertRowid);
insertResident.run('Ana Garcia', 42, '789 Pine Rd', santolan.lastInsertRowid);

console.log('Residents added!');
```

---

### INNER JOIN - Displaying Related Data

**The problem:** Residents table only has `barangay_id`, not the barangay name!

```javascript
const residents = db.prepare('SELECT * FROM residents').all();
console.log(residents);
// Output: [
//   { id: 1, name: 'Juan Dela Cruz', barangay_id: 1 },  // What's barangay 1?
//   ...
// ]
```

**The solution: JOIN the tables!**

```javascript
const residentsWithBarangay = db.prepare(`
  SELECT 
    residents.id,
    residents.name,
    residents.age,
    residents.address,
    barangays.name as barangay_name,
    barangays.captain as barangay_captain
  FROM residents
  INNER JOIN barangays ON residents.barangay_id = barangays.id
`).all();

console.log(residentsWithBarangay);
// Output: [
//   { 
//     id: 1, 
//     name: 'Juan Dela Cruz', 
//     age: 35,
//     barangay_name: 'San Roque',
//     barangay_captain: 'Pedro Cruz'
//   },
//   ...
// ]
```

**Understanding INNER JOIN:**

```sql
SELECT 
  residents.name,           -- Column from residents table
  barangays.name as barangay_name  -- Column from barangays table (renamed)
FROM residents              -- Start with residents table
INNER JOIN barangays        -- Combine with barangays table
  ON residents.barangay_id = barangays.id  -- Match when IDs are equal
```

**Analogy:** JOIN is like stapling related documents together. The barangay_id is the paper clip that tells you which documents go together.

![Table Relationships Diagram](diagrams/database-basics/table-relationships.png)

---

### Real-World Example: Students and Sections

**Tables:**

```javascript
// sections table
db.exec(`
  CREATE TABLE sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    adviser TEXT NOT NULL,
    room TEXT
  )
`);

// students table (with foreign key to sections)
db.exec(`
  CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 5 AND age <= 100),
    section_id INTEGER NOT NULL,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE RESTRICT
  )
`);
```

**Note:** `ON DELETE RESTRICT` means you can't delete a section if it has students. Makes sense!

**Displaying students with their section info:**

```javascript
const studentsWithSections = db.prepare(`
  SELECT 
    students.student_id,
    students.name,
    students.age,
    sections.name as section_name,
    sections.adviser as section_adviser,
    sections.room as section_room
  FROM students
  INNER JOIN sections ON students.section_id = sections.id
  ORDER BY sections.name, students.name
`).all();

// Now you can display:
// "Juan Dela Cruz (Grade 9-Einstein, Room 101, Adviser: Ms. Reyes)"
```

**Filtering with JOIN:**

```javascript
// All students in Einstein section
const einsteinStudents = db.prepare(`
  SELECT students.name, students.age
  FROM students
  INNER JOIN sections ON students.section_id = sections.id
  WHERE sections.name = ?
`).all('Einstein');
```

**Counting with JOIN:**

```javascript
// How many students in each section?
const sectionCounts = db.prepare(`
  SELECT 
    sections.name,
    sections.adviser,
    COUNT(students.id) as student_count
  FROM sections
  LEFT JOIN students ON sections.section_id = students.section_id
  GROUP BY sections.id
`).all();

// Output: [
//   { name: 'Einstein', adviser: 'Ms. Reyes', student_count: 25 },
//   { name: 'Newton', adviser: 'Mr. Santos', student_count: 23 }
// ]
```

---

## 🛡️ Section 6: Security - Prepared Statements

**The most important section! Read carefully!**

### What is SQL Injection?

**SQL Injection** is when a hacker tricks your app into running malicious SQL commands.

**🎯 Scary Example: The Vulnerable Code**

```javascript
// ❌ DANGEROUS CODE - NEVER DO THIS!
app.get('/student', (req, res) => {
  const studentId = req.query.id;
  
  // Building SQL with string concatenation
  const sql = 'SELECT * FROM students WHERE id = ' + studentId;
  const student = db.prepare(sql).get();
  
  res.render('student', { student });
});
```

**Normal use:**
```
URL: /student?id=1
SQL: SELECT * FROM students WHERE id = 1
Result: Shows student #1 ✅
```

**Hacker use:**
```
URL: /student?id=1 OR 1=1
SQL: SELECT * FROM students WHERE id = 1 OR 1=1
Result: Shows ALL students! 💥
```

**Even worse:**
```
URL: /student?id=1; DROP TABLE students;
SQL: SELECT * FROM students WHERE id = 1; DROP TABLE students;
Result: YOUR ENTIRE STUDENTS TABLE IS DELETED! 💀
```

---

### How to Prevent SQL Injection

![Prepared Statements Security](diagrams/database-basics/prepared-statements.png)

**✅ ALWAYS USE PREPARED STATEMENTS (with ? placeholders)**

```javascript
// ✅ SAFE CODE - DO THIS!
app.get('/student', (req, res) => {
  const studentId = req.query.id;
  
  // Use ? placeholder
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
  
  res.render('student', { student });
});
```

**What happens:**
```
URL: /student?id=1 OR 1=1
The database treats "1 OR 1=1" as a STRING, not SQL code
SQL: SELECT * FROM students WHERE id = "1 OR 1=1"
Result: No student found (safe!) ✅
```

**The ? placeholder tells SQLite:** "This is DATA, not SQL CODE. Treat it as text."

---

### More Examples: Always Use ?

**❌ WRONG (vulnerable):**
```javascript
const name = req.body.name;
db.prepare(`INSERT INTO students (name) VALUES ('${name}')`).run();
```

**✅ CORRECT:**
```javascript
const name = req.body.name;
db.prepare('INSERT INTO students (name) VALUES (?)').run(name);
```

---

**❌ WRONG (vulnerable):**
```javascript
const section = req.query.section;
const students = db.prepare(`SELECT * FROM students WHERE section = '${section}'`).all();
```

**✅ CORRECT:**
```javascript
const section = req.query.section;
const students = db.prepare('SELECT * FROM students WHERE section = ?').all(section);
```

---

**❌ WRONG (vulnerable):**
```javascript
const search = req.query.q;
const results = db.prepare(`SELECT * FROM students WHERE name LIKE '%${search}%'`).all();
```

**✅ CORRECT:**
```javascript
const search = req.query.q;
const results = db.prepare('SELECT * FROM students WHERE name LIKE ?').all(`%${search}%`);
// Note: The % goes in the VALUE, not in the SQL
```

---

### Multiple Placeholders

```javascript
// ✅ Multiple ? placeholders (passed in order)
const student = db.prepare(`
  INSERT INTO students (name, age, section, grade)
  VALUES (?, ?, ?, ?)
`).run('Juan Dela Cruz', 15, 'Einstein', 92);

// ✅ Same for UPDATE
const update = db.prepare(`
  UPDATE students 
  SET name = ?, age = ?, section = ?
  WHERE id = ?
`).run('Juan P. Dela Cruz', 16, 'Newton', 5);

// ✅ Same for SELECT with multiple conditions
const results = db.prepare(`
  SELECT * FROM students
  WHERE section = ? AND grade >= ?
`).all('Einstein', 85);
```

---

### The Golden Rule

**🏆 NEVER, EVER build SQL strings with user input!**

```javascript
// ❌ NEVER DO THIS
const sql = 'SELECT * FROM table WHERE col = ' + userInput;
const sql = `SELECT * FROM table WHERE col = '${userInput}'`;
const sql = 'SELECT * FROM table WHERE col = "' + userInput + '"';

// ✅ ALWAYS DO THIS
const sql = 'SELECT * FROM table WHERE col = ?';
db.prepare(sql).get(userInput);
```

**If you remember only ONE thing from this lecture, remember this!** 🔒

---

## 🐛 Section 7: Troubleshooting Guide

![Database Error Handling Patterns](diagrams/database-basics/error-handling.png)

### Common Errors and Solutions

#### Error: "database is locked"
**Cause:** Another process is writing to the database  
**Solution:** 
- Close other database connections
- Use transactions for multiple writes
- Make sure to call `db.close()` when done

```javascript
// Good practice: Use transactions
const insertMany = db.transaction((students) => {
  for (const student of students) {
    db.prepare('INSERT INTO students VALUES (?, ?, ?)').run(...student);
  }
});

insertMany(studentList);
```

---

#### Error: "FOREIGN KEY constraint failed"
**Cause:** Trying to insert a barangay_id that doesn't exist  
**Solution:** Insert parent record first, then child

```javascript
// WRONG ORDER
insertResident.run('Juan', 25, 'Address', 999); // Barangay 999 doesn't exist! ❌

// RIGHT ORDER
const barangay = insertBarangay.run('San Roque', 'Pedro Cruz'); // Create barangay first
insertResident.run('Juan', 25, 'Address', barangay.lastInsertRowid); // Use its ID ✅
```

**Enable foreign key enforcement:**
```javascript
const db = new Database('mydb.db');
db.pragma('foreign_keys = ON'); // Always add this line!
```

---

#### Error: "UNIQUE constraint failed"
**Cause:** Trying to insert duplicate value in UNIQUE column  
**Solution:** Check if record exists first

```javascript
// Check before inserting
const existing = db.prepare('SELECT * FROM students WHERE student_id = ?').get('2025-001');

if (existing) {
  console.log('Student ID already exists!');
} else {
  db.prepare('INSERT INTO students (student_id, name) VALUES (?, ?)').run('2025-001', 'Juan');
}
```

---

#### Error: "no such table: students"
**Cause:** Table doesn't exist (forgot to create it)  
**Solution:** Run CREATE TABLE first

```javascript
// Always create tables before using them
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`);
```

---

#### Error: "CHECK constraint failed"
**Cause:** Value violates CHECK rule  
**Solution:** Validate data before inserting

```javascript
// Table has CHECK (age >= 5 AND age <= 100)

// WRONG
db.prepare('INSERT INTO students (name, age) VALUES (?, ?)').run('Baby', 2); // Age too low! ❌

// RIGHT - validate first
const age = parseInt(req.body.age);
if (age < 5 || age > 100) {
  return res.send('Age must be between 5 and 100');
}
db.prepare('INSERT INTO students (name, age) VALUES (?, ?)').run('Juan', age); ✅
```

---

#### Error: "column X does not exist"
**Cause:** Typo in column name or wrong table  
**Solution:** Check spelling, use database viewer

```bash
# Install DB Browser for SQLite (GUI tool)
# https://sqlitebrowser.org/

# Or use command line to inspect
sqlite3 mydb.db ".schema students"
```

---

## 📚 Section 8: Additional Resources

### Quick References

**SQL Cheat Sheet:**
See `support-materials/sql-cheat-sheet.md` for complete SQL syntax reference.

**SQLite Setup Guide:**
See `support-materials/sqlite-setup-guide.md` for installation and Railway deployment.

**Schema Templates:**
See `support-materials/schema-templates/` for ready-to-use table designs:
- `users.sql` - User authentication tables
- `products.sql` - E-commerce product tables
- `transactions.sql` - Financial transaction tables

---

### Practice Apps

**Want more practice?** Check out these apps in `practice-apps/`:

1. **07-sqlite-basics/** - Hello SQLite (simple SELECT)
2. **08-crud-simple/** - Single table CRUD operations
3. **09-crud-validation/** - CRUD with form validation
4. **10-relationships/** - Multiple tables with JOINs

Each has a README with instructions and learning goals.

---

### Tools for Working with SQLite

**DB Browser for SQLite (Recommended!)**
- Visual tool to view/edit databases
- Download: [sqlitebrowser.org](https://sqlitebrowser.org/)
- Open your `.db` file to see tables and data
- Great for debugging and learning

**VS Code Extensions:**
- **SQLite Viewer** - View .db files in VS Code
- **SQLite** - Run SQL queries from editor

**Command Line:**
```bash
# Open database in SQLite shell
sqlite3 mydb.db

# List tables
.tables

# Show table structure
.schema students

# Run a query
SELECT * FROM students;

# Exit
.quit
```

---

### Further Learning

**What's Next?**
- **Part 2B:** User authentication, login/logout, sessions, password hashing
- **Part 2C:** Advanced features (CSV export, QR codes, API integration, audit logs)

**Migration Guide:**
See `database-sqlite-migration-guide.md` for step-by-step instructions on upgrading your Part 1 JSON projects to SQLite.

---

## 🎓 Bonus Topics: Advanced Concepts

The following diagrams cover advanced database concepts not required for Part 2A, but useful to understand as you grow as a developer.

### Transaction Management

![Transaction Flow Pattern](diagrams/database-basics/transaction-flow.png)

**Transactions** ensure that multiple database operations either all succeed or all fail together (atomic operations). This is critical for financial apps, inventory systems, or any scenario where data consistency is essential.

**When you'll need this:**
- Processing payments (deduct from account A, add to account B)
- Transferring inventory between warehouses
- Complex multi-table operations

**Learn more:** Advanced database courses, Part 3 lectures (future)

---

### Database Migration Strategies

![Database Migration Strategy](diagrams/database-basics/migration-strategy.png)

**Migrations** are version-controlled changes to your database schema. As your app evolves, you'll need to add columns, create new tables, or modify relationships without losing existing data.

**When you'll need this:**
- Deploying schema changes to production
- Working in teams (syncing database structure)
- Adding features to existing applications

**Learn more:** Tools like Knex.js, Sequelize migrations, or Prisma

---

**These topics will be covered in future advanced lectures. For now, focus on mastering CRUD operations and relationships!** 💪

---

## 🎓 Summary: What You've Learned

**Congratulations!** You now know:

✅ **Why databases are better than JSON** for real applications  
✅ **How to set up SQLite** with better-sqlite3  
✅ **CRUD operations:** Create (INSERT), Read (SELECT), Update (UPDATE), Delete (DELETE)  
✅ **Filtering data:** WHERE clauses, LIKE patterns  
✅ **Aggregate queries:** COUNT, SUM, AVG, MIN, MAX, GROUP BY  
✅ **Sorting results:** ORDER BY  
✅ **Table relationships:** Foreign keys, INNER JOIN  
✅ **Security:** Prepared statements prevent SQL injection  

**You can now build production-ready database applications!** 🚀

---

## 🚀 What's Next?

**Step 1:** Review the concepts in this lecture  
**Step 2:** Read `database-sqlite-migration-guide.md` to upgrade your projects  
**Step 3:** Choose one mini-project to explore:
- `practice-apps/barangay-directory-v2/`
- `practice-apps/class-list-v2/`
- `practice-apps/store-inventory-v2/`

**Step 4:** Customize it! Add features, change the design, make it yours  
**Step 5:** Deploy to Railway and share with friends!

---

## 💭 Reflection Questions

1. What are 3 advantages of databases over JSON files?
2. What does the `?` placeholder do in SQL queries?
3. Why is SQL injection dangerous?
4. When would you use `ON DELETE CASCADE` vs `ON DELETE RESTRICT`?
5. What's the difference between `all()` and `get()` in better-sqlite3?

**Discuss with your classmates or write in your journal!**

---

**Ready to upgrade your projects? See you in the Migration Guide!** 📚

*Last updated: November 11, 2025*
