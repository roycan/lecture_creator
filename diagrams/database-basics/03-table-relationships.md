# Database Diagram 03: Table Relationships

**Purpose:** Visual guide to database relationships (one-to-many, foreign keys, JOINs)

**Format:** Entity relationship diagrams with JOIN query examples

---

## The Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATABASE RELATIONSHIPS                              │
│                  (Foreign Keys, JOINs, Referential Integrity)            │
└─────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
 ONE-TO-MANY RELATIONSHIP
═══════════════════════════════════════════════════════════════════════════

CONCEPT: One parent record can have many child records

EXAMPLE: School System
────────────────────────────────────────────────────────────────

One SECTION can have MANY STUDENTS
Each STUDENT belongs to ONE SECTION

┌─────────────────┐         ┌──────────────────┐
│   sections      │         │    students      │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │◄────────│ section_id (FK)  │
│ name            │ 1     ∞ │ student_id       │
│ adviser         │         │ first_name       │
│ room            │         │ last_name        │
└─────────────────┘         └──────────────────┘

Legend:
  PK = Primary Key (unique identifier)
  FK = Foreign Key (reference to another table)
  1:∞ = One-to-Many relationship
  ◄─ = Arrow shows relationship direction


TABLE DATA EXAMPLE:
────────────────────────────────────────────────────────────────

sections table:
┌────┬────────────┬─────────────┬──────────┐
│ id │ name       │ adviser     │ room     │
├────┼────────────┼─────────────┼──────────┤
│ 1  │ Grade 10-A │ Ms. Garcia  │ Room 101 │
│ 2  │ Grade 10-B │ Mr. Santos  │ Room 102 │
│ 3  │ Grade 10-C │ Mrs. Reyes  │ Room 103 │
└────┴────────────┴─────────────┴──────────┘

students table:
┌────┬────────────┬────────────┬────────────┬────────────┐
│ id │ student_id │ first_name │ last_name  │ section_id │
├────┼────────────┼────────────┼────────────┼────────────┤
│ 1  │ 2024-0001  │ Juan       │ Cruz       │ 1          │← Points to section 1
│ 2  │ 2024-0002  │ Maria      │ Santos     │ 1          │← Points to section 1
│ 3  │ 2024-0003  │ Pedro      │ Reyes      │ 2          │← Points to section 2
│ 4  │ 2024-0004  │ Ana        │ Garcia     │ 2          │← Points to section 2
│ 5  │ 2024-0005  │ Sofia      │ Mercado    │ 1          │← Points to section 1
└────┴────────────┴────────────┴────────────┴────────────┘
                                               ↑
                                        FOREIGN KEY
                                   (references sections.id)

RELATIONSHIP FACTS:
  • Section 1 (Grade 10-A) has 3 students (Juan, Maria, Sofia)
  • Section 2 (Grade 10-B) has 2 students (Pedro, Ana)
  • Section 3 (Grade 10-C) has 0 students
  • Each student can only be in ONE section


═══════════════════════════════════════════════════════════════════════════
 CREATING RELATIONSHIPS (Schema Definition)
═══════════════════════════════════════════════════════════════════════════

STEP 1: Create parent table (sections)
────────────────────────────────────────────────────────────────

CREATE TABLE sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  adviser TEXT NOT NULL,
  room TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


STEP 2: Create child table with foreign key (students)
────────────────────────────────────────────────────────────────

CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  section_id INTEGER NOT NULL,           ← Foreign key column
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (section_id) REFERENCES sections(id)
    ON DELETE CASCADE                    ← Delete rule
    ON UPDATE CASCADE                    ← Update rule
);

FOREIGN KEY CONSTRAINT EXPLAINED:
  • section_id must contain a value that exists in sections.id
  • Cannot insert student with section_id = 999 if section 999 doesn't exist
  • ON DELETE CASCADE: If section deleted, its students also deleted
  • ON UPDATE CASCADE: If section.id changes, students.section_id updates


STEP 3: Create index for faster lookups
────────────────────────────────────────────────────────────────

CREATE INDEX idx_students_section ON students(section_id);

WHY: Foreign key queries are common (JOINs), index speeds them up


═══════════════════════════════════════════════════════════════════════════
 INSERTING RELATED DATA
═══════════════════════════════════════════════════════════════════════════

ORDER MATTERS: Parent first, then children
────────────────────────────────────────────────────────────────

// 1. Insert section first
const sectionResult = db.prepare(`
  INSERT INTO sections (name, adviser, room)
  VALUES (?, ?, ?)
`).run('Grade 10-A', 'Ms. Garcia', 'Room 101');

const sectionId = sectionResult.lastInsertRowid;  // Get new section ID

// 2. Insert students with foreign key
db.prepare(`
  INSERT INTO students (student_id, first_name, last_name, section_id)
  VALUES (?, ?, ?, ?)
`).run('2024-0001', 'Juan', 'Cruz', sectionId);


VALIDATION: Check foreign key exists
────────────────────────────────────────────────────────────────

function validateSectionExists(sectionId) {
  const section = db.prepare(
    'SELECT id FROM sections WHERE id = ?'
  ).get(sectionId);
  
  return section !== undefined;
}

// Use in route
app.post('/students/add', (req, res) => {
  if (!validateSectionExists(req.body.section_id)) {
    return res.status(400).send('Invalid section');
  }
  
  // Insert student...
});


═══════════════════════════════════════════════════════════════════════════
 QUERYING RELATED DATA (JOINs)
═══════════════════════════════════════════════════════════════════════════

INNER JOIN: Only matched records
────────────────────────────────────────────────────────────────

SELECT 
  students.id,
  students.first_name,
  students.last_name,
  sections.name AS section_name,
  sections.adviser,
  sections.room
FROM students
INNER JOIN sections ON students.section_id = sections.id;

RESULT:
┌────┬────────────┬────────────┬──────────────┬─────────────┬──────────┐
│ id │ first_name │ last_name  │ section_name │ adviser     │ room     │
├────┼────────────┼────────────┼──────────────┼─────────────┼──────────┤
│ 1  │ Juan       │ Cruz       │ Grade 10-A   │ Ms. Garcia  │ Room 101 │
│ 2  │ Maria      │ Santos     │ Grade 10-A   │ Ms. Garcia  │ Room 101 │
│ 3  │ Pedro      │ Reyes      │ Grade 10-B   │ Mr. Santos  │ Room 102 │
│ 4  │ Ana        │ Garcia     │ Grade 10-B   │ Mr. Santos  │ Room 102 │
│ 5  │ Sofia      │ Mercado    │ Grade 10-A   │ Ms. Garcia  │ Room 101 │
└────┴────────────┴────────────┴──────────────┴─────────────┴──────────┘

NOTES:
  • Combines columns from both tables
  • Only students with valid section_id appear
  • Section info not duplicated (stored once, JOINed when needed)


LEFT JOIN: Include unmatched parent records
────────────────────────────────────────────────────────────────

SELECT 
  sections.id,
  sections.name,
  sections.adviser,
  COUNT(students.id) AS student_count
FROM sections
LEFT JOIN students ON sections.id = students.section_id
GROUP BY sections.id;

RESULT:
┌────┬────────────┬─────────────┬───────────────┐
│ id │ name       │ adviser     │ student_count │
├────┼────────────┼─────────────┼───────────────┤
│ 1  │ Grade 10-A │ Ms. Garcia  │ 3             │
│ 2  │ Grade 10-B │ Mr. Santos  │ 2             │
│ 3  │ Grade 10-C │ Mrs. Reyes  │ 0             │← Included with LEFT JOIN
└────┴────────────┴─────────────┴───────────────┘

DIFFERENCE FROM INNER JOIN:
  • INNER JOIN: Only sections with students
  • LEFT JOIN: All sections, even with 0 students


VISUALIZATION OF JOIN TYPES:
────────────────────────────────────────────────────────────────

sections table:      students table:
┌─────┐              ┌─────────────┐
│ 1   │◄─────────────│ section_id=1│  (Juan)
│ 2   │◄─────────────│ section_id=2│  (Pedro)
│ 3   │              │ section_id=1│  (Maria)
└─────┘              └─────────────┘

INNER JOIN:
  Returns: Sections 1, 2 (have students)
  Excludes: Section 3 (no students)

LEFT JOIN:
  Returns: Sections 1, 2, 3 (all sections)
  Section 3 shows: student_count = 0


JAVASCRIPT USAGE:
────────────────────────────────────────────────────────────────

// Get student with section details
const student = db.prepare(`
  SELECT 
    students.*,
    sections.name AS section_name,
    sections.adviser,
    sections.room
  FROM students
  INNER JOIN sections ON students.section_id = sections.id
  WHERE students.id = ?
`).get(studentId);

console.log(student);
// {
//   id: 1,
//   student_id: '2024-0001',
//   first_name: 'Juan',
//   last_name: 'Cruz',
//   section_id: 1,
//   section_name: 'Grade 10-A',   ← From sections table
//   adviser: 'Ms. Garcia',         ← From sections table
//   room: 'Room 101'               ← From sections table
// }


═══════════════════════════════════════════════════════════════════════════
 UPDATING RELATIONSHIPS
═══════════════════════════════════════════════════════════════════════════

TRANSFER STUDENT TO NEW SECTION:
────────────────────────────────────────────────────────────────

UPDATE students
SET section_id = 2
WHERE id = 1;

BEFORE:                           AFTER:
Juan in Section 1 (Grade 10-A) → Juan in Section 2 (Grade 10-B)

Only the foreign key changes, all data integrity maintained


BULK UPDATE:
────────────────────────────────────────────────────────────────

// Move all students from section 1 to section 2
UPDATE students
SET section_id = 2
WHERE section_id = 1;


═══════════════════════════════════════════════════════════════════════════
 DELETING WITH RELATIONSHIPS
═══════════════════════════════════════════════════════════════════════════

CASCADE DELETE (ON DELETE CASCADE):
────────────────────────────────────────────────────────────────

DELETE FROM sections WHERE id = 1;

RESULT:
  • Section 1 (Grade 10-A) deleted
  • All students with section_id = 1 ALSO deleted automatically
  • Juan, Maria, Sofia removed (CASCADE)

WITHOUT CASCADE:
  • Error: "foreign key constraint failed"
  • Must delete students first, then section


RESTRICT DELETE (Prevent if children exist):
────────────────────────────────────────────────────────────────

FOREIGN KEY (section_id) REFERENCES sections(id)
  ON DELETE RESTRICT

DELETE FROM sections WHERE id = 1;
// ❌ Error: Cannot delete section with students


SET NULL (Orphan children):
────────────────────────────────────────────────────────────────

FOREIGN KEY (section_id) REFERENCES sections(id)
  ON DELETE SET NULL

DELETE FROM sections WHERE id = 1;
// Students' section_id becomes NULL (orphaned)


RECOMMENDATION FOR THIS COURSE:
  Use CASCADE for simplicity (most common in real apps)


═══════════════════════════════════════════════════════════════════════════
 DROPDOWN SELECTS (UI for Foreign Keys)
═══════════════════════════════════════════════════════════════════════════

POPULATE DROPDOWN FROM DATABASE:
────────────────────────────────────────────────────────────────

// Route: GET /students/add
app.get('/students/add', (req, res) => {
  const sections = db.prepare(`
    SELECT id, name, adviser, room
    FROM sections
    ORDER BY name
  `).all();
  
  res.render('add-student', { sections });
});


EJS TEMPLATE:
────────────────────────────────────────────────────────────────

<label>Section:</label>
<select name="section_id" required>
  <option value="">-- Select Section --</option>
  <% sections.forEach(section => { %>
    <option value="<%= section.id %>">
      <%= section.name %> - <%= section.adviser %> (<%= section.room %>)
    </option>
  <% }); %>
</select>

RENDERED HTML:
<select name="section_id">
  <option value="">-- Select Section --</option>
  <option value="1">Grade 10-A - Ms. Garcia (Room 101)</option>
  <option value="2">Grade 10-B - Mr. Santos (Room 102)</option>
  <option value="3">Grade 10-C - Mrs. Reyes (Room 103)</option>
</select>


PRE-SELECTING CURRENT VALUE (Edit form):
────────────────────────────────────────────────────────────────

<select name="section_id" required>
  <% sections.forEach(section => { %>
    <option 
      value="<%= section.id %>"
      <%= student.section_id === section.id ? 'selected' : '' %>>
      <%= section.name %>
    </option>
  <% }); %>
</select>


═══════════════════════════════════════════════════════════════════════════
 REAL-WORLD EXAMPLE: Complete CRUD with Relationships
═══════════════════════════════════════════════════════════════════════════

// LIST students with section info (INNER JOIN)
app.get('/students', (req, res) => {
  const students = db.prepare(`
    SELECT 
      students.*,
      sections.name AS section_name,
      sections.adviser,
      sections.room
    FROM students
    INNER JOIN sections ON students.section_id = sections.id
    ORDER BY students.last_name
  `).all();
  
  res.render('students', { students });
});


// ADD student form (dropdown with sections)
app.get('/students/add', (req, res) => {
  const sections = db.prepare('SELECT * FROM sections ORDER BY name').all();
  res.render('add-student', { sections });
});


// ADD student (validate foreign key)
app.post('/students/add', (req, res) => {
  // Validate section exists
  const section = db.prepare('SELECT id FROM sections WHERE id = ?')
    .get(req.body.section_id);
  
  if (!section) {
    req.flash('error', 'Invalid section selected');
    return res.redirect('/students/add');
  }
  
  // Insert student
  db.prepare(`
    INSERT INTO students (student_id, first_name, last_name, section_id)
    VALUES (?, ?, ?, ?)
  `).run(
    req.body.student_id,
    req.body.first_name,
    req.body.last_name,
    req.body.section_id
  );
  
  res.redirect('/students');
});


// EDIT student (change section)
app.post('/students/edit/:id', (req, res) => {
  db.prepare(`
    UPDATE students
    SET first_name = ?, last_name = ?, section_id = ?
    WHERE id = ?
  `).run(
    req.body.first_name,
    req.body.last_name,
    req.body.section_id,
    req.params.id
  );
  
  res.redirect('/students');
});


// DELETE student (CASCADE not needed for child deletion)
app.post('/students/delete/:id', (req, res) => {
  db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
  res.redirect('/students');
});


═══════════════════════════════════════════════════════════════════════════
 BENEFITS OF RELATIONSHIPS
═══════════════════════════════════════════════════════════════════════════

1. NO DATA DUPLICATION
────────────────────────────────────────────────────────────────
   Without relationships:
   ┌────┬──────┬─────────────┬──────────┐
   │ id │ name │ adviser     │ room     │  ← Repeated for each student
   ├────┼──────┼─────────────┼──────────┤
   │ 1  │ Juan │ Ms. Garcia  │ Room 101 │
   │ 2  │ Maria│ Ms. Garcia  │ Room 101 │  ← Duplicate data!
   │ 3  │ Pedro│ Ms. Garcia  │ Room 101 │
   └────┴──────┴─────────────┴──────────┘
   
   Problem: If adviser changes, update 3 rows!
   
   With relationships:
   sections: { id: 1, adviser: "Ms. Garcia" }  ← Stored once
   students: All reference section_id = 1      ← No duplication


2. DATA INTEGRITY
────────────────────────────────────────────────────────────────
   • Cannot assign student to non-existent section
   • Foreign key constraint enforced by database
   • Prevents orphaned records
   • Consistent data across tables


3. EFFICIENT UPDATES
────────────────────────────────────────────────────────────────
   Change adviser once in sections table:
   UPDATE sections SET adviser = 'New Name' WHERE id = 1;
   
   All students automatically show new adviser via JOIN


4. FLEXIBLE QUERIES
────────────────────────────────────────────────────────────────
   • List all students in a section
   • Count students per section
   • Find sections with no students
   • Get section details for any student


┌─────────────────────────────────────────────────────────────┐
│                    KEY TAKEAWAYS                            │
└─────────────────────────────────────────────────────────────┘

1. Foreign keys link tables together (section_id → sections.id)
2. Use INNER JOIN to combine related data in queries
3. Use LEFT JOIN to include records with no matches
4. ON DELETE CASCADE automatically deletes children
5. Dropdowns populated from parent table (sections)
6. Always validate foreign keys before insert/update
7. Relationships eliminate data duplication
8. Database enforces referential integrity
```

---

## Usage in Lecture

**Reference this diagram when:**
- Introducing database relationships (App 10)
- Teaching foreign keys and referential integrity
- Explaining INNER JOIN vs LEFT JOIN
- Showing how to populate dropdowns from database

**Key teaching points:**
1. One-to-many is the most common relationship
2. Foreign keys ensure data integrity
3. JOINs combine related data in queries
4. CASCADE deletes simplify data management

---

## Related Diagrams

- **Diagram 02**: SQL Operations (basic CRUD before relationships)
- **Diagram 05**: Database Schema (designing related tables)
- **Part 1**: Covered data without relationships (JSON files)
