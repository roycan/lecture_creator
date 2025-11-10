# 🏪 Sari-Sari Store Inventory Manager

A complete inventory management system designed for Filipino neighborhood stores (sari-sari stores).

## 📋 Project Description

The Sari-Sari Store Inventory Manager helps store owners track products, monitor stock levels, calculate inventory value, and manage their business digitally. It features real-time stock alerts, category analysis, and financial calculations.

## 🎯 Key Features

### 1. **Comprehensive Inventory Dashboard**
- View all products with detailed information
- Real-time stock level monitoring
- Color-coded status indicators
- Category-based organization
- Supplier tracking

### 2. **Stock Alert System**
- **Out of Stock (0 units):** 🚨 Urgent reorder needed
- **Critical (1-5 units):** ⚠️ Immediate reorder
- **Low Stock (6-10 units):** 📉 Plan to reorder
- **Adequate (11-30 units):** ✓ Monitor regularly
- **In Stock (31+ units):** ✓ Well stocked

### 3. **Financial Analytics**
- Total products count
- Total items in stock
- Total inventory value (₱)
- Value per category
- Individual product value (price × stock)

### 4. **Product Management**
- Add new products with validation
- 11 predefined categories
- Multiple unit types (pack, can, bottle, sachet, etc.)
- Optional supplier information
- Automatic ID generation

## 📁 Project Structure

```
mini-project-store/
├── app.js                    # Express server with calculations
├── package.json              # Dependencies
├── data/
│   └── products.json         # Product inventory data
├── views/
│   ├── index.ejs             # Inventory list with stats
│   ├── add.ejs               # Add product form
│   ├── about.ejs             # System information
│   └── partials/
│       ├── navbar.ejs        # Navigation
│       └── footer.ejs        # Footer
└── public/
    └── css/
        └── style.css         # Custom styles with alerts
```

## 🚀 How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

4. **Development mode:**
   ```bash
   npm run dev
   ```

## 💾 Data Structure

### products.json
```json
{
  "id": 1,
  "name": "Lucky Me Pancit Canton",
  "category": "Noodles",
  "price": 15.00,
  "stock": 48,
  "unit": "pack",
  "supplier": "Monde Nissin"
}
```

## 📊 Product Categories

1. **Noodles** - Instant noodles and pasta
2. **Canned Goods** - Tuna, corned beef, sardines
3. **Beverages** - Soft drinks, coffee, juice
4. **Snacks** - Crackers, chips, candies
5. **Condiments** - Soy sauce, vinegar, sauce
6. **Dairy** - Evaporada, milk, cheese
7. **Meat Products** - Hotdog, tocino, bacon
8. **Household** - Detergent, bleach, cleaning supplies
9. **Personal Care** - Soap, toothpaste, shampoo
10. **School Supplies** - Notebooks, pens, paper
11. **Other** - Miscellaneous items

## ✨ Technical Highlights

### Real-Time Calculations
```javascript
// Total inventory value
const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

// Low stock alerts
const lowStock = products.filter(p => p.stock <= 10).length;

// Category breakdown
const categoryProducts = products.filter(p => p.category === 'Noodles');
```

### Visual Stock Indicators
- Red highlighting for out-of-stock items
- Yellow highlighting for low stock warnings
- Color-coded tags for quick status recognition
- Row-level alerts in inventory table

### Responsive Dashboard
- Mobile-friendly stat boxes
- Scrollable table for small screens
- Touch-optimized buttons
- Print-friendly layout

## 🎨 Customization Ideas

1. **Sales Tracking** - Record daily sales transactions
2. **Profit Calculator** - Track cost vs selling price
3. **Expiration Dates** - Monitor perishable items
4. **Customer Credit** - Track "utang" (customer credit)
5. **Barcode Scanner** - Quick product lookup
6. **Reorder Automation** - Auto-generate purchase orders
7. **Multiple Stores** - Manage inventory across locations
8. **Receipt Printing** - Generate sales receipts

## ⚠️ Known Limitations

1. **No sales tracking** - Only inventory management
2. **No profit margins** - Price tracking only
3. **No edit/delete** - Only Read and Add operations
4. **No user authentication** - Open access
5. **No concurrent safety** - File-based storage
6. **No backup system** - Single JSON file

**Solution:** Part 2 will add SQLite database with sales tracking, authentication, and full CRUD!

## 🐛 Troubleshooting

**Problem:** Stock alerts not showing
```javascript
// Check if stock comparison is correct
<%= product.stock <= 10 ? 'is-warning' : 'is-success' %>
```

**Problem:** Total value incorrect
```javascript
// Ensure price is parsed as float
price: parseFloat(req.body.price)
```

**Problem:** Category breakdown not displaying
```javascript
// Verify unique category extraction
const categories = [...new Set(products.map(p => p.category))];
```

## 🔧 Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **EJS** - Template engine
- **Bulma CSS** - UI framework with custom stat boxes
- **JSON** - Data storage

## 📚 Learning Objectives

This project demonstrates:
1. **Business Logic** - Inventory management concepts
2. **Financial Calculations** - Price × Quantity, totals, summaries
3. **Data Aggregation** - Grouping, filtering, reducing
4. **Conditional Styling** - Stock-based visual indicators
5. **Real-World Application** - Philippine sari-sari store model
6. **Alert Systems** - Low stock warnings and notifications

## 💡 For Store Owners

### Inventory Management Tips:
- **Fast-Moving Items:** Candies, cigarettes, load cards, noodles
- **Reorder Points:** Set alerts at 10 units to avoid stockouts
- **Pricing Strategy:** Cost + 20-30% markup for profit
- **Category Focus:** Stock popular categories heavily
- **Supplier Relations:** Maintain good credit terms

### Common Mistakes to Avoid:
- ❌ Overstocking slow-moving items
- ❌ Ignoring expiration dates
- ❌ Not tracking customer credit (utang)
- ❌ Forgetting to count cash daily
- ❌ Poor product organization

## 🎓 For Students

This mini-project is excellent for learning:
- Inventory management systems
- Financial calculations in web apps
- Real-world business applications
- Philippine cultural context
- Data visualization and alerts

Good luck with your sari-sari store! 🏪💪
