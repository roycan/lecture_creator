# System Architecture - Complete Web Application (D2)

## Purpose
Modern layered architecture diagram showing the complete sari-sari store web application stack with clear visual hierarchy and component relationships.

## Rendering
**VS Code:** Install "d2" extension  
**Online:** Copy code to [D2 Playground](https://play.d2lang.com)  
**CLI:** `d2 06-system-architecture-d2.md architecture.svg`

## Diagram

```d2
direction: down

title: {
  label: Sari-Sari Store - System Architecture
  shape: text
  style.font-size: 26
  style.bold: true
}

client: CLIENT LAYER {
  style.fill: "#E3F2FD"
  style.stroke: "#0288D1"
  style.stroke-width: 3
  
  browser: Web Browser {
    shape: rectangle
    style.fill: "#90CAF9"
  }
  
  html: HTML/EJS Templates {
    shape: rectangle
    style.fill: "#90CAF9"
  }
  
  css: CSS + Bootstrap {
    shape: rectangle
    style.fill: "#90CAF9"
  }
  
  js: JavaScript + jQuery {
    shape: rectangle
    style.fill: "#90CAF9"
  }
  
  libraries: Client Libraries {
    shape: rectangle
    style.fill: "#64B5F6"
    
    datatables: DataTables
    qrscanner: HTML5-QRCode
  }
}

server: SERVER LAYER {
  style.fill: "#E8F5E9"
  style.stroke: "#4CAF50"
  style.stroke-width: 3
  
  express: Express.js Server (Port 3000) {
    shape: rectangle
    style.fill: "#81C784"
    style.stroke-width: 2
  }
  
  middleware: Middleware Stack {
    style.fill: "#C8E6C9"
    
    static: express.static (Public files) {
      shape: rectangle
    }
    
    bodyparser: body-parser (Form data) {
      shape: rectangle
    }
    
    session: express-session (Session mgmt) {
      shape: rectangle
    }
    
    flash: connect-flash (Messages) {
      shape: rectangle
    }
    
    auth: requireAuth (Check login) {
      shape: rectangle
    }
    
    rbac: requireRole (Check permissions) {
      shape: rectangle
    }
  }
  
  routes: Route Handlers {
    style.fill: "#A5D6A7"
    
    authroutes: /login, /register, /logout {
      shape: rectangle
    }
    
    productroutes: /products (CRUD) {
      shape: rectangle
    }
    
    cartroutes: /cart, /cart/add {
      shape: rectangle
    }
    
    orderroutes: /orders, /checkout {
      shape: rectangle
    }
    
    adminroutes: /admin/audit, /admin/users {
      shape: rectangle
    }
    
    apiroutes: /api/products/lookup {
      shape: rectangle
    }
  }
  
  utils: Utility Modules {
    style.fill: "#81C784"
    
    qrgen: QR Generator (UUID codes) {
      shape: rectangle
    }
    
    auditlog: Audit Logger {
      shape: rectangle
    }
    
    emailer: Email Sender (SMTP) {
      shape: rectangle
    }
  }
}

database: DATABASE LAYER {
  style.fill: "#FFF3E0"
  style.stroke: "#F57C00"
  style.stroke-width: 3
  
  sqlite: SQLite Database (store.db) {
    shape: cylinder
    style.fill: "#FFB74D"
    style.stroke-width: 2
  }
  
  tables: Tables {
    style.fill: "#FFE0B2"
    
    users: users (auth, roles) {
      shape: rectangle
    }
    
    products: products (inventory, QR) {
      shape: rectangle
    }
    
    orders: orders (purchases) {
      shape: rectangle
    }
    
    orderitems: order_items (line items) {
      shape: rectangle
    }
    
    auditlog: audit_log (change tracking) {
      shape: rectangle
    }
    
    qrscans: qr_scans (scan analytics) {
      shape: rectangle
    }
    
    sessions: sessions (session store) {
      shape: rectangle
    }
  }
}

external: EXTERNAL SERVICES {
  style.fill: "#F3E5F5"
  style.stroke: "#7B1FA2"
  style.stroke-width: 3
  
  smtp: SMTP Server {
    shape: rectangle
    style.fill: "#CE93D8"
    icon: https://icons.terrastruct.com/essentials%2F119-mail.svg
  }
  
  filesystem: File System {
    shape: rectangle
    style.fill: "#CE93D8"
    
    csv: CSV Imports
    backups: JSON Backups
    uploads: File Uploads
  }
}

# CONNECTIONS - Client to Server
client.browser -> server.express: HTTP Requests (GET, POST) {
  style.stroke: "#0288D1"
  style.stroke-width: 3
}

server.express -> client.browser: HTTP Responses (HTML, JSON, Redirects) {
  style.stroke: "#4CAF50"
  style.stroke-width: 3
}

# Server internal flow
server.express -> server.middleware: Every request passes through {
  style.stroke: "#4CAF50"
  style.stroke-width: 2
}

server.middleware -> server.routes: After middleware {
  style.stroke: "#4CAF50"
  style.stroke-width: 2
}

server.routes -> server.utils: Call utility functions {
  style.stroke: "#4CAF50"
  style.stroke-dash: 3
}

# Routes to Database
server.routes.authroutes -> database.tables.users: SELECT, INSERT {
  style.stroke: "#F57C00"
  style.stroke-width: 2
}

server.routes.productroutes -> database.tables.products: CRUD operations {
  style.stroke: "#F57C00"
  style.stroke-width: 2
}

server.routes.orderroutes -> database.tables.orders: INSERT orders {
  style.stroke: "#F57C00"
  style.stroke-width: 2
}

server.routes.orderroutes -> database.tables.orderitems: INSERT line items {
  style.stroke: "#F57C00"
  style.stroke-width: 2
}

server.routes.adminroutes -> database.tables.auditlog: SELECT logs {
  style.stroke: "#F57C00"
  style.stroke-width: 2
}

server.routes.apiroutes -> database.tables.qrscans: INSERT scans {
  style.stroke: "#F57C00"
  style.stroke-width: 2
}

server.middleware.session -> database.tables.sessions: Store/retrieve sessions {
  style.stroke: "#F57C00"
  style.stroke-dash: 3
}

# Utils to Database
server.utils.auditlog -> database.tables.auditlog: INSERT audit entries {
  style.stroke: "#F57C00"
  style.stroke-dash: 3
}

# External services
server.utils.emailer -> external.smtp: Send emails {
  style.stroke: "#7B1FA2"
  style.stroke-width: 2
}

server.routes.productroutes -> external.filesystem.csv: Read CSV files {
  style.stroke: "#7B1FA2"
  style.stroke-dash: 3
}

server.routes.adminroutes -> external.filesystem.backups: Write backup JSON {
  style.stroke: "#7B1FA2"
  style.stroke-dash: 3
}

# Database relationships (FK)
database.tables.orders -> database.tables.users: user_id FK {
  style.stroke: "#FF6F00"
  style.stroke-dash: 5
}

database.tables.orderitems -> database.tables.orders: order_id FK {
  style.stroke: "#FF6F00"
  style.stroke-dash: 5
}

database.tables.orderitems -> database.tables.products: product_id FK {
  style.stroke: "#FF6F00"
  style.stroke-dash: 5
}

database.tables.products -> database.tables.users: created_by FK {
  style.stroke: "#FF6F00"
  style.stroke-dash: 5
}

database.tables.auditlog -> database.tables.users: user_id FK {
  style.stroke: "#FF6F00"
  style.stroke-dash: 5
}

database.tables.qrscans -> database.tables.products: product_id FK {
  style.stroke: "#FF6F00"
  style.stroke-dash: 5
}

# Info boxes
dataflow: |md
  ## 📊 Data Flow
  
  1. **Request:** Browser → Express → Middleware → Routes
  2. **Database:** Routes query SQLite tables
  3. **Response:** Routes render EJS → HTML sent to browser
  4. **Session:** Stored in SQLite (persistent across restarts)
| {
  shape: rectangle
  style.fill: "#E8F5E9"
  style.stroke: "#4CAF50"
}

security: |md
  ## 🔒 Security Layers
  
  - **Authentication:** requireAuth middleware (session check)
  - **Authorization:** requireRole middleware (permission check)
  - **Sessions:** Stored server-side (not in cookies)
  - **Passwords:** Hashed with bcrypt (never plaintext)
  - **Audit:** All changes logged to audit_log table
| {
  shape: rectangle
  style.fill: "#FFEBEE"
  style.stroke: "#D32F2F"
}

server.middleware.auth -> security {
  style.stroke-dash: 3
}

server.routes -> dataflow {
  style.stroke-dash: 3
}
```

## Key Insights

1. **Three-tier architecture:**
   - **Presentation:** Client layer (browser + templates)
   - **Business Logic:** Server layer (Express + routes + middleware)
   - **Data:** Database layer (SQLite + tables)

2. **Middleware pipeline:**
   - Every request flows through middleware stack in order
   - Authentication and authorization happen before routes
   - Session management enables flash messages and user tracking

3. **Database relationships:**
   - Orange dashed lines show foreign key constraints
   - Ensures referential integrity (can't delete user with orders)

4. **External integrations:**
   - Purple connections show external services
   - SMTP for emails, file system for CSV/backups

## Code Mapping

See `06-system-architecture-mermaid.md` for complete code examples including:
- `app.js` (main entry point)
- Middleware configuration
- Route handlers
- Database schema
- Utility modules

## Related Concepts
- Web App Basics Part 2C: All sections
- Three-tier architecture
- MVC pattern
- Middleware pattern
- Database normalization
