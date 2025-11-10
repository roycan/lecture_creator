const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3000;

// Database connection
const dbPath = path.join(__dirname, 'data', 'classlist.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================================================================
// ROUTES
// ============================================================================

// Home - List all students with section info
app.get('/', (req, res) => {
  try {
    const students = db.prepare(`
      SELECT 
        students.id,
        students.student_id,
        students.name,
        students.age,
        sections.name as section_name,
        sections.id as section_id,
        sections.adviser
      FROM students
      INNER JOIN sections ON students.section_id = sections.id
      ORDER BY sections.name, students.name
    `).all();

    const sections = db.prepare('SELECT * FROM sections ORDER BY name').all();

    res.render('index', { students, sections });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).send('Database error');
  }
});

// Add student form
app.get('/add', (req, res) => {
  try {
    const sections = db.prepare('SELECT * FROM sections ORDER BY name').all();
    res.render('add', { sections });
  } catch (error) {
    console.error('Error loading form:', error);
    res.status(500).send('Database error');
  }
});

// Add student (POST)
app.post('/add', (req, res) => {
  const { student_id, name, age, section_id } = req.body;

  // Validation
  if (!student_id || !name || !age || !section_id) {
    return res.status(400).send('All fields are required');
  }

  const ageNum = parseInt(age);
  if (isNaN(ageNum) || ageNum < 5 || ageNum > 100) {
    return res.status(400).send('Please enter a valid age (5-100)');
  }

  try {
    // Verify section exists
    const section = db.prepare('SELECT id FROM sections WHERE id = ?').get(section_id);
    if (!section) {
      return res.status(400).send('Invalid section selected');
    }

    // Insert student
    const stmt = db.prepare(`
      INSERT INTO students (student_id, name, age, section_id)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(student_id.trim(), name.trim(), ageNum, section_id);

    res.redirect('/');
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).send('Student ID already exists');
    }
    console.error('Error adding student:', error);
    res.status(500).send('Database error');
  }
});

// View single student
app.get('/student/:id', (req, res) => {
  try {
    const student = db.prepare(`
      SELECT 
        students.*,
        sections.name as section_name,
        sections.adviser,
        sections.room
      FROM students
      INNER JOIN sections ON students.section_id = sections.id
      WHERE students.id = ?
    `).get(req.params.id);

    if (!student) {
      return res.status(404).send('Student not found');
    }

    res.render('view', { student });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).send('Database error');
  }
});

// Edit student form
app.get('/edit/:id', (req, res) => {
  try {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    
    if (!student) {
      return res.status(404).send('Student not found');
    }

    const sections = db.prepare('SELECT * FROM sections ORDER BY name').all();

    res.render('edit', { student, sections });
  } catch (error) {
    console.error('Error loading edit form:', error);
    res.status(500).send('Database error');
  }
});

// Update student (POST)
app.post('/edit/:id', (req, res) => {
  const { student_id, name, age, section_id } = req.body;

  // Validation
  if (!student_id || !name || !age || !section_id) {
    return res.status(400).send('All fields are required');
  }

  const ageNum = parseInt(age);
  if (isNaN(ageNum) || ageNum < 5 || ageNum > 100) {
    return res.status(400).send('Please enter a valid age (5-100)');
  }

  try {
    // Verify section exists
    const section = db.prepare('SELECT id FROM sections WHERE id = ?').get(section_id);
    if (!section) {
      return res.status(400).send('Invalid section selected');
    }

    // Update student
    const stmt = db.prepare(`
      UPDATE students
      SET student_id = ?,
          name = ?,
          age = ?,
          section_id = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(student_id.trim(), name.trim(), ageNum, section_id, req.params.id);

    if (result.changes === 0) {
      return res.status(404).send('Student not found');
    }

    res.redirect(`/student/${req.params.id}`);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).send('Student ID already exists');
    }
    console.error('Error updating student:', error);
    res.status(500).send('Database error');
  }
});

// Delete student (POST)
app.post('/delete/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM students WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).send('Student not found');
    }

    res.redirect('/');
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).send('Database error');
  }
});

// Search students
app.get('/search', (req, res) => {
  const searchTerm = req.query.q || '';

  try {
    const students = db.prepare(`
      SELECT 
        students.id,
        students.student_id,
        students.name,
        students.age,
        sections.name as section_name,
        sections.adviser
      FROM students
      INNER JOIN sections ON students.section_id = sections.id
      WHERE students.name LIKE ? OR students.student_id LIKE ?
      ORDER BY sections.name, students.name
    `).all(`%${searchTerm}%`, `%${searchTerm}%`);

    const sections = db.prepare('SELECT * FROM sections ORDER BY name').all();

    res.render('index', { students, sections, searchTerm });
  } catch (error) {
    console.error('Error searching students:', error);
    res.status(500).send('Database error');
  }
});

// Filter by section
app.get('/section/:id', (req, res) => {
  try {
    const section = db.prepare('SELECT * FROM sections WHERE id = ?').get(req.params.id);
    
    if (!section) {
      return res.status(404).send('Section not found');
    }

    const students = db.prepare(`
      SELECT 
        students.id,
        students.student_id,
        students.name,
        students.age,
        sections.name as section_name,
        sections.adviser
      FROM students
      INNER JOIN sections ON students.section_id = sections.id
      WHERE sections.id = ?
      ORDER BY students.name
    `).all(req.params.id);

    const sections = db.prepare('SELECT * FROM sections ORDER BY name').all();

    res.render('index', { students, sections, selectedSection: section });
  } catch (error) {
    console.error('Error filtering by section:', error);
    res.status(500).send('Database error');
  }
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 Class List running at http://localhost:${PORT}`);
  console.log(`📊 Database: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  console.log('\n✓ Database closed');
  process.exit();
});
