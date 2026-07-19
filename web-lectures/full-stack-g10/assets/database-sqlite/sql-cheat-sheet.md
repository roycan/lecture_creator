# SQL Cheat Sheet

Quick reference for common SQL operations in SQLite

---

## Table of Contents

- [CREATE Operations](#create-operations)
- [SELECT Queries](#select-queries)
- [INSERT Data](#insert-data)
- [UPDATE Data](#update-data)
- [DELETE Data](#delete-data)
- [Aggregate Functions](#aggregate-functions)
- [JOIN Operations](#join-operations)
- [Indexes](#indexes)
- [Constraints](#constraints)

---

## CREATE Operations

### Create Table

```sql
CREATE TABLE table_name (
  column1 datatype constraints,
  column2 datatype constraints,
  ...
);
```

**Example:**
```sql
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER CHECK (age >= 0),
  email TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Data Types

| Type | Description | Example |
|------|-------------|---------|
| `INTEGER` | Whole numbers | `42`, `-10`, `0` |
| `REAL` | Decimals | `3.14`, `99.99` |
| `TEXT` | Strings | `'Hello'`, `'juan@example.com'` |
| `BLOB` | Binary data | (not used in this course) |

### Common Constraints

```sql
PRIMARY KEY              -- Unique identifier
AUTOINCREMENT           -- Auto-generate sequential IDs
NOT NULL                -- Field is required
UNIQUE                  -- No duplicate values
DEFAULT value           -- Default if not specified
CHECK (condition)       -- Validation rule
FOREIGN KEY (col) REFERENCES other_table(col)
```

---

## SELECT Queries

### Basic SELECT

```sql
-- All columns, all rows
SELECT * FROM students;

-- Specific columns
SELECT name, age FROM students;

-- With condition
SELECT * FROM students WHERE age >= 18;

-- Multiple conditions
SELECT * FROM students WHERE age >= 18 AND grade = '10-A';

-- OR condition
SELECT * FROM students WHERE grade = '10-A' OR grade = '10-B';
```

### Pattern Matching

```sql
-- Starts with
SELECT * FROM students WHERE name LIKE 'Juan%';

-- Contains
SELECT * FROM students WHERE name LIKE '%Santos%';

-- Case-insensitive
SELECT * FROM students WHERE LOWER(name) LIKE LOWER('%cruz%');
```

### Sorting

```sql
-- Ascending (default)
SELECT * FROM students ORDER BY name ASC;

-- Descending
SELECT * FROM students ORDER BY age DESC;

-- Multiple columns
SELECT * FROM students ORDER BY grade ASC, name ASC;
```

### Limiting Results

```sql
-- First 10 rows
SELECT * FROM students LIMIT 10;

-- Pagination (skip 10, take 10)
SELECT * FROM students LIMIT 10 OFFSET 10;
```

### Distinct Values

```sql
-- Unique grades
SELECT DISTINCT grade FROM students;
```

---

## INSERT Data

### Single Row

```sql
INSERT INTO students (name, age, grade)
VALUES ('Juan Cruz', 16, '10-A');
```

### Multiple Rows

```sql
INSERT INTO students (name, age, grade)
VALUES 
  ('Juan Cruz', 16, '10-A'),
  ('Maria Santos', 15, '10-B'),
  ('Pedro Reyes', 17, '10-C');
```

### With better-sqlite3

```javascript
// Single insert
const stmt = db.prepare('INSERT INTO students (name, age) VALUES (?, ?)');
const result = stmt.run('Juan Cruz', 16);
console.log(result.lastInsertRowid);  // Get new ID

// Multiple inserts
const insert = db.prepare('INSERT INTO students (name, age) VALUES (?, ?)');
const insertMany = db.transaction((students) => {
  students.forEach(student => insert.run(student.name, student.age));
});

insertMany([
  { name: 'Juan', age: 16 },
  { name: 'Maria', age: 15 }
]);
```

---

## UPDATE Data

### Basic UPDATE

```sql
-- Update single row
UPDATE students
SET age = 17, grade = '11-A'
WHERE id = 1;

-- Update multiple rows
UPDATE students
SET grade = '11-A'
WHERE grade = '10-A';
```

### Increment Value

```sql
UPDATE products
SET stock = stock + 10
WHERE id = 5;
```

### Update Timestamp

```sql
UPDATE students
SET name = 'New Name',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1;
```

### With better-sqlite3

```javascript
const stmt = db.prepare(`
  UPDATE students
  SET name = ?, age = ?
  WHERE id = ?
`);

const result = stmt.run('Juan Cruz', 17, 1);
console.log(result.changes);  // Number of rows updated
```

⚠️ **Warning:** Always use `WHERE` clause to avoid updating all rows!

---

## DELETE Data

### Basic DELETE

```sql
-- Delete single row
DELETE FROM students WHERE id = 1;

-- Delete multiple rows
DELETE FROM students WHERE grade = '10-A';

-- Delete all rows (dangerous!)
DELETE FROM students;
```

### With better-sqlite3

```javascript
const stmt = db.prepare('DELETE FROM students WHERE id = ?');
const result = stmt.run(1);
console.log(result.changes);  // Number of rows deleted
```

⚠️ **Warning:** Always use `WHERE` clause to avoid deleting all rows!

---

## Aggregate Functions

### COUNT

```sql
-- Total students
SELECT COUNT(*) as total FROM students;

-- Students per grade
SELECT grade, COUNT(*) as count
FROM students
GROUP BY grade;
```

### SUM

```sql
-- Total inventory value
SELECT SUM(price * quantity) as total_value FROM products;
```

### AVG

```sql
-- Average age
SELECT AVG(age) as average_age FROM students;
```

### MIN / MAX

```sql
-- Youngest and oldest
SELECT MIN(age) as youngest, MAX(age) as oldest FROM students;
```

### GROUP BY

```sql
-- Count students per grade
SELECT grade, COUNT(*) as student_count
FROM students
GROUP BY grade;

-- Having clause (filter groups)
SELECT grade, COUNT(*) as student_count
FROM students
GROUP BY grade
HAVING student_count > 30;
```

---

## JOIN Operations

### INNER JOIN

Returns only rows with matches in both tables.

```sql
SELECT 
  students.id,
  students.name,
  sections.name as section_name,
  sections.adviser
FROM students
INNER JOIN sections ON students.section_id = sections.id;
```

### LEFT JOIN

Returns all rows from left table, even if no match.

```sql
SELECT 
  sections.name,
  COUNT(students.id) as student_count
FROM sections
LEFT JOIN students ON sections.id = students.section_id
GROUP BY sections.id;
```

### Multiple JOINs

```sql
SELECT 
  students.name,
  sections.name as section_name,
  grades.score
FROM students
INNER JOIN sections ON students.section_id = sections.id
INNER JOIN grades ON students.id = grades.student_id;
```

---

## Indexes

### Create Index

```sql
-- Single column
CREATE INDEX idx_students_email ON students(email);

-- Multiple columns (composite)
CREATE INDEX idx_students_name ON students(last_name, first_name);

-- Unique index
CREATE UNIQUE INDEX idx_students_student_id ON students(student_id);
```

### When to Index

✅ Foreign key columns
✅ Frequently searched columns
✅ Columns in WHERE clauses
✅ Columns in ORDER BY

❌ Small tables (<1000 rows)
❌ Columns rarely queried

### Drop Index

```sql
DROP INDEX idx_students_email;
```

---

## Constraints

### Primary Key

```sql
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT
);
```

### NOT NULL

```sql
CREATE TABLE students (
  name TEXT NOT NULL,
  email TEXT NOT NULL
);
```

### UNIQUE

```sql
CREATE TABLE users (
  email TEXT UNIQUE,
  username TEXT UNIQUE
);
```

### CHECK

```sql
CREATE TABLE students (
  age INTEGER CHECK (age >= 0 AND age <= 120),
  grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D', 'F'))
);
```

### DEFAULT

```sql
CREATE TABLE products (
  stock INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Foreign Key

```sql
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  section_id INTEGER NOT NULL,
  FOREIGN KEY (section_id) REFERENCES sections(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
```

---

## Quick Reference: better-sqlite3 Methods

```javascript
// Execute query (no results expected)
db.prepare('CREATE TABLE ...').run();

// Get single row
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(1);
// Returns: { id: 1, name: 'Juan', ... } or undefined

// Get all rows
const users = db.prepare('SELECT * FROM users').all();
// Returns: [{ id: 1, ... }, { id: 2, ... }]

// Insert/Update/Delete
const result = db.prepare('INSERT INTO users (...) VALUES (...)').run(...);
console.log(result.lastInsertRowid);  // New ID (INSERT)
console.log(result.changes);          // Rows affected (UPDATE/DELETE)

// Transaction
const transfer = db.transaction((fromId, toId, amount) => {
  db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(amount, fromId);
  db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(amount, toId);
});

transfer(1, 2, 100);  // Executes atomically
```

---

## Common Patterns

### Check if Record Exists

```javascript
const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
if (exists) {
  // Email already registered
}
```

### Get or Create

```javascript
let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
if (!user) {
  const result = db.prepare('INSERT INTO users (email) VALUES (?)').run(email);
  user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
}
```

### Pagination

```javascript
const page = 2;
const perPage = 10;
const offset = (page - 1) * perPage;

const students = db.prepare(`
  SELECT * FROM students
  LIMIT ? OFFSET ?
`).all(perPage, offset);

const total = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
const totalPages = Math.ceil(total / perPage);
```

### Search with Multiple Terms

```javascript
const searchTerm = req.query.q;
const students = db.prepare(`
  SELECT * FROM students
  WHERE name LIKE ? OR student_id LIKE ?
  ORDER BY name
`).all(`%${searchTerm}%`, `%${searchTerm}%`);
```

---

## Tips & Best Practices

1. **Always use prepared statements** (? placeholders) to prevent SQL injection
2. **Always use WHERE** in UPDATE/DELETE to avoid affecting all rows
3. **Check result.changes** after UPDATE/DELETE to confirm operation
4. **Use transactions** for related operations (atomicity)
5. **Index foreign keys** for faster JOINs
6. **Add timestamps** (created_at, updated_at) to all tables
7. **Use NOT NULL** for required fields
8. **Use UNIQUE** for fields that must be unique
9. **Validate input** before database operations
10. **Handle errors** gracefully (try-catch)

---

## Resources

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [SQL Tutorial](https://www.w3schools.com/sql/)

---

**Need help?** Refer to the diagram sources in `diagram-src/database-basics/` for detailed explanations and examples.
