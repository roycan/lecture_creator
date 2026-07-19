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

// Home: Display all products
app.get('/', (req, res) => {
  const products = readJSONFile('products.json');
  
  // Calculate statistics
  const stats = {
    totalProducts: products.length,
    totalItems: products.reduce((sum, p) => sum + p.stock, 0),
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2),
    lowStock: products.filter(p => p.stock <= 10).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    categories: [...new Set(products.map(p => p.category))].length
  };
  
  res.render('index', { products: products, stats: stats });
});

// Show add product form
app.get('/add', (req, res) => {
  res.render('add');
});

// Handle add product
app.post('/add', (req, res) => {
  const products = readJSONFile('products.json');
  
  const newProduct = {
    id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
    name: req.body.name,
    category: req.body.category,
    price: parseFloat(req.body.price),
    stock: parseInt(req.body.stock),
    unit: req.body.unit,
    supplier: req.body.supplier || 'N/A'
  };
  
  products.push(newProduct);
  writeJSONFile('products.json', products);
  
  res.redirect('/');
});

// About page
app.get('/about', (req, res) => {
  res.render('about');
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🏪 Sari-Sari Store Inventory`);
  console.log(`================================`);
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`\nPages:`);
  console.log(`  📦 Inventory:   http://localhost:${PORT}/`);
  console.log(`  ➕ Add Product: http://localhost:${PORT}/add`);
  console.log(`  ℹ️  About:       http://localhost:${PORT}/about`);
  console.log(`\nPress Ctrl+C to stop\n`);
});
