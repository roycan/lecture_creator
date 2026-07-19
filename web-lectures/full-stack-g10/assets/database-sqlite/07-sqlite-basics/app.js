const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// DATABASE SETUP
// ==========================================

// IMPORTANT: Support for Railway volumes (persistent storage)
// If running on Railway with volume, use that path
// Otherwise, use local ./data.db file
const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH 
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'students.db')
  : path.join(__dirname, 'students.db');

console.log('📁 Database path:', dbPath);

const db = new Database(dbPath);

// Create students table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    section TEXT NOT NULL,
    grade INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert sample data if table is empty
const count = db.prepare('SELECT COUNT(*) as count FROM students').get();
if (count.count === 0) {
  console.log('📝 Inserting sample data...');
  const insert = db.prepare('INSERT INTO students (name, section, grade) VALUES (?, ?, ?)');
  
  insert.run('Maria Santos', 'Einstein', 95);
  insert.run('Juan Dela Cruz', 'Newton', 88);
  insert.run('Ana Garcia', 'Einstein', 92);
  insert.run('Pedro Reyes', 'Newton', 85);
  insert.run('Sofia Cruz', 'Einstein', 90);
  insert.run('Carlos Mendoza', 'Newton', 87);
  
  console.log('✅ Sample data inserted!');
}

// ==========================================
// VIEW ENGINE SETUP
// ==========================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static('public'));

// ==========================================
// ROUTES
// ==========================================

// Home - List all students
app.get('/', (req, res) => {
  // SELECT query - get all students
  const students = db.prepare('SELECT * FROM students ORDER BY name').all();
  
  // Calculate average grade
  const avgResult = db.prepare('SELECT AVG(grade) as average FROM students').get();
  const average = Math.round(avgResult.average);
  
  // Count by section
  const einsteinCount = db.prepare('SELECT COUNT(*) as count FROM students WHERE section = ?').get('Einstein').count;
  const newtonCount = db.prepare('SELECT COUNT(*) as count FROM students WHERE section = ?').get('Newton').count;
  
  res.render('index', { 
    students,
    average,
    einsteinCount,
    newtonCount,
    total: students.length
  });
});

// About - Show database info
app.get('/about', (req, res) => {
  // Get database size and table info
  const tableInfo = db.prepare("SELECT * FROM sqlite_master WHERE type='table' AND name='students'").get();
  const rowCount = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
  
  res.render('about', {
    dbPath,
    tableInfo,
    rowCount
  });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Database: ${db.prepare('SELECT COUNT(*) as count FROM students').get().count} students loaded`);
});
