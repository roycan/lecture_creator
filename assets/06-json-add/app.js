const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Helper: Read JSON file
function readJSONFile(filename) {
  const filePath = path.join(__dirname, 'data', filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

// Helper: Write JSON file
function writeJSONFile(filename, data) {
  const filePath = path.join(__dirname, 'data', filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Route: Home - Display students
app.get('/', (req, res) => {
  const students = readJSONFile('students.json');
  res.render('index', { students: students });
});

// Route: Show add student form
app.get('/add-student', (req, res) => {
  res.render('add-student');
});

// Route: Handle adding new student
app.post('/add-student', (req, res) => {
  // Read existing students
  const students = readJSONFile('students.json');
  
  // Create new student object
  const newStudent = {
    id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1,
    name: req.body.name,
    course: req.body.course,
    year: parseInt(req.body.year),
    grade: parseFloat(req.body.grade),
    email: req.body.email
  };
  
  // Add to array
  students.push(newStudent);
  
  // Write back to file
  writeJSONFile('students.json', students);
  
  // Redirect to home page
  res.redirect('/');
});

// Route: About page
app.get('/about', (req, res) => {
  res.render('about');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Available pages:');
  console.log('  - http://localhost:3000/ (Student List)');
  console.log('  - http://localhost:3000/add-student (Add New Student)');
  console.log('  - http://localhost:3000/about (About)');
});
