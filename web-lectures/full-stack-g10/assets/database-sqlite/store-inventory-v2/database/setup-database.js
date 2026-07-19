const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database path
const dbPath = path.join(dataDir, 'inventory.db');

console.log('Setting up Store Inventory database...');
console.log('Database path:', dbPath);

// Open connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('\nCreating tables...');

// Create tables
db.exec(`
  -- Categories table
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Products table
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    category_id INTEGER NOT NULL,
    price REAL NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    low_stock_threshold INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
      ON DELETE RESTRICT
      ON UPDATE CASCADE
  );
`);

console.log('✓ Tables created successfully');

// Create indexes
console.log('\nCreating indexes...');

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
  CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
  CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
  CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
`);

console.log('✓ Indexes created successfully');

// Insert sample data
console.log('\nInserting sample data...');

// Sample categories
const categoryStmt = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
const categories = [
  ['Electronics', 'Electronic devices and gadgets'],
  ['Clothing', 'Apparel and fashion items'],
  ['Food & Beverages', 'Food products and drinks'],
  ['Home & Garden', 'Home improvement and gardening supplies']
];

const insertCategories = db.transaction(() => {
  categories.forEach(category => categoryStmt.run(...category));
});

insertCategories();

console.log(`✓ Inserted ${categories.length} categories`);

// Sample products
const productStmt = db.prepare(`
  INSERT INTO products (name, sku, category_id, price, stock, low_stock_threshold)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const products = [
  ['Wireless Mouse', 'ELEC-001', 1, 599.00, 45, 10],
  ['USB Cable (1m)', 'ELEC-002', 1, 149.00, 120, 20],
  ['Bluetooth Speaker', 'ELEC-003', 1, 1299.00, 8, 5],
  ['Cotton T-Shirt (M)', 'CLO-001', 2, 299.00, 60, 15],
  ['Denim Jeans (32)', 'CLO-002', 2, 899.00, 25, 10],
  ['Sports Cap', 'CLO-003', 2, 199.00, 40, 10],
  ['Instant Coffee (100g)', 'FOOD-001', 3, 89.00, 200, 50],
  ['Bottled Water (500ml)', 'FOOD-002', 3, 15.00, 500, 100],
  ['Chocolate Bar', 'FOOD-003', 3, 45.00, 150, 30],
  ['LED Light Bulb', 'HOME-001', 4, 120.00, 75, 20],
  ['Plant Pot (Small)', 'HOME-002', 4, 85.00, 30, 10]
];

const insertProducts = db.transaction(() => {
  products.forEach(product => productStmt.run(...product));
});

insertProducts();

console.log(`✓ Inserted ${products.length} products`);

// Display summary
console.log('\n=== Database Summary ===');
const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
const totalValue = db.prepare('SELECT SUM(price * stock) as total FROM products').get();

console.log(`Categories: ${categoryCount.count}`);
console.log(`Products: ${productCount.count}`);
console.log(`Total Inventory Value: ₱${totalValue.total.toFixed(2)}`);

// Test query
console.log('\n=== Sample Query ===');
const sampleQuery = db.prepare(`
  SELECT 
    products.name,
    products.sku,
    products.price,
    products.stock,
    categories.name as category_name
  FROM products
  INNER JOIN categories ON products.category_id = categories.id
  LIMIT 3
`).all();

console.log('First 3 products:');
sampleQuery.forEach(product => {
  console.log(`- ${product.name} (${product.sku}): ₱${product.price} x ${product.stock} = ₱${(product.price * product.stock).toFixed(2)}`);
});

// Low stock products
console.log('\n=== Low Stock Alert ===');
const lowStock = db.prepare(`
  SELECT 
    products.name,
    products.stock,
    products.low_stock_threshold
  FROM products
  WHERE products.stock <= products.low_stock_threshold
`).all();

if (lowStock.length > 0) {
  console.log(`⚠️  ${lowStock.length} products need restocking:`);
  lowStock.forEach(product => {
    console.log(`- ${product.name}: ${product.stock} units (threshold: ${product.low_stock_threshold})`);
  });
} else {
  console.log('✓ All products have sufficient stock');
}

// Products per category
console.log('\n=== Products per Category ===');
const perCategory = db.prepare(`
  SELECT 
    categories.name,
    COUNT(products.id) as product_count,
    SUM(products.stock) as total_units
  FROM categories
  LEFT JOIN products ON categories.id = products.category_id
  GROUP BY categories.id
`).all();

perCategory.forEach(category => {
  console.log(`${category.name}: ${category.product_count} products, ${category.total_units} units`);
});

db.close();
console.log('\n✓ Database setup complete!');
console.log('Run "npm start" to start the application.');
