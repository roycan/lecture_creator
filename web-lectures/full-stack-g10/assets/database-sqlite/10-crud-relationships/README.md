# Practice App 10: Database Relationships

**Topics:** Foreign keys, one-to-many relationships, JOIN queries, referential integrity

---

## 📚 What You'll Learn

This app introduces **database relationships**:
- **One-to-many relationship** (one section has many students)
- **Foreign keys** to link tables together
- **JOIN queries** to combine data from multiple tables
- **Referential integrity** to prevent orphaned records
- **Dropdown selects** for foreign key assignment

---

## 🎯 Learning Objectives

By the end of this practice app, you will:
1. Design related tables with foreign keys
2. Write INNER JOIN queries to combine table data
3. Use LEFT JOIN to include records with no matches
4. Display dropdown selects populated from database
5. Enforce referential integrity with CASCADE
6. Count related records (e.g., students per section)

---

## 🚀 Getting Started

### Installation
```bash
cd practice-apps/10-crud-relationships
npm install
```

### Run the App
```bash
node app.js
```

Visit: `http://localhost:3000`

The app will automatically seed 5 sections on first run.

---

## 📖 Key Concepts

### 1. One-to-Many Relationship

**Definition:** One record in Table A can be related to many records in Table B.

**Example:**
- One **section** (e.g., "Grade 10-A") has **many students**
- Each **student** belongs to **one section**

**How it works:**
- Students table has a `section_id` column (foreign key)
- This column references the `id` in the sections table

```
Sections Table:
+----+------------+-----------+----------+
| id | name       | adviser   | room     |
+----+------------+-----------+----------+
| 1  | Grade 10-A | Ms. Garcia| Room 101 |
| 2  | Grade 10-B | Mr. Santos| Room 102 |
+----+------------+-----------+----------+

Students Table:
+----+------------+------------+-----------+------------+
| id | student_id | first_name | last_name | section_id |
+----+------------+------------+-----------+------------+
| 1  | 2024-0001  | Juan       | Cruz      | 1          |
| 2  | 2024-0002  | Maria      | Santos    | 1          |
| 3  | 2024-0003  | Pedro      | Reyes     | 2          |
+----+------------+------------+-----------+------------+
                                            ↑
                                    Foreign Key (points to sections.id)
```

### 2. Foreign Key Constraints

**Purpose:** Enforce data integrity between related tables.

```sql
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  student_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  section_id INTEGER NOT NULL,  -- Foreign key column
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);
```

**Benefits:**
- **Prevents orphans:** Can't insert a student with non-existent section_id
- **CASCADE DELETE:** Deleting a section also deletes its students
- **Data integrity:** Database enforces rules automatically

### 3. JOIN Queries

**INNER JOIN:** Returns only rows where there's a match in both tables.

```sql
SELECT 
  students.id,
  students.first_name,
  students.last_name,
  sections.name as section_name,
  sections.adviser
FROM students
INNER JOIN sections ON students.section_id = sections.id;
```

**Result:**
```
+----+------------+-----------+--------------+-----------+
| id | first_name | last_name | section_name | adviser   |
+----+------------+-----------+--------------+-----------+
| 1  | Juan       | Cruz      | Grade 10-A   | Ms. Garcia|
| 2  | Maria      | Santos    | Grade 10-A   | Ms. Garcia|
| 3  | Pedro      | Reyes     | Grade 10-B   | Mr. Santos|
+----+------------+-----------+--------------+-----------+
```

**LEFT JOIN:** Returns all rows from left table, even if no match.

```sql
SELECT 
  sections.name,
  COUNT(students.id) as student_count
FROM sections
LEFT JOIN students ON sections.id = students.section_id
GROUP BY sections.id;
```

This shows sections even if they have 0 students.

### 4. Dropdown Selects for Foreign Keys

When adding/editing a student, we populate a `<select>` with available sections:

```javascript
// Get all sections
const sections = db.prepare('SELECT * FROM sections ORDER BY name').all();

// Pass to view
res.render('add', { sections });
```

```html
<select name="section_id" required>
  <option value="">-- Select Section --</option>
  <% sections.forEach(section => { %>
    <option value="<%= section.id %>">
      <%= section.name %> (Adviser: <%= section.adviser %>)
    </option>
  <% }); %>
</select>
```

When user submits, `req.body.section_id` contains the foreign key value.

---

## 🔍 Code Walkthrough

### Database Schema

```javascript
// Sections table (parent)
CREATE TABLE sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  adviser TEXT NOT NULL,
  room TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

// Students table (child)
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  section_id INTEGER NOT NULL,  -- Foreign key
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

// Index for faster lookups
CREATE INDEX idx_students_section ON students(section_id);
```

### INNER JOIN Query (List Students)

```javascript
app.get('/', (req, res) => {
  // JOIN students with sections
  const students = db.prepare(`
    SELECT 
      students.id,
      students.student_id,
      students.first_name,
      students.last_name,
      students.email,
      sections.name as section_name,  -- From sections table
      sections.adviser,               -- From sections table
      sections.room                   -- From sections table
    FROM students
    INNER JOIN sections ON students.section_id = sections.id
    ORDER BY students.last_name, students.first_name
  `).all();
  
  res.render('index', { students });
});
```

**Result:** Each student row includes their section details (name, adviser, room) without data duplication.

### LEFT JOIN Query (Count Students per Section)

```javascript
const sectionCounts = db.prepare(`
  SELECT 
    sections.name,
    COUNT(students.id) as count
  FROM sections
  LEFT JOIN students ON sections.id = students.section_id
  GROUP BY sections.id, sections.name
`).all();
```

**Why LEFT JOIN?**
- Shows all sections, even if they have 0 students
- INNER JOIN would skip sections with no students

### Add Student with Foreign Key

```javascript
app.post('/add', (req, res) => {
  // Validate section_id exists
  const section = db.prepare('SELECT id FROM sections WHERE id = ?')
    .get(parseInt(req.body.section_id));
  
  if (!section) {
    errors.push('Selected section does not exist');
  }
  
  if (errors.length === 0) {
    // Insert with foreign key
    const stmt = db.prepare(`
      INSERT INTO students (student_id, first_name, last_name, section_id, email)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      req.body.student_id,
      req.body.first_name,
      req.body.last_name,
      parseInt(req.body.section_id),  // Foreign key value
      req.body.email || null
    );
    
    res.redirect('/');
  }
});
```

### Update Student (Change Section)

```javascript
app.post('/edit/:id', (req, res) => {
  // Update foreign key (transfer to new section)
  const stmt = db.prepare(`
    UPDATE students
    SET student_id = ?, first_name = ?, last_name = ?, 
        section_id = ?, email = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  stmt.run(
    req.body.student_id,
    req.body.first_name,
    req.body.last_name,
    parseInt(req.body.section_id),  // New section
    req.body.email || null,
    id
  );
  
  res.redirect('/');
});
```

When you change the section dropdown and submit, the student is transferred to the new section.

---

## 📊 Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│    sections     │         │     students     │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │◄────────│ section_id (FK)  │
│ name            │ 1     ∞ │ student_id       │
│ adviser         │         │ first_name       │
│ room            │         │ last_name        │
│ created_at      │         │ email            │
└─────────────────┘         └──────────────────┘

PK = Primary Key
FK = Foreign Key
1:∞ = One-to-Many Relationship
```

**Reading the diagram:**
- One section (1) can have many students (∞)
- Each student has exactly one section_id (points to one section)
- The arrow shows the relationship direction (students point to sections)

---

## 🎨 UI Features

### Dropdown Select for Sections

```html
<select name="section_id" required>
  <option value="">-- Select Section --</option>
  <% sections.forEach(section => { %>
    <option value="<%= section.id %>">
      <%= section.name %> (Adviser: <%= section.adviser %>, Room: <%= section.room %>)
    </option>
  <% }); %>
</select>
```

**Benefits:**
- User can't type an invalid section
- Shows human-readable section details
- Submits the numeric section_id (foreign key)

### Display Section Info with JOIN

```html
<% students.forEach(student => { %>
  <tr>
    <td><%= student.student_id %></td>
    <td><%= student.first_name %> <%= student.last_name %></td>
    <td><%= student.section_name %></td>  <!-- From JOIN -->
    <td><%= student.adviser %></td>       <!-- From JOIN -->
    <td><%= student.room %></td>          <!-- From JOIN -->
  </tr>
<% }); %>
```

All section details come from the JOIN query - no need to query sections separately.

### Stats with GROUP BY

```javascript
const sectionCounts = db.prepare(`
  SELECT sections.name, COUNT(students.id) as count
  FROM sections
  LEFT JOIN students ON sections.id = students.section_id
  GROUP BY sections.id
`).all();
```

Displays: "Grade 10-A: 15 students, Grade 10-B: 12 students"

---

## 🧪 Testing Checklist

### Foreign Key Tests

- [ ] Add student with valid section → should work
- [ ] Try to manually insert student with section_id = 999 (doesn't exist) → should fail
- [ ] Edit student and change section → should update successfully
- [ ] Delete a section that has students → students should also be deleted (CASCADE)

### JOIN Query Tests

- [ ] Add students to different sections → should display correct section info
- [ ] Add section with 0 students → LEFT JOIN should still show it
- [ ] View /sections page → should show correct student counts

### Dropdown Tests

- [ ] Add form → dropdown should show all sections
- [ ] Edit form → dropdown should pre-select current section
- [ ] Submit without selecting section → should show validation error

---

## 🔐 Why Relationships Matter

### 1. No Data Duplication

**Without relationships (bad):**
```
+----+------------+------------+-----------+
| id | first_name | last_name | adviser   |
+----+------------+------------+-----------+
| 1  | Juan       | Cruz      | Ms. Garcia|
| 2  | Maria      | Santos    | Ms. Garcia|
| 3  | Pedro      | Reyes     | Ms. Garcia|
+----+------------+------------+-----------+
```

If Ms. Garcia's name changes, you have to update 3 rows!

**With relationships (good):**
```
Sections: { id: 1, adviser: "Ms. Garcia" }
Students: { id: 1, section_id: 1 }
          { id: 2, section_id: 1 }
          { id: 3, section_id: 1 }
```

Update adviser once in sections table, all students automatically show the new name via JOIN.

### 2. Data Integrity

- Can't assign student to non-existent section
- Can't delete section if it has students (unless CASCADE)
- Database enforces rules automatically

### 3. Efficient Queries

```sql
-- Get all students with section details (1 query)
SELECT * FROM students
INNER JOIN sections ON students.section_id = sections.id;
```

No need for multiple queries or loops in code.

---

## 🎓 Key Takeaways

1. **Foreign keys link tables** - section_id in students points to sections.id
2. **INNER JOIN combines data** - one query gets info from both tables
3. **LEFT JOIN includes empties** - shows sections even with 0 students
4. **Dropdowns for foreign keys** - users select from valid options
5. **CASCADE deletes** - deleting parent deletes children
6. **No data duplication** - adviser stored once, referenced many times

---

## 🔗 Common Relationship Types

| Type | Example | Description |
|------|---------|-------------|
| **One-to-Many** | Section → Students | One section, many students (this app) |
| **Many-to-One** | Students → Section | Many students, one section (reverse view) |
| **Many-to-Many** | Students ↔ Subjects | Uses junction table (advanced) |
| **One-to-One** | User → Profile | Rare, usually combined into one table |

**This app demonstrates:** One-to-Many (most common relationship type)

---

## 🎯 Practice Challenges

### Easy
1. Add a `grade_level` field to sections (10, 11, 12)
2. Filter students by grade level
3. Show adviser's email in section details

### Medium
4. Add a `subjects` table with one-to-many to sections
5. Display subjects taught in each section
6. Add sorting: by name, by section, by student ID

### Hard
7. Implement many-to-many: Students can enroll in multiple subjects
8. Create a junction table: `enrollments` (student_id, subject_id, grade)
9. Display each student's subjects with grades

---

## 📚 Next Steps

**Mini-Projects v2:**
- We'll upgrade the 3 mini-projects from Part 1 to use SQLite
- Barangay Directory, Class List, Store Inventory
- Apply CRUD, validation, and relationships

**Part 2B: Authentication**
- User accounts and sessions
- Passwords and bcrypt
- Login/logout functionality

**Advanced relationships:**
- Many-to-many relationships (junction tables)
- Self-referential relationships (e.g., employee → manager)
- Polymorphic relationships (advanced)

---

## 🐛 Common Issues

### Issue: Foreign key constraint failed
**Cause:** Trying to insert student with non-existent section_id
**Solution:** Validate section_id exists before insert:
```javascript
const section = db.prepare('SELECT id FROM sections WHERE id = ?').get(sectionId);
if (!section) {
  errors.push('Invalid section');
}
```

### Issue: JOIN returns no results
**Cause:** Using INNER JOIN with students who have NULL section_id
**Solution:** Either:
1. Make section_id NOT NULL (prevent NULL values)
2. Use LEFT JOIN instead

### Issue: Can't delete section
**Cause:** Foreign key constraint prevents deletion (has students)
**Solution:** Either:
1. Delete students first
2. Use ON DELETE CASCADE (done in this app)

---

## 🎉 You Did It!

You now understand database relationships - the foundation of **relational databases**!

**What you built:**
- ✅ One-to-many relationship (sections → students)
- ✅ Foreign key constraints with CASCADE
- ✅ INNER JOIN and LEFT JOIN queries
- ✅ Dropdown selects from database
- ✅ Referential integrity enforcement

**Ready for the real world?** → Mini-Projects v2 (apply these concepts to complete apps)
