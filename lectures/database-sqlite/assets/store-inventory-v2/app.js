const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3000;

// Database connection
const dbPath = path.join(__dirname, 'data', 'inventory.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================================================================
// ROUTES
// ============================================================================

// Home - List all products with category info
app.get('/', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT 
        products.id,
        products.name,
        products.sku,
        products.price,
        products.stock,
        products.low_stock_threshold,
        categories.name as category_name,
        categories.id as category_id,
        (products.price * products.stock) as total_value
      FROM products
      INNER JOIN categories ON products.category_id = categories.id
      ORDER BY products.name
    `).all();

    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();

    // Calculate summary
    const totalValue = products.reduce((sum, p) => sum + p.total_value, 0);
    const lowStockCount = products.filter(p => p.stock <= p.low_stock_threshold).length;

    res.render('index', { products, categories, totalValue, lowStockCount });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Database error');
  }
});

// Add product form
app.get('/add', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.render('add', { categories });
  } catch (error) {
    console.error('Error loading form:', error);
    res.status(500).send('Database error');
  }
});

// Add product (POST)
app.post('/add', (req, res) => {
  const { name, sku, category_id, price, stock, low_stock_threshold } = req.body;

  // Validation
  if (!name || !sku || !category_id || !price || !stock) {
    return res.status(400).send('All required fields must be filled');
  }

  const priceNum = parseFloat(price);
  const stockNum = parseInt(stock);
  const thresholdNum = parseInt(low_stock_threshold) || 10;

  if (isNaN(priceNum) || priceNum < 0) {
    return res.status(400).send('Please enter a valid price (>= 0)');
  }

  if (isNaN(stockNum) || stockNum < 0) {
    return res.status(400).send('Please enter a valid stock quantity (>= 0)');
  }

  try {
    // Verify category exists
    const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
    if (!category) {
      return res.status(400).send('Invalid category selected');
    }

    // Insert product
    const stmt = db.prepare(`
      INSERT INTO products (name, sku, category_id, price, stock, low_stock_threshold)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(name.trim(), sku.trim().toUpperCase(), category_id, priceNum, stockNum, thresholdNum);

    res.redirect('/');
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).send('SKU already exists');
    }
    console.error('Error adding product:', error);
    res.status(500).send('Database error');
  }
});

// View single product
app.get('/product/:id', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT 
        products.*,
        categories.name as category_name,
        (products.price * products.stock) as total_value
      FROM products
      INNER JOIN categories ON products.category_id = categories.id
      WHERE products.id = ?
    `).get(req.params.id);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    res.render('view', { product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send('Database error');
  }
});

// Edit product form
app.get('/edit/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    
    if (!product) {
      return res.status(404).send('Product not found');
    }

    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();

    res.render('edit', { product, categories });
  } catch (error) {
    console.error('Error loading edit form:', error);
    res.status(500).send('Database error');
  }
});

// Update product (POST)
app.post('/edit/:id', (req, res) => {
  const { name, sku, category_id, price, stock, low_stock_threshold } = req.body;

  // Validation
  if (!name || !sku || !category_id || !price || !stock) {
    return res.status(400).send('All required fields must be filled');
  }

  const priceNum = parseFloat(price);
  const stockNum = parseInt(stock);
  const thresholdNum = parseInt(low_stock_threshold) || 10;

  if (isNaN(priceNum) || priceNum < 0) {
    return res.status(400).send('Please enter a valid price (>= 0)');
  }

  if (isNaN(stockNum) || stockNum < 0) {
    return res.status(400).send('Please enter a valid stock quantity (>= 0)');
  }

  try {
    // Verify category exists
    const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
    if (!category) {
      return res.status(400).send('Invalid category selected');
    }

    // Update product
    const stmt = db.prepare(`
      UPDATE products
      SET name = ?,
          sku = ?,
          category_id = ?,
          price = ?,
          stock = ?,
          low_stock_threshold = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      name.trim(), 
      sku.trim().toUpperCase(), 
      category_id, 
      priceNum, 
      stockNum, 
      thresholdNum, 
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).send('Product not found');
    }

    res.redirect(`/product/${req.params.id}`);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).send('SKU already exists');
    }
    console.error('Error updating product:', error);
    res.status(500).send('Database error');
  }
});

// Delete product (POST)
app.post('/delete/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).send('Product not found');
    }

    res.redirect('/');
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send('Database error');
  }
});

// Adjust stock
app.post('/adjust-stock/:id', (req, res) => {
  const { adjustment, reason } = req.body;
  const adjustmentNum = parseInt(adjustment);

  if (isNaN(adjustmentNum) || adjustmentNum === 0) {
    return res.status(400).send('Invalid adjustment amount');
  }

  try {
    // Get current stock
    const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(req.params.id);
    
    if (!product) {
      return res.status(404).send('Product not found');
    }

    const newStock = product.stock + adjustmentNum;

    if (newStock < 0) {
      return res.status(400).send('Insufficient stock');
    }

    // Update stock
    const stmt = db.prepare(`
      UPDATE products
      SET stock = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(newStock, req.params.id);

    res.redirect(`/product/${req.params.id}`);
  } catch (error) {
    console.error('Error adjusting stock:', error);
    res.status(500).send('Database error');
  }
});

// Search products
app.get('/search', (req, res) => {
  const searchTerm = req.query.q || '';

  try {
    const products = db.prepare(`
      SELECT 
        products.id,
        products.name,
        products.sku,
        products.price,
        products.stock,
        products.low_stock_threshold,
        categories.name as category_name,
        (products.price * products.stock) as total_value
      FROM products
      INNER JOIN categories ON products.category_id = categories.id
      WHERE products.name LIKE ? OR products.sku LIKE ?
      ORDER BY products.name
    `).all(`%${searchTerm}%`, `%${searchTerm}%`);

    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();

    const totalValue = products.reduce((sum, p) => sum + p.total_value, 0);
    const lowStockCount = products.filter(p => p.stock <= p.low_stock_threshold).length;

    res.render('index', { products, categories, totalValue, lowStockCount, searchTerm });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).send('Database error');
  }
});

// Filter by category
app.get('/category/:id', (req, res) => {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    
    if (!category) {
      return res.status(404).send('Category not found');
    }

    const products = db.prepare(`
      SELECT 
        products.id,
        products.name,
        products.sku,
        products.price,
        products.stock,
        products.low_stock_threshold,
        categories.name as category_name,
        (products.price * products.stock) as total_value
      FROM products
      INNER JOIN categories ON products.category_id = categories.id
      WHERE categories.id = ?
      ORDER BY products.name
    `).all(req.params.id);

    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();

    const totalValue = products.reduce((sum, p) => sum + p.total_value, 0);
    const lowStockCount = products.filter(p => p.stock <= p.low_stock_threshold).length;

    res.render('index', { products, categories, totalValue, lowStockCount, selectedCategory: category });
  } catch (error) {
    console.error('Error filtering by category:', error);
    res.status(500).send('Database error');
  }
});

// Low stock alert page
app.get('/low-stock', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT 
        products.id,
        products.name,
        products.sku,
        products.price,
        products.stock,
        products.low_stock_threshold,
        categories.name as category_name,
        (products.price * products.stock) as total_value
      FROM products
      INNER JOIN categories ON products.category_id = categories.id
      WHERE products.stock <= products.low_stock_threshold
      ORDER BY products.stock ASC
    `).all();

    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();

    const totalValue = products.reduce((sum, p) => sum + p.total_value, 0);
    const lowStockCount = products.length;

    res.render('index', { products, categories, totalValue, lowStockCount, lowStockFilter: true });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).send('Database error');
  }
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 Store Inventory running at http://localhost:${PORT}`);
  console.log(`📊 Database: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  console.log('\n✓ Database closed');
  process.exit();
});
