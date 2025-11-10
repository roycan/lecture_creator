# Barangay Directory v2.0

A modern web application for managing barangay residents with SQLite database.

## ✨ Features

- ✅ **Full CRUD Operations:** Create, Read, Update, Delete residents
- ✅ **SQLite Database:** Persistent data storage with relationships
- ✅ **Search Functionality:** Find residents by name or address
- ✅ **Filter by Barangay:** View residents from specific barangays
- ✅ **Foreign Key Relationships:** Residents linked to barangays
- ✅ **Input Validation:** Age constraints, required fields
- ✅ **Responsive Design:** Mobile-friendly interface
- ✅ **Beautiful UI:** Modern gradient design with smooth animations

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

```bash
npm run setup
```

This will:
- Create the SQLite database
- Create tables (barangays, residents)
- Insert sample data (3 barangays, 6 residents)

### 3. Run Application

```bash
npm start
```

Visit: **http://localhost:3000**

## 📁 Project Structure

```
barangay-directory-v2/
├── app.js                  # Main application
├── package.json            # Dependencies
├── .gitignore             # Git ignore rules
├── README.md              # This file
├── database/
│   └── setup-database.js  # Database setup script
├── data/
│   └── barangay.db        # SQLite database (created on setup)
└── views/
    ├── index.ejs          # Main resident list
    ├── add.ejs            # Add resident form
    ├── edit.ejs           # Edit resident form
    └── view.ejs           # View resident details
```

## 🗄️ Database Schema

### `barangays` Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL, UNIQUE |
| captain | TEXT | NOT NULL |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### `residents` Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL |
| age | INTEGER | NOT NULL, CHECK (age >= 0) |
| address | TEXT | NOT NULL |
| barangay_id | INTEGER | NOT NULL, FOREIGN KEY |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

**Relationship:** Each resident belongs to one barangay (one-to-many)

## 🎯 Available Routes

### Main Routes

- `GET /` - List all residents
- `GET /add` - Show add resident form
- `POST /add` - Create new resident
- `GET /resident/:id` - View resident details
- `GET /edit/:id` - Show edit resident form
- `POST /edit/:id` - Update resident
- `POST /delete/:id` - Delete resident

### Filter Routes

- `GET /search?q=query` - Search residents by name/address
- `GET /barangay/:id` - Filter residents by barangay

## 💡 Usage Examples

### Add New Resident

1. Click "➕ Add New Resident"
2. Fill in the form:
   - Full Name: `Juan Dela Cruz`
   - Age: `35`
   - Address: `123 Main Street`
   - Barangay: Select from dropdown
3. Click "✓ Add Resident"

### Search Residents

Use the search box to find residents by name or address:
```
Search: "Juan" → Finds all residents named Juan
Search: "Main" → Finds residents living on Main Street
```

### Filter by Barangay

Use the barangay dropdown to view residents from a specific barangay.

### Edit Resident

1. Click "✏️ Edit" next to a resident
2. Update the information
3. Click "✓ Save Changes"

### Delete Resident

1. Click "🗑️ Delete" next to a resident
2. Confirm the deletion
3. Resident will be permanently removed

## 🔧 Configuration

### Change Port

Edit `app.js`:
```javascript
const PORT = 3000; // Change to your desired port
```

### Database Location

Edit `database/setup-database.js`:
```javascript
const dbPath = path.join(__dirname, '..', 'data', 'barangay.db');
```

## 🚢 Deployment to Railway

### 1. Add Volume

In Railway dashboard:
- Mount path: `/data`
- Name: `barangay-database`

### 2. Update Database Path

```javascript
const dataDir = process.env.RAILWAY_ENVIRONMENT 
  ? '/data' 
  : path.join(__dirname, 'data');
```

### 3. Update Start Command

In `package.json`:
```json
{
  "scripts": {
    "start": "node database/setup-database.js && node app.js"
  }
}
```

## 📊 Sample Data

The setup script creates:

**Barangays:**
- San Antonio (Capt. Juan Dela Cruz)
- Santa Cruz (Capt. Maria Santos)
- San Jose (Capt. Pedro Reyes)

**Residents:**
- 2 residents in San Antonio
- 2 residents in Santa Cruz
- 2 residents in San Jose

## 🛡️ Validation Rules

- **Name:** Required, any text
- **Age:** Required, 0-150
- **Address:** Required, any text
- **Barangay:** Required, must exist in database

## 🐛 Troubleshooting

### Database Not Found

Run setup first:
```bash
npm run setup
```

### Foreign Key Constraint Failed

This means you're trying to add a resident with an invalid barangay_id. Make sure the barangay exists in the database first.

### Port Already in Use

Change the port in `app.js` or kill the process using port 3000:
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 🔄 Upgrade from v1.0 (JSON)

### Changes from v1.0:

| Feature | v1.0 (JSON) | v2.0 (SQLite) |
|---------|-------------|---------------|
| Storage | JSON file | SQLite database |
| Relationships | Stored as strings | Foreign keys |
| Search | Array filter | SQL LIKE |
| Performance | Slow on large data | Fast queries |
| Data Integrity | No constraints | Database constraints |

### Migration Steps:

1. Export data from v1.0 (if needed)
2. Install v2.0 dependencies
3. Run database setup
4. Import old data (manual or script)

## 📚 Learning Resources

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [better-sqlite3 Docs](https://github.com/WiseLibs/better-sqlite3)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [EJS Template Engine](https://ejs.co/)

## 📝 License

MIT License - Feel free to use this for learning and personal projects!

## 🤝 Contributing

This is a learning project. Feel free to fork and experiment!

---

**Version:** 2.0.0 (SQLite)  
**Previous Version:** 1.0.0 (JSON file storage)  
**Upgrade:** Migrated from JSON to SQLite for better performance and data integrity
