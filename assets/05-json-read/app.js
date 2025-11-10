const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static('public'));

// Helper function to read JSON file
function readJSONFile(filename) {
  const filePath = path.join(__dirname, 'data', filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

// Route: Home page - Student list
app.get('/', (req, res) => {
  const students = readJSONFile('students.json');
  res.render('students', { students: students });
});

// Route: Barangay officials
app.get('/barangay', (req, res) => {
  const officials = readJSONFile('barangay.json');
  res.render('barangay', { officials: officials });
});

// Route: Store products
app.get('/products', (req, res) => {
  const products = readJSONFile('products.json');
  res.render('products', { products: products });
});

// Route: About page
app.get('/about', (req, res) => {
  res.render('about');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Available pages:');
  console.log('  - http://localhost:3000/ (Students)');
  console.log('  - http://localhost:3000/barangay (Barangay Officials)');
  console.log('  - http://localhost:3000/products (Store Products)');
  console.log('  - http://localhost:3000/about (About)');
});
