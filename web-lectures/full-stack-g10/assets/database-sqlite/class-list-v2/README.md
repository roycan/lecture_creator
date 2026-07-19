# Class List v2.0

A modern web application for managing student class lists with SQLite database.

## ✨ Features

- ✅ **Full CRUD Operations:** Create, Read, Update, Delete students
- ✅ **SQLite Database:** Persistent data storage with relationships
- ✅ **Search Functionality:** Find students by name or student ID
- ✅ **Filter by Section:** View students from specific sections
- ✅ **Foreign Key Relationships:** Students linked to sections
- ✅ **Input Validation:** Age constraints, unique student IDs
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
- Create tables (sections, students)
- Insert sample data (3 sections, 8 students)

### 3. Run Application

```bash
npm start
```

Visit: **http://localhost:3000**

## 📁 Project Structure

```
class-list-v2/
├── app.js                  # Main application
├── package.json            # Dependencies
├── .gitignore             # Git ignore rules
├── README.md              # This file
├── database/
│   └── setup-database.js  # Database setup script
├── data/
│   └── classlist.db       # SQLite database (created on setup)
└── views/
    ├── index.ejs          # Main student list
    ├── add.ejs            # Add student form
    ├── edit.ejs           # Edit student form
    └── view.ejs           # View student details
```

## 🗄️ Database Schema

### `sections` Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL, UNIQUE |
| adviser | TEXT | NOT NULL |
| room | TEXT | - |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### `students` Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| student_id | TEXT | NOT NULL, UNIQUE |
| name | TEXT | NOT NULL |
| age | INTEGER | NOT NULL, CHECK (age >= 5 AND age <= 100) |
| section_id | INTEGER | NOT NULL, FOREIGN KEY |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

**Relationship:** Each student belongs to one section (one-to-many)

## 🎯 Available Routes

### Main Routes

- `GET /` - List all students
- `GET /add` - Show add student form
- `POST /add` - Create new student
- `GET /student/:id` - View student details
- `GET /edit/:id` - Show edit student form
- `POST /edit/:id` - Update student
- `POST /delete/:id` - Delete student

### Filter Routes

- `GET /search?q=query` - Search students by name/student ID
- `GET /section/:id` - Filter students by section

## 💡 Usage Examples

### Add New Student

1. Click "➕ Add New Student"
2. Fill in the form:
   - Student ID: `2024-009`
   - Full Name: `Juan Dela Cruz`
   - Age: `16`
   - Section: Select from dropdown
3. Click "✓ Add Student"

### Search Students

Use the search box to find students by name or student ID:
```
Search: "Juan" → Finds all students named Juan
Search: "2024-001" → Finds student with that ID
```

### Filter by Section

Use the section dropdown to view students from a specific section.

### Edit Student

1. Click "✏️ Edit" next to a student
2. Update the information
3. Click "✓ Save Changes"

### Delete Student

1. Click "🗑️ Delete" next to a student
2. Confirm the deletion
3. Student will be permanently removed

## 🔧 Configuration

### Change Port

Edit `app.js`:
```javascript
const PORT = 3000; // Change to your desired port
```

### Database Location

Edit `database/setup-database.js`:
```javascript
const dbPath = path.join(__dirname, '..', 'data', 'classlist.db');
```

## 🚢 Deployment to Railway

### 1. Add Volume

In Railway dashboard:
- Mount path: `/data`
- Name: `classlist-database`

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

**Sections:**
- 10-A (Ms. Garcia, Room 101)
- 10-B (Mr. Santos, Room 102)
- 10-C (Mrs. Cruz, Room 103)

**Students:**
- 8 students distributed across 3 sections
- Student IDs: 2024-001 through 2024-008
- Ages: 15-17 years old

## 🛡️ Validation Rules

- **Student ID:** Required, must be unique
- **Name:** Required, any text
- **Age:** Required, 5-100
- **Section:** Required, must exist in database

## 🐛 Troubleshooting

### Database Not Found

Run setup first:
```bash
npm run setup
```

### Student ID Already Exists

Each student must have a unique student ID. Try a different ID or edit the existing student.

### Foreign Key Constraint Failed

This means you're trying to add a student with an invalid section_id. Make sure the section exists in the database first.

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
| Student IDs | Optional | Required & unique |
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
