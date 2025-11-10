# Store Inventory v2.0

A modern web application for managing store inventory with SQLite database.

## ✨ Features

- ✅ **Full CRUD Operations:** Create, Read, Update, Delete products
- ✅ **SQLite Database:** Persistent data storage with relationships
- ✅ **Inventory Dashboard:** Total products, total value, low stock alerts
- ✅ **Stock Management:** Adjust stock quantities with +/- values
- ✅ **Search Functionality:** Find products by name or SKU
- ✅ **Filter by Category:** View products from specific categories
- ✅ **Low Stock Alerts:** Automatic alerts when stock falls below threshold
- ✅ **Foreign Key Relationships:** Products linked to categories
- ✅ **Input Validation:** Price/stock constraints, unique SKUs
- ✅ **Responsive Design:** Mobile-friendly interface
- ✅ **Beautiful UI:** Modern gradient design with smooth animations

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

```bash
npm run setup
```

This will:
- Create the SQLite database
- Create tables (categories, products)
- Insert sample data (4 categories, 11 products)

### 3. Run Application

```bash
npm start
```

Visit: **http://localhost:3000**

## 📁 Project Structure

```
store-inventory-v2/
├── app.js                  # Main application
├── package.json            # Dependencies
├── .gitignore             # Git ignore rules
├── README.md              # This file
├── database/
│   └── setup-database.js  # Database setup script
├── data/
│   └── inventory.db       # SQLite database (created on setup)
└── views/
    ├── index.ejs          # Main product list
    ├── add.ejs            # Add product form
    ├── edit.ejs           # Edit product form
    └── view.ejs           # View product details
```

## 🗄️ Database Schema

### `categories` Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL, UNIQUE |
| description | TEXT | - |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### `products` Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL |
| sku | TEXT | NOT NULL, UNIQUE |
| category_id | INTEGER | NOT NULL, FOREIGN KEY |
| price | REAL | NOT NULL, CHECK (price >= 0) |
| stock | INTEGER | NOT NULL, DEFAULT 0, CHECK (stock >= 0) |
| low_stock_threshold | INTEGER | DEFAULT 10 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

**Relationship:** Each product belongs to one category (one-to-many)

## 🎯 Available Routes

### Main Routes

- `GET /` - List all products (inventory dashboard)
- `GET /add` - Show add product form
- `POST /add` - Create new product
- `GET /product/:id` - View product details
- `GET /edit/:id` - Show edit product form
- `POST /edit/:id` - Update product
- `POST /delete/:id` - Delete product
- `POST /adjust-stock/:id` - Adjust stock quantity

### Filter Routes

- `GET /search?q=query` - Search products by name/SKU
- `GET /category/:id` - Filter products by category
- `GET /low-stock` - View products with low stock

## 💡 Usage Examples

### Add New Product

1. Click "➕ Add New Product"
2. Fill in the form:
   - Product Name: `Wireless Mouse`
   - SKU: `ELEC-001`
   - Category: Select from dropdown
   - Price: `599.00`
   - Stock: `50`
   - Low Stock Threshold: `10`
3. Click "✓ Add Product"

### Adjust Stock

1. Click "👁️ View" on a product
2. Use the stock adjustment form:
   - Enter `+50` to add 50 units
   - Enter `-10` to remove 10 units
3. Click "Adjust Stock"

### Search Products

Use the search box to find products by name or SKU:
```
Search: "Mouse" → Finds all products with "Mouse" in name
Search: "ELEC-001" → Finds product with that SKU
```

### Filter by Category

Use the category dropdown to view products from a specific category.

### View Low Stock Items

Click "⚠️ Low Stock" to see products that need restocking.

### Edit Product

1. Click "✏️ Edit" next to a product
2. Update the information
3. Click "✓ Save Changes"

### Delete Product

1. Click "🗑️ Delete" next to a product
2. Confirm the deletion
3. Product will be permanently removed

## 🔧 Configuration

### Change Port

Edit `app.js`:
```javascript
const PORT = 3000; // Change to your desired port
```

### Database Location

Edit `database/setup-database.js`:
```javascript
const dbPath = path.join(__dirname, '..', 'data', 'inventory.db');
```

## 🚢 Deployment to Railway

### 1. Add Volume

In Railway dashboard:
- Mount path: `/data`
- Name: `inventory-database`

### 2. Update Database Path

```javascript
const dataDir = process.env.RAILWAY_ENVIRONMENT 
  ? '/data' 
  : path.join(__dirname, 'data');
```

### 3. Update Start Command

In `package.json`:
```json
{
  "scripts": {
    "start": "node database/setup-database.js && node app.js"
  }
}
```

## 📊 Sample Data

The setup script creates:

**Categories:**
- Electronics
- Clothing
- Food & Beverages
- Home & Garden

**Products:**
- 11 products across 4 categories
- Realistic SKUs (ELEC-001, CLO-001, etc.)
- Various price points (₱15 - ₱1,299)
- Different stock levels

## 🛡️ Validation Rules

- **Product Name:** Required, any text
- **SKU:** Required, must be unique, auto-uppercase
- **Category:** Required, must exist in database
- **Price:** Required, >= 0
- **Stock:** Required, >= 0
- **Low Stock Threshold:** Optional, default 10

## 🐛 Troubleshooting

### Database Not Found

Run setup first:
```bash
npm run setup
```

### SKU Already Exists

Each product must have a unique SKU. Try a different SKU or edit the existing product.

### Foreign Key Constraint Failed

This means you're trying to add a product with an invalid category_id. Make sure the category exists in the database first.

### Cannot Delete Category

Categories cannot be deleted if they have products (RESTRICT constraint). Delete or move products first.

### Port Already in Use

Change the port in `app.js` or kill the process using port 3000:
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 🔄 Upgrade from v1.0 (JSON)

### Changes from v1.0:

| Feature | v1.0 (JSON) | v2.0 (SQLite) |
|---------|-------------|---------------|
| Storage | JSON file | SQLite database |
| Relationships | Stored as strings | Foreign keys |
| SKUs | Optional | Required & unique |
| Search | Array filter | SQL LIKE |
| Stock Management | Manual edit | +/- adjustments |
| Low Stock Alerts | Manual check | Automatic alerts |
| Performance | Slow on large data | Fast queries |
| Data Integrity | No constraints | Database constraints |
| Total Value Calc | Manual | Automatic (price × stock) |

### Migration Steps:

1. Export data from v1.0 (if needed)
2. Install v2.0 dependencies
3. Run database setup
4. Import old data (manual or script)

## 📚 Learning Resources

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [better-sqlite3 Docs](https://github.com/WiseLibs/better-sqlite3)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [EJS Template Engine](https://ejs.co/)

## 🎓 Learning Objectives

This project demonstrates:
- ✅ Foreign key relationships (products → categories)
- ✅ CHECK constraints (price >= 0, stock >= 0)
- ✅ UNIQUE constraints (SKU uniqueness)
- ✅ Aggregate calculations (SUM, COUNT)
- ✅ JOIN queries (products + categories)
- ✅ WHERE clause filtering
- ✅ Transaction safety
- ✅ Input validation
- ✅ Error handling
- ✅ RESTful routing

## 📝 License

MIT License - Feel free to use this for learning and personal projects!

## 🤝 Contributing

This is a learning project. Feel free to fork and experiment!

---

**Version:** 2.0.0 (SQLite)  
**Previous Version:** 1.0.0 (JSON file storage)  
**Upgrade:** Migrated from JSON to SQLite for better performance, relationships, and data integrity
