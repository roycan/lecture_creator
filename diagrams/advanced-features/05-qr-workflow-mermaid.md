# QR Code Workflow - Generate & Scan (Mermaid)

## Purpose
Sequence diagram showing the temporal flow of QR code generation, scanning, and product lookup with all actors involved.

## Rendering
**VS Code:** Built-in Mermaid support (preview Markdown files)  
**GitHub:** Renders automatically in `.md` files  
**Online:** [mermaid.live](https://mermaid.live)

## Diagram

```mermaid
sequenceDiagram
    participant Manager
    participant Server as Express Server
    participant DB as SQLite Database
    participant QRLib as QRCode Library
    participant Customer
    participant Scanner as QR Scanner (Browser)
    
    Note over Manager,QRLib: GENERATION FLOW
    
    Manager->>Server: POST /products<br/>{name: "Skyflakes", price: 35}
    activate Server
    
    Server->>Server: Generate unique code<br/>generateProductCode()
    Note right of Server: "PROD-2024-A7F3B9C2"
    
    Server->>DB: INSERT INTO products<br/>(name, price, qr_code)<br/>VALUES (...)
    activate DB
    DB-->>Server: lastInsertRowid: 42
    deactivate DB
    
    Server-->>Manager: Redirect to /products/42/qr
    deactivate Server
    
    Manager->>Server: GET /products/42/qr
    activate Server
    
    Server->>DB: SELECT qr_code FROM products<br/>WHERE id = 42
    activate DB
    DB-->>Server: "PROD-2024-A7F3B9C2"
    deactivate DB
    
    Server->>QRLib: QRCode.toDataURL(<br/>"PROD-2024-A7F3B9C2"<br/>)
    activate QRLib
    QRLib-->>Server: data:image/png;base64,...
    deactivate QRLib
    
    Server-->>Manager: Render QR display page<br/>(with QR image)
    deactivate Server
    
    Manager->>Manager: Print QR label<br/>Attach to product
    
    Note over Manager,Scanner: --- Time Passes ---<br/>Product is on shelf with QR label
    
    Note over Customer,Scanner: SCANNING FLOW
    
    Customer->>Scanner: Open /scan page
    activate Scanner
    
    Scanner->>Scanner: Request camera access
    Note right of Scanner: navigator.mediaDevices<br/>.getUserMedia()
    
    Scanner-->>Customer: Show camera view
    
    Customer->>Scanner: Point camera at<br/>QR code on product
    
    Scanner->>Scanner: Decode QR image
    Note right of Scanner: html5-qrcode library<br/>scans and decodes
    
    Scanner->>Scanner: Extract text:<br/>"PROD-2024-A7F3B9C2"
    
    Scanner->>Server: GET /api/products/lookup<br/>?code=PROD-2024-A7F3B9C2
    deactivate Scanner
    activate Server
    
    Server->>DB: SELECT * FROM products<br/>WHERE qr_code = ?
    activate DB
    DB-->>Server: {id:42, name:"Skyflakes",<br/>price:35, stock:100}
    deactivate DB
    
    Server->>DB: INSERT INTO qr_scans<br/>(product_id, qr_code,<br/>scanned_at, ip_address)
    activate DB
    Note right of Server: Log scan for audit/analytics
    DB-->>Server: OK
    deactivate DB
    
    Server-->>Scanner: JSON: {product: {...}}
    deactivate Server
    activate Scanner
    
    Scanner->>Scanner: displayProduct(product)
    
    Scanner-->>Customer: Show product details:<br/>Name, Price, Stock<br/>[Add to Cart] button
    deactivate Scanner
    
    Customer->>Server: POST /cart/add<br/>{productId: 42, quantity: 1}
    activate Server
    
    Server->>Server: Add to session cart<br/>req.session.cart.push(...)
    
    Server-->>Customer: Flash: "Added to cart!"<br/>Redirect to /cart
    deactivate Server
    
    rect rgb(200, 230, 201)
        Note over Manager,Scanner: ✅ SUCCESS PATH<br/>Product found and added to cart
    end
    
    Note over Customer,Scanner: ALTERNATIVE: Product Not Found
    
    Customer->>Scanner: Scan invalid/deleted<br/>QR code
    activate Scanner
    
    Scanner->>Server: GET /api/products/lookup<br/>?code=INVALID-CODE
    activate Server
    
    Server->>DB: SELECT * FROM products<br/>WHERE qr_code = ?
    activate DB
    DB-->>Server: undefined (not found)
    deactivate DB
    
    Server-->>Scanner: 404 JSON:<br/>{error: "Product not found"}
    deactivate Server
    
    Scanner->>Scanner: showError(error)
    
    Scanner-->>Customer: ❌ Error message:<br/>"Product not found.<br/>Please scan again."
    deactivate Scanner
    
    rect rgb(255, 235, 238)
        Note over Customer,Scanner: ❌ ERROR PATH<br/>Invalid QR code
    end
```

## Key Insights

1. **Two distinct phases:**
   - **Generation:** Manager creates product → Server generates unique code → QR library creates image → Manager prints
   - **Scanning:** Customer scans → Scanner decodes → Server looks up → Display product

2. **Temporal sequence:**
   - Vertical axis shows time flowing downward
   - Activation bars show when each component is actively processing
   - Time gap between generation and scanning (product sits on shelf)

3. **Key actors:**
   - **Manager:** Creates products and prints QR labels
   - **Customer:** Scans QR codes to find products
   - **Server:** Orchestrates everything (generate, lookup, log)
   - **Database:** Stores products and QR codes
   - **QRLib:** Generates QR images
   - **Scanner:** Decodes QR codes in browser

4. **Two paths shown:**
   - Green box = Success path (product found, added to cart)
   - Red box = Error path (product not found, show error)

## Code Mapping

### Database Schema

```javascript
// database.js
const db = require('better-sqlite3')('store.db');

db.exec(`
  -- Products with QR codes
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL,
    qr_code TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );
  
  -- QR scan tracking (audit/analytics)
  CREATE TABLE IF NOT EXISTS qr_scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    qr_code TEXT NOT NULL,
    scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
  
  -- Indexes for fast lookup
  CREATE INDEX IF NOT EXISTS idx_products_qr_code ON products(qr_code);
  CREATE INDEX IF NOT EXISTS idx_qr_scans_product_id ON qr_scans(product_id);
`);

module.exports = db;
```

### QR Code Generation

```javascript
// utils/qr-generator.js
const { v4: uuidv4 } = require('uuid');

function generateProductCode() {
  const year = new Date().getFullYear();
  const uniqueId = uuidv4().slice(0, 8).toUpperCase();
  return `PROD-${year}-${uniqueId}`;
  // Example: "PROD-2024-A7F3B9C2"
}

module.exports = { generateProductCode };
```

```javascript
// routes/products.js
const QRCode = require('qrcode');
const { generateProductCode } = require('../utils/qr-generator');

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
  
  req.flash('success', `Product created! QR Code: ${qrCode}`);
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
  
  // Generate QR as data URL
  QRCode.toDataURL(product.qr_code, {
    width: 300,
    margin: 2,
    errorCorrectionLevel: 'M'
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
```

### QR Code Lookup API

```javascript
// routes/api.js
app.get('/api/products/lookup', (req, res) => {
  const qrCode = req.query.code;
  
  // Validate input
  if (!qrCode) {
    return res.status(400).json({ 
      error: 'QR code is required' 
    });
  }
  
  // Lookup product
  const product = db.prepare(`
    SELECT id, name, price, stock, qr_code
    FROM products
    WHERE qr_code = ?
  `).get(qrCode);
  
  // Product not found
  if (!product) {
    return res.status(404).json({ 
      error: 'Product not found' 
    });
  }
  
  // Log scan (audit trail + analytics)
  db.prepare(`
    INSERT INTO qr_scans (
      product_id, 
      qr_code, 
      scanned_at, 
      ip_address,
      user_agent
    ) VALUES (?, ?, datetime('now'), ?, ?)
  `).run(
    product.id, 
    qrCode, 
    req.ip,
    req.get('User-Agent')
  );
  
  // Return product details
  res.json({ product });
});
```

### QR Scanner Page

```ejs
<!-- views/scan-qr.ejs -->
<!DOCTYPE html>
<html>
<head>
  <title>Scan QR Code - Sari-Sari Store</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 20px auto;
      padding: 0 15px;
    }
    #reader {
      border: 2px solid #333;
      border-radius: 8px;
      overflow: hidden;
    }
    #result {
      margin-top: 20px;
    }
    .product-card {
      background: #E8F5E9;
      border: 2px solid #4CAF50;
      border-radius: 8px;
      padding: 20px;
      margin-top: 15px;
    }
    .error {
      background: #FFEBEE;
      border: 2px solid #D32F2F;
      color: #D32F2F;
      padding: 15px;
      border-radius: 4px;
    }
    button {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin: 5px;
    }
    button:hover {
      background: #45a049;
    }
  </style>
</head>
<body>
  <h1>📱 Scan Product QR Code</h1>
  <p>Point your camera at the QR code on the product.</p>
  
  <div id="reader"></div>
  
  <div id="result"></div>
  
  <script>
    const resultDiv = document.getElementById('result');
    let isScanning = false;
    
    // Initialize QR scanner
    const scanner = new Html5Qrcode("reader");
    
    function startScanning() {
      if (isScanning) return;
      
      isScanning = true;
      resultDiv.innerHTML = '';
      
      scanner.start(
        { facingMode: "environment" },  // Use back camera
        {
          fps: 10,                       // 10 scans per second
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanError
      ).catch((err) => {
        isScanning = false;
        resultDiv.innerHTML = `
          <div class="error">
            <strong>Camera Error:</strong><br>
            ${err}<br><br>
            Please allow camera access and try again.
          </div>
        `;
      });
    }
    
    function onScanSuccess(decodedText, decodedResult) {
      console.log(`QR Code detected: ${decodedText}`);
      
      // Stop scanning
      scanner.stop().then(() => {
        isScanning = false;
      });
      
      // Show loading
      resultDiv.innerHTML = '<p>🔍 Looking up product...</p>';
      
      // Lookup product
      fetch(`/api/products/lookup?code=${encodeURIComponent(decodedText)}`)
        .then(response => {
          if (!response.ok) {
            return response.json().then(data => {
              throw new Error(data.error || 'Product not found');
            });
          }
          return response.json();
        })
        .then(data => {
          displayProduct(data.product);
        })
        .catch(error => {
          showError(error.message);
        });
    }
    
    function onScanError(errorMessage) {
      // Ignore scanning errors (happens every frame without QR)
    }
    
    function displayProduct(product) {
      resultDiv.innerHTML = `
        <div class="product-card">
          <h2>${product.name}</h2>
          <p><strong>Price:</strong> ₱${parseFloat(product.price).toFixed(2)}</p>
          <p><strong>Stock:</strong> ${product.stock} units available</p>
          <p><small>QR Code: ${product.qr_code}</small></p>
          
          <form action="/cart/add" method="POST" style="margin-top: 15px;">
            <input type="hidden" name="productId" value="${product.id}">
            <label>
              Quantity:
              <input type="number" name="quantity" value="1" 
                     min="1" max="${product.stock}" style="width: 60px; padding: 5px;">
            </label>
            <br><br>
            <button type="submit">🛒 Add to Cart</button>
          </form>
          
          <button onclick="location.reload()">🔄 Scan Another Product</button>
        </div>
      `;
    }
    
    function showError(message) {
      resultDiv.innerHTML = `
        <div class="error">
          <strong>❌ Error:</strong><br>
          ${message}<br><br>
          <button onclick="location.reload()">🔄 Scan Again</button>
        </div>
      `;
    }
    
    // Auto-start scanning on page load
    startScanning();
  </script>
</body>
</html>
```

### Add to Cart Handler

```javascript
// routes/cart.js
app.post('/cart/add', requireAuth, (req, res) => {
  const productId = parseInt(req.body.productId);
  const quantity = parseInt(req.body.quantity) || 1;
  
  // Validate product exists and has stock
  const product = db.prepare(`
    SELECT id, name, price, stock
    FROM products
    WHERE id = ?
  `).get(productId);
  
  if (!product) {
    req.flash('error', 'Product not found');
    return res.redirect('/scan');
  }
  
  if (product.stock < quantity) {
    req.flash('error', `Only ${product.stock} units available`);
    return res.redirect('/scan');
  }
  
  // Initialize cart if needed
  if (!req.session.cart) {
    req.session.cart = [];
  }
  
  // Check if product already in cart
  const existingItem = req.session.cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    req.session.cart.push({
      productId,
      name: product.name,
      price: product.price,
      quantity,
      addedAt: new Date().toISOString()
    });
  }
  
  req.flash('success', `${product.name} added to cart!`);
  res.redirect('/cart');
});
```

## Common Mistakes

1. **Not handling camera permissions:**
   ```javascript
   // ❌ No error handling
   scanner.start({ facingMode: "environment" }, ...);
   // Fails silently if permission denied
   
   // ✅ Catch errors and inform user
   scanner.start(...).catch((err) => {
     alert('Please allow camera access to scan QR codes');
     console.error('Scanner error:', err);
   });
   ```

2. **Using sequential/predictable QR codes:**
   ```javascript
   // ❌ Predictable codes
   const qrCode = `PROD-${productId}`;  // PROD-1, PROD-2, PROD-3
   // Anyone can guess codes and scan products that aren't on shelf
   
   // ✅ Use UUIDs
   const { v4: uuidv4 } = require('uuid');
   const qrCode = `PROD-${uuidv4()}`;  // PROD-a7f3b9c2-...-...
   ```

3. **Not logging scans:**
   ```javascript
   // ❌ No audit trail
   app.get('/api/products/lookup', (req, res) => {
     const product = db.prepare('SELECT...').get(qrCode);
     res.json({ product });
     // Can't track which products are popular, when they're scanned, etc.
   });
   
   // ✅ Log all scans
   app.get('/api/products/lookup', (req, res) => {
     const product = db.prepare('SELECT...').get(qrCode);
     
     if (product) {
       db.prepare(`
         INSERT INTO qr_scans (product_id, qr_code, scanned_at, ip_address)
         VALUES (?, ?, datetime('now'), ?)
       `).run(product.id, qrCode, req.ip);
     }
     
     res.json({ product });
   });
   ```

4. **Encoding sensitive data in QR:**
   ```javascript
   // ❌ Encoding price in QR (can be tampered!)
   const qrData = JSON.stringify({ 
     id: product.id, 
     price: product.price 
   });
   // Customer could create fake QR with lower price!
   
   // ✅ Only encode unique ID
   const qrData = product.qr_code;
   // Server always returns current price from database
   ```

5. **Not stopping scanner after successful scan:**
   ```javascript
   // ❌ Scanner keeps running
   function onScanSuccess(decodedText) {
     lookupProduct(decodedText);
     // Scanner still active, might scan again immediately
   }
   
   // ✅ Stop scanner after success
   function onScanSuccess(decodedText) {
     scanner.stop();  // Stop scanning
     lookupProduct(decodedText);
   }
   ```

## Related Concepts
- Web App Basics Part 2C: Section 9 (QR Codes)
- Camera API (getUserMedia)
- REST API design
- UUID generation
- Mobile-first design
- Audit logging
