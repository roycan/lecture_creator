# DataTables Decision Tree - Client-Side vs Server-Side (D3)

## Purpose
Modern, visually appealing decision tree with clear visual hierarchy showing when to choose client-side vs server-side DataTables processing.

## Rendering
**VS Code:** Install "d2" extension  
**Online:** Copy code to [D2 Playground](https://play.d2lang.com)  
**CLI:** `d2 04-datatables-decision-d2.md datatables-decision.svg`

## Diagram

```d2
direction: down

title: {
  label: DataTables Decision Tree
  shape: text
  style: {
    font-size: 24
    bold: true
  }
}

start: Need table with sorting, search, pagination {
  shape: oval
  style.fill: "#E0F7FA"
  style.stroke: "#00BCD4"
  style.stroke-width: 3
}

# Main decision point
data_size: How many rows? {
  shape: diamond
  style.fill: "#E1BEE7"
  style.stroke: "#7B1FA2"
  style.stroke-width: 3
}

# Security check
security: Sensitive data?\nNeed access control? {
  shape: diamond
  style.fill: "#FFE082"
  style.stroke: "#F57C00"
  style.stroke-width: 3
}

# Client-side path
client_decision: "< 1,000 rows\n& No security concerns" {
  shape: hexagon
  style.fill: "#90EE90"
  style.stroke: "#4CAF50"
  style.stroke-width: 4
}

client_impl: |md
  ## ✅ CLIENT-SIDE
  
  **Implementation:**
  1. Load all data in EJS
  2. Include DataTables JS
  3. Call $('#table').DataTable()
  
  **Code:**
  ```javascript
  // Server: Send all rows
  const products = db.prepare(
    'SELECT * FROM products'
  ).all();
  res.render('list', {products});
  ```
  
  ```javascript
  // Client: Initialize
  $('#table').DataTable({
    pageLength: 25
  });
  ```
| {
  shape: rectangle
  style.fill: "#90EE90"
  style.stroke: "#4CAF50"
  style.stroke-width: 2
}

client_pros: |md
  ## Benefits
  
  ✅ Instant interactions (no server delay)
  ✅ Works offline
  ✅ No server load on sort/search
  ✅ Simple code (3 lines!)
  ✅ Best user experience
| {
  shape: rectangle
  style.fill: "#C8E6C9"
  style.stroke: "#4CAF50"
}

client_cons: |md
  ## Drawbacks
  
  ⚠️ Large initial HTML (slow first load)
  ⚠️ All data sent to browser
  ⚠️ Security risk (user can inspect all data)
  ⚠️ Limited to ~1,000 rows max
| {
  shape: rectangle
  style.fill: "#FFE0B2"
  style.stroke: "#FF6F00"
}

# Server-side path
server_decision: "> 1,000 rows\nOR security concerns" {
  shape: hexagon
  style.fill: "#87CEEB"
  style.stroke: "#0288D1"
  style.stroke-width: 4
}

server_impl: |md
  ## ✅ SERVER-SIDE
  
  **Implementation:**
  1. Create API endpoint
  2. Parse DataTables params
  3. Build SQL with LIMIT/OFFSET
  4. Return JSON response
  
  **Code:**
  ```javascript
  // API endpoint
  app.get('/api/products', (req, res) => {
    const start = req.query.start;
    const length = req.query.length;
    const search = req.query.search.value;
    
    const data = db.prepare(`
      SELECT * FROM products
      WHERE name LIKE ?
      LIMIT ? OFFSET ?
    `).all(`%${search}%`, length, start);
    
    res.json({
      draw: req.query.draw,
      recordsTotal: total,
      recordsFiltered: filtered,
      data: data
    });
  });
  ```
  
  ```javascript
  // Client: Initialize
  $('#table').DataTable({
    serverSide: true,
    ajax: '/api/products'
  });
  ```
| {
  shape: rectangle
  style.fill: "#87CEEB"
  style.stroke: "#0288D1"
  style.stroke-width: 2
}

server_pros: |md
  ## Benefits
  
  ✅ Fast initial page load
  ✅ Scales to millions of rows
  ✅ Only send visible data (security!)
  ✅ Reduced bandwidth
  ✅ Server-side access control
| {
  shape: rectangle
  style.fill: "#B3E5FC"
  style.stroke: "#0288D1"
}

server_cons: |md
  ## Drawbacks
  
  ⚠️ Server load on every interaction
  ⚠️ More complex code (API endpoint)
  ⚠️ Slight delay on sort/search
  ⚠️ Requires proper indexing
| {
  shape: rectangle
  style.fill: "#FFCCBC"
  style.stroke: "#D32F2F"
}

# Query complexity path
query_complex: Complex query?\n(JOINs, aggregations) {
  shape: diamond
  style.fill: "#E1BEE7"
  style.stroke: "#7B1FA2"
  style.stroke-width: 3
}

optimize: |md
  ## Optimize Query
  
  1. Add indexes:
     ```sql
     CREATE INDEX idx_name 
     ON products(name);
     ```
  
  2. Use EXPLAIN:
     ```sql
     EXPLAIN QUERY PLAN
     SELECT * FROM products
     WHERE name LIKE '%search%';
     ```
  
  3. Covering indexes:
     ```sql
     CREATE INDEX idx_cover
     ON products(name, price, stock);
     ```
| {
  shape: rectangle
  style.fill: "#FFF9C4"
  style.stroke: "#F57C00"
  style.stroke-width: 2
}

cache_option: Can results be cached? {
  shape: diamond
  style.fill: "#E1BEE7"
  style.stroke: "#7B1FA2"
}

cache_impl: |md
  ## Use Caching
  
  ```javascript
  const NodeCache = require('node-cache');
  const cache = new NodeCache({ stdTTL: 600 });
  
  app.get('/api/products', (req, res) => {
    const cacheKey = JSON.stringify(req.query);
    
    let data = cache.get(cacheKey);
    if (!data) {
      // Expensive query
      data = db.prepare('...').all();
      cache.set(cacheKey, data);
    }
    
    res.json(data);
  });
  ```
  
  ⚠️ Invalidate cache on updates!
| {
  shape: rectangle
  style.fill: "#B2DFDB"
  style.stroke: "#00897B"
  style.stroke-width: 2
}

hybrid: |md
  ## Hybrid Approach
  
  **Best of Both Worlds:**
  
  1. Pre-load first page client-side
  2. Lazy-load additional pages
  3. Cache frequent searches
  4. Virtual scrolling for large lists
  
  **When to use:**
  - Variable data size per user
  - Mix of small and large queries
  - Need fast initial render + scalability
| {
  shape: rectangle
  style.fill: "#FFECB3"
  style.stroke: "#FF6F00"
  style.stroke-width: 2
}

# Examples
examples: |md
  ## Real-World Examples
  
  **Client-Side (< 1,000):**
  - Product catalog (small store)
  - User list (< 200 users)
  - Category dropdown (< 50 items)
  - Settings/config tables
  
  **Server-Side (> 1,000):**
  - Audit logs (grows indefinitely)
  - Transaction history
  - Large product catalogs
  - User activity tracking
  - Any time-series data
  
  **Security-First (any size):**
  - Customer orders (user-specific)
  - Medical records
  - Financial transactions
  - Personal information
| {
  shape: rectangle
  style.fill: "#F3E5F5"
  style.stroke: "#7B1FA2"
}

# Connections
start -> security: Evaluate
security -> client_decision: "No security concerns\n& Small data"
security -> server_decision: "Yes: Need access control\n(Use server-side regardless of size!)"

start -> data_size
data_size -> client_decision: "< 1,000 rows"
data_size -> server_decision: "> 1,000 rows"

client_decision -> client_impl
client_impl -> client_pros
client_impl -> client_cons

server_decision -> server_impl
server_impl -> server_pros
server_impl -> server_cons

server_impl -> query_complex: "Check performance"
query_complex -> optimize: "Yes: Slow queries"
query_complex -> server_pros: "No: Fast queries"

optimize -> cache_option: "Still slow after optimization?"
cache_option -> cache_impl: "Yes: Cache results"
cache_option -> hybrid: "No: Real-time data needed"

# Summary boxes
summary_client: |md
  📊 **When to use CLIENT-SIDE:**
  
  ✅ Data size: < 1,000 rows
  ✅ Security: Public data (or authenticated, not user-specific)
  ✅ Query: Simple SELECT
  ✅ Goal: Best user experience (instant interactions)
| {
  shape: rectangle
  style.fill: "#E8F5E9"
  style.stroke: "#4CAF50"
  style.stroke-width: 3
}

summary_server: |md
  📊 **When to use SERVER-SIDE:**
  
  ✅ Data size: > 1,000 rows
  ✅ Security: User-specific data (orders, records)
  ✅ Query: Complex JOINs or aggregations
  ✅ Goal: Scalability + security
| {
  shape: rectangle
  style.fill: "#E3F2FD"
  style.stroke: "#0288D1"
  style.stroke-width: 3
}

client_cons -> summary_client
server_cons -> summary_server

examples -> summary_client: Reference
examples -> summary_server: Reference
```

## Key Insights

1. **Visual hierarchy:**
   - Ovals = Start/entry points
   - Diamonds = Decision points
   - Hexagons = Major path decisions
   - Rectangles = Implementation details
   - Markdown boxes = Rich content with code examples

2. **Color strategy:**
   - Green = Client-side (simple, fast interactions)
   - Blue = Server-side (scalable, secure)
   - Purple = Decision points
   - Yellow/Orange = Warnings, optimizations
   - Teal = Caching solutions

3. **Two critical overrides:**
   - **Security concerns** → Always use server-side (even if < 1,000 rows)
   - **Complex queries** → Optimization path (indexes → caching → hybrid)

4. **Flow paths:**
   - Simple path: Size check → Choose approach
   - Security path: Security check overrides size
   - Performance path: Query complexity → Optimization steps

## Code Mapping

### Decision Logic Function

```javascript
// utils/datatables-helper.js
function shouldUseServerSide(options) {
  const {
    rowCount,
    hasSensitiveData,
    hasComplexQuery,
    expectedGrowth
  } = options;
  
  // Override: Security first!
  if (hasSensitiveData) {
    return {
      method: 'server-side',
      reason: 'Security: User-specific or sensitive data'
    };
  }
  
  // Size check
  if (rowCount > 1000 || expectedGrowth === 'high') {
    return {
      method: 'server-side',
      reason: 'Scalability: Large dataset'
    };
  }
  
  // Performance check
  if (hasComplexQuery && rowCount > 500) {
    return {
      method: 'server-side',
      reason: 'Performance: Complex query with moderate data'
    };
  }
  
  // Default: Client-side
  return {
    method: 'client-side',
    reason: 'Simple dataset with fast interactions'
  };
}

// Usage
const decision = shouldUseServerSide({
  rowCount: 150,
  hasSensitiveData: false,
  hasComplexQuery: false,
  expectedGrowth: 'low'
});

console.log(decision);
// { method: 'client-side', reason: 'Simple dataset with fast interactions' }
```

### Client-Side Template

```javascript
// routes/products.js
app.get('/products', requireAuth, (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY name').all();
  
  // Decision check
  if (products.length < 1000) {
    // Use client-side
    res.render('products/list-client', { products });
  } else {
    // Use server-side (render empty table, load via AJAX)
    res.render('products/list-server');
  }
});
```

```ejs
<!-- views/products/list-client.ejs -->
<table id="productsTable">
  <thead>
    <tr><th>Name</th><th>Price</th><th>Stock</th></tr>
  </thead>
  <tbody>
    <% products.forEach(p => { %>
      <tr>
        <td><%= p.name %></td>
        <td>₱<%= p.price.toFixed(2) %></td>
        <td><%= p.stock %></td>
      </tr>
    <% }); %>
  </tbody>
</table>

<script>
  $('#productsTable').DataTable({ pageLength: 25 });
</script>
```

### Server-Side Template

```ejs
<!-- views/products/list-server.ejs -->
<table id="productsTable">
  <thead>
    <tr><th>Name</th><th>Price</th><th>Stock</th></tr>
  </thead>
  <tbody>
    <!-- Loaded via AJAX -->
  </tbody>
</table>

<script>
  $('#productsTable').DataTable({
    serverSide: true,
    processing: true,
    ajax: '/api/products',
    columns: [
      { data: 'name' },
      { 
        data: 'price',
        render: function(data) {
          return '₱' + parseFloat(data).toFixed(2);
        }
      },
      { data: 'stock' }
    ],
    pageLength: 25
  });
</script>
```

### Server-Side API with Optimization

```javascript
// routes/api.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 min cache

app.get('/api/products', requireAuth, (req, res) => {
  const draw = parseInt(req.query.draw);
  const start = parseInt(req.query.start) || 0;
  const length = parseInt(req.query.length) || 10;
  const search = req.query.search?.value || '';
  
  // Cache key based on params
  const cacheKey = `products:${start}:${length}:${search}`;
  
  // Try cache first
  let result = cache.get(cacheKey);
  
  if (!result) {
    // Build query
    let whereClause = '';
    let params = [];
    
    if (search) {
      whereClause = 'WHERE name LIKE ? OR category LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }
    
    // Get counts
    const totalRecords = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const filteredRecords = db.prepare(`
      SELECT COUNT(*) as count FROM products ${whereClause}
    `).get(...params).count;
    
    // Get data (with indexes on name and category)
    const products = db.prepare(`
      SELECT id, name, price, stock, category
      FROM products
      ${whereClause}
      ORDER BY name
      LIMIT ? OFFSET ?
    `).all(...params, length, start);
    
    result = {
      draw: draw,
      recordsTotal: totalRecords,
      recordsFiltered: filteredRecords,
      data: products
    };
    
    // Cache result
    cache.set(cacheKey, result);
  } else {
    // Use cached result but update draw number
    result.draw = draw;
  }
  
  res.json(result);
});

// Invalidate cache on updates
app.post('/products/:id/edit', requireAdmin, (req, res) => {
  // Update product...
  
  // Clear cache
  cache.flushAll();
  
  res.redirect('/products');
});
```

## Common Mistakes

1. **Ignoring security implications:**
   ```javascript
   // ❌ Customer can see ALL orders (security breach!)
   app.get('/orders', (req, res) => {
     const allOrders = db.prepare('SELECT * FROM orders').all();
     res.render('orders', { allOrders });  // Sends everyone's data!
   });
   
   // ✅ Use server-side with access control
   app.get('/api/orders', (req, res) => {
     const userOrders = db.prepare(`
       SELECT * FROM orders WHERE user_id = ?
     `).all(res.locals.user.id);
     res.json({ data: userOrders });
   });
   ```

2. **Not considering data growth:**
   ```javascript
   // ❌ Works now (100 rows), breaks later (10,000 rows)
   app.get('/transactions', (req, res) => {
     const txns = db.prepare('SELECT * FROM transactions').all();
     res.render('list', { txns });  // Client-side will slow down over time
   });
   
   // ✅ Use server-side from the start (future-proof)
   app.get('/transactions', (req, res) => {
     res.render('list-server');  // Uses AJAX for data
   });
   ```

3. **Forgetting to add indexes:**
   ```javascript
   // ❌ Slow query on every search (full table scan)
   const products = db.prepare(`
     SELECT * FROM products WHERE name LIKE ?
   `).all(`%${search}%`);
   
   // ✅ Add index first
   db.exec('CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)');
   // Now query is 100x faster!
   ```

4. **Not handling errors properly:**
   ```javascript
   // ❌ Returns 500 error if query fails
   app.get('/api/products', (req, res) => {
     const data = db.prepare('SELECT...').all();
     res.json({ data });  // Crashes if SQL error
   });
   
   // ✅ Handle errors gracefully
   app.get('/api/products', (req, res) => {
     try {
       const data = db.prepare('SELECT...').all();
       res.json({
         draw: req.query.draw,
         recordsTotal: data.length,
         recordsFiltered: data.length,
         data: data || []
       });
     } catch (error) {
       console.error('DataTables error:', error);
       res.json({
         draw: req.query.draw,
         recordsTotal: 0,
         recordsFiltered: 0,
         data: [],
         error: 'Failed to load data'
       });
     }
   });
   ```

5. **Not testing with realistic data volumes:**
   ```javascript
   // ❌ Testing with 10 test rows (works fine)
   // Real production: 50,000 rows (crashes browser)
   
   // ✅ Test with realistic data
   // Generate test data:
   for (let i = 0; i < 5000; i++) {
     db.prepare('INSERT INTO products...').run(...);
   }
   // Now test both approaches and compare performance
   ```

## Related Concepts
- Web App Basics Part 2C: Section 8 (DataTables)
- AJAX and JSON APIs
- SQL LIMIT and OFFSET (pagination)
- Database indexing (B-tree, covering indexes)
- Caching strategies (in-memory, Redis)
- Role-based access control
