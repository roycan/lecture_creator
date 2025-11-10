# Database Diagram 02: SQL Operations (CRUD)

**Purpose:** Visual guide to all SQL CRUD operations with examples

**Format:** Operation flow diagrams with syntax and results

---

## The Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       SQL CRUD OPERATIONS                                │
│                  (Create, Read, Update, Delete)                          │
└─────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
 CREATE - INSERT New Records
═══════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│  INSERT INTO table_name (column1, column2, ...)             │
│  VALUES (value1, value2, ...);                              │
└─────────────────────────────────────────────────────────────┘

EXAMPLE 1: Insert single student
────────────────────────────────────────────────────────────────

SQL:
    INSERT INTO students (name, age, grade)
    VALUES ('Juan Cruz', 16, '10-A');

JavaScript (better-sqlite3):
    const stmt = db.prepare(`
      INSERT INTO students (name, age, grade)
      VALUES (?, ?, ?)
    `);
    stmt.run('Juan Cruz', 16, '10-A');

BEFORE:                           AFTER:
┌────┬──────┬─────┬───────┐      ┌────┬────────────┬─────┬───────┐
│ id │ name │ age │ grade │      │ id │ name       │ age │ grade │
├────┼──────┼─────┼───────┤      ├────┼────────────┼─────┼───────┤
│ 1  │ Maria│ 15  │ 10-B  │      │ 1  │ Maria      │ 15  │ 10-B  │
└────┴──────┴─────┴───────┘      │ 2  │ Juan Cruz  │ 16  │ 10-A  │ ← NEW
                                  └────┴────────────┴─────┴───────┘


EXAMPLE 2: Insert with auto-increment ID
────────────────────────────────────────────────────────────────

Table Schema:
    CREATE TABLE students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,  ← Automatic
      name TEXT NOT NULL,
      age INTEGER
    );

Insert (no need to specify id):
    INSERT INTO students (name, age)
    VALUES ('Pedro Reyes', 17);

Result:
    id = 3 (automatically assigned next available)


EXAMPLE 3: Insert multiple rows
────────────────────────────────────────────────────────────────

SQL:
    INSERT INTO students (name, age, grade)
    VALUES 
      ('Ana Garcia', 16, '10-A'),
      ('Luis Santos', 15, '10-B'),
      ('Sofia Reyes', 16, '10-C');

JavaScript (loop):
    const stmt = db.prepare(`
      INSERT INTO students (name, age, grade)
      VALUES (?, ?, ?)
    `);
    
    const students = [
      ['Ana Garcia', 16, '10-A'],
      ['Luis Santos', 15, '10-B'],
      ['Sofia Reyes', 16, '10-C']
    ];
    
    students.forEach(student => stmt.run(...student));


EXAMPLE 4: Get the inserted ID
────────────────────────────────────────────────────────────────

const result = stmt.run('Juan Cruz', 16, '10-A');
console.log(result.lastInsertRowid);  // Output: 5

Useful for: Redirecting to edit page, showing success message


═══════════════════════════════════════════════════════════════════════════
 READ - SELECT Query Data
═══════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│  SELECT column1, column2, ...                               │
│  FROM table_name                                            │
│  WHERE condition                                            │
│  ORDER BY column                                            │
│  LIMIT number;                                              │
└─────────────────────────────────────────────────────────────┘

EXAMPLE 1: Select all columns, all rows
────────────────────────────────────────────────────────────────

SQL:
    SELECT * FROM students;

JavaScript:
    const students = db.prepare('SELECT * FROM students').all();

Result (array of objects):
    [
      { id: 1, name: 'Maria Santos', age: 15, grade: '10-B' },
      { id: 2, name: 'Juan Cruz', age: 16, grade: '10-A' },
      { id: 3, name: 'Pedro Reyes', age: 17, grade: '10-C' }
    ]


EXAMPLE 2: Select specific columns
────────────────────────────────────────────────────────────────

SQL:
    SELECT name, age FROM students;

Result:
    [
      { name: 'Maria Santos', age: 15 },
      { name: 'Juan Cruz', age: 16 },
      { name: 'Pedro Reyes', age: 17 }
    ]


EXAMPLE 3: Select with WHERE condition
────────────────────────────────────────────────────────────────

SQL:
    SELECT * FROM students
    WHERE age >= 16;

JavaScript:
    const adults = db.prepare(`
      SELECT * FROM students
      WHERE age >= ?
    `).all(16);

Result (only matching rows):
    [
      { id: 2, name: 'Juan Cruz', age: 16, grade: '10-A' },
      { id: 3, name: 'Pedro Reyes', age: 17, grade: '10-C' }
    ]


EXAMPLE 4: Select single row
────────────────────────────────────────────────────────────────

SQL:
    SELECT * FROM students
    WHERE id = 2;

JavaScript (.get() returns single object):
    const student = db.prepare(`
      SELECT * FROM students
      WHERE id = ?
    `).get(2);

Result (single object, not array):
    { id: 2, name: 'Juan Cruz', age: 16, grade: '10-A' }


EXAMPLE 5: Order results
────────────────────────────────────────────────────────────────

SQL (ascending):
    SELECT * FROM students
    ORDER BY age ASC;

SQL (descending):
    SELECT * FROM students
    ORDER BY age DESC;

SQL (multiple columns):
    SELECT * FROM students
    ORDER BY grade ASC, name ASC;

Result (sorted):
    1. Maria Santos (age 15)
    2. Juan Cruz (age 16)
    3. Pedro Reyes (age 17)


EXAMPLE 6: Limit results
────────────────────────────────────────────────────────────────

SQL (first 5):
    SELECT * FROM students
    LIMIT 5;

SQL (pagination - skip 10, take 5):
    SELECT * FROM students
    LIMIT 5 OFFSET 10;

JavaScript:
    const page = 2;
    const perPage = 10;
    const offset = (page - 1) * perPage;
    
    const students = db.prepare(`
      SELECT * FROM students
      LIMIT ? OFFSET ?
    `).all(perPage, offset);


EXAMPLE 7: Aggregate functions
────────────────────────────────────────────────────────────────

COUNT:
    SELECT COUNT(*) as total FROM students;
    Result: { total: 150 }

AVERAGE:
    SELECT AVG(age) as avg_age FROM students;
    Result: { avg_age: 15.7 }

MIN/MAX:
    SELECT MIN(age) as youngest, MAX(age) as oldest
    FROM students;
    Result: { youngest: 14, oldest: 18 }

SUM:
    SELECT SUM(price) as total FROM products;

GROUP BY:
    SELECT grade, COUNT(*) as count
    FROM students
    GROUP BY grade;
    
    Result:
    [
      { grade: '10-A', count: 30 },
      { grade: '10-B', count: 28 },
      { grade: '10-C', count: 32 }
    ]


EXAMPLE 8: Pattern matching (LIKE)
────────────────────────────────────────────────────────────────

SQL (starts with):
    SELECT * FROM students
    WHERE name LIKE 'Juan%';

SQL (contains):
    SELECT * FROM students
    WHERE name LIKE '%Santos%';

SQL (case-insensitive):
    SELECT * FROM students
    WHERE LOWER(name) LIKE LOWER('%cruz%');


═══════════════════════════════════════════════════════════════════════════
 UPDATE - Modify Existing Records
═══════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│  UPDATE table_name                                          │
│  SET column1 = value1, column2 = value2, ...                │
│  WHERE condition;                                           │
└─────────────────────────────────────────────────────────────┘

⚠️  WARNING: Always use WHERE clause! Without it, ALL rows update.

EXAMPLE 1: Update single row
────────────────────────────────────────────────────────────────

SQL:
    UPDATE students
    SET age = 17, grade = '11-A'
    WHERE id = 2;

JavaScript:
    const stmt = db.prepare(`
      UPDATE students
      SET age = ?, grade = ?
      WHERE id = ?
    `);
    stmt.run(17, '11-A', 2);

BEFORE:                           AFTER:
┌────┬────────────┬─────┬───────┐ ┌────┬────────────┬─────┬───────┐
│ id │ name       │ age │ grade │ │ id │ name       │ age │ grade │
├────┼────────────┼─────┼───────┤ ├────┼────────────┼─────┼───────┤
│ 1  │ Maria      │ 15  │ 10-B  │ │ 1  │ Maria      │ 15  │ 10-B  │
│ 2  │ Juan Cruz  │ 16  │ 10-A  │ │ 2  │ Juan Cruz  │ 17  │ 11-A  │ ← UPDATED
│ 3  │ Pedro      │ 17  │ 10-C  │ │ 3  │ Pedro      │ 17  │ 10-C  │
└────┴────────────┴─────┴───────┘ └────┴────────────┴─────┴───────┘


EXAMPLE 2: Update multiple rows
────────────────────────────────────────────────────────────────

SQL (promote all grade 10 to grade 11):
    UPDATE students
    SET grade = REPLACE(grade, '10', '11')
    WHERE grade LIKE '10-%';

Result: All '10-A' → '11-A', '10-B' → '11-B', etc.


EXAMPLE 3: Increment value
────────────────────────────────────────────────────────────────

SQL:
    UPDATE products
    SET stock = stock + 10
    WHERE id = 5;

Useful for: Inventory management, view counts, likes


EXAMPLE 4: Update with timestamp
────────────────────────────────────────────────────────────────

SQL:
    UPDATE students
    SET name = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?;

Always update "updated_at" column when modifying data


EXAMPLE 5: Check how many rows updated
────────────────────────────────────────────────────────────────

JavaScript:
    const result = stmt.run('New Name', 2);
    console.log(result.changes);  // Output: 1
    
    if (result.changes === 0) {
      // No rows updated (id not found)
      console.log('Student not found');
    }


═══════════════════════════════════════════════════════════════════════════
 DELETE - Remove Records
═══════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│  DELETE FROM table_name                                     │
│  WHERE condition;                                           │
└─────────────────────────────────────────────────────────────┘

⚠️  WARNING: Without WHERE clause, deletes ALL rows!

EXAMPLE 1: Delete single row
────────────────────────────────────────────────────────────────

SQL:
    DELETE FROM students
    WHERE id = 2;

JavaScript:
    const stmt = db.prepare('DELETE FROM students WHERE id = ?');
    stmt.run(2);

BEFORE:                           AFTER:
┌────┬────────────┬─────┬───────┐ ┌────┬────────────┬─────┬───────┐
│ id │ name       │ age │ grade │ │ id │ name       │ age │ grade │
├────┼────────────┼─────┼───────┤ ├────┼────────────┼─────┼───────┤
│ 1  │ Maria      │ 15  │ 10-B  │ │ 1  │ Maria      │ 15  │ 10-B  │
│ 2  │ Juan Cruz  │ 16  │ 10-A  │ │ 3  │ Pedro      │ 17  │ 10-C  │
│ 3  │ Pedro      │ 17  │ 10-C  │ └────┴────────────┴─────┴───────┘
└────┴────────────┴─────┴───────┘      Row 2 DELETED ↑


EXAMPLE 2: Delete multiple rows
────────────────────────────────────────────────────────────────

SQL (delete all grade 12 students):
    DELETE FROM students
    WHERE grade LIKE '12-%';

JavaScript:
    const result = stmt.run('12-%');
    console.log(`${result.changes} students deleted`);


EXAMPLE 3: Delete all rows (but keep table)
────────────────────────────────────────────────────────────────

SQL:
    DELETE FROM students;

⚠️  Dangerous! No undo. Use with caution.

Better: Use TRUNCATE or DROP TABLE if resetting entire table.


EXAMPLE 4: Confirm before delete
────────────────────────────────────────────────────────────────

JavaScript (Express route):
    app.post('/delete/:id', (req, res) => {
      // Get student info first
      const student = db.prepare(
        'SELECT name FROM students WHERE id = ?'
      ).get(req.params.id);
      
      if (!student) {
        return res.status(404).send('Student not found');
      }
      
      // Delete
      db.prepare('DELETE FROM students WHERE id = ?')
        .run(req.params.id);
      
      req.flash('success', `${student.name} deleted`);
      res.redirect('/students');
    });

EJS (with confirmation):
    <form method="POST" action="/delete/<%= student.id %>"
          onsubmit="return confirm('Delete <%= student.name %>?')">
      <button type="submit">Delete</button>
    </form>


═══════════════════════════════════════════════════════════════════════════
 PREPARED STATEMENTS (Security)
═══════════════════════════════════════════════════════════════════════════

❌ NEVER DO THIS (SQL Injection vulnerability):
────────────────────────────────────────────────────────────────

const name = req.body.name;
const query = `SELECT * FROM students WHERE name = '${name}'`;
const result = db.prepare(query).all();

ATTACK: User enters: ' OR '1'='1
RESULT: SELECT * FROM students WHERE name = '' OR '1'='1'
        → Returns ALL students (security breach)


✅ ALWAYS DO THIS (Safe with placeholders):
────────────────────────────────────────────────────────────────

const name = req.body.name;
const result = db.prepare(`
  SELECT * FROM students WHERE name = ?
`).all(name);

Placeholders (?) escape special characters automatically.


PLACEHOLDER SYNTAX:
────────────────────────────────────────────────────────────────

Single value:
    db.prepare('SELECT * FROM students WHERE id = ?').get(5);

Multiple values:
    db.prepare(`
      INSERT INTO students (name, age, grade)
      VALUES (?, ?, ?)
    `).run('Juan', 16, '10-A');

Named parameters (optional):
    db.prepare(`
      SELECT * FROM students
      WHERE name = @name AND age = @age
    `).all({ name: 'Juan', age: 16 });


═══════════════════════════════════════════════════════════════════════════
 CRUD OPERATIONS SUMMARY
═══════════════════════════════════════════════════════════════════════════

┌──────────┬─────────────────┬──────────────────┬─────────────────┐
│ Operation│ SQL Command     │ JavaScript Method│ Returns         │
├──────────┼─────────────────┼──────────────────┼─────────────────┤
│ CREATE   │ INSERT INTO ... │ .run()           │ { lastInsertRowid,│
│          │                 │                  │   changes }     │
├──────────┼─────────────────┼──────────────────┼─────────────────┤
│ READ     │ SELECT * ...    │ .all()           │ Array of objects│
│ (many)   │                 │                  │                 │
├──────────┼─────────────────┼──────────────────┼─────────────────┤
│ READ     │ SELECT * ...    │ .get()           │ Single object   │
│ (one)    │ WHERE id = ?    │                  │ (or undefined)  │
├──────────┼─────────────────┼──────────────────┼─────────────────┤
│ UPDATE   │ UPDATE ...      │ .run()           │ { changes }     │
│          │ SET ... WHERE...│                  │                 │
├──────────┼─────────────────┼──────────────────┼─────────────────┤
│ DELETE   │ DELETE FROM ... │ .run()           │ { changes }     │
│          │ WHERE ...       │                  │                 │
└──────────┴─────────────────┴──────────────────┴─────────────────┘


COMPLETE EXAMPLE (Express Routes):
────────────────────────────────────────────────────────────────

// CREATE
app.post('/students/add', (req, res) => {
  const stmt = db.prepare(`
    INSERT INTO students (name, age, grade)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(req.body.name, req.body.age, req.body.grade);
  console.log(`Created student with ID: ${result.lastInsertRowid}`);
  res.redirect('/students');
});

// READ (all)
app.get('/students', (req, res) => {
  const students = db.prepare('SELECT * FROM students').all();
  res.render('students', { students });
});

// READ (one)
app.get('/students/:id', (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE id = ?')
    .get(req.params.id);
  if (!student) return res.status(404).send('Not found');
  res.render('student-detail', { student });
});

// UPDATE
app.post('/students/edit/:id', (req, res) => {
  const stmt = db.prepare(`
    UPDATE students
    SET name = ?, age = ?, grade = ?
    WHERE id = ?
  `);
  const result = stmt.run(
    req.body.name,
    req.body.age,
    req.body.grade,
    req.params.id
  );
  if (result.changes === 0) {
    return res.status(404).send('Student not found');
  }
  res.redirect('/students');
});

// DELETE
app.post('/students/delete/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM students WHERE id = ?');
  const result = stmt.run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).send('Student not found');
  }
  res.redirect('/students');
});


┌─────────────────────────────────────────────────────────────┐
│                    BEST PRACTICES                           │
└─────────────────────────────────────────────────────────────┘

1. ✅ Always use prepared statements (? placeholders)
2. ✅ Always use WHERE clause in UPDATE/DELETE
3. ✅ Check result.changes to confirm operation
4. ✅ Use transactions for multiple related operations
5. ✅ Add indexes on frequently queried columns
6. ✅ Validate input before database operations
7. ✅ Update timestamps (updated_at) on modifications
8. ✅ Log important operations (audit trail)
9. ✅ Handle errors gracefully (try/catch)
10. ✅ Use meaningful column names (created_at, not ct)
```

---

## Usage in Lecture

**Reference this diagram when:**
- Teaching each CRUD operation in detail
- Showing SQL syntax alongside JavaScript code
- Explaining prepared statements and SQL injection
- Comparing operations (when to use .all() vs .get())

**Key teaching points:**
1. Four operations cover 90% of database work
2. Prepared statements prevent SQL injection
3. Always check results (changes, lastInsertRowid)
4. WHERE clause is critical for UPDATE/DELETE

---

## Related Diagrams

- **Diagram 01**: JSON vs Database (why SQL is needed)
- **Diagram 04**: Prepared Statements (deep dive on security)
- **Diagram 06**: Transaction Flow (wrapping multiple operations)
