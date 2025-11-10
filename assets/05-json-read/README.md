# 05 - Reading JSON Data

This example demonstrates how to **read data from JSON files** and display them in web pages using Express and EJS.

## What's New in This Example

1. **JSON Data Files** - Data stored in separate `.json` files in the `data/` folder
2. **File System Module** - Using Node's `fs` module to read files
3. **Multiple Routes** - Different pages for different data types
4. **Reusable Partials** - Navbar and footer as separate EJS files
5. **Data Calculations** - Computing statistics (averages, totals, percentages)

## Files

```
05-json-read/
├── app.js                    # Express server with file reading
├── package.json              # Dependencies
├── data/
│   ├── students.json         # Student data
│   ├── barangay.json         # Barangay officials data
│   └── products.json         # Store inventory data
├── views/
│   ├── students.ejs          # Student directory page
│   ├── barangay.ejs          # Barangay officials page
│   ├── products.ejs          # Store inventory page
│   ├── about.ejs             # About page
│   └── partials/
│       ├── navbar.ejs        # Reusable navigation
│       └── footer.ejs        # Reusable footer
└── public/
    └── css/
        └── style.css         # Custom styles
```

## Key Concepts

### Reading JSON Files

```javascript
const fs = require('fs');
const path = require('path');

// Read and parse JSON file
function readJSONFile(filename) {
  const filePath = path.join(__dirname, 'data', filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

// Use in route
app.get('/', (req, res) => {
  const students = readJSONFile('students.json');
  res.render('students', { students: students });
});
```

### EJS Partials (Reusable Components)

```ejs
<!-- Include navbar partial -->
<%- include('partials/navbar') %>

<!-- Page content here -->

<!-- Include footer partial -->
<%- include('partials/footer') %>
```

### Computing Statistics in EJS

```ejs
<!-- Count passing students -->
<%= students.filter(s => s.grade >= 75).length %>

<!-- Calculate average -->
<%= (students.reduce((sum, s) => sum + s.grade, 0) / students.length).toFixed(1) %>

<!-- Calculate percentage -->
<%= Math.round((passed / total) * 100) %>%
```

### Different Display Formats

**Table View** (students.ejs):
```ejs
<table class="table is-fullwidth is-striped is-hoverable">
  <tbody>
    <% students.forEach(student => { %>
      <tr>
        <td><%= student.name %></td>
        <td><%= student.grade %></td>
      </tr>
    <% }); %>
  </tbody>
</table>
```

**Card View** (barangay.ejs):
```ejs
<div class="columns is-multiline">
  <% officials.forEach(official => { %>
    <div class="column is-one-third">
      <div class="card">
        <div class="card-content">
          <p class="title is-5"><%= official.name %></p>
          <p class="subtitle is-6"><%= official.position %></p>
        </div>
      </div>
    </div>
  <% }); %>
</div>
```

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Visit the pages:
   - `http://localhost:3000/` - Student directory
   - `http://localhost:3000/barangay` - Barangay officials
   - `http://localhost:3000/products` - Store inventory
   - `http://localhost:3000/about` - About page

## Try It Yourself

1. **Edit the JSON files** - Add more students, officials, or products
2. **Add a new category** - Create `courses.json` and display it
3. **Add sorting** - Sort students by grade or name
4. **Add filtering** - Show only passed students or specific categories
5. **Create new calculations** - Find highest grade, most expensive product, etc.

## Understanding the Code

### app.js Breakdown

```javascript
// Import required modules
const fs = require('fs');              // File system (reading files)
const path = require('path');          // Path manipulation

// Helper function to read JSON
function readJSONFile(filename) {
  const filePath = path.join(__dirname, 'data', filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

// Route using the helper
app.get('/', (req, res) => {
  const students = readJSONFile('students.json');  // Read file
  res.render('students', { students: students });   // Pass to template
});
```

### JSON File Structure

```json
[
  {
    "id": 1,
    "name": "Maria Santos",
    "course": "BSIT",
    "grade": 95
  },
  {
    "id": 2,
    "name": "Juan Dela Cruz",
    "course": "BSCS",
    "grade": 88
  }
]
```

## Important Notes

⚠️ **Limitations of JSON Files:**
- Data is read fresh on every request (no caching)
- All data must fit in memory
- No concurrent write safety
- No query capabilities (must load entire file)

✅ **Good for:**
- Small datasets (< 1000 records)
- Configuration files
- Learning and prototyping
- Read-mostly applications

🔴 **Not good for:**
- Large datasets
- Frequent writes
- Multiple users editing simultaneously
- Production applications

## Next Steps

See `06-json-add` to learn how to **add new data** to JSON files using forms!

## Common Issues

**Problem:** `ENOENT: no such file or directory`
- **Solution:** Make sure the `data/` folder and JSON files exist

**Problem:** `Unexpected token in JSON`
- **Solution:** Check your JSON syntax - use a JSON validator

**Problem:** Changes to JSON file don't appear
- **Solution:** Restart the server (Ctrl+C then `npm start`)
