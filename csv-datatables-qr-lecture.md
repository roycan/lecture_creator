# Building Web Applications - Part 2C
## Advanced Features & Professional Polish

**Target Audience:** Grade 9 Students  
**Prerequisites:** Part 2B (Authentication & Authorization)  
**Duration:** 4-5 days

---

## 🎯 What You'll Learn

By the end of this lecture, you'll be able to:
- Implement search and filtering with DataTables.js
- Add flash messages for better user feedback
- Export and import data using CSV files
- Generate QR codes for easy sharing
- Integrate external APIs (REST Countries)
- Implement audit logging for accountability
- Create JSON backup and restore functionality

**Final Outcome:** Your projects will have enterprise-level features used in professional applications!

---

## 🚀 Introduction: From Good to Great

Your Part 2B projects work great! They have:
- ✅ Database storage (fast, reliable)
- ✅ CRUD operations (create, read, update, delete)
- ✅ Authentication (secure login)
- ✅ Authorization (role-based access)

**But real businesses need MORE:**

### The Store Manager's Wishlist

**Maria's Sari-Sari Store** (now with auth!) still needs:
- 🔍 "I have 500 products - I need to search quickly!"
- 📊 "Can I export my sales data to Excel?"
- 📤 "How do I import products from my supplier's list?"
- 🔗 "Customers want QR codes to scan product info!"
- 🌍 "I need to store customer countries for delivery!"
- 📝 "Who changed this price? I need an audit trail!"

**Part 2C teaches you all of these!**

---

## 🔍 Section 1: Search, Filter & DataTables.js

### The Problem: Too Much Data

With 500 products in your database:
- Scrolling is tedious
- Finding specific items takes forever
- No way to sort by price or stock
- Can't filter by category

### The Solution: DataTables.js

**DataTables** is a powerful jQuery plugin that adds:
- ✅ Instant search (client-side, super fast!)
- ✅ Column sorting (click headers to sort)
- ✅ Pagination (show 10, 25, 50, or 100 per page)
- ✅ Column filtering
- ✅ Export to CSV/Excel/PDF (bonus!)

**Best part:** Just add 3 lines of JavaScript!

### **Visual Guide: DataTables Decision & Flow**

![DataTables Decision Tree](diagrams/advanced-features/datatables-decision.png)
*Figure 1: Decision tree for when to use DataTables vs basic HTML tables*

![DataTables Flow Diagram](diagrams/advanced-features/datatables-flow.png)
*Figure 2: How DataTables transforms a basic HTML table into an interactive data grid*

### **Visual Guide: DataTables Features Overview**

![DataTables Features](diagrams/supplementary/datatables-features.png)
*Figure 3: Comprehensive overview of all DataTables features - search, sort, pagination, export, and filtering*

---

### Basic DataTables Setup

**Step 1: Add DataTables to your view**

```html
<!DOCTYPE html>
<html>
<head>
  <title>Products</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
  
  <!-- DataTables CSS -->
  <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
</head>
<body>
  <%- include('partials/navbar') %>
  
  <section class="section">
    <div class="container">
      <h1 class="title">Products</h1>
      
      <table id="productsTable" class="table is-fullwidth is-striped is-hoverable">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <% products.forEach(product => { %>
            <tr>
              <td><%= product.name %></td>
              <td><%= product.category_name %></td>
              <td>₱<%= product.price.toFixed(2) %></td>
              <td><%= product.stock %></td>
              <td>
                <% if (user.role === 'admin') { %>
                  <a href="/products/<%= product.id %>/edit" class="button is-small is-info">Edit</a>
                <% } %>
              </td>
            </tr>
          <% }); %>
        </tbody>
      </table>
    </div>
  </section>
  
  <!-- jQuery (required by DataTables) -->
  <script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
  
  <!-- DataTables JS -->
  <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
  
  <!-- Initialize DataTables -->
  <script>
    $(document).ready(function() {
      $('#productsTable').DataTable({
        pageLength: 25,
        order: [[0, 'asc']], // Sort by name (column 0) ascending
        language: {
          search: "Search products:",
          lengthMenu: "Show _MENU_ products per page",
          info: "Showing _START_ to _END_ of _TOTAL_ products"
        }
      });
    });
  </script>
</body>
</html>
```

**That's it!** Your table now has:
- Search box (top right)
- Pagination controls (bottom)
- Sortable columns (click any header)
- "Show X entries" dropdown

---

### Advanced DataTables Options

**Custom column sorting:**

```javascript
$('#productsTable').DataTable({
  pageLength: 25,
  order: [[2, 'desc']], // Sort by price (column 2) descending
  columnDefs: [
    { orderable: false, targets: 4 } // Disable sorting on "Actions" column
  ],
  language: {
    search: "Search:",
    paginate: {
      first: "Primera",
      last: "Última",
      next: "Siguiente",
      previous: "Anterior"
    }
  }
});
```

**Export buttons (CSV, Excel, PDF):**

```html
<!-- Additional CSS/JS for buttons -->
<link rel="stylesheet" href="https://cdn.datatables.net/buttons/2.4.1/css/buttons.dataTables.min.css">
<script src="https://cdn.datatables.net/buttons/2.4.1/js/dataTables.buttons.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="https://cdn.datatables.net/buttons/2.4.1/js/buttons.html5.min.js"></script>

<script>
  $('#productsTable').DataTable({
    dom: 'Bfrtip', // B = buttons, f = filter, r = processing, t = table, i = info, p = pagination
    buttons: [
      'copy', 'csv', 'excel', 'pdf'
    ],
    pageLength: 25
  });
</script>
```

---

### Server-Side Search (For HUGE Datasets)

If you have 10,000+ records, use server-side search:

```javascript
// Route: Handle search
app.get('/products/search', requireLogin, (req, res) => {
  const searchTerm = req.query.q || '';
  
  const products = db.prepare(`
    SELECT products.*, categories.name as category_name
    FROM products
    LEFT JOIN categories ON products.category_id = categories.id
    WHERE products.name LIKE ? OR categories.name LIKE ?
    ORDER BY products.name
    LIMIT 100
  `).all(`%${searchTerm}%`, `%${searchTerm}%`);
  
  res.json(products);
});
```

```html
<!-- Client-side fetch -->
<input type="text" id="searchInput" placeholder="Search products...">
<div id="results"></div>

<script>
  const searchInput = document.getElementById('searchInput');
  const resultsDiv = document.getElementById('results');
  
  searchInput.addEventListener('input', async (e) => {
    const query = e.target.value;
    
    if (query.length < 2) {
      resultsDiv.innerHTML = '';
      return;
    }
    
    const response = await fetch(`/products/search?q=${encodeURIComponent(query)}`);
    const products = await response.json();
    
    resultsDiv.innerHTML = products.map(p => `
      <div class="box">
        <strong>${p.name}</strong> - ₱${p.price} - Stock: ${p.stock}
      </div>
    `).join('');
  });
</script>
```

---

## 💬 Section 2: Flash Messages

### The Problem: No User Feedback

**After adding a product:**
```javascript
app.post('/products', requireAdmin, (req, res) => {
  db.prepare('INSERT INTO products ...').run(...);
  res.redirect('/products'); // User sees list, but did it work?
});
```

**User thinks:** "Did it save? Did it fail? Should I click again?"

---

### The Solution: Flash Messages

**Flash messages** = One-time notifications that survive redirects

**Features:**
- ✅ Show success/error/info messages
- ✅ Persist across redirects
- ✅ Auto-dismiss or require close
- ✅ Professional look (Bulma notifications)

![Flash Message Lifecycle Flow](diagrams/advanced-features/flash-lifecycle.png)

![Flash Message Lifecycle Detailed](diagrams/advanced-features/flash-message-lifecycle.png)

---

### Setup Flash Messages

**Step 1: Install connect-flash**

```bash
npm install connect-flash
```

**Step 2: Configure in app.js**

```javascript
const flash = require('connect-flash');

// After session middleware
app.use(flash());

// Make flash available in all views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.info_msg = req.flash('info');
  next();
});
```

**Step 3: Create flash partial (views/partials/flash.ejs)**

```html
<% if (typeof success_msg !== 'undefined' && success_msg.length > 0) { %>
  <% success_msg.forEach(msg => { %>
    <div class="notification is-success is-light">
      <button class="delete"></button>
      <%= msg %>
    </div>
  <% }); %>
<% } %>

<% if (typeof error_msg !== 'undefined' && error_msg.length > 0) { %>
  <% error_msg.forEach(msg => { %>
    <div class="notification is-danger is-light">
      <button class="delete"></button>
      <%= msg %>
    </div>
  <% }); %>
<% } %>

<% if (typeof info_msg !== 'undefined' && info_msg.length > 0) { %>
  <% info_msg.forEach(msg => { %>
    <div class="notification is-info is-light">
      <button class="delete"></button>
      <%= msg %>
    </div>
  <% }); %>
<% } %>

<script>
  // Auto-close notifications
  document.addEventListener('DOMContentLoaded', () => {
    (document.querySelectorAll('.notification .delete') || []).forEach(($delete) => {
      const $notification = $delete.parentNode;
      $delete.addEventListener('click', () => {
        $notification.parentNode.removeChild($notification);
      });
    });
  });
</script>
```

**Step 4: Include in views**

```html
<body>
  <%- include('partials/navbar') %>
  
  <section class="section">
    <div class="container">
      <%- include('partials/flash') %>
      
      <!-- Your content here -->
    </div>
  </section>
</body>
```

---

### Using Flash Messages

![Flash Lifecycle Variants](diagrams/advanced-features/flash-lifecycle-2.png)

![Flash Lifecycle Alternative](diagrams/advanced-features/flash-lifecycle-3.png)

```javascript
// Success message
app.post('/products', requireAdmin, (req, res) => {
  try {
    db.prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)')
      .run(req.body.name, req.body.price, req.body.stock);
    
    req.flash('success', 'Product added successfully!');
    res.redirect('/products');
  } catch (error) {
    req.flash('error', 'Failed to add product: ' + error.message);
    res.redirect('/products/new');
  }
});

// Error message
app.post('/products/:id/delete', requireAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    req.flash('success', 'Product deleted successfully!');
  } catch (error) {
    req.flash('error', 'Cannot delete product: it may have sales records');
  }
  res.redirect('/products');
});

// Info message
app.post('/login', (req, res) => {
  // ... login logic ...
  req.flash('info', 'Welcome back, ' + user.name + '!');
  res.redirect('/');
});
```

---

## 📄 Section 3: CSV Export & Import

### Why CSV?

**CSV (Comma-Separated Values)** = Universal data format

**Use cases:**
- ✅ Export data to Excel/Google Sheets
- ✅ Bulk import from suppliers
- ✅ Share data with other systems
- ✅ Backup readable by humans
- ✅ Migrate between applications

---

### CSV Export (Simple)

**Route:**

```javascript
app.get('/products/export/csv', requireAdmin, (req, res) => {
  const products = db.prepare(`
    SELECT products.name, categories.name as category, products.price, products.stock
    FROM products
    LEFT JOIN categories ON products.category_id = categories.id
    ORDER BY products.name
  `).all();
  
  // Build CSV
  let csv = 'Name,Category,Price,Stock\n';
  products.forEach(p => {
    csv += `"${p.name}","${p.category}",${p.price},${p.stock}\n`;
  });
  
  // Send as download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
  res.send(csv);
});
```

**Add to view:**

```html
<a href="/products/export/csv" class="button is-success">
  📥 Export to CSV
</a>
```

**Result:** User downloads `products.csv`:
```csv
Name,Category,Price,Stock
"Skyflakes",Biscuits,35.50,100
"Lucky Me Pancit Canton",Noodles,12.00,200
"Del Monte Tomato Sauce",Canned Goods,25.00,50
```

---

### CSV Export (Using Library)

For complex CSVs, use `csv-writer`:

```bash
npm install csv-writer
```

```javascript
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

app.get('/products/export/csv', requireAdmin, async (req, res) => {
  const products = db.prepare(`
    SELECT products.*, categories.name as category
    FROM products
    LEFT JOIN categories ON products.category_id = categories.id
  `).all();
  
  const csvWriter = createCsvWriter({
    path: 'temp/products.csv',
    header: [
      {id: 'name', title: 'Product Name'},
      {id: 'category', title: 'Category'},
      {id: 'price', title: 'Price'},
      {id: 'stock', title: 'Stock Level'}
    ]
  });
  
  await csvWriter.writeRecords(products);
  res.download('temp/products.csv');
});
```

---

### CSV Import

![CSV Import Validation Flow](diagrams/advanced-features/csv-import-validation.png)

**Upload form:**

```html
<form method="POST" action="/products/import/csv" enctype="multipart/form-data">
  <div class="field">
    <label class="label">Upload CSV File</label>
    <div class="control">
      <div class="file has-name">
        <label class="file-label">
          <input class="file-input" type="file" name="csvFile" accept=".csv" required>
          <span class="file-cta">
            <span class="file-label">Choose a file…</span>
          </span>
          <span class="file-name" id="fileName">No file selected</span>
        </label>
      </div>
    </div>
    <p class="help">CSV format: Name,Category,Price,Stock</p>
  </div>
  
  <div class="field">
    <div class="control">
      <button type="submit" class="button is-primary">📤 Import Products</button>
    </div>
  </div>
</form>

<script>
  const fileInput = document.querySelector('.file-input');
  const fileName = document.getElementById('fileName');
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      fileName.textContent = e.target.files[0].name;
    }
  });
</script>
```

**Route (using multer):**

```bash
npm install multer csv-parse
```

```javascript
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const fs = require('fs');

const upload = multer({ dest: 'temp/' });

app.post('/products/import/csv', requireAdmin, upload.single('csvFile'), (req, res) => {
  try {
    // Read uploaded file
    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    // Insert into database
    const stmt = db.prepare(`
      INSERT INTO products (name, category_id, price, stock)
      VALUES (?, (SELECT id FROM categories WHERE name = ?), ?, ?)
    `);
    
    let imported = 0;
    let errors = 0;
    
    records.forEach(record => {
      try {
        stmt.run(record.Name, record.Category, parseFloat(record.Price), parseInt(record.Stock));
        imported++;
      } catch (error) {
        console.error('Failed to import:', record, error);
        errors++;
      }
    });
    
    // Clean up temp file
    fs.unlinkSync(req.file.path);
    
    req.flash('success', `Imported ${imported} products successfully! ${errors} errors.`);
    res.redirect('/products');
    
  } catch (error) {
    req.flash('error', 'Failed to import CSV: ' + error.message);
    res.redirect('/products');
  }
});
```

---

## 📱 Section 4: QR Codes

### Why QR Codes?

**QR codes** = Quick Response codes (2D barcodes)

**Use cases:**
- ✅ Resident ID cards (scan to view info)
- ✅ Product labels (scan to see details/price)
- ✅ Student IDs (scan for attendance)
- ✅ Share links easily (no typing!)
- ✅ Professional look

**Best part:** No server-side library needed! Use a free API.

---

### QR Code Basics

![QR Code Generation Process](diagrams/advanced-features/qr-code-generation.png)

![QR Code Workflow](diagrams/advanced-features/qr-workflow.png)



**Using QR Server API:**

```html
<!-- Simple QR code (inline image) -->
<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Hello+World" 
     alt="QR Code">

<!-- QR code with data -->
<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=<%= encodeURIComponent('RESIDENT-' + resident.id) %>" 
     alt="QR Code for <%= resident.name %>">
```

**Result:** A 200x200px QR code that encodes "RESIDENT-123"

---

### Barangay Directory: Resident ID Cards

**View (views/residents/id-card.ejs):**

```html
<div class="box" style="width: 400px; border: 2px solid #333;">
  <div class="has-text-centered">
    <h2 class="title is-4">Barangay <%= resident.barangay_name %></h2>
    <h3 class="subtitle is-6">Resident ID Card</h3>
  </div>
  
  <div class="columns">
    <div class="column">
      <p><strong>Name:</strong> <%= resident.name %></p>
      <p><strong>Age:</strong> <%= resident.age %></p>
      <p><strong>Address:</strong> <%= resident.address %></p>
      <p><strong>ID:</strong> <%= resident.id %></p>
    </div>
    <div class="column is-narrow">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=<%= encodeURIComponent('RESIDENT-' + resident.id) %>" 
           alt="QR Code">
    </div>
  </div>
  
  <div class="has-text-centered mt-4">
    <small>Scan QR code to verify identity</small>
  </div>
</div>

<div class="buttons mt-4">
  <button class="button is-primary" onclick="window.print()">🖨️ Print ID Card</button>
  <a href="/residents" class="button">Back to List</a>
</div>
```

**Route:**

```javascript
app.get('/residents/:id/id-card', requireLogin, (req, res) => {
  const resident = db.prepare(`
    SELECT residents.*, barangays.name as barangay_name
    FROM residents
    JOIN barangays ON residents.barangay_id = barangays.id
    WHERE residents.id = ?
  `).get(req.params.id);
  
  if (!resident) {
    return res.status(404).send('Resident not found');
  }
  
  res.render('residents/id-card', { resident, title: 'Resident ID Card' });
});
```

---

### Store Inventory: Product QR Codes

![QR Code Generation Detailed](diagrams/advanced-features/qr-code-generation-2.png)

**Generate QR code for each product:**

```html
<!-- In product detail view -->
<div class="box">
  <div class="columns">
    <div class="column">
      <h2 class="title"><%= product.name %></h2>
      <p><strong>Price:</strong> ₱<%= product.price.toFixed(2) %></p>
      <p><strong>Stock:</strong> <%= product.stock %> units</p>
      <p><strong>Category:</strong> <%= product.category_name %></p>
    </div>
    <div class="column is-narrow">
      <!-- QR code encodes product URL -->
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=<%= encodeURIComponent('https://mystore.com/products/' + product.id) %>" 
           alt="Product QR Code">
      <p class="has-text-centered mt-2">
        <small>Scan to view product</small>
      </p>
    </div>
  </div>
</div>
```

---

### QR Code Scanning (Bonus)

![QR Code Workflow Alternative](diagrams/advanced-features/qr-workflow-2.png)

To scan QR codes on your phone:
1. Open camera app
2. Point at QR code
3. Tap notification to open link

**For web-based scanning, use html5-qrcode library:**

```html
<div id="reader" style="width: 300px;"></div>

<script src="https://unpkg.com/html5-qrcode"></script>
<script>
  function onScanSuccess(decodedText, decodedResult) {
    console.log(`Scanned: ${decodedText}`);
    alert(`Scanned: ${decodedText}`);
    // Redirect to resident page
    if (decodedText.startsWith('RESIDENT-')) {
      const id = decodedText.replace('RESIDENT-', '');
      window.location.href = `/residents/${id}`;
    }
  }

  const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 10, qrbox: 250 }
  );
  html5QrcodeScanner.render(onScanSuccess);
</script>
```

---

## 🌍 Section 5: REST Countries API Integration

### Why External APIs?

**Your app can use data from anywhere!**

**REST Countries API** provides:
- ✅ All world countries (250+)
- ✅ Flags (emoji & SVG)
- ✅ Population, currencies, languages
- ✅ Completely FREE!
- ✅ No API key needed

**Use case:** Store customer countries for delivery/shipping

![REST API Integration Patterns](diagrams/advanced-features/rest-api-integration.png)

---

### Basic Country Dropdown

**Client-side fetch (students already learned this!):**

```html
<div class="field">
  <label class="label">Country</label>
  <div class="control">
    <div class="select is-fullwidth">
      <select id="country" name="country">
        <option>Loading countries...</option>
      </select>
    </div>
  </div>
</div>

<script>
  // Fetch countries from API
  fetch('https://restcountries.com/v3.1/all')
    .then(response => response.json())
    .then(countries => {
      const select = document.getElementById('country');
      
      // Sort alphabetically
      countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
      
      // Build options
      select.innerHTML = '<option value="">Select a country</option>' + 
        countries.map(c => 
          `<option value="${c.name.common}">${c.flag} ${c.name.common}</option>`
        ).join('');
    })
    .catch(error => {
      console.error('Error loading countries:', error);
      document.getElementById('country').innerHTML = '<option>Error loading countries</option>';
    });
</script>
```

**Result:** Beautiful dropdown with flags! 🇵🇭 Philippines, 🇺🇸 United States, etc.

---

### Advanced: Country Information Display

**Show country details:**

```html
<div class="field">
  <label class="label">Country</label>
  <div class="control">
    <div class="select is-fullwidth">
      <select id="country" onchange="showCountryInfo()">
        <option value="">Select a country</option>
      </select>
    </div>
  </div>
</div>

<div id="countryInfo" class="box mt-4" style="display: none;">
  <!-- Country details will appear here -->
</div>

<script>
  let countriesData = [];
  
  // Load countries
  fetch('https://restcountries.com/v3.1/all')
    .then(response => response.json())
    .then(countries => {
      countriesData = countries;
      const select = document.getElementById('country');
      
      countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
      
      select.innerHTML = '<option value="">Select a country</option>' + 
        countries.map(c => 
          `<option value="${c.cca2}">${c.flag} ${c.name.common}</option>`
        ).join('');
    });
  
  // Show country info
  function showCountryInfo() {
    const select = document.getElementById('country');
    const code = select.value;
    
    if (!code) {
      document.getElementById('countryInfo').style.display = 'none';
      return;
    }
    
    const country = countriesData.find(c => c.cca2 === code);
    
    if (country) {
      document.getElementById('countryInfo').style.display = 'block';
      document.getElementById('countryInfo').innerHTML = `
        <h3 class="title is-4">${country.flag} ${country.name.common}</h3>
        <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
        <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
        <p><strong>Region:</strong> ${country.region}</p>
        <p><strong>Currency:</strong> ${Object.values(country.currencies || {})[0]?.name || 'N/A'}</p>
      `;
    }
  }
</script>
```

---

### Store Example: Customer Country Tracking

**Update customers table:**

```sql
ALTER TABLE customers ADD COLUMN country TEXT;
ALTER TABLE customers ADD COLUMN country_code TEXT;
```

**Add form (views/customers/new.ejs):**

```html
<form method="POST" action="/customers">
  <div class="field">
    <label class="label">Name</label>
    <div class="control">
      <input class="input" type="text" name="name" required>
    </div>
  </div>
  
  <div class="field">
    <label class="label">Country</label>
    <div class="control">
      <div class="select is-fullwidth">
        <select id="country" name="country" required>
          <option value="">Loading countries...</option>
        </select>
      </div>
    </div>
  </div>
  
  <input type="hidden" id="countryCode" name="country_code">
  
  <div class="field">
    <div class="control">
      <button type="submit" class="button is-primary">Add Customer</button>
    </div>
  </div>
</form>

<script>
  fetch('https://restcountries.com/v3.1/all')
    .then(response => response.json())
    .then(countries => {
      countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
      
      const select = document.getElementById('country');
      select.innerHTML = '<option value="">Select a country</option>' + 
        countries.map(c => 
          `<option value="${c.name.common}" data-code="${c.cca2}">${c.flag} ${c.name.common}</option>`
        ).join('');
      
      select.addEventListener('change', (e) => {
        const option = e.target.options[e.target.selectedIndex];
        document.getElementById('countryCode').value = option.dataset.code;
      });
    });
</script>
```

---

## 📝 Section 6: Audit Logging

### Why Audit Logs?

**Audit logs** = Track who did what, when

**Real-world scenario:**
- Manager: "Who changed this product price from ₱50 to ₱500?"
- Audit log: "User 'cashier_maria' updated Product #123 on Nov 10, 2025 at 2:30 PM"

**Required for:**
- ✅ Compliance (government regulations)
- ✅ Accountability (employee actions)
- ✅ Debugging (trace issues)
- ✅ Security (detect unauthorized changes)

![Audit Log Pattern](diagrams/advanced-features/audit-log-pattern.png)

![Audit Log Flow](diagrams/advanced-features/audit-log-flow.png)

---

### Audit Log Database Schema

```sql
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'VIEW'
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  old_data TEXT, -- JSON string of old values (for UPDATE/DELETE)
  new_data TEXT, -- JSON string of new values (for CREATE/UPDATE)
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Add to `database/setup-database.js`:**

```javascript
db.exec(`
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    old_data TEXT,
    new_data TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);
console.log('✅ Audit log table created');
```

---

### Logging Helper Functions

**Create `utils/audit.js`:**

```javascript
function logAudit(db, userId, action, tableName, recordId, oldData = null, newData = null, ipAddress = null) {
  const stmt = db.prepare(`
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_data, new_data, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    userId,
    action,
    tableName,
    recordId,
    oldData ? JSON.stringify(oldData) : null,
    newData ? JSON.stringify(newData) : null,
    ipAddress
  );
}

module.exports = { logAudit };
```

---

### Using Audit Logs in Routes

**CREATE (Insert):**

```javascript
const { logAudit } = require('./utils/audit');

app.post('/products', requireAdmin, (req, res) => {
  const { name, price, stock, category_id } = req.body;
  
  const result = db.prepare(`
    INSERT INTO products (name, price, stock, category_id)
    VALUES (?, ?, ?, ?)
  `).run(name, price, stock, category_id);
  
  // Log the creation
  logAudit(
    db,
    req.session.userId,
    'CREATE',
    'products',
    result.lastInsertRowid,
    null,
    { name, price, stock, category_id },
    req.ip
  );
  
  req.flash('success', 'Product added successfully!');
  res.redirect('/products');
});
```

**UPDATE:**

```javascript
app.post('/products/:id', requireAdmin, (req, res) => {
  const { name, price, stock, category_id } = req.body;
  
  // Get old data BEFORE updating
  const oldProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  
  // Update
  db.prepare(`
    UPDATE products 
    SET name = ?, price = ?, stock = ?, category_id = ?
    WHERE id = ?
  `).run(name, price, stock, category_id, req.params.id);
  
  // Log the update
  logAudit(
    db,
    req.session.userId,
    'UPDATE',
    'products',
    req.params.id,
    oldProduct,
    { name, price, stock, category_id },
    req.ip
  );
  
  req.flash('success', 'Product updated successfully!');
  res.redirect('/products');
});
```

**DELETE:**

```javascript
app.post('/products/:id/delete', requireAdmin, (req, res) => {
  // Get data BEFORE deleting
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  
  if (!product) {
    req.flash('error', 'Product not found');
    return res.redirect('/products');
  }
  
  // Delete
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  
  // Log the deletion
  logAudit(
    db,
    req.session.userId,
    'DELETE',
    'products',
    req.params.id,
    product,
    null,
    req.ip
  );
  
  req.flash('success', 'Product deleted successfully!');
  res.redirect('/products');
});
```

---

### Viewing Audit Logs

![Audit Log Alternative View](diagrams/advanced-features/audit-log-pattern-2.png)

**Route:**

```javascript
app.get('/admin/audit-log', requireAdmin, (req, res) => {
  const logs = db.prepare(`
    SELECT audit_log.*, users.name as user_name
    FROM audit_log
    JOIN users ON audit_log.user_id = users.id
    ORDER BY audit_log.created_at DESC
    LIMIT 500
  `).all();
  
  res.render('admin/audit-log', { logs, title: 'Audit Log' });
});
```

**View (views/admin/audit-log.ejs):**

```html
<section class="section">
  <div class="container">
    <h1 class="title">Audit Log</h1>
    
    <table id="auditTable" class="table is-fullwidth is-striped is-hoverable">
      <thead>
        <tr>
          <th>Date/Time</th>
          <th>User</th>
          <th>Action</th>
          <th>Table</th>
          <th>Record ID</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        <% logs.forEach(log => { %>
          <tr>
            <td><%= new Date(log.created_at).toLocaleString() %></td>
            <td><%= log.user_name %></td>
            <td>
              <span class="tag <%= log.action === 'DELETE' ? 'is-danger' : log.action === 'UPDATE' ? 'is-warning' : 'is-success' %>">
                <%= log.action %>
              </span>
            </td>
            <td><%= log.table_name %></td>
            <td>#<%= log.record_id %></td>
            <td>
              <% if (log.action === 'UPDATE') { %>
                <details>
                  <summary>View changes</summary>
                  <p><strong>Before:</strong> <%= log.old_data %></p>
                  <p><strong>After:</strong> <%= log.new_data %></p>
                </details>
              <% } else if (log.action === 'DELETE') { %>
                <details>
                  <summary>View deleted data</summary>
                  <p><%= log.old_data %></p>
                </details>
              <% } else { %>
                <small>Created: <%= log.new_data %></small>
              <% } %>
            </td>
          </tr>
        <% }); %>
      </tbody>
    </table>
  </div>
</section>

<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
<script>
  $(document).ready(function() {
    $('#auditTable').DataTable({
      pageLength: 50,
      order: [[0, 'desc']] // Most recent first
    });
  });
</script>
```

---

**✅ Part 2C Section 1-6 Complete!**

*Continuing in next file...*
