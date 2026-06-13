const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();
const PORT = 3000;

// Database setup with Railway volume support
const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH 
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'school.db')
  : path.join(__dirname, 'school.db');

const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    adviser TEXT NOT NULL,
    room TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    section_id INTEGER NOT NULL,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_students_section ON students(section_id);
`);

// Seed data for sections if empty
const sectionCount = db.prepare('SELECT COUNT(*) as count FROM sections').get();
if (sectionCount.count === 0) {
  const insertSection = db.prepare('INSERT INTO sections (name, adviser, room) VALUES (?, ?, ?)');
  const sections = [
    ['Grade 10-A', 'Ms. Garcia', 'Room 101'],
    ['Grade 10-B', 'Mr. Santos', 'Room 102'],
    ['Grade 10-C', 'Mrs. Reyes', 'Room 103'],
    ['Grade 11-A', 'Mr. Dela Cruz', 'Room 201'],
    ['Grade 11-B', 'Ms. Mercado', 'Room 202']
  ];
  
  sections.forEach(section => insertSection.run(...section));
  console.log('✅ Seeded 5 sections');
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 * 10 } // 10 minutes
}));

app.use(flash());

// Pass flash messages to all views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// ============================================
// VALIDATION FUNCTIONS
// ============================================

function validateStudent(data) {
  const errors = [];
  
  // Student ID: 8 characters (e.g., 2024-0001)
  if (!data.student_id || data.student_id.trim().length !== 9 || !data.student_id.includes('-')) {
    errors.push('Student ID must be in format YYYY-NNNN (e.g., 2024-0001)');
  }
  
  // First name: 2-50 characters
  if (!data.first_name || data.first_name.trim().length < 2 || data.first_name.trim().length > 50) {
    errors.push('First name must be between 2-50 characters');
  }
  
  // Last name: 2-50 characters
  if (!data.last_name || data.last_name.trim().length < 2 || data.last_name.trim().length > 50) {
    errors.push('Last name must be between 2-50 characters');
  }
  
  // Section: Must be a valid section ID
  const sectionId = parseInt(data.section_id);
  if (isNaN(sectionId)) {
    errors.push('Please select a valid section');
  } else {
    // Check if section exists
    const section = db.prepare('SELECT id FROM sections WHERE id = ?').get(sectionId);
    if (!section) {
      errors.push('Selected section does not exist');
    }
  }
  
  // Email: Optional, but if provided must be valid format
  if (data.email && data.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Invalid email format');
    }
  }
  
  return errors;
}

function checkDuplicateStudentId(studentId, excludeId = null) {
  let query = 'SELECT id FROM students WHERE student_id = ?';
  const params = [studentId];
  
  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }
  
  const existing = db.prepare(query).get(...params);
  return existing !== undefined;
}

// ============================================
// ROUTES
// ============================================

// Home - List all students with section info (JOIN query)
app.get('/', (req, res) => {
  // JOIN students with sections to get section details
  const students = db.prepare(`
    SELECT 
      students.id,
      students.student_id,
      students.first_name,
      students.last_name,
      students.email,
      sections.name as section_name,
      sections.adviser,
      sections.room
    FROM students
    INNER JOIN sections ON students.section_id = sections.id
    ORDER BY students.last_name, students.first_name
  `).all();
  
  // Get stats
  const stats = {
    totalStudents: students.length,
    totalSections: db.prepare('SELECT COUNT(*) as count FROM sections').get().count,
    studentsPerSection: {}
  };
  
  // Count students per section
  const sectionCounts = db.prepare(`
    SELECT 
      sections.name,
      COUNT(students.id) as count
    FROM sections
    LEFT JOIN students ON sections.id = students.section_id
    GROUP BY sections.id, sections.name
  `).all();
  
  sectionCounts.forEach(row => {
    stats.studentsPerSection[row.name] = row.count;
  });
  
  res.render('index', { students, stats });
});

// View all sections
app.get('/sections', (req, res) => {
  const sections = db.prepare(`
    SELECT 
      sections.*,
      COUNT(students.id) as student_count
    FROM sections
    LEFT JOIN students ON sections.id = students.section_id
    GROUP BY sections.id
    ORDER BY sections.name
  `).all();
  
  res.render('sections', { sections });
});

// Add student form
app.get('/add', (req, res) => {
  // Get all sections for dropdown
  const sections = db.prepare('SELECT * FROM sections ORDER BY name').all();
  
  res.render('add', { sections, formData: {} });
});

// Add student POST
app.post('/add', (req, res) => {
  // Validate
  const errors = validateStudent(req.body);
  
  // Check duplicate student ID
  if (checkDuplicateStudentId(req.body.student_id)) {
    errors.push('A student with this ID already exists');
  }
  
  if (errors.length > 0) {
    req.flash('error', errors);
    const sections = db.prepare('SELECT * FROM sections ORDER BY name').all();
    return res.render('add', {
      error: req.flash('error'),
      sections,
      formData: req.body
    });
  }
  
  // Insert student
  const stmt = db.prepare(`
    INSERT INTO students (student_id, first_name, last_name, section_id, email)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    req.body.student_id.trim(),
    req.body.first_name.trim(),
    req.body.last_name.trim(),
    parseInt(req.body.section_id),
    req.body.email ? req.body.email.trim() : null
  );
  
  req.flash('success', `Student ${req.body.first_name} ${req.body.last_name} added successfully!`);
  res.redirect('/');
});

// Edit student form
app.get('/edit/:id', (req, res) => {
  const student = db.prepare(`
    SELECT 
      students.*,
      sections.name as section_name
    FROM students
    INNER JOIN sections ON students.section_id = sections.id
    WHERE students.id = ?
  `).get(req.params.id);
  
  if (!student) {
    req.flash('error', 'Student not found');
    return res.redirect('/');
  }
  
  const sections = db.prepare('SELECT * FROM sections ORDER BY name').all();
  
  res.render('edit', { student, sections });
});

// Edit student POST
app.post('/edit/:id', (req, res) => {
  const id = req.params.id;
  
  // Validate
  const errors = validateStudent(req.body);
  
  // Check duplicate student ID (exclude current student)
  if (checkDuplicateStudentId(req.body.student_id, id)) {
    errors.push('Another student with this ID already exists');
  }
  
  if (errors.length > 0) {
    req.flash('error', errors);
    
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    const sections = db.prepare('SELECT * FROM sections ORDER BY name').all();
    const mergedData = { ...student, ...req.body };
    
    return res.render('edit', {
      error: req.flash('error'),
      student: mergedData,
      sections
    });
  }
  
  // Update student
  const stmt = db.prepare(`
    UPDATE students
    SET student_id = ?, first_name = ?, last_name = ?, section_id = ?, email = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  stmt.run(
    req.body.student_id.trim(),
    req.body.first_name.trim(),
    req.body.last_name.trim(),
    parseInt(req.body.section_id),
    req.body.email ? req.body.email.trim() : null,
    id
  );
  
  req.flash('success', `Student ${req.body.first_name} ${req.body.last_name} updated successfully!`);
  res.redirect('/');
});

// Delete student
app.post('/delete/:id', (req, res) => {
  const student = db.prepare('SELECT first_name, last_name FROM students WHERE id = ?').get(req.params.id);
  
  if (!student) {
    req.flash('error', 'Student not found');
    return res.redirect('/');
  }
  
  db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
  
  req.flash('success', `Student ${student.first_name} ${student.last_name} deleted successfully`);
  res.redirect('/');
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`\n🎓 School Management System`);
  console.log(`📊 Database: ${dbPath}`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`\n📚 Features:`);
  console.log(`   - One-to-many relationship (Students → Sections)`);
  console.log(`   - JOIN queries to display related data`);
  console.log(`   - Foreign key constraints`);
  console.log(`   - Dropdown select for section assignment\n`);
});
