# Flash Message Lifecycle (D2)

## Purpose
Modern, clean visualization of the flash message pattern, emphasizing the temporal flow and session bridge mechanism.

## Rendering
**D2 Playground:** Copy code to [play.d2lang.com](https://play.d2lang.com)  
**CLI:** `d2 01-flash-lifecycle-d2.md flash-lifecycle.svg`  
**Install D2:** `curl -fsSL https://d2lang.com/install.sh | sh -s --`

## Diagram

```d2
direction: right

title: Flash Message Lifecycle - Session Bridge Pattern {
  near: top-center
  shape: text
  style.font-size: 20
  style.bold: true
}

user: {
  shape: person
  label: User
}

browser: {
  label: Browser
  shape: rectangle
  style.fill: "#E0F7FA"
}

server: {
  label: "Express Server"
  shape: rectangle
  style.fill: "#87CEEB"
}

session: {
  label: "Session Store\n(flash messages here)"
  shape: cylinder
  style.fill: "#FFD700"
}

database: {
  label: "SQLite Database"
  shape: cylinder
  style.fill: "#C8E6C9"
}

# POST Request Flow
user -> browser: "1. Fill form &\nsubmit product" {
  style.stroke: "#2196F3"
}

browser -> server: "2. POST /products\n(cookie: session_id=abc123)" {
  style.stroke: "#2196F3"
}

server -> database: "3. INSERT product" {
  style.stroke: "#4CAF50"
}

database -> server: "4. Success\n(rowid: 5)" {
  style.stroke: "#4CAF50"
}

server -> session: "5. req.flash('success', 'Added!')\nSTORE in session" {
  style.stroke: "#FFD700"
  style.stroke-width: 3
}

session -> server: "6. Stored" {
  style.stroke: "#FFD700"
}

server -> browser: "7. HTTP 302 Redirect\nLocation: /products" {
  style.stroke: "#FF9800"
}

# GET Request Flow (after redirect)
browser -> server: "8. GET /products\n(same cookie: session_id=abc123)" {
  style.stroke: "#9C27B0"
}

server -> session: "9. req.flash('success')\nRETRIEVE & DELETE" {
  style.stroke: "#E91E63"
  style.stroke-width: 3
}

session -> server: "10. ['Added!']\n(then remove from session)" {
  style.stroke: "#E91E63"
}

server -> database: "11. SELECT products" {
  style.stroke: "#4CAF50"
}

database -> server: "12. Product list" {
  style.stroke: "#4CAF50"
}

server -> browser: "13. Render page +\nflash message" {
  style.stroke: "#9C27B0"
}

browser -> user: "14. Show '✓ Product added!'\nnotification" {
  style.stroke: "#4CAF50"
}

# Key Insights Box
insights: {
  label: "Key Insights"
  shape: rectangle
  style.fill: "#FFF9C4"
  style.stroke: "#F57C00"
  style.stroke-width: 2
  
  insight1: "1. Session = Bridge" {
    shape: text
    style.font-size: 14
  }
  insight2: "2. One-time use (auto-delete)" {
    shape: text
    style.font-size: 14
  }
  insight3: "3. Survives redirect" {
    shape: text
    style.font-size: 14
  }
  insight4: "4. Gone on refresh" {
    shape: text
    style.font-size: 14
  }
  
  insight1 -> insight2 -> insight3 -> insight4: {
    style.opacity: 0
  }
}

# Common Mistake Box
mistake: {
  label: "⚠️ Common Mistake"
  shape: rectangle
  style.fill: "#FFB6C1"
  style.stroke: "#D32F2F"
  style.stroke-width: 2
  
  mistake_text: "Flash BEFORE session\n= req.flash is not a function" {
    shape: text
    style.font-size: 13
  }
}

# Correct Order Box
correct: {
  label: "✓ Correct Middleware Order"
  shape: rectangle
  style.fill: "#90EE90"
  style.stroke: "#388E3C"
  style.stroke-width: 2
  
  step1: "app.use(session({...}))" {
    shape: rectangle
    style.fill: "#E8F5E9"
  }
  step2: "app.use(flash())" {
    shape: rectangle
    style.fill: "#E8F5E9"
  }
  step3: "app.use(routes)" {
    shape: rectangle
    style.fill: "#E8F5E9"
  }
  
  step1 -> step2 -> step3: {
    label: "must be in\nthis order"
    style.stroke: "#388E3C"
  }
}

insights -> mistake: {
  style.opacity: 0
}
mistake -> correct: {
  style.opacity: 0
}
```

## Key Insights

1. **Color coding:**
   - 🔵 Blue = POST request flow
   - 🟣 Purple = GET request flow (after redirect)
   - 🟡 Yellow = Session operations (critical!)
   - 🟢 Green = Database operations
   - 🟠 Orange = Redirect

2. **Temporal flow:** Left-to-right shows the time progression (POST → Redirect → GET)

3. **Critical operations:** Session STORE and RETRIEVE/DELETE are emphasized with thicker lines

4. **Visual separation:** Boxes at bottom show insights, mistakes, and correct configuration

## Code Mapping

**The flash lifecycle in code:**

```javascript
// Step 5: Store flash message
app.post('/products', (req, res) => {
  db.prepare('INSERT INTO products (name, price) VALUES (?, ?)').run(
    req.body.name, req.body.price
  );
  
  req.flash('success', 'Product added!');  // ← STORES in session
  res.redirect('/products');                // ← Triggers browser GET request
});

// Step 9-10: Retrieve and delete flash message
app.get('/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products').all();
  
  res.render('products', {
    products: products,
    success_msg: req.flash('success')  // ← RETRIEVES & DELETES
  });
});

// Display in view (views/products.ejs)
<% if (success_msg && success_msg.length > 0) { %>
  <div class="notification is-success">
    <% success_msg.forEach(msg => { %>
      <%= msg %>
    <% }); %>
  </div>
<% } %>
```

**Session configuration:**
```javascript
const session = require('express-session');
const flash = require('connect-flash');
const SqliteStore = require('better-sqlite3-session-store')(session);

// CORRECT ORDER:
app.use(session({
  store: new SqliteStore({ client: db }),
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));  // ← 1. Session FIRST

app.use(flash());  // ← 2. Flash SECOND (depends on session)

app.use((req, res, next) => {  // ← 3. Make available to views
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  next();
});
```

## Common Mistakes

1. **Middleware order violation:**
   ```javascript
   app.use(flash());     // ❌ WRONG - flash before session
   app.use(session());
   // Result: "req.flash is not a function" error
   ```

2. **Not setting before redirect:**
   ```javascript
   app.post('/products', (req, res) => {
     db.prepare('INSERT...').run(...);
     res.redirect('/products');           // ❌ No flash message
     req.flash('success', 'Added!');      // ❌ Too late! Already redirected
   });
   ```

3. **Expecting persistence:**
   ```javascript
   // First request
   req.flash('success', 'Saved!');
   res.redirect('/products');
   
   // Second request (refresh page)
   req.flash('success')  // Returns [] - message already used!
   ```

4. **Session not configured:**
   ```javascript
   app.use(flash());  // ❌ No session middleware
   // Result: Flash won't work (needs session to store messages)
   ```

## Related Concepts
- Web App Basics Part 2C: Section 2 (Flash Messages)
- POST-Redirect-GET pattern (PRG)
- Express middleware stack execution
- Session-based state management
- Temporary vs persistent storage
