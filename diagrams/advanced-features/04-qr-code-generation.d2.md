# QR Code Generation & Scanning Flow (D2)

## Purpose
Show how QR codes work in a web app: generation using an API and scanning with a web-based scanner.

## Rendering
Use D2 Playground (play.d2lang.com) or D2 CLI.

## Diagram

```d2
title: QR Code Generation & Scanning Flow

direction: right

User: {
  shape: person
  label: "Store Manager"
}

Browser: {
  label: "Web Browser"
  shape: rectangle
}

ExpressApp: {
  label: "Express App\n(Your Code)"
  shape: rectangle
  style.fill: "#87CEEB"
}

Database: {
  label: "SQLite\nDatabase"
  shape: cylinder
}

QRServerAPI: {
  label: "QR Server API\n(goqr.me)"
  shape: cloud
  style.fill: "#FFD700"
}

Scanner: {
  label: "QR Scanner\n(html5-qrcode)"
  shape: rectangle
  style.fill: "#90EE90"
}

# GENERATION FLOW
User -> Browser: "1. View product\ndetail page"

Browser -> ExpressApp: "2. GET /products/5"

ExpressApp -> Database: "3. SELECT * FROM products\nWHERE id = 5"

Database -> ExpressApp: "4. Return product data:\n{id: 5, name: 'Skyflakes',\nprice: 35.50}"

ExpressApp -> Browser: "5. Render product page\nwith QR code URL"

Browser -> QRServerAPI: "6. <img src=\n'https://api.qrserver.com/v1/\ncreate-qr-code/?size=300x300\n&data=PRODUCT-5'>"

QRServerAPI -> Browser: "7. Return QR code image\n(PNG)"

Browser -> User: "8. Display QR code\n(can print label)"

# SCANNING FLOW
User -> Scanner: "9. Open scanner page\n(/scan)"

Scanner -> User: "10. Camera permission\nrequest"

User -> Scanner: "11. Allow camera access"

Scanner -> User: "12. Point camera at\nQR code"

User -> Scanner: "13. QR code detected:\n'PRODUCT-5'"

Scanner -> ExpressApp: "14. Redirect to\n/products/5"

ExpressApp -> Database: "15. SELECT product 5"

Database -> ExpressApp: "16. Return data"

ExpressApp -> Browser: "17. Show product page"

Browser -> User: "18. Product details\ndisplayed!"

# NOTES
notes: |md
  ## Why QR Codes?
  
  **Use Cases:**
  - Product labels (scan to view details)
  - Resident ID cards (scan to view profile)
  - Student IDs (scan to view grades)
  - Quick access without typing
  
  ## Benefits:
  - ✅ Free (QR Server API, no key needed)
  - ✅ Works offline (once generated)
  - ✅ No library needed for generation
  - ✅ Can print on paper
  - ✅ Works with any QR scanner app
|

style: {
  font-size: 14
}
```

## Code Examples

### Generation (EJS View)

```html
<!-- views/products/detail.ejs -->
<div class="box has-text-centered">
  <h3>Product QR Code</h3>
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=<%= encodeURIComponent('PRODUCT-' + product.id) %>" 
       alt="Product QR Code">
  <p class="mt-2">Scan to view this product</p>
  <button onclick="window.print()" class="button is-small">
    🖨️ Print Label
  </button>
</div>
```

### Scanning (HTML5 QR Code Library)

```html
<!-- views/scan.ejs -->
<div id="reader" style="width: 500px;"></div>

<script src="https://unpkg.com/html5-qrcode"></script>
<script>
  const html5QrCode = new Html5Qrcode("reader");
  
  html5QrCode.start(
    { facingMode: "environment" }, // Use back camera
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      // Successfully scanned
      console.log("Scanned:", decodedText); // "PRODUCT-5"
      
      // Extract ID and redirect
      const productId = decodedText.replace('PRODUCT-', '');
      window.location.href = `/products/${productId}`;
    },
    (errorMessage) => {
      // Scanning... (ignore these)
    }
  );
</script>
```

## QR Server API Options

```
https://api.qrserver.com/v1/create-qr-code/
  ?size=300x300           # Image size (100x100 to 1000x1000)
  &data=YOUR_DATA         # Text to encode (URL encode special chars)
  &color=000000           # Foreground color (hex without #)
  &bgcolor=FFFFFF         # Background color (hex without #)
  &format=png             # png, gif, jpeg, svg
  &ecc=L                  # Error correction (L, M, Q, H)
```

**Example custom QR code:**
```
https://api.qrserver.com/v1/create-qr-code/
  ?size=400x400
  &data=https://mystore.com/products/5
  &color=2B5329           # Dark green
  &bgcolor=E8F5E9         # Light green
  &format=svg             # Vector format (scalable)
```

## Practical Applications

### 1. Product Labels
```
Store prints QR code sticker
Customer scans with phone
Browser opens product details
Can check price, stock, reviews
```

### 2. Resident ID Cards
```
Barangay issues ID with QR code
Guard scans QR at gate
System shows resident info
Access granted if authorized
```

### 3. Student IDs
```
Student card has QR code
Teacher scans during attendance
System marks present automatically
Parents get notification
```

## Related Concepts
- Web App Basics Part 2C: Section 4 (QR Codes)
- QR Server API (goqr.me)
- html5-qrcode library for scanning
- Mobile-first design
