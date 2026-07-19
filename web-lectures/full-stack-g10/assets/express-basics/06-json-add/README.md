# 06 - Adding Data to JSON Files

This example demonstrates how to **add new data to JSON files** using HTML forms and POST requests.

## What's New in This Example

1. **HTML Forms** - Creating forms to collect user input
2. **POST Requests** - Handling form submissions on the server
3. **Writing JSON Files** - Using `fs.writeFileSync()` to save data
4. **Form Validation** - Basic HTML5 validation (required fields, number ranges)
5. **Redirects** - Redirecting users after successful form submission
6. **Middleware** - Using `express.urlencoded()` to parse form data

## Files

```
06-json-add/
├── app.js                    # Express server with POST route
├── package.json              # Dependencies
├── data/
│   └── students.json         # Student data (gets updated)
├── views/
│   ├── index.ejs             # Student list (home page)
│   ├── add-student.ejs       # Form to add new student
│   ├── about.ejs             # About page
│   └── partials/
│       ├── navbar.ejs        # Reusable navigation
│       └── footer.ejs        # Reusable footer
└── public/
    └── css/
        └── style.css         # Custom styles
```

## Key Concepts

### 1. Form Setup (HTML)

```html
<form action="/add-student" method="POST">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <input type="number" name="grade" min="0" max="100" required>
  <button type="submit">Add Student</button>
</form>
```

**Important attributes:**
- `action="/add-student"` - Where to send the data
- `method="POST"` - Use POST (not GET) for adding data
- `name="..."` - Keys for accessing data in Express
- `required` - HTML5 validation
- `min/max` - Number range validation

### 2. Express Middleware

```javascript
// MUST include this to parse form data!
app.use(express.urlencoded({ extended: true }));
```

Without this middleware, `req.body` will be undefined!

### 3. Handling POST Requests

```javascript
app.post('/add-student', (req, res) => {
  // 1. Read existing data
  const students = readJSONFile('students.json');
  
  // 2. Create new student
  const newStudent = {
    id: students.length + 1,
    name: req.body.name,      // From form input name="name"
    email: req.body.email,    // From form input name="email"
    grade: parseFloat(req.body.grade)  // Convert string to number
  };
  
  // 3. Add to array
  students.push(newStudent);
  
  // 4. Write back to file
  writeJSONFile('students.json', students);
  
  // 5. Redirect to home page
  res.redirect('/');
});
```

### 4. Writing JSON Files

```javascript
function writeJSONFile(filename, data) {
  const filePath = path.join(__dirname, 'data', filename);
  // Convert JavaScript object to JSON string with nice formatting
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
```

**Parameters for `JSON.stringify()`:**
- `data` - The JavaScript object/array to convert
- `null` - Replacer function (not used here)
- `2` - Indent with 2 spaces (makes it readable)

### 5. Auto-Incrementing IDs

```javascript
// Find highest existing ID and add 1
const newId = students.length > 0 
  ? Math.max(...students.map(s => s.id)) + 1 
  : 1;
```

This ensures unique IDs even if students are deleted.

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open browser:
   - View students: `http://localhost:3000/`
   - Add student: `http://localhost:3000/add-student`

4. Try adding a student through the form!

## Try It Yourself

1. **Add validation messages** - Show errors if data is invalid
2. **Add success messages** - Show "Student added successfully!"
3. **Add more fields** - Phone number, address, birthday
4. **Prevent duplicates** - Check if email already exists
5. **Add delete functionality** - Remove students from the list
6. **Add edit functionality** - Update existing student data

## Important Notes

### ⚠️ Data Type Conversions

Form data arrives as **strings**! You must convert:

```javascript
// ❌ WRONG - stores as string "95"
grade: req.body.grade

// ✅ CORRECT - converts to number 95
grade: parseFloat(req.body.grade)

// For integers
year: parseInt(req.body.year)
```

### 🔄 POST vs GET

| Method | Purpose | Data Location | Visible in URL? |
|--------|---------|---------------|-----------------|
| GET | Retrieve data | URL (query string) | ✅ Yes |
| POST | Send data | Request body | ❌ No |

**Use POST for:**
- Adding data
- Updating data
- Deleting data
- Sending passwords/sensitive data

**Use GET for:**
- Displaying pages
- Searching/filtering
- Navigation links

### 🔴 Limitations

1. **No concurrent writes** - If two users submit at the same time, data could be lost
2. **File corruption risk** - If server crashes during write, file could be corrupted
3. **No validation** - Any data can be saved (even invalid data)
4. **Performance** - Entire file is read/written on every request
5. **No transactions** - Can't roll back if something fails

### ✅ Best Practices

1. **Validate input** - Check data before saving
2. **Handle errors** - Wrap file operations in try/catch
3. **Backup data** - Keep copies of important JSON files
4. **Use database** - For production apps, use SQLite/PostgreSQL (Part 2!)

## Common Issues

**Problem:** `req.body is undefined`
```javascript
// Solution: Add middleware
app.use(express.urlencoded({ extended: true }));
```

**Problem:** Numbers saved as strings
```javascript
// Solution: Convert strings to numbers
grade: parseFloat(req.body.grade)
year: parseInt(req.body.year)
```

**Problem:** Form doesn't redirect after submit
```javascript
// Solution: Use res.redirect() not res.render()
res.redirect('/');  // ✅ Correct
res.render('index'); // ❌ Won't refresh data
```

**Problem:** JSON file becomes unreadable
```javascript
// Solution: Format JSON nicely
JSON.stringify(data, null, 2)  // Pretty format
```

## Next Steps

You've learned:
- ✅ Reading JSON files
- ✅ Displaying data in templates
- ✅ Creating HTML forms
- ✅ Handling POST requests
- ✅ Writing JSON files

**Next:** Build your mini-project! Choose from:
- 🏘️ Barangay Officials Directory
- 🎓 Class List Manager
- 🏪 Sari-Sari Store Inventory

Then deploy to Railway in Part 2!

## File Operations Summary

```javascript
// READ
const data = fs.readFileSync(filePath, 'utf-8');
const json = JSON.parse(data);

// WRITE
const jsonString = JSON.stringify(json, null, 2);
fs.writeFileSync(filePath, jsonString);

// APPEND (add to array)
json.push(newItem);

// DELETE (remove from array)
json = json.filter(item => item.id !== deleteId);

// UPDATE (modify existing)
const index = json.findIndex(item => item.id === updateId);
json[index] = updatedItem;
```
