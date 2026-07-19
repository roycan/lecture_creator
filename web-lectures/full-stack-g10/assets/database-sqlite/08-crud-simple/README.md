# App 08: CRUD Simple

**Concept:** Complete CRUD (Create, Read, Update, Delete) operations with SQLite

## What You'll Learn

- Creating records (INSERT)
- Reading records (SELECT)
- Updating records (UPDATE)
- Deleting records (DELETE)
- Using prepared statements to prevent SQL injection
- Form handling for CRUD operations
- Timestamps (created_at, updated_at)

## Setup

```bash
npm install
npm start
```

Visit: http://localhost:3000

## CRUD Operations

### 1. CREATE (Insert)
```javascript
app.post('/add', (req, res) => {
  const { name, price, stock, category } = req.body;
  const stmt = db.prepare('INSERT INTO products (name, price, stock, category) VALUES (?, ?, ?, ?)');
  stmt.run(name, parseFloat(price), parseInt(stock), category);
  res.redirect('/');
});
```

### 2. READ (Select)
```javascript
app.get('/', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY name').all();
  res.render('index', { products });
});
```

### 3. UPDATE (Modify)
```javascript
app.post('/edit/:id', (req, res) => {
  const { name, price, stock, category } = req.body;
  const stmt = db.prepare('UPDATE products SET name = ?, price = ?, stock = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(name, parseFloat(price), parseInt(stock), category, req.params.id);
  res.redirect('/');
});
```

### 4. DELETE (Remove)
```javascript
app.post('/delete/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  stmt.run(req.params.id);
  res.redirect('/');
});
```

## SQL Injection Prevention

### ❌ NEVER do this (vulnerable):
```javascript
const query = `INSERT INTO products VALUES ('${req.body.name}')`;
db.exec(query); // SQL INJECTION RISK!
```

### ✅ ALWAYS use prepared statements:
```javascript
const stmt = db.prepare('INSERT INTO products (name) VALUES (?)');
stmt.run(req.body.name); // SAFE!
```

**Why?** Prepared statements treat user input as DATA, not CODE.

## File Structure

```
08-crud-simple/
├── app.js              # Full CRUD operations
├── package.json        # Dependencies
├── products.db         # Database (auto-created)
├── views/
│   ├── index.ejs       # List products (READ)
│   ├── add.ejs         # Add form (CREATE)
│   └── edit.ejs        # Edit form (UPDATE)
└── README.md           # This file
```

## Features

- ✅ Add new products with validation
- ✅ View all products in a table
- ✅ Edit existing products
- ✅ Delete products with confirmation
- ✅ Stats: total products, inventory value, low stock count
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ SQL injection prevention

## Try It

1. Add a new product (e.g., "Pan de Sal 10pcs", ₱35, 40 units, "Bakery")
2. Edit the price or stock
3. Delete a product (confirmation required)
4. Check `products.db` file - data persists!

## SQL Commands Used

```sql
-- CREATE
INSERT INTO products (name, price, stock, category) VALUES (?, ?, ?, ?);

-- READ
SELECT * FROM products ORDER BY name;
SELECT * FROM products WHERE id = ?;

-- UPDATE
UPDATE products SET name = ?, price = ?, stock = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;

-- DELETE
DELETE FROM products WHERE id = ?;
```

## Common Patterns

### Get by ID
```javascript
const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
```

### Get all
```javascript
const products = db.prepare('SELECT * FROM products').all();
```

### Run (insert/update/delete)
```javascript
const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
console.log('Rows affected:', result.changes);
```

## Next Steps

In App 09, we'll add:
- ✅ Form validation
- ✅ Flash messages (success/error feedback)
- ✅ Better error handling

## Troubleshooting

**Data not saving?**
- Check browser console for errors
- Check server terminal for errors
- Verify form `method="POST"` and `action="/add"` are correct

**Delete not working?**
- Must be POST request (not GET) for safety
- Check form has `method="POST"`
- Confirm button type is `submit`

**Edited data not updating?**
- Check form action: `/edit/<%= product.id %>`
- Verify all input fields have `name` attributes
- Check server logs for SQL errors
