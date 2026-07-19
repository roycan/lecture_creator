const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// DATABASE SETUP
// ==========================================

const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH 
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'products.db')
  : path.join(__dirname, 'products.db');

console.log('📁 Database path:', dbPath);

const db = new Database(dbPath);

// Create products table
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert sample data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (count.count === 0) {
  console.log('📝 Inserting sample products...');
  const insert = db.prepare('INSERT INTO products (name, price, stock, category) VALUES (?, ?, ?, ?)');
  
  insert.run('Coke 500ml', 25, 50, 'Beverages');
  insert.run('Lucky Me Pancit Canton', 12, 120, 'Noodles');
  insert.run('Tide Detergent 50g', 8, 80, 'Household');
  insert.run('Alaska Evap 370ml', 35, 40, 'Dairy');
  insert.run('Skyflakes Crackers', 15, 60, 'Snacks');
  
  console.log('✅ Sample products inserted!');
}

// ==========================================
// MIDDLEWARE
// ==========================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // Parse form data

// ==========================================
// ROUTES - READ
// ==========================================

// List all products
app.get('/', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY name').all();
  const total = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  
  res.render('index', { products, total });
});

// ==========================================
// ROUTES - CREATE
// ==========================================

// Show add form
app.get('/add', (req, res) => {
  res.render('add');
});

// Handle add form submission
app.post('/add', (req, res) => {
  const { name, price, stock, category } = req.body;
  
  // IMPORTANT: Prepared statement prevents SQL injection!
  const stmt = db.prepare('INSERT INTO products (name, price, stock, category) VALUES (?, ?, ?, ?)');
  
  try {
    stmt.run(name, parseFloat(price), parseInt(stock), category);
    console.log(`✅ Added: ${name}`);
    res.redirect('/');
  } catch (error) {
    console.error('❌ Error adding product:', error.message);
    res.send('Error adding product: ' + error.message);
  }
});

// ==========================================
// ROUTES - UPDATE
// ==========================================

// Show edit form
app.get('/edit/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  
  if (!product) {
    return res.send('Product not found');
  }
  
  res.render('edit', { product });
});

// Handle edit form submission
app.post('/edit/:id', (req, res) => {
  const { name, price, stock, category } = req.body;
  const id = req.params.id;
  
  const stmt = db.prepare(`
    UPDATE products 
    SET name = ?, price = ?, stock = ?, category = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `);
  
  try {
    stmt.run(name, parseFloat(price), parseInt(stock), category, id);
    console.log(`✅ Updated product ID: ${id}`);
    res.redirect('/');
  } catch (error) {
    console.error('❌ Error updating product:', error.message);
    res.send('Error updating product: ' + error.message);
  }
});

// ==========================================
// ROUTES - DELETE
// ==========================================

// Handle delete (POST for safety)
app.post('/delete/:id', (req, res) => {
  const id = req.params.id;
  
  // Get product name before deleting (for log)
  const product = db.prepare('SELECT name FROM products WHERE id = ?').get(id);
  
  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  
  try {
    stmt.run(id);
    console.log(`✅ Deleted: ${product ? product.name : 'Product ID ' + id}`);
    res.redirect('/');
  } catch (error) {
    console.error('❌ Error deleting product:', error.message);
    res.send('Error deleting product: ' + error.message);
  }
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📦 Products in database: ${db.prepare('SELECT COUNT(*) as count FROM products').get().count}`);
});
