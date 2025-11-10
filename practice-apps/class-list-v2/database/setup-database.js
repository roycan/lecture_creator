const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database path
const dbPath = path.join(dataDir, 'classlist.db');

console.log('Setting up Class List database...');
console.log('Database path:', dbPath);

// Open connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('\nCreating tables...');

// Create tables
db.exec(`
  -- Sections table
  CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    adviser TEXT NOT NULL,
    room TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Students table
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 5 AND age <= 100),
    section_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
  );
`);

console.log('✓ Tables created successfully');

// Create indexes
console.log('\nCreating indexes...');

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_students_section_id ON students(section_id);
  CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
  CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
`);

console.log('✓ Indexes created successfully');

// Insert sample data
console.log('\nInserting sample data...');

// Sample sections
const sectionStmt = db.prepare('INSERT INTO sections (name, adviser, room) VALUES (?, ?, ?)');
const sections = [
  ['10-A', 'Ms. Garcia', 'Room 101'],
  ['10-B', 'Mr. Santos', 'Room 102'],
  ['10-C', 'Mrs. Cruz', 'Room 103']
];

const insertSections = db.transaction(() => {
  sections.forEach(section => sectionStmt.run(...section));
});

insertSections();

console.log(`✓ Inserted ${sections.length} sections`);

// Sample students
const studentStmt = db.prepare('INSERT INTO students (student_id, name, age, section_id) VALUES (?, ?, ?, ?)');
const students = [
  ['2024-001', 'Juan Cruz', 16, 1],
  ['2024-002', 'Maria Santos', 15, 1],
  ['2024-003', 'Pedro Reyes', 16, 1],
  ['2024-004', 'Ana Garcia', 15, 2],
  ['2024-005', 'Carlos Lopez', 16, 2],
  ['2024-006', 'Rosa Mendoza', 15, 2],
  ['2024-007', 'Miguel Torres', 17, 3],
  ['2024-008', 'Sofia Rivera', 16, 3]
];

const insertStudents = db.transaction(() => {
  students.forEach(student => studentStmt.run(...student));
});

insertStudents();

console.log(`✓ Inserted ${students.length} students`);

// Display summary
console.log('\n=== Database Summary ===');
const sectionCount = db.prepare('SELECT COUNT(*) as count FROM sections').get();
const studentCount = db.prepare('SELECT COUNT(*) as count FROM students').get();

console.log(`Sections: ${sectionCount.count}`);
console.log(`Students: ${studentCount.count}`);

// Test query
console.log('\n=== Sample Query ===');
const sampleQuery = db.prepare(`
  SELECT 
    students.student_id,
    students.name,
    students.age,
    sections.name as section_name,
    sections.adviser
  FROM students
  INNER JOIN sections ON students.section_id = sections.id
  LIMIT 3
`).all();

console.log('First 3 students:');
sampleQuery.forEach(student => {
  console.log(`- ${student.name} (${student.student_id}) - ${student.section_name}`);
});

// Students per section
console.log('\n=== Students per Section ===');
const perSection = db.prepare(`
  SELECT 
    sections.name,
    COUNT(students.id) as student_count
  FROM sections
  LEFT JOIN students ON sections.id = students.section_id
  GROUP BY sections.id
`).all();

perSection.forEach(section => {
  console.log(`${section.name}: ${section.student_count} students`);
});

db.close();
console.log('\n✓ Database setup complete!');
console.log('Run "npm start" to start the application.');
