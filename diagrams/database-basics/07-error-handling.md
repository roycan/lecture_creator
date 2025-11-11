# Database Diagram 07: Error Handling Patterns

**Purpose:** Common database errors and how to handle them gracefully

**Format:** Error scenarios with detection and recovery patterns

---

## The Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATABASE ERROR HANDLING                             │
│              (Common Errors, Detection, Recovery Patterns)               │
└─────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
 CONSTRAINT VIOLATION ERRORS
═══════════════════════════════════════════════════════════════════════════

ERROR 1: UNIQUE Constraint Failed
────────────────────────────────────────────────────────────────

SCENARIO:
  User tries to register with existing email

ERROR MESSAGE:
  SqliteError: UNIQUE constraint failed: users.email

CODE THAT TRIGGERS:
────────────────────────────────────────────────────────────────

db.prepare(`
  INSERT INTO users (email, password_hash)
  VALUES (?, ?)
`).run('john@example.com', hashedPassword);
// Error if john@example.com already exists


DETECTION PATTERN:
────────────────────────────────────────────────────────────────

try {
  db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
    .run(email, hashedPassword);
  
  req.flash('success', 'Account created!');
  res.redirect('/login');
  
} catch (err) {
  if (err.message.includes('UNIQUE constraint failed')) {
    req.flash('error', 'Email already registered');
    return res.redirect('/register');
  }
  
  // Other errors
  console.error(err);
  res.status(500).send('Something went wrong');
}


PREVENTION PATTERN (Check Before Insert):
────────────────────────────────────────────────────────────────

// Better: Check existence first
const existing = db.prepare('SELECT id FROM users WHERE email = ?')
  .get(email);

if (existing) {
  req.flash('error', 'Email already registered');
  return res.redirect('/register');
}

// Safe to insert
db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
  .run(email, hashedPassword);


USER-FRIENDLY MESSAGE:
────────────────────────────────────────────────────────────────

❌ "SqliteError: UNIQUE constraint failed: users.email"
✅ "This email is already registered. Please login or use another email."


───────────────────────────────────────────────────────────────────────────

ERROR 2: NOT NULL Constraint Failed
────────────────────────────────────────────────────────────────

SCENARIO:
  Required field not provided

ERROR MESSAGE:
  SqliteError: NOT NULL constraint failed: students.first_name

CODE THAT TRIGGERS:
────────────────────────────────────────────────────────────────

db.prepare(`
  INSERT INTO students (first_name, last_name, section_id)
  VALUES (?, ?, ?)
`).run(null, 'Cruz', 1);  // first_name is NULL


DETECTION PATTERN:
────────────────────────────────────────────────────────────────

try {
  db.prepare('INSERT INTO students (first_name, last_name) VALUES (?, ?)')
    .run(req.body.first_name, req.body.last_name);
    
} catch (err) {
  if (err.message.includes('NOT NULL constraint failed')) {
    // Extract which column failed
    const column = err.message.match(/students\.(\w+)/)?.[1];
    req.flash('error', `${column} is required`);
    return res.redirect('/students/add');
  }
}


PREVENTION PATTERN (Validate First):
────────────────────────────────────────────────────────────────

function validateStudent(data) {
  const errors = [];
  
  if (!data.first_name || data.first_name.trim().length === 0) {
    errors.push('First name is required');
  }
  
  if (!data.last_name || data.last_name.trim().length === 0) {
    errors.push('Last name is required');
  }
  
  return errors;
}

// Use in route
const errors = validateStudent(req.body);
if (errors.length > 0) {
  req.flash('error', errors);
  return res.redirect('/students/add');
}

// Safe to insert (all required fields present)


───────────────────────────────────────────────────────────────────────────

ERROR 3: FOREIGN KEY Constraint Failed
────────────────────────────────────────────────────────────────

SCENARIO:
  Inserting student with non-existent section_id

ERROR MESSAGE:
  SqliteError: FOREIGN KEY constraint failed

CODE THAT TRIGGERS:
────────────────────────────────────────────────────────────────

db.prepare(`
  INSERT INTO students (first_name, last_name, section_id)
  VALUES (?, ?, ?)
`).run('Juan', 'Cruz', 999);  // Section 999 doesn't exist


DETECTION PATTERN:
────────────────────────────────────────────────────────────────

try {
  db.prepare('INSERT INTO students (...) VALUES (?, ?, ?)')
    .run(firstName, lastName, sectionId);
    
} catch (err) {
  if (err.message.includes('FOREIGN KEY constraint failed')) {
    req.flash('error', 'Invalid section selected');
    return res.redirect('/students/add');
  }
}


PREVENTION PATTERN (Validate Foreign Key):
────────────────────────────────────────────────────────────────

function validateSectionExists(sectionId) {
  const section = db.prepare('SELECT id FROM sections WHERE id = ?')
    .get(sectionId);
  return section !== undefined;
}

// Use in route
if (!validateSectionExists(req.body.section_id)) {
  req.flash('error', 'Invalid section selected');
  return res.redirect('/students/add');
}

// Safe to insert


───────────────────────────────────────────────────────────────────────────

ERROR 4: CHECK Constraint Failed
────────────────────────────────────────────────────────────────

SCENARIO:
  Age outside allowed range

ERROR MESSAGE:
  SqliteError: CHECK constraint failed: students

CODE THAT TRIGGERS:
────────────────────────────────────────────────────────────────

CREATE TABLE students (
  age INTEGER CHECK (age >= 0 AND age <= 120)
);

db.prepare('INSERT INTO students (age) VALUES (?)')
  .run(-5);  // Invalid age


DETECTION PATTERN:
────────────────────────────────────────────────────────────────

try {
  db.prepare('INSERT INTO students (age) VALUES (?)').run(age);
  
} catch (err) {
  if (err.message.includes('CHECK constraint failed')) {
    req.flash('error', 'Invalid age (must be 0-120)');
    return res.redirect('/students/add');
  }
}


PREVENTION PATTERN:
────────────────────────────────────────────────────────────────

function validateAge(age) {
  const parsed = parseInt(age);
  if (isNaN(parsed)) {
    return 'Age must be a number';
  }
  if (parsed < 0 || parsed > 120) {
    return 'Age must be between 0-120';
  }
  return null;  // Valid
}

// Use in route
const ageError = validateAge(req.body.age);
if (ageError) {
  req.flash('error', ageError);
  return res.redirect('/students/add');
}


═══════════════════════════════════════════════════════════════════════════
 QUERY RESULT ERRORS
═══════════════════════════════════════════════════════════════════════════

ERROR 5: Record Not Found
────────────────────────────────────────────────────────────────

SCENARIO:
  Trying to edit/delete non-existent record

PATTERN:
────────────────────────────────────────────────────────────────

app.get('/students/edit/:id', (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE id = ?')
    .get(req.params.id);
  
  if (!student) {
    req.flash('error', 'Student not found');
    return res.redirect('/students');
  }
  
  res.render('edit', { student });
});


DELETE PATTERN (Check Before Delete):
────────────────────────────────────────────────────────────────

app.post('/students/delete/:id', (req, res) => {
  // Get student name for confirmation message
  const student = db.prepare('SELECT first_name, last_name FROM students WHERE id = ?')
    .get(req.params.id);
  
  if (!student) {
    req.flash('error', 'Student not found');
    return res.redirect('/students');
  }
  
  // Delete
  const result = db.prepare('DELETE FROM students WHERE id = ?')
    .run(req.params.id);
  
  if (result.changes === 0) {
    req.flash('error', 'Delete failed');
    return res.redirect('/students');
  }
  
  req.flash('success', `${student.first_name} ${student.last_name} deleted`);
  res.redirect('/students');
});


UPDATE PATTERN (Check Changes):
────────────────────────────────────────────────────────────────

app.post('/students/edit/:id', (req, res) => {
  const result = db.prepare(`
    UPDATE students
    SET first_name = ?, last_name = ?
    WHERE id = ?
  `).run(req.body.first_name, req.body.last_name, req.params.id);
  
  if (result.changes === 0) {
    req.flash('error', 'Student not found or no changes made');
    return res.redirect('/students');
  }
  
  req.flash('success', 'Student updated successfully');
  res.redirect('/students');
});


═══════════════════════════════════════════════════════════════════════════
 DATABASE CONNECTION ERRORS
═══════════════════════════════════════════════════════════════════════════

ERROR 6: Database Locked
────────────────────────────────────────────────────────────────

SCENARIO:
  Another process is writing to database

ERROR MESSAGE:
  SqliteError: database is locked

CAUSE:
  SQLite locks entire database during writes
  Multiple simultaneous writes can cause conflicts


SOLUTION 1: Retry Logic
────────────────────────────────────────────────────────────────

function queryWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return fn();
    } catch (err) {
      if (err.message.includes('database is locked') && i < maxRetries - 1) {
        // Wait and retry
        const delay = Math.pow(2, i) * 100;  // Exponential backoff
        const waitUntil = Date.now() + delay;
        while (Date.now() < waitUntil) {}  // Busy wait
        continue;
      }
      throw err;  // Give up
    }
  }
}

// Usage
try {
  const result = queryWithRetry(() => {
    return db.prepare('INSERT INTO students (...) VALUES (...)').run(...);
  });
} catch (err) {
  console.error('Query failed after retries:', err);
}


SOLUTION 2: Better-sqlite3 Options
────────────────────────────────────────────────────────────────

const db = new Database('school.db', {
  timeout: 5000  // Wait up to 5 seconds for lock to release
});


───────────────────────────────────────────────────────────────────────────

ERROR 7: Database File Not Found
────────────────────────────────────────────────────────────────

SCENARIO:
  Database file doesn't exist or wrong path

ERROR MESSAGE:
  Error: ENOENT: no such file or directory

SOLUTION: Create Database if Missing
────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');

// Create directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database (better-sqlite3 creates file automatically)
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ...
  );
`);


═══════════════════════════════════════════════════════════════════════════
 ERROR HANDLING BEST PRACTICES
═══════════════════════════════════════════════════════════════════════════

PATTERN 1: Centralized Error Handler
────────────────────────────────────────────────────────────────

function handleDatabaseError(err, req, res) {
  console.error('Database error:', err);
  
  // Constraint violations
  if (err.message.includes('UNIQUE constraint failed')) {
    const column = err.message.match(/\w+\.(\w+)/)?.[1];
    req.flash('error', `${column} already exists`);
    return res.redirect('back');
  }
  
  if (err.message.includes('NOT NULL constraint failed')) {
    const column = err.message.match(/\w+\.(\w+)/)?.[1];
    req.flash('error', `${column} is required`);
    return res.redirect('back');
  }
  
  if (err.message.includes('FOREIGN KEY constraint failed')) {
    req.flash('error', 'Invalid reference');
    return res.redirect('back');
  }
  
  // Generic error
  req.flash('error', 'Something went wrong');
  res.redirect('back');
}

// Usage in routes
app.post('/students/add', (req, res) => {
  try {
    db.prepare('INSERT INTO students (...) VALUES (...)').run(...);
    res.redirect('/students');
  } catch (err) {
    handleDatabaseError(err, req, res);
  }
});


PATTERN 2: Validation Before Database
────────────────────────────────────────────────────────────────

// Always validate BEFORE hitting database

function validateStudent(data) {
  const errors = [];
  
  // Required fields
  if (!data.first_name?.trim()) errors.push('First name is required');
  if (!data.last_name?.trim()) errors.push('Last name is required');
  
  // Format validation
  if (data.email && !isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }
  
  // Range validation
  const age = parseInt(data.age);
  if (isNaN(age) || age < 0 || age > 120) {
    errors.push('Age must be between 0-120');
  }
  
  // Foreign key validation
  if (!validateSectionExists(data.section_id)) {
    errors.push('Invalid section');
  }
  
  return errors;
}

// Route
app.post('/students/add', (req, res) => {
  const errors = validateStudent(req.body);
  
  if (errors.length > 0) {
    req.flash('error', errors);
    return res.render('add', { formData: req.body });
  }
  
  // Validation passed, database insert should succeed
  try {
    db.prepare('INSERT INTO students (...) VALUES (...)').run(...);
    res.redirect('/students');
  } catch (err) {
    // Should rarely happen if validation is good
    console.error('Unexpected database error:', err);
    req.flash('error', 'Something went wrong');
    res.redirect('/students/add');
  }
});


PATTERN 3: Logging Errors
────────────────────────────────────────────────────────────────

function logError(err, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
    context
  };
  
  // Log to console
  console.error(JSON.stringify(logEntry, null, 2));
  
  // Optional: Log to file
  fs.appendFileSync('errors.log', JSON.stringify(logEntry) + '\n');
  
  // Optional: Log to database
  try {
    db.prepare(`
      INSERT INTO error_logs (message, stack, context, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(err.message, err.stack, JSON.stringify(context));
  } catch (logErr) {
    // Don't throw if logging fails
    console.error('Failed to log error:', logErr);
  }
}

// Usage
app.post('/students/add', (req, res) => {
  try {
    db.prepare('INSERT INTO students (...) VALUES (...)').run(...);
    res.redirect('/students');
  } catch (err) {
    logError(err, {
      route: '/students/add',
      body: req.body,
      user: req.session.userId
    });
    
    req.flash('error', 'Something went wrong');
    res.redirect('/students/add');
  }
});


PATTERN 4: User-Friendly Messages
────────────────────────────────────────────────────────────────

// Convert technical errors to user-friendly messages

function getUserMessage(err) {
  if (err.message.includes('UNIQUE constraint')) {
    return 'This information is already registered';
  }
  
  if (err.message.includes('NOT NULL constraint')) {
    return 'Please fill in all required fields';
  }
  
  if (err.message.includes('FOREIGN KEY constraint')) {
    return 'Invalid selection';
  }
  
  if (err.message.includes('CHECK constraint')) {
    return 'Invalid value provided';
  }
  
  if (err.message.includes('database is locked')) {
    return 'System is busy, please try again';
  }
  
  // Default (don't expose technical details)
  return 'Something went wrong. Please try again later.';
}


═══════════════════════════════════════════════════════════════════════════
 COMPLETE ERROR HANDLING EXAMPLE
═══════════════════════════════════════════════════════════════════════════

app.post('/students/add', (req, res) => {
  // 1. Validate input
  const errors = validateStudent(req.body);
  if (errors.length > 0) {
    req.flash('error', errors);
    return res.render('add', {
      formData: req.body,
      sections: db.prepare('SELECT * FROM sections').all()
    });
  }
  
  // 2. Database operation
  try {
    const result = db.prepare(`
      INSERT INTO students (student_id, first_name, last_name, section_id, email)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      req.body.student_id,
      req.body.first_name,
      req.body.last_name,
      req.body.section_id,
      req.body.email || null
    );
    
    // 3. Success
    req.flash('success', `Student ${req.body.first_name} added successfully!`);
    res.redirect('/students');
    
  } catch (err) {
    // 4. Error handling
    
    // Log error (for debugging)
    logError(err, {
      route: '/students/add',
      body: req.body,
      user: req.session?.userId
    });
    
    // User-friendly message
    const message = getUserMessage(err);
    req.flash('error', message);
    
    // Preserve form data
    res.render('add', {
      formData: req.body,
      sections: db.prepare('SELECT * FROM sections').all()
    });
  }
});


┌─────────────────────────────────────────────────────────────┐
│                    KEY TAKEAWAYS                            │
└─────────────────────────────────────────────────────────────┘

1. ✅ Always use try-catch around database operations
2. ✅ Validate input BEFORE database operations
3. ✅ Check foreign keys exist before insert/update
4. ✅ Check result.changes after UPDATE/DELETE
5. ✅ Provide user-friendly error messages
6. ✅ Log errors with context for debugging
7. ✅ Preserve form data when validation fails
8. ✅ Handle "not found" cases gracefully
9. ❌ Never expose technical error details to users
10. ❌ Never ignore errors (always handle or log)

💡 REMEMBER: Good error handling makes the difference between
   a toy project and a production-ready application!
```

---

## Usage in Lecture

**Reference this diagram when:**
- Teaching validation (App 09)
- Discussing error handling in all CRUD operations
- Showing production-ready code patterns
- Debugging common database errors

**Key teaching points:**
1. Validate before database operations (prevent errors)
2. Handle errors gracefully (user-friendly messages)
3. Log errors for debugging (but don't expose to users)
4. Check results (changes count, record existence)

---

## Related Diagrams

- **Diagram 06**: Transaction Flow (error handling in transactions)
- **Diagram 04**: Prepared Statements (preventing SQL injection errors)
- **Diagram 02**: SQL Operations (operations that can fail)
