-- Products Table Schema Template
-- Ready-to-use schema for e-commerce/inventory applications

-- Enable foreign keys (add to your setup script)
PRAGMA foreign_keys = ON;

-- =============================================================================
-- Categories Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,  -- URL-friendly name (e.g., 'electronics')
  description TEXT,
  parent_id INTEGER,  -- For nested categories (optional)
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  CHECK (is_active IN (0, 1))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- =============================================================================
-- Products Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Basic information
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,  -- URL-friendly name
  sku TEXT NOT NULL UNIQUE,  -- Stock Keeping Unit (unique product code)
  barcode TEXT,  -- EAN/UPC barcode
  
  -- Category
  category_id INTEGER NOT NULL,
  
  -- Description
  short_description TEXT,  -- Brief description for listing pages
  description TEXT,  -- Full description for product page
  
  -- Pricing
  price REAL NOT NULL CHECK (price >= 0),
  cost_price REAL CHECK (cost_price >= 0),  -- Your cost (for profit calculation)
  sale_price REAL CHECK (sale_price >= 0),  -- Discounted price (optional)
  
  -- Inventory
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold INTEGER DEFAULT 10,
  
  -- Status
  is_active INTEGER DEFAULT 1,  -- 1 = visible, 0 = hidden
  is_featured INTEGER DEFAULT 0,  -- Featured on homepage
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  
  -- Constraints
  CHECK (is_active IN (0, 1)),
  CHECK (is_featured IN (0, 1)),
  CHECK (sale_price IS NULL OR sale_price < price)  -- Sale price must be lower
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);

-- =============================================================================
-- Product Images (Optional)
-- =============================================================================

CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary INTEGER DEFAULT 0,  -- 1 = main image, 0 = gallery image
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CHECK (is_primary IN (0, 1))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- =============================================================================
-- Product Tags (Optional)
-- =============================================================================

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many relationship between products and tags
CREATE TABLE IF NOT EXISTS product_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  
  -- Each product can have each tag only once
  UNIQUE(product_id, tag_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_tags_product_id ON product_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_tag_id ON product_tags(tag_id);

-- =============================================================================
-- Stock History (Optional - Track inventory changes)
-- =============================================================================

CREATE TABLE IF NOT EXISTS stock_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  change_amount INTEGER NOT NULL,  -- Positive = added, Negative = removed
  old_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT,  -- 'sale', 'restock', 'adjustment', 'return'
  notes TEXT,
  user_id INTEGER,  -- Who made the change
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stock_history_product_id ON stock_history(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_created_at ON stock_history(created_at);

-- =============================================================================
-- Sample Data
-- =============================================================================

-- Insert sample categories
INSERT OR IGNORE INTO categories (id, name, slug, description) VALUES
  (1, 'Electronics', 'electronics', 'Electronic devices and gadgets'),
  (2, 'Clothing', 'clothing', 'Apparel and fashion items'),
  (3, 'Books', 'books', 'Physical and digital books'),
  (4, 'Home & Garden', 'home-garden', 'Home improvement and gardening supplies'),
  (5, 'Sports', 'sports', 'Sports equipment and accessories');

-- Insert sample products
INSERT OR IGNORE INTO products (
  name, slug, sku, category_id, short_description, description, 
  price, cost_price, stock, is_active, is_featured
) VALUES
  (
    'Wireless Bluetooth Headphones',
    'wireless-bluetooth-headphones',
    'WBH-001',
    1,
    'High-quality wireless headphones with noise cancellation',
    'Premium wireless headphones featuring active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and professionals.',
    2999.00,
    1500.00,
    50,
    1,
    1
  ),
  (
    'Cotton T-Shirt - Blue',
    'cotton-tshirt-blue',
    'CT-BLUE-M',
    2,
    'Comfortable 100% cotton t-shirt',
    'Classic crew neck t-shirt made from 100% premium cotton. Available in multiple sizes and colors.',
    299.00,
    150.00,
    200,
    1,
    0
  ),
  (
    'JavaScript Programming Book',
    'javascript-programming-book',
    'BOOK-JS-001',
    3,
    'Complete guide to modern JavaScript',
    'Comprehensive guide covering ES6+, async programming, and modern JavaScript frameworks. Perfect for beginners and intermediate developers.',
    799.00,
    400.00,
    75,
    1,
    1
  );

-- =============================================================================
-- Common Queries
-- =============================================================================

-- Get all active products with category
-- SELECT 
--   products.*,
--   categories.name as category_name
-- FROM products
-- INNER JOIN categories ON products.category_id = categories.id
-- WHERE products.is_active = 1
-- ORDER BY products.name;

-- Get featured products
-- SELECT * FROM products 
-- WHERE is_active = 1 AND is_featured = 1
-- ORDER BY created_at DESC
-- LIMIT 10;

-- Get low stock products
-- SELECT * FROM products
-- WHERE is_active = 1 AND stock <= low_stock_threshold
-- ORDER BY stock ASC;

-- Get products by category
-- SELECT * FROM products
-- WHERE category_id = ? AND is_active = 1
-- ORDER BY name;

-- Search products
-- SELECT * FROM products
-- WHERE is_active = 1 
--   AND (name LIKE ? OR description LIKE ? OR sku LIKE ?)
-- ORDER BY name;

-- Get product with effective price (considering sale)
-- SELECT *,
--   CASE 
--     WHEN sale_price IS NOT NULL THEN sale_price
--     ELSE price
--   END as effective_price,
--   CASE
--     WHEN sale_price IS NOT NULL THEN ROUND(((price - sale_price) / price) * 100)
--     ELSE 0
--   END as discount_percent
-- FROM products
-- WHERE id = ?;

-- Update stock after sale
-- UPDATE products 
-- SET stock = stock - ?
-- WHERE id = ? AND stock >= ?;

-- Get products with profit margin
-- SELECT *,
--   (price - cost_price) as profit,
--   ROUND(((price - cost_price) / price) * 100, 2) as profit_margin_percent
-- FROM products
-- WHERE is_active = 1
-- ORDER BY profit_margin_percent DESC;

-- =============================================================================
-- JavaScript Usage Examples (with better-sqlite3)
-- =============================================================================

/*

const Database = require('better-sqlite3');
const db = new Database('database.db');

// ============================================================================
// Get All Products
// ============================================================================

function getAllProducts() {
  return db.prepare(`
    SELECT 
      products.*,
      categories.name as category_name,
      CASE 
        WHEN products.sale_price IS NOT NULL THEN products.sale_price
        ELSE products.price
      END as effective_price
    FROM products
    INNER JOIN categories ON products.category_id = categories.id
    WHERE products.is_active = 1
    ORDER BY products.name
  `).all();
}

// ============================================================================
// Get Product by ID
// ============================================================================

function getProductById(id) {
  return db.prepare(`
    SELECT 
      products.*,
      categories.name as category_name,
      CASE 
        WHEN products.sale_price IS NOT NULL THEN products.sale_price
        ELSE products.price
      END as effective_price,
      CASE
        WHEN products.sale_price IS NOT NULL 
        THEN ROUND(((products.price - products.sale_price) / products.price) * 100)
        ELSE 0
      END as discount_percent
    FROM products
    INNER JOIN categories ON products.category_id = categories.id
    WHERE products.id = ?
  `).get(id);
}

// ============================================================================
// Add Product
// ============================================================================

function addProduct(productData) {
  const stmt = db.prepare(`
    INSERT INTO products (
      name, slug, sku, category_id, short_description, description,
      price, cost_price, sale_price, stock, is_active, is_featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  try {
    const result = stmt.run(
      productData.name,
      productData.slug,
      productData.sku,
      productData.category_id,
      productData.short_description,
      productData.description,
      productData.price,
      productData.cost_price,
      productData.sale_price || null,
      productData.stock || 0,
      productData.is_active || 1,
      productData.is_featured || 0
    );
    
    return result.lastInsertRowid;
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      if (error.message.includes('sku')) {
        throw new Error('SKU already exists');
      } else if (error.message.includes('slug')) {
        throw new Error('Product slug already exists');
      }
    }
    throw error;
  }
}

// ============================================================================
// Update Product
// ============================================================================

function updateProduct(id, productData) {
  const stmt = db.prepare(`
    UPDATE products
    SET name = ?,
        category_id = ?,
        description = ?,
        price = ?,
        stock = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  const result = stmt.run(
    productData.name,
    productData.category_id,
    productData.description,
    productData.price,
    productData.stock,
    productData.is_active,
    id
  );
  
  return result.changes > 0;
}

// ============================================================================
// Update Stock (with history tracking)
// ============================================================================

function updateStock(productId, changeAmount, reason, notes = '') {
  const updateStock = db.transaction(() => {
    // Get current stock
    const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    const oldStock = product.stock;
    const newStock = oldStock + changeAmount;
    
    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }
    
    // Update product stock
    db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(newStock, productId);
    
    // Record history
    db.prepare(`
      INSERT INTO stock_history (product_id, change_amount, old_stock, new_stock, reason, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(productId, changeAmount, oldStock, newStock, reason, notes);
    
    return newStock;
  });
  
  return updateStock();
}

// ============================================================================
// Search Products
// ============================================================================

function searchProducts(searchTerm) {
  return db.prepare(`
    SELECT 
      products.*,
      categories.name as category_name
    FROM products
    INNER JOIN categories ON products.category_id = categories.id
    WHERE products.is_active = 1
      AND (
        products.name LIKE ? 
        OR products.description LIKE ?
        OR products.sku LIKE ?
      )
    ORDER BY products.name
    LIMIT 50
  `).all(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
}

// ============================================================================
// Get Low Stock Products
// ============================================================================

function getLowStockProducts() {
  return db.prepare(`
    SELECT 
      products.*,
      categories.name as category_name
    FROM products
    INNER JOIN categories ON products.category_id = categories.id
    WHERE products.is_active = 1 
      AND products.stock <= products.low_stock_threshold
    ORDER BY products.stock ASC
  `).all();
}

// ============================================================================
// Get Products by Category
// ============================================================================

function getProductsByCategory(categoryId) {
  return db.prepare(`
    SELECT * FROM products
    WHERE category_id = ? AND is_active = 1
    ORDER BY name
  `).all(categoryId);
}

// ============================================================================
// Process Sale (decrease stock)
// ============================================================================

function processSale(productId, quantity) {
  return updateStock(productId, -quantity, 'sale', `Sold ${quantity} units`);
}

// ============================================================================
// Restock Product (increase stock)
// ============================================================================

function restockProduct(productId, quantity) {
  return updateStock(productId, quantity, 'restock', `Added ${quantity} units`);
}

// ============================================================================
// Routes Example
// ============================================================================

// List all products
app.get('/products', (req, res) => {
  const products = getAllProducts();
  res.render('products/index', { products });
});

// View single product
app.get('/products/:id', (req, res) => {
  const product = getProductById(req.params.id);
  
  if (!product) {
    return res.status(404).send('Product not found');
  }
  
  res.render('products/view', { product });
});

// Add product form
app.get('/products/add', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories WHERE is_active = 1').all();
  res.render('products/add', { categories });
});

// Add product (POST)
app.post('/products/add', (req, res) => {
  try {
    const productId = addProduct(req.body);
    res.redirect(`/products/${productId}`);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Edit product form
app.get('/products/:id/edit', (req, res) => {
  const product = getProductById(req.params.id);
  const categories = db.prepare('SELECT * FROM categories WHERE is_active = 1').all();
  
  if (!product) {
    return res.status(404).send('Product not found');
  }
  
  res.render('products/edit', { product, categories });
});

// Update product (POST)
app.post('/products/:id/edit', (req, res) => {
  const success = updateProduct(req.params.id, req.body);
  
  if (!success) {
    return res.status(404).send('Product not found');
  }
  
  res.redirect(`/products/${req.params.id}`);
});

// Process sale
app.post('/products/:id/sell', (req, res) => {
  try {
    const quantity = parseInt(req.body.quantity);
    updateStock(req.params.id, -quantity, 'sale');
    res.redirect(`/products/${req.params.id}`);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Restock product
app.post('/products/:id/restock', (req, res) => {
  try {
    const quantity = parseInt(req.body.quantity);
    updateStock(req.params.id, quantity, 'restock');
    res.redirect(`/products/${req.params.id}`);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Search
app.get('/products/search', (req, res) => {
  const searchTerm = req.query.q || '';
  const products = searchProducts(searchTerm);
  res.render('products/search', { products, searchTerm });
});

// Low stock alert
app.get('/products/low-stock', (req, res) => {
  const products = getLowStockProducts();
  res.render('products/low-stock', { products });
});

*/

-- =============================================================================
-- Triggers (Optional - Auto-update timestamps)
-- =============================================================================

-- Automatically update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_products_timestamp
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
  UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Automatically update category timestamp
CREATE TRIGGER IF NOT EXISTS update_categories_timestamp
AFTER UPDATE ON categories
FOR EACH ROW
BEGIN
  UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =============================================================================
-- Views (Optional - Commonly used queries)
-- =============================================================================

-- Product with effective price
CREATE VIEW IF NOT EXISTS products_with_price AS
SELECT 
  products.*,
  categories.name as category_name,
  CASE 
    WHEN products.sale_price IS NOT NULL THEN products.sale_price
    ELSE products.price
  END as effective_price,
  CASE
    WHEN products.sale_price IS NOT NULL 
    THEN ROUND(((products.price - products.sale_price) / products.price) * 100)
    ELSE 0
  END as discount_percent,
  (products.price - products.cost_price) as profit,
  ROUND(((products.price - products.cost_price) / products.price) * 100, 2) as profit_margin
FROM products
INNER JOIN categories ON products.category_id = categories.id;

-- =============================================================================
-- Notes
-- =============================================================================

-- 1. Add validation on the application layer (price > 0, stock >= 0, etc.)
-- 2. Implement image upload functionality (store in /public/uploads)
-- 3. Consider adding product variants (sizes, colors) with separate table
-- 4. Implement product reviews/ratings if needed
-- 5. Add related products feature (product_relations table)
-- 6. Consider adding weight/dimensions for shipping calculations
-- 7. Backup database regularly (especially before bulk operations)
-- 8. Use transactions for operations that modify multiple tables
-- 9. Add search indexes for better performance on large catalogs
-- 10. Consider implementing caching for frequently accessed products
