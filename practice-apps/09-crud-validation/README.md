# Practice App 09: CRUD with Validation & Flash Messages

**Topics:** Server-side validation, flash messages, data integrity, user feedback

---

## 📚 What You'll Learn

This app builds on App 08 by adding:
- **Server-side validation** before database operations
- **Flash messages** for user feedback (success/error notifications)
- **Unique constraints** and duplicate checking
- **Business rules** enforcement (e.g., available ≤ total copies)
- **Form data preservation** when validation fails

---

## 🎯 Learning Objectives

By the end of this practice app, you will:
1. Implement server-side validation functions
2. Use `connect-flash` for temporary messages across redirects
3. Check for duplicate data (ISBN uniqueness)
4. Enforce business logic rules
5. Display validation errors to users
6. Preserve form data when validation fails

---

## 🚀 Getting Started

### Installation
```bash
cd practice-apps/09-crud-validation
npm install
```

### Run the App
```bash
node app.js
```

Visit: `http://localhost:3000`

---

## 📖 Key Concepts

### 1. Server-Side Validation

**Why validate on the server?**
- Client-side validation (HTML5 `required`, `pattern`) can be bypassed
- Server is the last line of defense
- Ensures data integrity in the database

**Validation function pattern:**
```javascript
function validateBook(data) {
  const errors = [];
  
  // Check each field
  if (!data.title || data.title.trim().length < 2) {
    errors.push('Title must be at least 2 characters');
  }
  
  // Return all errors at once
  return errors;
}
```

### 2. Flash Messages

Flash messages are **temporary messages** stored in the session:
- Set in one request (e.g., after saving)
- Retrieved in the next request (e.g., redirect to list)
- Automatically cleared after retrieval

**Setup:**
```javascript
const session = require('express-session');
const flash = require('connect-flash');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(flash());
```

**Usage:**
```javascript
// Set a flash message
req.flash('success', 'Book added successfully!');
req.flash('error', 'Invalid ISBN format');

// Retrieve in next request
res.render('index', {
  success: req.flash('success'),
  error: req.flash('error')
});
```

### 3. Duplicate Checking

Before inserting, check if data already exists:

```javascript
function checkDuplicateISBN(isbn, excludeId = null) {
  let query = 'SELECT id FROM books WHERE isbn = ?';
  const params = [isbn];
  
  // When editing, exclude current book
  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }
  
  const existing = db.prepare(query).get(...params);
  return existing !== undefined;
}
```

### 4. Form Data Preservation

When validation fails, preserve the user's input:

```javascript
// Validation failed
req.flash('error', errors);
return res.render('add', {
  error: req.flash('error'),
  formData: req.body  // Pass back what user typed
});
```

In the view:
```html
<input type="text" name="title" 
       value="<%= typeof formData !== 'undefined' ? formData.title || '' : '' %>">
```

---

## 🔍 Code Walkthrough

### Validation Function

```javascript
function validateBook(data) {
  const errors = [];
  
  // 1. Title: 2-200 characters
  if (!data.title || data.title.trim().length < 2 || data.title.trim().length > 200) {
    errors.push('Title must be between 2-200 characters');
  }
  
  // 2. Author: 2-100 characters
  if (!data.author || data.author.trim().length < 2 || data.author.trim().length > 100) {
    errors.push('Author must be between 2-100 characters');
  }
  
  // 3. ISBN: Must match 978-XXXXXXXXXX format
  const isbnRegex = /^978-\d{10}$/;
  if (!data.isbn || !isbnRegex.test(data.isbn)) {
    errors.push('ISBN must be in format 978-XXXXXXXXXX');
  }
  
  // 4. Copies: 1-1000
  const copies = parseInt(data.copies);
  if (isNaN(copies) || copies < 1 || copies > 1000) {
    errors.push('Total copies must be between 1-1000');
  }
  
  // 5. Available: 0-1000, cannot exceed total copies
  const available = parseInt(data.available);
  if (isNaN(available) || available < 0 || available > 1000) {
    errors.push('Available copies must be between 0-1000');
  } else if (available > copies) {
    errors.push('Available copies cannot exceed total copies');
  }
  
  // 6. Category: Must be from predefined list
  const validCategories = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Reference'];
  if (!data.category || !validCategories.includes(data.category)) {
    errors.push('Please select a valid category');
  }
  
  return errors;
}
```

### Add Route with Validation

```javascript
app.post('/add', (req, res) => {
  // 1. Validate all fields
  const errors = validateBook(req.body);
  
  // 2. Check for duplicate ISBN
  if (checkDuplicateISBN(req.body.isbn)) {
    errors.push('A book with this ISBN already exists');
  }
  
  // 3. If errors, show them to user
  if (errors.length > 0) {
    req.flash('error', errors);
    return res.render('add', {
      error: req.flash('error'),
      formData: req.body  // Preserve user input
    });
  }
  
  // 4. All valid - insert into database
  const stmt = db.prepare(`
    INSERT INTO books (title, author, isbn, copies, available, category)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    req.body.title.trim(),
    req.body.author.trim(),
    req.body.isbn,
    parseInt(req.body.copies),
    parseInt(req.body.available),
    req.body.category
  );
  
  // 5. Success! Redirect with flash message
  req.flash('success', 'Book added successfully!');
  res.redirect('/');
});
```

### Edit Route with Validation

```javascript
app.post('/edit/:id', (req, res) => {
  const id = req.params.id;
  
  // 1. Validate all fields
  const errors = validateBook(req.body);
  
  // 2. Check for duplicate ISBN (exclude current book)
  if (checkDuplicateISBN(req.body.isbn, id)) {
    errors.push('Another book with this ISBN already exists');
  }
  
  // 3. If errors, show them to user
  if (errors.length > 0) {
    req.flash('error', errors);
    
    // Get current book data to show in form
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
    
    // Merge with submitted data (user's edits take precedence)
    const mergedData = { ...book, ...req.body };
    
    return res.render('edit', {
      error: req.flash('error'),
      book: mergedData
    });
  }
  
  // 4. All valid - update database
  const stmt = db.prepare(`
    UPDATE books
    SET title = ?, author = ?, isbn = ?, copies = ?, available = ?, category = ?
    WHERE id = ?
  `);
  
  stmt.run(
    req.body.title.trim(),
    req.body.author.trim(),
    req.body.isbn,
    parseInt(req.body.copies),
    parseInt(req.body.available),
    req.body.category,
    id
  );
  
  // 5. Success!
  req.flash('success', 'Book updated successfully!');
  res.redirect('/');
});
```

---

## 🎨 UI/UX Features

### Flash Message Display

```html
<!-- Success messages (green) -->
<% if (success && success.length > 0) { %>
  <div class="notification is-success is-light">
    <button class="delete"></button>
    <%= success[0] %>
  </div>
<% } %>

<!-- Error messages (red, can show multiple) -->
<% if (error && error.length > 0) { %>
  <div class="notification is-danger is-light">
    <button class="delete"></button>
    <ul>
      <% error.forEach(err => { %>
        <li><%= err %></li>
      <% }); %>
    </ul>
  </div>
<% } %>
```

### Auto-Dismiss Notifications

```javascript
// Auto-hide after 5 seconds
setTimeout(() => {
  document.querySelectorAll('.notification').forEach(notif => {
    notif.style.display = 'none';
  });
}, 5000);
```

### Input Error Highlighting

```html
<input 
  class="input <%= error && error.some(e => e.includes('Title')) ? 'is-danger' : '' %>" 
  type="text" 
  name="title">
```

If any error contains the word "Title", the input gets a red border.

---

## 📊 Validation Rules

| Field | Rules |
|-------|-------|
| **Title** | 2-200 characters, required, trimmed |
| **Author** | 2-100 characters, required, trimmed |
| **ISBN** | Format: `978-XXXXXXXXXX`, unique across all books |
| **Copies** | Integer, 1-1000, required |
| **Available** | Integer, 0-1000, must be ≤ total copies |
| **Category** | Must be from predefined list |

---

## 🔐 Why This Matters

### Data Integrity
- Prevents invalid data from entering your database
- Enforces business rules (available ≤ total)
- Catches user mistakes before they cause problems

### User Experience
- Clear error messages tell users what went wrong
- Form data is preserved (no need to retype everything)
- Success messages confirm actions completed

### Security
- Server-side validation can't be bypassed
- Input sanitization (trim, parseInt) prevents injection
- Duplicate checking prevents data conflicts

---

## 🧪 Testing Checklist

### Validation Tests

**Test invalid title:**
- [ ] Leave title blank → should show error
- [ ] Enter 1 character → should show error
- [ ] Enter 201 characters → should show error
- [ ] Enter valid title → should work

**Test invalid ISBN:**
- [ ] Enter `123-4567890123` → should reject (wrong prefix)
- [ ] Enter `978-12345` → should reject (too short)
- [ ] Enter `978-12345678901` → should reject (too long)
- [ ] Enter `978-123456789X` → should reject (contains letter)
- [ ] Add duplicate ISBN → should reject
- [ ] Edit book and keep same ISBN → should work

**Test available copies:**
- [ ] Set available > total → should reject
- [ ] Set available = total → should work
- [ ] Set available = 0 → should work

### Flash Message Tests

- [ ] Add book successfully → should show green success message
- [ ] Add book with errors → should show red error list
- [ ] Refresh page → flash messages should disappear
- [ ] Messages should auto-hide after 5 seconds

### Form Preservation Tests

- [ ] Submit invalid form → all fields should keep their values
- [ ] Error only in one field → other fields unchanged
- [ ] Valid submission → form clears (because of redirect)

---

## 🎓 Key Takeaways

1. **Always validate on the server** - client-side validation is for UX, not security
2. **Collect all errors at once** - don't make users submit multiple times
3. **Flash messages survive redirects** - perfect for Post-Redirect-Get pattern
4. **Preserve form data on errors** - don't make users retype everything
5. **Check for duplicates before inserting** - prevents database errors
6. **Enforce business rules** - validation isn't just about data types

---

## 🔗 Related Concepts

- **App 08**: Simple CRUD without validation (compare the difference)
- **App 10**: We'll add relationships between tables
- **Part 2B**: Authentication will use similar validation techniques
- **Part 2C**: Audit logging will track validation failures

---

## 🎯 Practice Challenges

### Easy
1. Add a `published_year` field with validation (1000-2024)
2. Change success messages to auto-hide after 3 seconds
3. Add a character counter for title field

### Medium
4. Add a "Description" field with 10-500 character limit
5. Validate that author name contains at least one space (first + last name)
6. Add duplicate checking for title (case-insensitive)

### Hard
7. Add a preview mode: show all data before final submit
8. Implement "undo" functionality with flash messages
9. Add validation for multiple books at once (bulk import)

---

## 📚 Next Steps

**App 10: Relationships**
- We'll learn how to link tables together
- Students belong to Sections (one-to-many relationship)
- JOIN queries to display related data

**Advanced validation concepts in Part 2B:**
- Password strength validation
- Email format validation
- File type validation (if user uploads)

**Production tips:**
- Use a validation library like Joi or Yup for complex apps
- Log validation failures for security monitoring
- Consider rate limiting to prevent spam submissions

---

## 🐛 Common Issues

### Issue: Flash messages not appearing
**Solution:** Make sure session middleware comes before flash middleware:
```javascript
app.use(session({...}));  // Must be first
app.use(flash());          // Then flash
```

### Issue: Form data not preserved
**Solution:** Check that you're passing `formData: req.body` in the render:
```javascript
res.render('add', { formData: req.body });
```

### Issue: Duplicate ISBN still allowed
**Solution:** Check you're calling `checkDuplicateISBN()` before insert:
```javascript
if (checkDuplicateISBN(req.body.isbn)) {
  errors.push('ISBN already exists');
}
```

---

## 🎉 You Did It!

You now understand server-side validation - a critical skill for **every** web application. This is what separates toy projects from production-ready apps.

**What you built:**
- ✅ Server-side validation functions
- ✅ Flash message system for user feedback
- ✅ Duplicate detection logic
- ✅ Business rule enforcement
- ✅ Form data preservation on errors

**Ready for the next challenge?** → App 10: Database Relationships
