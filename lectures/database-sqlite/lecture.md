# Building Web Applications - Part 2A
## SQLite Databases and CRUD Operations

**Target Audience:** Grade 10 Students  
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

## � Section 0: Database Design Basics - Thinking in Tables

Before we write any code, let's learn to **think like a database designer**. Good design = easier coding later!

### From Spreadsheet to Database

You already know spreadsheets (Excel, Google Sheets). Databases work similarly!

**Spreadsheet thinking:**
- Each sheet = one type of thing (students, products, orders)
- Each row = one item
- Each column = one property

**Database thinking:**
- Each table = one type of thing (same!)
- Each row = one record
- Each column = one field/attribute

### The Golden Rules of Table Design

#### Rule 1: One Table = One Type of Thing

**Good:**
- `students` table - only student info
- `products` table - only product info
- `orders` table - only order info

**Bad:**
- Mixing students and products in one table ❌
- Putting orders inside the students table ❌

#### Rule 2: Each Row Must Be Unique

Every table needs an **ID column** (primary key) to identify each row.

**Example: Students Table**
```
id   name           section    grade_level
---  -------------  ---------  -----------
1    Maria Santos   Einstein   9
2    Juan Cruz      Newton     9
3    Maria Santos   Darwin     9  ← Different person, different ID!
```

**Why IDs matter:**
- Names can be duplicated (two Marias)
- IDs are always unique
- Easy to reference (Student #1 ordered Product #5)

#### Rule 3: Keep It Simple - One Value Per Cell

**Bad Design:** Cramming multiple values
```
id   name          subjects
---  ------------  -----------------------
1    Maria         Math, Science, English  ❌ Multiple values!
```

**Good Design:** Separate table for relationships
```
students table:
id   name
---  ------
1    Maria

student_subjects table:
student_id  subject
----------  -------
1           Math
1           Science
1           English
```

#### Rule 4: Don't Repeat Data

**Bad: Repeating teacher info**
```
students table:
id   name     teacher        teacher_email
---  -------  -------------  ------------------
1    Maria    Ms. Reyes      reyes@school.ph
2    Juan     Ms. Reyes      reyes@school.ph  ← Repeated!
3    Pedro    Ms. Santos     santos@school.ph
```

**Good: Separate teachers table**
```
students table:
id   name     teacher_id
---  -------  ----------
1    Maria    1
2    Juan     1
3    Pedro    2

teachers table:
id   name        email
---  ----------  -----------------
1    Ms. Reyes   reyes@school.ph
2    Ms. Santos  santos@school.ph
```

**Benefits:**
- Update teacher email once, not 50 times
- No typos ("reyes@school.ph" vs "reyes@schhol.ph")
- Saves space

### Choosing Column Types

SQL has different types for different kinds of data:

| Type | What It Stores | Examples |
|------|----------------|----------|
| `INTEGER` | Whole numbers | Age: 15, Count: 100 |
| `REAL` | Decimals | Price: 99.50, Grade: 88.5 |
| `TEXT` | Words/sentences | Name, Address, Email |
| `BLOB` | Binary data | Images, PDFs (advanced) |

**Rules of thumb:**
- IDs → `INTEGER`
- Names, emails, descriptions → `TEXT`
- Ages, counts → `INTEGER`
- Prices, grades, percentages → `REAL`
- True/false → `INTEGER` (0 = false, 1 = true)

### Planning a Table: The 4-Step Method

Let's design a **products table** for a sari-sari store:

**Step 1: List what you need to track**
- Product name
- Price
- Category (snacks, drinks, toiletries)
- Stock count
- Date added

**Step 2: Choose column names** (lowercase, underscores for spaces)
- `name`
- `price`
- `category`
- `stock`
- `date_added`

**Step 3: Choose types**
- `name` → TEXT (words)
- `price` → REAL (decimals like ₱15.50)
- `category` → TEXT (words)
- `stock` → INTEGER (whole numbers)
- `date_added` → TEXT (SQLite stores dates as text)

**Step 4: Add ID column** (always!)
- `id` → INTEGER PRIMARY KEY AUTOINCREMENT

**Final table design:**
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  date_added TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Common Design Patterns

#### Pattern 1: Directory/List (Simple)

**Use case:** Barangay officials, class list, contact directory

**One table is enough:**
```
officials table:
id   name               position         phone
---  -----------------  ---------------  ------------
1    Kapitan Ramos      Barangay Captain 09171234567
2    Kagawad Santos     Councilor        09187654321
```

**When to use:**
- No relationships needed
- Simple list of items
- 10-500 records

#### Pattern 2: Categories (One-to-Many)

**Use case:** Products with categories, students with sections

**Two tables with link:**
```
categories table:
id   name
---  -----------
1    Snacks
2    Drinks

products table:
id   name          category_id
---  ------------  -----------
1    Skyflakes     1
2    Lucky Me      1
3    Coke          2
```

**Relationship:** One category → Many products

#### Pattern 3: Transactions (Parent-Child)

**Use case:** Orders with items, enrollments with subjects

**Three tables:**
```
orders table (parent):
id   customer_name   order_date
---  --------------  ----------
1    Maria           2025-11-13

order_items table (child):
id   order_id   product   quantity
---  --------   --------  --------
1    1          Coke      2
2    1          Chips     1

products table:
id   name     price
---  -------  -----
1    Coke     20
2    Chips    15
```

**Relationship:** One order → Many items

### Philippine Examples to Practice

#### Example 1: School Grading System

**What to track:**
- Students (name, section, grade level)
- Subjects (name, teacher)
- Grades (student, subject, quarter, score)

**Tables needed:**
1. `students` (id, name, section, grade_level)
2. `subjects` (id, name, teacher)
3. `grades` (id, student_id, subject_id, quarter, score)

#### Example 2: Barangay Clearance System

**What to track:**
- Residents (name, address, birth_date)
- Clearance requests (resident, date_requested, purpose, status)

**Tables needed:**
1. `residents` (id, name, address, birth_date)
2. `clearances` (id, resident_id, date_requested, purpose, status)

#### Example 3: Sari-Sari Store Inventory

**What to track:**
- Products (name, price, category, stock)
- Sales transactions (date, total)
- Sale items (which products, quantities)

**Tables needed:**
1. `products` (id, name, price, category, stock)
2. `sales` (id, date, total)
3. `sale_items` (id, sale_id, product_id, quantity, price_at_sale)

### Before You Code: Draw It Out!

**Pen and paper exercise:**

1. **Write down what you need to track**
   - Students? Products? Orders?

2. **Group related info**
   - Student info (name, age, section)
   - Product info (name, price, stock)
   - Order info (date, customer, items)

3. **Draw tables**
   ```
   students
   --------
   id
   name
   section
   grade_level
   ```

4. **Draw arrows for relationships**
   ```
   students ----<  grades  >---- subjects
   (one)        (many)      (one)
   ```

5. **Now you're ready to write SQL!**

### Design Checklist

Before creating tables, ask:
- [ ] Does each table represent ONE type of thing?
- [ ] Does each table have an `id` column?
- [ ] Are there any columns with multiple values? (Fix with new table)
- [ ] Is any data repeated across rows? (Fix with relationships)
- [ ] Did I choose appropriate column types?
- [ ] Did I name columns clearly (lowercase, underscores)?

### Common Beginner Mistakes

**❌ Mistake 1: Everything in one table**
```
mega_table:
id, student_name, student_section, teacher_name, 
teacher_email, subject_name, grade, ...
```
**Fix:** Separate into students, teachers, subjects, grades tables

**❌ Mistake 2: No ID column**
```
students:
name, section  ← How to tell two "Juan Santos" apart?
```
**Fix:** Add `id INTEGER PRIMARY KEY AUTOINCREMENT`

**❌ Mistake 3: Storing lists in text**
```
students:
id, name, subjects  ← "Math, Science, English" as text
```
**Fix:** Create `student_subjects` linking table

**❌ Mistake 4: Wrong types**
```
age TEXT,      ← Should be INTEGER
price INTEGER  ← Should be REAL (decimals!)
```
**Fix:** Match type to data nature

### Practice Exercise: Design First, Code Later

**Scenario:** Design tables for a school library system.

**What to track:**
- Books (title, author, ISBN, copies available)
- Students (name, grade level, section)
- Borrowing (who borrowed what, when, returned?)

**Your task:**
1. List all tables needed
2. For each table:
   - Column names
   - Column types
   - Primary key
3. Draw relationships

**Solution (Don't peek until you try!):**

```sql
-- Table 1: Books
CREATE TABLE books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE,
  copies_available INTEGER DEFAULT 1
);

-- Table 2: Students
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  section TEXT NOT NULL
);

-- Table 3: Borrowing transactions
CREATE TABLE borrowings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  borrowed_date TEXT DEFAULT CURRENT_TIMESTAMP,
  due_date TEXT NOT NULL,
  returned_date TEXT,
  status TEXT DEFAULT 'borrowed',
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);
```

**Relationships:**
- One student → Many borrowings
- One book → Many borrowings (over time)
- Borrowings links students and books

### Key Takeaway

**Design before code!**

Spend 10 minutes planning tables = Save 2 hours of refactoring later.

**The best database design:**
- Simple (as few tables as needed)
- Clear (column names make sense)
- Normalized (no repeated data)
- Flexible (easy to add features later)

Now that you know how to **think** in tables, let's learn how databases solve the problems we saw with JSON files.

---

## �📊 Section 1: Understanding Databases vs JSON Files

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

### Why SQLite for Grade 10 Students?

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
// "Juan Dela Cruz (Grade 10-Einstein, Room 101, Adviser: Ms. Reyes)"
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

### 🛡️ Validation: The Other Half of Security

Prepared statements stop **hackers** (SQL injection). But what about **bad data**? A user who isn't trying to hack you can still type nonsense:

```javascript
// User fills the form with:
// name: "asdfghjkl"      (keyboard smash)
// age: "-999"            (negative age?!)
// section: ""            (left it blank)
```

Prepared statements will happily insert all of that — no error! That's why you need **validation** *before* your `INSERT`.

**Layer 1: Manual checks in your route (do this first)**

```javascript
app.post('/students/add', (req, res) => {
  const name = req.body.name;
  const age = parseInt(req.body.age);

  const errors = [];

  if (!name || name.trim() === '') {
    errors.push('Name is required.');
  }

  if (isNaN(age) || age < 5 || age > 120) {
    errors.push('Age must be a number between 5 and 120.');
  }

  // Stop if there are problems
  if (errors.length > 0) {
    return res.render('add-student', { errors: errors });
  }

  // All good — safe to INSERT with a prepared statement
  db.prepare('INSERT INTO students (name, age) VALUES (?, ?)')
    .run(name.trim(), age);

  res.redirect('/students');
});
```

**Layer 2: Column constraints (your backup)**

Even if your route validation has a bug, the database itself can reject bad data. You add these rules when you `CREATE TABLE`:

```sql
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                     -- can't be empty
  age INTEGER NOT NULL CHECK (age >= 0),  -- can't be negative
  section TEXT DEFAULT 'Unassigned'       -- fills in if blank
);
```

| Constraint | What it does | Example |
|---|---|---|
| `NOT NULL` | Rejects empty values | `name TEXT NOT NULL` |
| `CHECK (...)` | Rejects values that fail a rule | `CHECK (age >= 0)` |
| `DEFAULT value` | Uses a fallback if blank | `DEFAULT 'Unassigned'` |
| `UNIQUE` | Rejects duplicates | `email TEXT UNIQUE` |

```mermaid
flowchart LR
    A[User submits form] --> B[Route: manual if/else checks]
    B -->|Fails| C[Re-show form\nwith errors]
    B -->|Passes| D[Prepared statement INSERT]
    D --> E{Column constraints}
    E -->|Violated| F[Database error\nhandle with try/catch]
    E -->|OK| G[Data saved]
```

> ⚠️ **Why two layers?** Your route validation gives users *friendly* error messages ("Age must be a number"). Column constraints are a *safety net* that catches anything your code missed. Both matter.

**🎯 Try It:** Add a `CHECK` constraint to one of your tables — for example, force a `price` column to be positive: `price REAL CHECK (price >= 0)`. Then try to insert a negative price and watch the database reject it!

---

## 🤔 When to Use SQLite (vs JSON Files, Other Databases)

### ✅ Use SQLite When

#### 1. **You Have Related Data (Relationships Matter)**
```javascript
// JSON - Hard to keep in sync ❌
// students.json
[{id: 1, name: "Juan", barangay: "San Roque"}]

// barangays.json  
[{name: "San Roque", captain: "Pedro"}]

// What if barangay name changes? Must update BOTH files!

// SQLite - Relationships enforced ✅
CREATE TABLE barangays (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE
);

CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT,
  barangay_id INTEGER REFERENCES barangays(id)
);

// Change barangay name once, students automatically see new name!
```

**Real example:** Barangay system (residents belong to barangays, clearances belong to residents)

#### 2. **You Need to Search or Filter Data Efficiently**
```javascript
// JSON - Load ALL data, filter in JavaScript ❌
const data = JSON.parse(fs.readFileSync('students.json'));
const result = data.filter(s => s.age > 18 && s.grade > 85);
// Slow with 1000+ students! Loads EVERYTHING into memory.

// SQLite - Database does the filtering ✅
const result = db.prepare(`
  SELECT * FROM students 
  WHERE age > ? AND grade > ?
`).all(18, 85);
// Fast! Only returns matching rows.
```

**Real example:** School library with 500+ books - search by title, author, availability

#### 3. **Multiple Users Accessing Same Data**
```javascript
// JSON - Race condition disaster ❌
// User A reads file
const data = JSON.parse(fs.readFileSync('data.json'));
// User B reads file (same data)
const data2 = JSON.parse(fs.readFileSync('data.json'));
// User A adds item, saves
fs.writeFileSync('data.json', JSON.stringify([...data, newItem]));
// User B adds item, saves (OVERWRITES User A's change!)
fs.writeFileSync('data.json', JSON.stringify([...data2, newItem2]));
// User A's item is LOST!

// SQLite - Handles concurrency ✅
// User A inserts
db.prepare('INSERT INTO items VALUES (?)').run(newItem);
// User B inserts
db.prepare('INSERT INTO items VALUES (?)').run(newItem2);
// BOTH items saved! Database handles locking.
```

**Real example:** Sari-sari store where owner and helper both record sales

#### 4. **You Need Data Validation**
```javascript
// JSON - Must validate manually ❌
const newStudent = { name: req.body.name, age: req.body.age };
if (!newStudent.name) return res.send('Name required!');
if (newStudent.age < 0) return res.send('Invalid age!');
// Easy to forget checks!

// SQLite - Database enforces rules ✅
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,        -- Can't be empty
  age INTEGER CHECK(age > 0), -- Must be positive
  email TEXT UNIQUE          -- No duplicates
);

// Try to insert bad data?
db.prepare('INSERT INTO students VALUES (?, ?, ?)').run(null, -5, 'duplicate@email');
// Error! Database rejects it automatically.
```

### ❌ Don't Use SQLite When

#### 1. **Simple Configuration or Settings (Small, Rarely Changes)**
```javascript
// Overkill for SQLite ❌
CREATE TABLE settings (key TEXT, value TEXT);
INSERT INTO settings VALUES ('siteName', 'My Store');
INSERT INTO settings VALUES ('currency', 'PHP');

// JSON is simpler ✅
// config.json
{
  "siteName": "My Store",
  "currency": "PHP"
}

// Read settings
const config = require('./config.json');
```

**Rule of thumb:** < 10 settings that rarely change? Use JSON.

#### 2. **Temporary Data or Cache (Doesn't Need to Persist)**
```javascript
// Don't need database for temporary data ❌
CREATE TABLE cache (key TEXT, value TEXT, expires INTEGER);

// Just use variables or files ✅
const cache = new Map();
cache.set('weather', weatherData);

// Or use Redis for serious caching
```

#### 3. **Very Large Scale (Millions of Users Simultaneously)**
```markdown
SQLite is file-based, one writer at a time.

✅ GOOD: Barangay system (50 households, 100 requests/day)
✅ GOOD: School system (500 students, 1000 requests/day)
❌ BAD: National ID system (100 million citizens, 10,000 requests/second)

For massive scale: PostgreSQL, MySQL, or cloud databases (Firebase, Supabase)
```

#### 4. **You Need Advanced Features**
```markdown
SQLite is lightweight - doesn't have everything:

❌ No user accounts/permissions (anyone with file access can read)
❌ No stored procedures (can't write SQL functions in database)
❌ Limited data types (no native date, boolean types)
❌ No full-text search (basic LIKE only, no ranking)

If you need these: PostgreSQL or MySQL
```

### 📊 Decision Framework

| Data Characteristics | Use SQLite? | Alternative |
|----------------------|-------------|-------------|
| **< 10 simple settings** | ❌ NO | JSON file |
| **10-1000 records, related** | ✅ YES | SQLite |
| **1000+ records, need search** | ✅ YES | SQLite |
| **Multiple users editing** | ✅ YES | SQLite |
| **Millions of users** | ❌ NO | PostgreSQL, MySQL, cloud DB |
| **Temporary data/cache** | ❌ NO | Variables, Redis |
| **Static content (blog posts)** | ⚠️ MAYBE | Markdown files or SQLite |
| **Need user permissions** | ❌ NO | PostgreSQL/MySQL |

### 🇵🇭 Philippine Context Examples

#### Example 1: Sari-Sari Store Inventory (50 Products)

**NEEDS:**
- Track products (name, price, stock)
- Record sales (who bought what, when)
- Generate reports (best-selling items, daily revenue)
- Owner and helper both use system

**JSON vs SQLite:**

```javascript
// JSON approach ❌ PROBLEMS:
// 1. Can't easily relate sales to products
// 2. Owner and helper might overwrite each other's changes
// 3. Searching for "products below 10 stock" = load everything
// 4. No validation (can set stock to -5!)

// SQLite approach ✅ BETTER:
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price REAL CHECK(price > 0),
  stock INTEGER CHECK(stock >= 0)
);

CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER CHECK(quantity > 0),
  sold_at TEXT DEFAULT CURRENT_TIMESTAMP
);

// Benefits:
// ✅ Sales automatically link to products
// ✅ Both users can add sales safely
// ✅ Fast queries: "SELECT * FROM products WHERE stock < 10"
// ✅ Database prevents negative stock
```

**DECISION: Use SQLite ✅**

**Cost:** 30 minutes learning SQL
**Benefit:** Reliable data, multiple users, easy reports
**Hosting:** Railway free tier (500MB database = plenty for store)

#### Example 2: Barangay Clearance System

**NEEDS:**
- Track residents (name, address, contact)
- Track clearance requests (who, when, status, purpose)
- Generate reports for captain (requests this month, pending count)

**Why SQLite over JSON:**

```sql
-- Relationships matter:
CREATE TABLE residents (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  contact TEXT
);

CREATE TABLE clearance_requests (
  id INTEGER PRIMARY KEY,
  resident_id INTEGER REFERENCES residents(id),
  purpose TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  requested_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Easy queries:
-- How many requests this month?
SELECT COUNT(*) FROM clearance_requests 
WHERE requested_at >= date('now', 'start of month');

-- Which residents have pending requests?
SELECT r.name, c.purpose 
FROM residents r 
JOIN clearance_requests c ON c.resident_id = r.id
WHERE c.status = 'Pending';

-- Try doing this efficiently with JSON! ❌
```

**DECISION: Use SQLite ✅**

**Reality:** 100 residents, 30 requests/month = easy for SQLite

#### Example 3: Student Portfolio Website

**NEEDS:**
- Display 5 projects
- Show skills list
- Contact form (send email)

**JSON vs SQLite:**

```json
// projects.json ✅ SIMPLE
[
  {
    "title": "Sari-sari Store App",
    "description": "Built with Express",
    "image": "store.jpg"
  }
]

// In EJS:
<% projects.forEach(project => { %>
  <div><%= project.title %></div>
<% }) %>
```

**DECISION: DON'T use SQLite ❌**

**Why:**
- Only 5 projects (small data)
- YOU are the only editor (no concurrency)
- No relationships (projects don't relate to anything)
- Data rarely changes (update once per month)

**Better:** Keep using JSON, save hosting resources

**Cost:** JSON = 0 setup time, SQLite = 20 minutes
**Benefit:** No real benefit for this use case

#### Example 4: School Library (300 Books)

**NEEDS:**
- Track books (title, author, ISBN, copies)
- Track students (name, grade, section)
- Track borrowing (who borrowed what, when, returned?)
- Generate reports (overdue books, most borrowed)

**This SCREAMS for SQLite:**

```sql
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  isbn TEXT UNIQUE,
  copies INTEGER CHECK(copies >= 0)
);

CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  grade INTEGER,
  section TEXT
);

CREATE TABLE borrowings (
  id INTEGER PRIMARY KEY,
  book_id INTEGER REFERENCES books(id),
  student_id INTEGER REFERENCES students(id),
  borrowed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  due_date TEXT NOT NULL,
  returned_at TEXT
);

-- Powerful queries:
-- Overdue books
SELECT s.name, b.title, br.due_date
FROM borrowings br
JOIN students s ON br.student_id = s.id
JOIN books b ON br.book_id = b.id
WHERE br.returned_at IS NULL AND br.due_date < date('now');

-- How many copies of a book are available?
SELECT 
  b.title,
  b.copies - COUNT(br.id) as available
FROM books b
LEFT JOIN borrowings br ON br.book_id = b.id AND br.returned_at IS NULL
GROUP BY b.id;
```

**DECISION: MUST use SQLite ✅**

**Why JSON would FAIL:**
- ❌ Can't efficiently track relationships (books ↔ students ↔ borrowings)
- ❌ Searching 300 books in JSON = slow
- ❌ Multiple librarians = data conflicts
- ❌ Complex reports = tons of JavaScript array filtering

**Reality:** This is what databases were made for!

### 🎯 Quick Decision Guide

**Ask these questions:**

1. **"How many records will I have?"**
   - < 10 → JSON is fine
   - 10-1000 → SQLite is better
   - 1000+ → SQLite is essential
   - 1 million+ → Consider PostgreSQL/MySQL

2. **"Do I need to search/filter/sort data?"**
   - YES → SQLite (efficient queries)
   - NO (just display all) → JSON is OK

3. **"Do records relate to each other?"**
   - YES (students ↔ clearances, books ↔ borrowings) → SQLite
   - NO (just a list of items) → JSON might work

4. **"How many users will edit data?"**
   - 1 user → JSON works
   - 2+ users → SQLite (handles concurrency)

5. **"Do I need validation (prevent bad data)?"**
   - YES (prices must be positive, emails unique) → SQLite
   - NO (you manually check) → JSON

6. **"How often does data change?"**
   - Hourly/daily → SQLite (better for writes)
   - Weekly/monthly → JSON might be fine
   - Never (static data) → JSON or Markdown

### 🎓 Learning Path Recommendations

**For Grade 10 students:**

```markdown
PROJECT 1: Portfolio (5 pages, 3 projects)
→ Use JSON ✅
→ Why: Learn basics without database complexity

PROJECT 2: Todo List with Categories
→ Use JSON ✅
→ Why: Simple relationships, good practice for SQL later

PROJECT 3: Sari-Sari Store (inventory + sales)
→ NOW use SQLite ✅
→ Why: Multiple tables, relationships, real-world complexity

PROJECT 4: Library/Barangay System
→ Definitely SQLite ✅
→ Why: Complex relationships, multiple users, reports

❌ DON'T: Start with SQLite on day 1
✅ DO: Master Express + JSON first, then add SQLite
```

### 📋 Best Practices Summary

**DO:**
- ✅ Use SQLite when data has relationships (foreign keys)
- ✅ Use SQLite when multiple users edit data
- ✅ Use SQLite for 100+ records that need searching
- ✅ Use prepared statements ALWAYS (prevent SQL injection)
- ✅ Enable foreign keys: `db.pragma('foreign_keys = ON')`
- ✅ Start simple: One table, then add relationships
- ✅ Test queries in DB Browser for SQLite first

**DON'T:**
- ❌ Use SQLite for simple config files (< 10 settings)
- ❌ Use SQLite for temporary/cache data
- ❌ Forget to close connections: `db.close()`
- ❌ Use string concatenation for queries (SQL injection!)
- ❌ Make it too complex: Start with 2-3 tables max
- ❌ Skip learning JSON first (understand basics before databases)

**🇵🇭 Reality Check:**
- JSON: Quick to learn, good for small projects
- SQLite: 2x effort to learn, 10x better for real projects
- Most REAL client projects need SQLite (data relationships matter)
- Railway free tier: 500MB database = enough for most barangay/school projects

**When in doubt:** Start with JSON, migrate to SQLite when you feel the pain (slow searches, data conflicts, relationship problems).

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
