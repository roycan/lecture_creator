# Flash Message Lifecycle (Mermaid)

## Purpose
Visualizes how flash messages persist across HTTP redirects by using session storage. This diagram solves the #1 confusion point in Part 2C: "Why don't my messages disappear after redirect?"

## Rendering
**VS Code:** Install "Markdown Preview Mermaid Support" extension, then preview this file  
**Online:** Copy code to [mermaid.live](https://mermaid.live)  
**CLI:** `npx @mermaid-js/mermaid-cli -i 01-flash-lifecycle-mermaid.md -o flash-lifecycle.png`

## Diagram

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server
    participant Session
    participant Database
    
    Note over User,Database: POST → Flash → Redirect → GET Pattern
    
    User->>Browser: Fill form & submit<br/>(Add product)
    Browser->>Server: POST /products<br/>(with session cookie)
    
    Server->>Database: INSERT product
    Database-->>Server: Success (rowid: 5)
    
    rect rgb(144, 238, 144)
        Note right of Server: Flash message STORED
        Server->>Session: req.flash('success', 'Product added!')
        Session-->>Server: Stored in session
    end
    
    Server-->>Browser: 302 Redirect<br/>Location: /products
    
    Note over Browser: Browser makes NEW request
    
    Browser->>Server: GET /products<br/>(with same session cookie)
    
    rect rgb(255, 215, 0)
        Note right of Server: Flash message RETRIEVED & DELETED
        Server->>Session: req.flash('success')
        Session-->>Server: ['Product added!']<br/>(then deletes from session)
    end
    
    Server->>Database: SELECT * FROM products
    Database-->>Server: Product list
    
    Server-->>Browser: Render products page<br/>with flash message
    Browser-->>User: Shows "Product added!" notification
    
    Note over User,Browser: After 5 seconds, message auto-dismisses
    
    rect rgb(255, 182, 193)
        Note over User,Database: What happens on page refresh?
        User->>Browser: Refresh page (F5)
        Browser->>Server: GET /products
        Server->>Session: req.flash('success')
        Session-->>Server: [] (empty - already used!)
        Server-->>Browser: Products page (no message)
        Browser-->>User: No notification shown
    end
```

## Key Insights

1. **Session is the bridge:** Flash messages survive redirect because they're stored in server-side session
2. **One-time use:** Messages are automatically deleted after being read (prevents showing on refresh)
3. **Cookie requirement:** Session ID in cookie allows server to retrieve the message on the next request
4. **POST-Redirect-GET pattern:** Common web pattern to prevent duplicate form submissions

## Code Mapping

**Storing the message (POST route):**
```javascript
app.post('/products', (req, res) => {
  db.prepare('INSERT INTO products ...').run(...);
  req.flash('success', 'Product added!');  // ← Stores in session
  res.redirect('/products');               // ← Triggers GET request
});
```

**Retrieving the message (GET route):**
```javascript
app.get('/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products').all();
  res.render('products', {
    products: products,
    success_msg: req.flash('success')  // ← Retrieves & deletes
  });
});
```

**Middleware setup (app.js):**
```javascript
app.use(session({ /* config */ }));  // MUST be first
app.use(flash());                     // MUST be after session
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  next();
});
```

## Common Mistakes

1. **Configuring flash before session:** Flash middleware MUST come after session middleware
2. **Forgetting to set message:** Calling `res.redirect()` without `req.flash()` - user sees no feedback
3. **Setting message after redirect:** Must call `req.flash()` BEFORE `res.redirect()`
4. **Expecting message to persist:** Flash is one-time use; doesn't show on page refresh

## Related Concepts
- Web App Basics Part 2C: Section 2 (Flash Messages)
- Express sessions and middleware order
- HTTP redirect status codes (302)
- POST-Redirect-GET pattern
