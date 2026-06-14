const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Set EJS as the view engine
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

// Home: Display all barangay officials
app.get('/', (req, res) => {
  const officials = readJSONFile('officials.json');
  res.render('index', { officials: officials });
});

// Show add official form
app.get('/add', (req, res) => {
  res.render('add');
});

// Handle add official
app.post('/add', (req, res) => {
  const officials = readJSONFile('officials.json');
  
  const newOfficial = {
    id: officials.length > 0 ? Math.max(...officials.map(o => o.id)) + 1 : 1,
    name: req.body.name,
    position: req.body.position,
    contact: req.body.contact,
    address: req.body.address,
    term: req.body.term
  };
  
  officials.push(newOfficial);
  writeJSONFile('officials.json', officials);
  
  res.redirect('/');
});

// About page
app.get('/about', (req, res) => {
  res.render('about');
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🏘️  Barangay Directory System`);
  console.log(`================================`);
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`\nPages:`);
  console.log(`  📋 Officials List: http://localhost:${PORT}/`);
  console.log(`  ➕ Add Official:  http://localhost:${PORT}/add`);
  console.log(`  ℹ️  About:         http://localhost:${PORT}/about`);
  console.log(`\nPress Ctrl+C to stop\n`);
});
