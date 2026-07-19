const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Set EJS as view engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Helper functions
function readJSONFile(filename) {
  const filePath = path.join(__dirname, 'data', filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

function writeJSONFile(filename, data) {
  const filePath = path.join(__dirname, 'data', filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ROUTES

// Home: Display all students
app.get('/', (req, res) => {
  const students = readJSONFile('students.json');
  
  // Calculate statistics
  const stats = {
    total: students.length,
    passing: students.filter(s => s.grade >= 75).length,
    failing: students.filter(s => s.grade < 75).length,
    average: students.length > 0 
      ? (students.reduce((sum, s) => sum + s.grade, 0) / students.length).toFixed(2)
      : 0,
    highest: students.length > 0 
      ? Math.max(...students.map(s => s.grade))
      : 0
  };
  
  res.render('index', { students: students, stats: stats });
});

// Show add student form
app.get('/add', (req, res) => {
  res.render('add');
});

// Handle add student
app.post('/add', (req, res) => {
  const students = readJSONFile('students.json');
  
  const newStudent = {
    id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1,
    name: req.body.name,
    studentId: req.body.studentId,
    course: req.body.course,
    year: parseInt(req.body.year),
    grade: parseFloat(req.body.grade),
    email: req.body.email
  };
  
  students.push(newStudent);
  writeJSONFile('students.json', students);
  
  res.redirect('/');
});

// About page
app.get('/about', (req, res) => {
  res.render('about');
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🎓 Class List Manager`);
  console.log(`================================`);
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`\nPages:`);
  console.log(`  📋 Student List: http://localhost:${PORT}/`);
  console.log(`  ➕ Add Student:  http://localhost:${PORT}/add`);
  console.log(`  ℹ️  About:        http://localhost:${PORT}/about`);
  console.log(`\nPress Ctrl+C to stop\n`);
});
