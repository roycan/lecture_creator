const express = require('express');
const app = express();
const PORT = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Route: Home page with student data
app.get('/', (req, res) => {
  const students = [
    { name: 'Maria Santos', grade: 95, course: 'BSIT' },
    { name: 'Juan Dela Cruz', grade: 88, course: 'BSCS' },
    { name: 'Sofia Reyes', grade: 92, course: 'BSIT' },
    { name: 'Carlos Mendoza', grade: 76, course: 'BSIS' }
  ];
  
  res.render('home', { students: students });
});

// Route: About page
app.get('/about', (req, res) => {
  const appInfo = {
    title: 'Student Management System',
    version: '1.0',
    description: 'A simple app to display student information with Bulma styling',
    features: [
      'Display student list',
      'Show grades and courses',
      'Responsive design with Bulma',
      'Clean and modern UI'
    ]
  };
  
  res.render('about', { info: appInfo });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});
