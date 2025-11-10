# Database Diagram 01: JSON vs Database Comparison

**Purpose:** Visual comparison showing when to use JSON files vs SQLite database

**Format:** Side-by-side comparison table with scenarios

---

## The Diagram

```

┌─────────────────────────────────────────────────────────────────────────┐
│                    JSON FILES vs SQLITE DATABASE                        │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│      JSON FILES          │         │   SQLITE DATABASE        │
│      (Part 1)            │         │      (Part 2)            │
└──────────────────────────┘         └──────────────────────────┘

📄 STRUCTURE                         📊 STRUCTURE
─────────────────────────            ─────────────────────────
[                                    CREATE TABLE students (
  {                                    id INTEGER PRIMARY KEY,
    "id": 1,                           name TEXT NOT NULL,
    "name": "Juan Cruz",               age INTEGER,
    "age": 16                          grade TEXT
  },                                 );
  {
    "id": 2,                         ┌─────┬────────────┬─────┬───────┐
    "name": "Maria Santos",          │ id  │ name       │ age │ grade │
    "age": 15                        ├─────┼────────────┼─────┼───────┤
  }                                  │ 1   │ Juan Cruz  │ 16  │ 10-A  │
]                                    │ 2   │ Maria      │ 15  │ 10-B  │
                                     └─────┴────────────┴─────┴───────┘


🔍 READING DATA                      🔍 READING DATA
─────────────────────────            ─────────────────────────
const data = JSON.parse(             const students = db.prepare(
  fs.readFileSync('file.json')         'SELECT * FROM students'
);                                   ).all();

// Filter in JavaScript                // Filter in SQL
const adults = data.filter(           const adults = db.prepare(
  item => item.age >= 18                'SELECT * FROM students
);                                       WHERE age >= 18'
                                       ).all();

⏱️  Speed: SLOW for large data       ⏱️  Speed: FAST (indexed queries)
    (reads entire file)                   (reads only needed rows)


✏️  WRITING DATA                      ✏️  WRITING DATA
─────────────────────────            ─────────────────────────
// Read entire file                   // Insert single row
const data = JSON.parse(              db.prepare(
  fs.readFileSync('file.json')          'INSERT INTO students
);                                       (name, age, grade)
                                         VALUES (?, ?, ?)'
// Modify in memory                   ).run('Pedro Reyes', 16, '10-C');
data.push({
  id: 3,                             ⏱️  Speed: INSTANT
  name: "Pedro Reyes",                   (no file rewrite)
  age: 16
});

// Write entire file back
fs.writeFileSync(
  'file.json',
  JSON.stringify(data, null, 2)
);

⏱️  Speed: SLOW (rewrites entire file)


🔗 RELATIONSHIPS                     🔗 RELATIONSHIPS
─────────────────────────            ─────────────────────────
// Manual lookup                      // JOIN query
const student = data.find(            const result = db.prepare(`
  s => s.id === 1                       SELECT students.*, sections.name
);                                      FROM students
const section = sections.find(          JOIN sections 
  sec => sec.id === student.sectionId     ON students.section_id = sections.id
);                                      WHERE students.id = ?
                                       `).get(1);

❌ No foreign keys                    ✅ Foreign key constraints
❌ No referential integrity           ✅ Referential integrity enforced
❌ Manual validation                  ✅ Automatic validation


🔒 CONCURRENT ACCESS                 🔒 CONCURRENT ACCESS
─────────────────────────            ─────────────────────────
❌ File locks (read entire file)     ✅ Row-level locking
❌ Race conditions possible          ✅ ACID transactions
❌ Manual conflict resolution        ✅ Automatic conflict handling

Example problem:                     Example solution:
User A reads file (10 students)     User A: INSERT student (atomic)
User B reads file (10 students)     User B: INSERT student (atomic)
User A adds 1 student, saves        Result: 12 students ✅
User B adds 1 student, saves
Result: 11 students (User A lost) ❌


📊 QUERY CAPABILITIES                📊 QUERY CAPABILITIES
─────────────────────────            ─────────────────────────
❌ Filter in JavaScript              ✅ SQL WHERE clause
❌ Sort in JavaScript                ✅ SQL ORDER BY
❌ No indexes                        ✅ Database indexes
❌ No aggregation functions          ✅ COUNT, SUM, AVG, MAX, MIN
❌ No complex queries                ✅ JOINs, subqueries, CTEs

// Get average age                   // Get average age
const sum = data.reduce(             const result = db.prepare(
  (acc, s) => acc + s.age, 0           'SELECT AVG(age) as avg
);                                      FROM students'
const avg = sum / data.length;       ).get();


💾 DATA INTEGRITY                    💾 DATA INTEGRITY
─────────────────────────            ─────────────────────────
❌ No type checking                  ✅ Column types enforced
❌ No constraints                    ✅ NOT NULL, UNIQUE, CHECK
❌ No validation                     ✅ Foreign key constraints
❌ Manual checks                     ✅ Default values

// Invalid data allowed:             // Invalid data rejected:
{                                    db.prepare(
  "id": "not-a-number",                'INSERT INTO students
  "age": -5,                            (name, age)
  "name": null                          VALUES (?, ?)'
}                                    ).run(null, -5);
✅ Saves successfully                // ❌ Error: NOT NULL constraint


📈 SCALABILITY                       📈 SCALABILITY
─────────────────────────            ─────────────────────────
10 records:    ✅ Fast               10 records:    ✅ Instant
100 records:   ✅ OK                 100 records:   ✅ Instant
1,000 records: ⚠️  Slow              1,000 records: ✅ Fast
10,000 records: ❌ Very slow         10,000 records: ✅ Fast
100,000 records: ❌ Unusable         100,000 records: ✅ Still fast


┌─────────────────────────────────────────────────────────────┐
│                    WHEN TO USE EACH                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  USE JSON WHEN:                   USE DATABASE WHEN:        │
│  ─────────────────                ─────────────────         │
│  ✅ Config files                  ✅ User data              │
│  ✅ Small datasets (<50 items)    ✅ Large datasets (>100)  │
│  ✅ Rarely updated                ✅ Frequent updates       │
│  ✅ No relationships              ✅ Related data           │
│  ✅ Single user                   ✅ Multiple users         │
│  ✅ Simple structure              ✅ Complex queries        │
│  ✅ Export/import                 ✅ Data integrity critical│
│  ✅ Learning basics               ✅ Production apps        │
│                                                             │
│  EXAMPLES:                        EXAMPLES:                 │
│  • App settings                   • Student records         │
│  • Menu items                     • E-commerce products     │
│  • Static content                 • User accounts           │
│  • Prototypes                     • Transaction history     │
│                                                             │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                  MIGRATION PATH (Part 1 → Part 2)           │
└─────────────────────────────────────────────────────────────┘

STEP 1: JSON File (Part 1)          STEP 2: SQLite (Part 2)
─────────────────────────────        ─────────────────────────
students.json                        school.db
├── Read entire file                 ├── Create table schema
├── Parse JSON                       ├── Migrate JSON data
├── Filter/map in JS                 ├── Query with SQL
└── Write back entire file           └── Individual row updates

CODE COMPARISON:
───────────────────────────────────────────────────────────────

// Part 1: JSON                      // Part 2: SQLite
const data = JSON.parse(             const db = require('better-sqlite3')('school.db');
  fs.readFileSync('students.json')   
);                                   db.prepare(`
                                       CREATE TABLE IF NOT EXISTS students (
app.get('/students', (req, res) => {    id INTEGER PRIMARY KEY,
  res.render('students', {              name TEXT,
    students: data                      age INTEGER
  });                                  )
});                                  `).run();

app.post('/students/add', (req, res) => {
  const newStudent = {               app.get('/students', (req, res) => {
    id: data.length + 1,                const students = db.prepare(
    name: req.body.name,                  'SELECT * FROM students'
    age: req.body.age                   ).all();
  };                                    res.render('students', { students });
  data.push(newStudent);             });
  
  fs.writeFileSync(                  app.post('/students/add', (req, res) => {
    'students.json',                    db.prepare(
    JSON.stringify(data, null, 2)        'INSERT INTO students (name, age)
  );                                      VALUES (?, ?)'
  res.redirect('/students');            ).run(req.body.name, req.body.age);
});                                     res.redirect('/students');
                                     });


┌─────────────────────────────────────────────────────────────┐
│                    PERFORMANCE COMPARISON                   │
└─────────────────────────────────────────────────────────────┘

OPERATION: Find 1 student by ID in 10,000 records
────────────────────────────────────────────────────

JSON Approach:
1. Read entire file (10,000 records)     ⏱️  ~50ms
2. Parse JSON into JavaScript             ⏱️  ~30ms
3. Array.find() loop through all          ⏱️  ~5ms
────────────────────────────────────
TOTAL:                                    ⏱️  ~85ms

SQLite Approach:
1. Open database connection               ⏱️  <1ms
2. Execute indexed SELECT query           ⏱️  <1ms
────────────────────────────────────
TOTAL:                                    ⏱️  ~2ms

🚀 SQLite is 40x FASTER!


OPERATION: Update 1 student's age
────────────────────────────────────────────────────

JSON Approach:
1. Read entire file                       ⏱️  ~50ms
2. Parse JSON                             ⏱️  ~30ms
3. Find and update in memory              ⏱️  ~5ms
4. Stringify updated data                 ⏱️  ~30ms
5. Write entire file back                 ⏱️  ~100ms
────────────────────────────────────
TOTAL:                                    ⏱️  ~215ms

SQLite Approach:
1. Execute UPDATE query                   ⏱️  ~2ms
────────────────────────────────────
TOTAL:                                    ⏱️  ~2ms

🚀 SQLite is 100x FASTER!


OPERATION: Get all students sorted by age
────────────────────────────────────────────────────

JSON Approach:
1. Read entire file                       ⏱️  ~50ms
2. Parse JSON                             ⏱️  ~30ms
3. Array.sort() in JavaScript             ⏱️  ~10ms
────────────────────────────────────
TOTAL:                                    ⏱️  ~90ms

SQLite Approach:
1. Execute SELECT with ORDER BY           ⏱️  ~3ms
────────────────────────────────────
TOTAL:                                    ⏱️  ~3ms

🚀 SQLite is 30x FASTER!


┌─────────────────────────────────────────────────────────────┐
│                         KEY TAKEAWAYS                       │
└─────────────────────────────────────────────────────────────┘

1. 📚 JSON is great for LEARNING and SMALL DATA
   - Easy to understand and visualize
   - No setup required
   - Perfect for Part 1 (basics)

2. 🚀 SQLite is better for REAL APPS
   - Faster queries (especially with indexes)
   - Data integrity (types, constraints)
   - Concurrent access (multiple users)

3. 🔄 Migration is STRAIGHTFORWARD
   - Same Express/EJS structure
   - Replace fs.readFile with db.prepare
   - Replace Array methods with SQL queries

4. 💡 Both have their place
   - JSON: Config, exports, simple data
   - SQLite: User data, complex queries, production

5. 🎓 Learn JSON first, then SQLite
   - Understand CRUD concepts with JSON
   - Apply same concepts with SQLite
   - Appreciate the benefits of databases

```

---

## Usage in Lecture

**Reference this diagram when:**
- Introducing Part 2A (transition from JSON to SQLite)
- Explaining why databases exist
- Comparing code from Part 1 to Part 2
- Discussing scalability and performance

**Key teaching points:**
1. JSON taught CRUD concepts (those skills transfer)
2. SQLite solves JSON's limitations (speed, integrity, concurrency)
3. Migration path is clear (fs.readFile → db.prepare)
4. Both tools are valid for different use cases

---

## Related Diagrams

- **Diagram 02**: SQL Operations (detailed CRUD in SQLite)
- **Diagram 08**: Migration Strategy (step-by-step JSON → SQLite)
- **Part 1 Diagram 05**: JSON File Operations (comparison baseline)
