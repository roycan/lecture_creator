# App 07: SQLite Basics

**Concept:** Introduction to SQLite database - reading data

## What You'll Learn

- How to set up SQLite with better-sqlite3
- Creating tables with SQL
- Reading data with SELECT queries
- Displaying database data in EJS templates
- Calculating aggregates (AVG, COUNT)
- Railway volume support for persistent storage

## Setup

```bash
npm install
npm start
```

Visit: http://localhost:3000

## Key Features

### 1. Database Setup with Railway Support
```javascript
// Works both locally and on Railway with persistent storage
const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH 
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'students.db')
  : path.join(__dirname, 'students.db');

const db = new Database(dbPath);
```

### 2. Auto-Create Table
```javascript
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    section TEXT NOT NULL,
    grade INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
```

### 3. Sample Data Insert
```javascript
const insert = db.prepare('INSERT INTO students (name, section, grade) VALUES (?, ?, ?)');
insert.run('Maria Santos', 'Einstein', 95);
```

### 4. Select Queries
```javascript
// Get all students
const students = db.prepare('SELECT * FROM students ORDER BY name').all();

// Get average
const avgResult = db.prepare('SELECT AVG(grade) as average FROM students').get();

// Count by section
const count = db.prepare('SELECT COUNT(*) as count FROM students WHERE section = ?').get('Einstein');
```

## File Structure

```
07-sqlite-basics/
├── app.js              # Main server with database setup
├── package.json        # Dependencies (better-sqlite3)
├── students.db         # SQLite database file (created automatically)
├── views/
│   ├── index.ejs       # Student list with stats
│   └── about.ejs       # Database info
└── README.md           # This file
```

## SQL Concepts Introduced

- `CREATE TABLE` - Define table structure
- `INTEGER PRIMARY KEY AUTOINCREMENT` - Auto-incrementing ID
- `TEXT NOT NULL` - Required text field
- `DATETIME DEFAULT CURRENT_TIMESTAMP` - Auto timestamp
- `SELECT * FROM table` - Get all records
- `SELECT AVG(column)` - Calculate average
- `SELECT COUNT(*)` - Count records
- `WHERE clause` - Filter results
- `ORDER BY` - Sort results

## Comparing to JSON

**JSON (Part 1):**
```javascript
const students = JSON.parse(fs.readFileSync('students.json'));
```

**SQLite (Part 2A):**
```javascript
const students = db.prepare('SELECT * FROM students').all();
```

**Why Database is Better:**
- ✅ Faster for large datasets
- ✅ Powerful queries (filter, sort, join)
- ✅ Data integrity (constraints, types)
- ✅ Concurrent access (multiple users)
- ✅ Relationships between tables

## Next Steps

In App 08, we'll add:
- ✅ CREATE (add new students)
- ✅ UPDATE (edit existing students)
- ✅ DELETE (remove students)

## Railway Deployment

1. Create volume in Railway dashboard
2. Set environment variable: `RAILWAY_VOLUME_MOUNT_PATH=/data`
3. Deploy - data will persist across restarts!

## Troubleshooting

**Error: Cannot find module 'better-sqlite3'**
- Run: `npm install`

**Error: Database is locked**
- Close other connections
- Restart the server

**Empty table on Railway**
- Check Railway logs
- Verify volume is mounted
- Sample data inserts on first run

## Try It

1. Run the app locally
2. Check `students.db` file created
3. Visit `/about` to see database details
4. Stop server, restart - data persists!
5. Compare speed to JSON file operations
