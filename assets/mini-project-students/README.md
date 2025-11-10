# 🎓 Class List Manager

A complete web application for managing student records with performance tracking and statistics.

## 📋 Project Description

The Class List Manager is a comprehensive system for educators to manage student enrollment, track academic performance, and analyze class statistics. It features a clean, modern interface with real-time calculations and grade-based insights.

## 🎯 Key Features

### 1. **Student Roster**
- View all enrolled students in a sortable table
- Automatic sorting by grade (highest to lowest)
- Color-coded grade tags (Excellent to Failed)
- Top student highlighting (🏆 trophy icon)
- Student ID, course, year level, and contact info display

### 2. **Enrollment System**
- User-friendly form for adding students
- Built-in validation (Student ID format, grade range)
- Course selection (BSIT, BSCS, BSIS, BSCpE, BSEMC)
- Year level selection (1st to 5th year)
- Email validation

### 3. **Performance Analytics**
- **Total Students** - Count of enrolled students
- **Passing Rate** - Percentage of students with grade ≥ 75
- **Average Grade** - Class mean performance
- **Highest Grade** - Top student achievement
- **Grade Distribution** - Breakdown by performance brackets:
  - Excellent (95-100)
  - Very Good (90-94)
  - Good (80-89)
  - Passed (75-79)
  - Failed (Below 75)

## 📁 Project Structure

```
mini-project-students/
├── app.js                    # Express server with statistics
├── package.json              # Dependencies
├── data/
│   └── students.json         # Student records
├── views/
│   ├── index.ejs             # Student list with stats
│   ├── add.ejs               # Enrollment form
│   ├── about.ejs             # System information
│   └── partials/
│       ├── navbar.ejs        # Navigation
│       └── footer.ejs        # Footer
└── public/
    └── css/
        └── style.css         # Custom styles with stat boxes
```

## 🚀 How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

4. **Development mode:**
   ```bash
   npm run dev
   ```

## 📊 Grading Scale

| Grade Range | Rating | Description |
|------------|--------|-------------|
| 95-100 | ⭐ Excellent | Outstanding performance |
| 90-94 | 👍 Very Good | Above expectations |
| 80-89 | ✓ Good | Meets expectations |
| 75-79 | 📚 Passed | Satisfactory |
| Below 75 | ❌ Failed | Needs improvement |

## 💾 Data Structure

### students.json
```json
{
  "id": 1,
  "name": "Maria Santos",
  "studentId": "2021-00001",
  "course": "BSIT",
  "year": 3,
  "grade": 95,
  "email": "maria.santos@example.com"
}
```

## ✨ Technical Highlights

### Real-Time Statistics
```javascript
const stats = {
  total: students.length,
  passing: students.filter(s => s.grade >= 75).length,
  average: (students.reduce((sum, s) => sum + s.grade, 0) / students.length).toFixed(2),
  highest: Math.max(...students.map(s => s.grade))
};
```

### Automatic Sorting
Students are automatically sorted by grade (highest first):
```javascript
students.sort((a, b) => b.grade - a.grade)
```

### Form Validation
- Student ID pattern: `2023-00123` (YYYY-NNNNN)
- Grade range: 0-100 (with decimal support)
- Email format validation
- Required field checks

## 🎨 Customization Ideas

1. **Search & Filter** - Add search by name, course, or grade range
2. **Sorting Options** - Sort by name, ID, or enrollment date
3. **Export Data** - Download class list as CSV/PDF
4. **Student Profiles** - Detailed view for each student
5. **Grade Calculator** - Automatic grade computation from components
6. **Attendance Tracking** - Add attendance records
7. **Progress Reports** - Generate performance reports
8. **Email Integration** - Send grades to students

## ⚠️ Known Limitations

1. **No database** - Uses JSON files (not scalable)
2. **No authentication** - Open access to all features
3. **No edit/delete** - Only Read and Add operations
4. **No concurrent writes** - File corruption risk
5. **No audit trail** - Changes are not logged
6. **No backup** - Single JSON file as storage

**Solution:** Part 2 will use SQLite database with full CRUD operations and authentication!

## 🐛 Troubleshooting

**Problem:** Statistics showing NaN
```javascript
// Check if students array is empty before calculations
const average = students.length > 0 
  ? (students.reduce((sum, s) => sum + s.grade, 0) / students.length).toFixed(2)
  : 0;
```

**Problem:** Student ID validation failing
```
Format must be: YYYY-NNNNN
Example: 2023-00123
Pattern: [0-9]{4}-[0-9]{5}
```

**Problem:** Grade not displaying correctly
```javascript
// Ensure grade is parsed as float, not string
grade: parseFloat(req.body.grade)
```

## 🔧 Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework  
- **EJS** - Template engine
- **Bulma CSS** - UI framework with enhanced stat boxes
- **JSON** - Data storage

## 📚 Learning Objectives

This project teaches:
1. **Data Aggregation** - Computing statistics (sum, average, max, min)
2. **Array Operations** - Sorting, filtering, mapping, reducing
3. **Conditional Logic** - Grade brackets and performance ratings
4. **Form Validation** - Pattern matching and range validation
5. **Dynamic Rendering** - Conditional styling based on data
6. **Responsive Design** - Mobile-friendly statistics dashboard

## 🎓 For Students

This mini-project is perfect for practicing:
- Building full-stack applications
- Working with forms and validation
- Performing calculations in JavaScript
- Creating dynamic user interfaces
- Understanding educational management systems

Good luck and happy coding! 🚀
