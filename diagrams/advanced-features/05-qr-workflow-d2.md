# QR Code Workflow - Generate & Scan (D2)

## Purpose
Modern, user-friendly visualization showing the complete QR code workflow: generation on server, scanning by customer, and validation flow.

## Rendering
**VS Code:** Install "d2" extension  
**Online:** Copy code to [D2 Playground](https://play.d2lang.com)  
**CLI:** `d2 05-qr-workflow-d2.md qr-workflow.svg`

## Diagram

```d2
direction: right

title: {
  label: QR Code Workflow - Generate & Scan
  shape: text
  style: {
    font-size: 24
    bold: true
  }
}

# GENERATION FLOW (Left side)
generation_title: GENERATION FLOW {
  shape: text
  style: {
    font-size: 18
    bold: true
    fill: "#4CAF50"
  }
}

manager: Manager {
  shape: person
  style.fill: "#E1BEE7"
  style.stroke: "#7B1FA2"
  style.stroke-width: 2
}

create_product: |md
  ## Create Product
  
  POST /products
  
  ```javascript
  app.post('/products', (req, res) => {
    const result = db.prepare(`
      INSERT INTO products 
      (name, price, qr_code)
      VALUES (?, ?, ?)
    `).run(
      req.body.name,
      req.body.price,
      generateUniqueCode()  // e.g., "PROD-2024-1234"
    );
    
    res.redirect('/products');
  });
  ```
| {
  shape: rectangle
  style.fill: "#87CEEB"
  style.stroke: "#0288D1"
  style.stroke-width: 2
}

generate_qr: |md
  ## Generate QR Image
  
  ```javascript
  const QRCode = require('qrcode');
  
  app.get('/products/:id/qr', (req, res) => {
    const product = db.prepare(
      'SELECT qr_code FROM products WHERE id = ?'
    ).get(req.params.id);
    
    // Generate QR as data URL
    QRCode.toDataURL(product.qr_code, (err, url) => {
      res.render('qr-display', { 
        qrDataUrl: url,
        qrCode: product.qr_code
      });
    });
  });
  ```
| {
  shape: rectangle
  style.fill: "#4ECDC4"
  style.stroke: "#00897B"
  style.stroke-width: 2
}

print_qr: |md
  ## Print/Display QR
  
  ```html
  <div class="qr-container">
    <img src="<%= qrDataUrl %>" alt="QR Code">
    <p>Code: <%= qrCode %></p>
    <button onclick="window.print()">
      Print Label
    </button>
  </div>
  ```
  
  📄 Printed label attached to product
| {
  shape: rectangle
  style.fill: "#90EE90"
  style.stroke: "#4CAF50"
  style.stroke-width: 2
}

# SCANNING FLOW (Right side)
scanning_title: SCANNING FLOW {
  shape: text
  style: {
    font-size: 18
    bold: true
    fill: "#0288D1"
  }
}

customer: Customer {
  shape: person
  style.fill: "#FFE082"
  style.stroke: "#F57C00"
  style.stroke-width: 2
}

scan_qr: |md
  ## Scan QR Code
  
  ```html
  <!-- html5-qrcode library -->
  <div id="reader"></div>
  
  <script>
  const scanner = new Html5Qrcode("reader");
  
  scanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      // Got QR code: "PROD-2024-1234"
      lookupProduct(decodedText);
    }
  );
  </script>
  ```
| {
  shape: rectangle
  style.fill: "#87CEEB"
  style.stroke: "#0288D1"
  style.stroke-width: 2
}

lookup_product: |md
  ## Lookup Product
  
  GET /api/products/lookup?code=PROD-2024-1234
  
  ```javascript
  app.get('/api/products/lookup', (req, res) => {
    const product = db.prepare(`
      SELECT id, name, price, stock
      FROM products
      WHERE qr_code = ?
    `).get(req.query.code);
    
    if (!product) {
      return res.json({ error: 'Product not found' });
    }
    
    res.json({ product });
  });
  ```
| {
  shape: rectangle
  style.fill: "#4ECDC4"
  style.stroke: "#00897B"
  style.stroke-width: 2
}

decision: Product Found? {
  shape: diamond
  style.fill: "#E1BEE7"
  style.stroke: "#7B1FA2"
  style.stroke-width: 3
}

show_details: |md
  ## Show Product Details
  
  ```javascript
  // Client-side
  function displayProduct(product) {
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-price').textContent = `₱${product.price}`;
    document.getElementById('product-stock').textContent = product.stock;
    
    document.getElementById('add-to-cart-btn').disabled = false;
  }
  ```
  
  ✅ Customer sees product info
| {
  shape: rectangle
  style.fill: "#90EE90"
  style.stroke: "#4CAF50"
  style.stroke-width: 2
}

add_to_cart: |md
  ## Add to Cart
  
  ```javascript
  app.post('/cart/add', (req, res) => {
    const productId = req.body.productId;
    const quantity = req.body.quantity;
    
    // Add to session cart
    if (!req.session.cart) {
      req.session.cart = [];
    }
    
    req.session.cart.push({
      productId,
      quantity,
      addedAt: new Date()
    });
    
    req.flash('success', 'Added to cart!');
    res.redirect('/cart');
  });
  ```
| {
  shape: rectangle
  style.fill: "#90EE90"
  style.stroke: "#4CAF50"
  style.stroke-width: 2
}

show_error: |md
  ## Show Error
  
  ```javascript
  // Client-side
  function showError(message) {
    document.getElementById('error-message').textContent = 
      'Product not found. Please scan again.';
    document.getElementById('error-message').style.display = 'block';
  }
  ```
  
  ❌ Invalid QR code
| {
  shape: rectangle
  style.fill: "#FFB6C1"
  style.stroke: "#D32F2F"
  style.stroke-width: 2
}

# CONNECTIONS - Generation flow
manager -> create_product: "1. Create product\nwith unique code" {
  style.stroke: "#4CAF50"
  style.stroke-width: 3
}

create_product -> generate_qr: "2. Generate\nQR image" {
  style.stroke: "#4CAF50"
  style.stroke-width: 3
}

generate_qr -> print_qr: "3. Display/Print" {
  style.stroke: "#4CAF50"
  style.stroke-width: 3
}

# CONNECTIONS - Scanning flow
customer -> scan_qr: "1. Scan with\nsmartphone" {
  style.stroke: "#0288D1"
  style.stroke-width: 3
}

scan_qr -> lookup_product: "2. Send code\nto server" {
  style.stroke: "#0288D1"
  style.stroke-width: 3
}

lookup_product -> decision: "3. Check\ndatabase" {
  style.stroke: "#0288D1"
  style.stroke-width: 3
}

decision -> show_details: "Found" {
  style.stroke: "#4CAF50"
  style.stroke-width: 3
}

decision -> show_error: "Not Found" {
  style.stroke: "#D32F2F"
  style.stroke-width: 3
  style.stroke-dash: 3
}

show_details -> add_to_cart: "4. Customer\nadds to cart" {
  style.stroke: "#4CAF50"
  style.stroke-width: 2
}

# Two-way connection
print_qr -> scan_qr: "QR code on\nproduct label" {
  style.stroke: "#7B1FA2"
  style.stroke-width: 4
  style.stroke-dash: 5
}

# Info boxes
benefits: |md
  ## 💡 Benefits
  
  ✅ Fast product lookup (no typing!)
  ✅ Reduces input errors
  ✅ Works offline (if cached)
  ✅ Mobile-friendly
  ✅ Scalable to thousands of products
| {
  shape: rectangle
  style.fill: "#E8F5E9"
  style.stroke: "#4CAF50"
}

security: |md
  ## 🔒 Security Tips
  
  ⚠️ Use unpredictable codes (UUID)
  ⚠️ Don't encode sensitive data in QR
  ⚠️ Rate-limit lookup API
  ⚠️ Log all scans (audit trail)
  ⚠️ Validate product exists before showing
| {
  shape: rectangle
  style.fill: "#FFF3E0"
  style.stroke: "#F57C00"
}

print_qr -> benefits
scan_qr -> security
```

## Key Insights

1. **Two-way workflow:**
   - **Generation:** Manager creates → Generate QR → Print label
   - **Scanning:** Customer scans → Lookup → Show details

2. **Visual flow:**
   - Left side = Generation (green theme)
   - Right side = Scanning (blue theme)
   - Thick dashed line connects the two flows (QR on product)

3. **Decision point:**
   - Diamond shape for "Product Found?" decision
   - Green path (success) → Show details → Add to cart
   - Red path (error) → Show error message

4. **Markdown boxes:**
   - Rich content with code examples embedded
   - Benefits and security tips in separate info boxes

## Code Mapping

### Complete QR Code Implementation

```javascript
// Install dependencies
// npm install qrcode uuid

const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// Generate unique product code
function generateProductCode() {
  return `PROD-${new Date().getFullYear()}-${uuidv4().slice(0, 8).toUpperCase()}`;
  // Example: "PROD-2024-A7F3B9C2"
}

// Create product with QR code
app.post('/products', requireAuth, requireRole('manager'), (req, res) => {
  const qrCode = generateProductCode();
  
  const result = db.prepare(`
    INSERT INTO products (name, price, stock, qr_code, created_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    req.body.name,
    req.body.price,
    req.body.stock,
    qrCode,
    res.locals.user.id
  );
  
  req.flash('success', `Product created with QR code: ${qrCode}`);
  res.redirect(`/products/${result.lastInsertRowid}/qr`);
});

// Display QR code
app.get('/products/:id/qr', requireAuth, (req, res) => {
  const product = db.prepare(`
    SELECT id, name, price, qr_code
    FROM products
    WHERE id = ?
  `).get(req.params.id);
  
  if (!product) {
    req.flash('error', 'Product not found');
    return res.redirect('/products');
  }
  
  // Generate QR as data URL (base64 image)
  QRCode.toDataURL(product.qr_code, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  }, (err, url) => {
    if (err) {
      req.flash('error', 'Failed to generate QR code');
      return res.redirect('/products');
    }
    
    res.render('products/qr-display', {
      product,
      qrDataUrl: url
    });
  });
});

// Download QR as PNG
app.get('/products/:id/qr/download', requireAuth, (req, res) => {
  const product = db.prepare('SELECT qr_code FROM products WHERE id = ?').get(req.params.id);
  
  if (!product) {
    return res.status(404).send('Product not found');
  }
  
  // Generate QR as PNG buffer
  QRCode.toBuffer(product.qr_code, {
    type: 'png',
    width: 500
  }, (err, buffer) => {
    if (err) {
      return res.status(500).send('Failed to generate QR code');
    }
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="qr-${product.qr_code}.png"`);
    res.send(buffer);
  });
});

// API: Lookup product by QR code
app.get('/api/products/lookup', (req, res) => {
  const qrCode = req.query.code;
  
  if (!qrCode) {
    return res.status(400).json({ error: 'QR code is required' });
  }
  
  const product = db.prepare(`
    SELECT id, name, price, stock, qr_code
    FROM products
    WHERE qr_code = ?
  `).get(qrCode);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  // Log scan (audit trail)
  db.prepare(`
    INSERT INTO qr_scans (product_id, qr_code, scanned_at, ip_address)
    VALUES (?, ?, datetime('now'), ?)
  `).run(product.id, qrCode, req.ip);
  
  res.json({ product });
});

// Scan page (customer-facing)
app.get('/scan', (req, res) => {
  res.render('scan-qr');
});
```

### QR Display Template

```ejs
<!-- views/products/qr-display.ejs -->
<!DOCTYPE html>
<html>
<head>
  <title>QR Code - <%= product.name %></title>
  <style>
    .qr-container {
      text-align: center;
      padding: 40px;
    }
    .qr-container img {
      border: 5px solid #333;
      padding: 10px;
      background: white;
    }
    .product-info {
      margin-top: 20px;
      font-size: 18px;
    }
    @media print {
      button { display: none; }
    }
  </style>
</head>
<body>
  <div class="qr-container">
    <h1><%= product.name %></h1>
    
    <img src="<%= qrDataUrl %>" alt="QR Code for <%= product.name %>">
    
    <div class="product-info">
      <p><strong>QR Code:</strong> <%= product.qr_code %></p>
      <p><strong>Price:</strong> ₱<%= product.price.toFixed(2) %></p>
    </div>
    
    <div class="actions">
      <button onclick="window.print()">🖨️ Print Label</button>
      <a href="/products/<%= product.id %>/qr/download" download>
        <button>⬇️ Download PNG</button>
      </a>
      <a href="/products/<%= product.id %>">
        <button>← Back to Product</button>
      </a>
    </div>
  </div>
</body>
</html>
```

### QR Scanner Template

```ejs
<!-- views/scan-qr.ejs -->
<!DOCTYPE html>
<html>
<head>
  <title>Scan QR Code</title>
  <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
  <style>
    #reader { width: 100%; max-width: 600px; margin: 20px auto; }
    #result { margin-top: 20px; padding: 20px; }
    .product-card { border: 2px solid #4CAF50; padding: 20px; border-radius: 8px; }
    .error { color: #D32F2F; background: #FFEBEE; padding: 15px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Scan Product QR Code</h1>
  
  <div id="reader"></div>
  
  <div id="result"></div>
  
  <script>
    const resultDiv = document.getElementById('result');
    
    // Initialize scanner
    const scanner = new Html5Qrcode("reader");
    
    scanner.start(
      { facingMode: "environment" },  // Use back camera
      {
        fps: 10,                       // Scans per second
        qrbox: { width: 250, height: 250 }
      },
      (decodedText, decodedResult) => {
        // Successfully scanned!
        console.log(`QR Code detected: ${decodedText}`);
        
        // Stop scanning
        scanner.stop();
        
        // Lookup product
        lookupProduct(decodedText);
      },
      (errorMessage) => {
        // Scanning (ignore errors)
      }
    ).catch((err) => {
      resultDiv.innerHTML = `
        <div class="error">
          Failed to start camera: ${err}
          <br>Please allow camera access and try again.
        </div>
      `;
    });
    
    function lookupProduct(qrCode) {
      resultDiv.innerHTML = '<p>Looking up product...</p>';
      
      fetch(`/api/products/lookup?code=${encodeURIComponent(qrCode)}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            resultDiv.innerHTML = `
              <div class="error">
                ${data.error}
                <br>
                <button onclick="scanner.start(...)">Scan Again</button>
              </div>
            `;
          } else {
            displayProduct(data.product);
          }
        })
        .catch(err => {
          resultDiv.innerHTML = `
            <div class="error">
              Failed to lookup product. Please try again.
            </div>
          `;
        });
    }
    
    function displayProduct(product) {
      resultDiv.innerHTML = `
        <div class="product-card">
          <h2>${product.name}</h2>
          <p><strong>Price:</strong> ₱${product.price.toFixed(2)}</p>
          <p><strong>Stock:</strong> ${product.stock} units</p>
          <p><strong>QR Code:</strong> ${product.qr_code}</p>
          
          <form action="/cart/add" method="POST">
            <input type="hidden" name="productId" value="${product.id}">
            <label>
              Quantity:
              <input type="number" name="quantity" value="1" min="1" max="${product.stock}">
            </label>
            <button type="submit">🛒 Add to Cart</button>
          </form>
          
          <button onclick="location.reload()">Scan Another</button>
        </div>
      `;
    }
  </script>
</body>
</html>
```

## Common Mistakes

1. **Using predictable QR codes:**
   ```javascript
   // ❌ Sequential IDs (easy to guess)
   const qrCode = `PROD-${productId}`;  // PROD-1, PROD-2, PROD-3...
   // Anyone can scan PROD-1000 without having the label!
   
   // ✅ Use UUIDs or random strings
   const qrCode = `PROD-${uuidv4()}`;  // PROD-a7f3b9c2-...
   ```

2. **Not validating product exists:**
   ```javascript
   // ❌ No validation
   app.get('/api/products/lookup', (req, res) => {
     const product = db.prepare('SELECT * FROM products WHERE qr_code = ?').get(req.query.code);
     res.json({ product });  // product might be undefined!
   });
   
   // ✅ Check and return proper error
   app.get('/api/products/lookup', (req, res) => {
     const product = db.prepare('SELECT * FROM products WHERE qr_code = ?').get(req.query.code);
     
     if (!product) {
       return res.status(404).json({ error: 'Product not found' });
     }
     
     res.json({ product });
   });
   ```

3. **Not logging scans (security/analytics):**
   ```javascript
   // ❌ No audit trail
   app.get('/api/products/lookup', (req, res) => {
     const product = db.prepare('SELECT * FROM products WHERE qr_code = ?').get(req.query.code);
     res.json({ product });
     // Can't track when/where products are scanned
   });
   
   // ✅ Log all scans
   app.get('/api/products/lookup', (req, res) => {
     const product = db.prepare('SELECT * FROM products WHERE qr_code = ?').get(req.query.code);
     
     if (product) {
       db.prepare(`
         INSERT INTO qr_scans (product_id, qr_code, scanned_at, ip_address)
         VALUES (?, ?, datetime('now'), ?)
       `).run(product.id, req.query.code, req.ip);
     }
     
     res.json({ product });
   });
   ```

4. **Encoding sensitive data in QR:**
   ```javascript
   // ❌ Encoding price in QR (can be tampered with!)
   const qrData = JSON.stringify({ id: product.id, price: product.price });
   QRCode.toDataURL(qrData, ...);
   // Customer could create fake QR with lower price!
   
   // ✅ Only encode unique ID, lookup details on server
   const qrData = product.qr_code;  // Just "PROD-a7f3b9c2"
   QRCode.toDataURL(qrData, ...);
   // Server always returns current price from database
   ```

5. **Not handling camera permissions:**
   ```javascript
   // ❌ No error handling
   scanner.start(...);
   // Fails silently if camera permission denied
   
   // ✅ Handle errors gracefully
   scanner.start(...).catch((err) => {
     alert('Please allow camera access to scan QR codes');
     console.error('Scanner error:', err);
   });
   ```

## Related Concepts
- Web App Basics Part 2C: Section 9 (QR Codes)
- REST API design (lookup endpoint)
- Mobile-first design
- Security: unpredictable identifiers
- Audit logging (scan tracking)
