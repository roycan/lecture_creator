# Database Diagram 04: Prepared Statements & SQL Injection

**Purpose:** Deep dive on SQL injection vulnerability and how prepared statements prevent it

**Format:** Attack scenarios with vulnerable/secure code comparisons

---

## The Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│              PREPARED STATEMENTS & SQL INJECTION PREVENTION              │
│                    (Why ? placeholders are critical)                     │
└─────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
 WHAT IS SQL INJECTION?
═══════════════════════════════════════════════════════════════════════════

SQL Injection is a security vulnerability where an attacker can manipulate
SQL queries by inserting malicious code through user input.

RANKED: #3 in OWASP Top 10 Web Application Security Risks (2021)


═══════════════════════════════════════════════════════════════════════════
 ATTACK SCENARIO #1: Authentication Bypass
═══════════════════════════════════════════════════════════════════════════

LOGIN FORM:
────────────────────────────────────────────────────────────────
┌─────────────────────────────┐
│  Username: admin            │
│  Password: ' OR '1'='1      │  ← MALICIOUS INPUT
│                             │
│        [ Login ]            │
└─────────────────────────────┘


❌ VULNERABLE CODE (String Concatenation):
────────────────────────────────────────────────────────────────

const username = req.body.username;  // "admin"
const password = req.body.password;  // "' OR '1'='1"

const query = `
  SELECT * FROM users 
  WHERE username = '${username}' 
  AND password = '${password}'
`;

console.log(query);
// SELECT * FROM users 
// WHERE username = 'admin' 
// AND password = '' OR '1'='1'
//                    ↑
//           This is ALWAYS TRUE!

const user = db.prepare(query).get();


WHAT HAPPENS:
────────────────────────────────────────────────────────────────

Original intent:
  WHERE username = 'admin' AND password = 'correct_password'

Actual query:
  WHERE username = 'admin' AND password = '' OR '1'='1'
  
Logic breakdown:
  (username = 'admin' AND password = '') OR ('1'='1')
                    FALSE              OR    TRUE
                            ↓
                           TRUE  ← Login succeeds!

RESULT: Attacker logs in WITHOUT knowing the password! 🚨


✅ SECURE CODE (Prepared Statements):
────────────────────────────────────────────────────────────────

const username = req.body.username;  // "admin"
const password = req.body.password;  // "' OR '1'='1"

const user = db.prepare(`
  SELECT * FROM users 
  WHERE username = ? 
  AND password = ?
`).get(username, password);


WHAT HAPPENS:
────────────────────────────────────────────────────────────────

Database treats input as DATA, not CODE:
  WHERE username = 'admin' 
  AND password = '\' OR \'1\'=\'1'
                 ↑  Escaped special characters

RESULT: Login fails (no user with that password) ✅


═══════════════════════════════════════════════════════════════════════════
 ATTACK SCENARIO #2: Data Theft
═══════════════════════════════════════════════════════════════════════════

SEARCH FORM:
────────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────┐
│  Search students: ' UNION SELECT id, password, NULL FROM    │
│                   users --                                  │  ← ATTACK
│                                                             │
│                 [ Search ]                                  │
└─────────────────────────────────────────────────────────────┘


❌ VULNERABLE CODE:
────────────────────────────────────────────────────────────────

const searchTerm = req.body.search;
// "' UNION SELECT id, password, NULL FROM users --"

const query = `
  SELECT id, name, grade 
  FROM students 
  WHERE name LIKE '%${searchTerm}%'
`;

const results = db.prepare(query).all();


ACTUAL QUERY EXECUTED:
────────────────────────────────────────────────────────────────

SELECT id, name, grade 
FROM students 
WHERE name LIKE '%' 
UNION SELECT id, password, NULL FROM users --'%'
                                          ↑
                                    Comment (ignores rest)

RESULT:
  • Returns all students
  • PLUS all user passwords from users table! 🚨
  • Attacker steals sensitive data


✅ SECURE CODE:
────────────────────────────────────────────────────────────────

const searchTerm = req.body.search;

const results = db.prepare(`
  SELECT id, name, grade 
  FROM students 
  WHERE name LIKE ?
`).all(`%${searchTerm}%`);

RESULT: Search term treated as literal string, UNION ignored ✅


═══════════════════════════════════════════════════════════════════════════
 ATTACK SCENARIO #3: Data Deletion
═══════════════════════════════════════════════════════════════════════════

DELETE STUDENT BY ID:
────────────────────────────────────────────────────────────────
URL: /students/delete/5; DROP TABLE students; --


❌ VULNERABLE CODE:
────────────────────────────────────────────────────────────────

const id = req.params.id;  // "5; DROP TABLE students; --"

const query = `DELETE FROM students WHERE id = ${id}`;
db.prepare(query).run();


ACTUAL QUERIES EXECUTED:
────────────────────────────────────────────────────────────────

DELETE FROM students WHERE id = 5;
DROP TABLE students;
--

RESULT:
  • Student 5 deleted
  • ENTIRE students table deleted! 🚨
  • All student data lost forever


✅ SECURE CODE:
────────────────────────────────────────────────────────────────

const id = req.params.id;

db.prepare('DELETE FROM students WHERE id = ?').run(id);

RESULT: Only deletes student with ID matching exact string ✅


═══════════════════════════════════════════════════════════════════════════
 HOW PREPARED STATEMENTS WORK
═══════════════════════════════════════════════════════════════════════════

STEP-BY-STEP PROCESS:
────────────────────────────────────────────────────────────────

1. PARSE QUERY STRUCTURE
   ────────────────────────
   const stmt = db.prepare('SELECT * FROM users WHERE name = ?');
   
   Database parses query:
     • SELECT keyword
     • FROM users table
     • WHERE clause with comparison
     • ? is a PARAMETER PLACEHOLDER (not data yet)


2. BIND PARAMETERS
   ────────────────────────
   stmt.get("' OR '1'='1");
   
   Database binds value AS DATA:
     • Treats input as literal string
     • Escapes special characters
     • Cannot change query structure


3. EXECUTE QUERY
   ────────────────────────
   Query structure already fixed in step 1
   Input cannot become SQL code


COMPARISON:
────────────────────────────────────────────────────────────────

String Concatenation (VULNERABLE):
  Parse + Execute happen together
  Input can change query structure
  
Prepared Statements (SECURE):
  Parse first (query structure locked)
  Execute later (input is just data)


ANALOGY:
────────────────────────────────────────────────────────────────

String Concatenation = Mad Libs After Printing
  "The [adjective] dog [verb] over the [noun]"
  If user writes: "big; burnt the house down; cat"
  Result changes the entire story!

Prepared Statements = Fill-in-the-Blank Test
  "The _____ dog _____ over the _____"
  Blanks can only contain ANSWERS, not new questions
  Structure cannot change, no matter what user writes


═══════════════════════════════════════════════════════════════════════════
 PLACEHOLDER SYNTAX
═══════════════════════════════════════════════════════════════════════════

POSITIONAL PARAMETERS (?):
────────────────────────────────────────────────────────────────

Single value:
    db.prepare('SELECT * FROM users WHERE id = ?').get(5);

Multiple values (order matters):
    db.prepare(`
      INSERT INTO users (name, email, age)
      VALUES (?, ?, ?)
    `).run('Juan Cruz', 'juan@example.com', 16);

WHERE conditions:
    db.prepare(`
      SELECT * FROM products
      WHERE category = ? AND price < ?
    `).all('Electronics', 1000);


NAMED PARAMETERS (optional, more readable):
────────────────────────────────────────────────────────────────

Single value:
    db.prepare('SELECT * FROM users WHERE id = @id')
      .get({ id: 5 });

Multiple values:
    db.prepare(`
      INSERT INTO users (name, email, age)
      VALUES (@name, @email, @age)
    `).run({
      name: 'Juan Cruz',
      email: 'juan@example.com',
      age: 16
    });

WHERE conditions:
    db.prepare(`
      SELECT * FROM products
      WHERE category = @category AND price < @maxPrice
    `).all({
      category: 'Electronics',
      maxPrice: 1000
    });


RECOMMENDATION:
  Use ? (positional) for simple queries (shorter syntax)
  Use @name (named) for complex queries (more readable)


═══════════════════════════════════════════════════════════════════════════
 COMMON MISTAKES & FIXES
═══════════════════════════════════════════════════════════════════════════

MISTAKE #1: LIKE with placeholders
────────────────────────────────────────────────────────────────

❌ WRONG:
    db.prepare(`
      SELECT * FROM students
      WHERE name LIKE '%?%'
    `).all(searchTerm);
    
    Problem: ? inside quotes becomes literal '%?%'

✅ CORRECT:
    db.prepare(`
      SELECT * FROM students
      WHERE name LIKE ?
    `).all(`%${searchTerm}%`);
    
    Build LIKE pattern outside query, pass as parameter


MISTAKE #2: IN clause with array
────────────────────────────────────────────────────────────────

❌ WRONG:
    const ids = [1, 2, 3];
    db.prepare(`
      SELECT * FROM students
      WHERE id IN (?)
    `).all(ids);
    
    Problem: Passes array as single value

✅ CORRECT (Option 1 - Dynamic placeholders):
    const ids = [1, 2, 3];
    const placeholders = ids.map(() => '?').join(',');
    
    db.prepare(`
      SELECT * FROM students
      WHERE id IN (${placeholders})
    `).all(...ids);
    
    Generates: WHERE id IN (?, ?, ?)

✅ CORRECT (Option 2 - JSON array):
    const ids = [1, 2, 3];
    db.prepare(`
      SELECT * FROM students
      WHERE id IN (SELECT value FROM json_each(?))
    `).all(JSON.stringify(ids));


MISTAKE #3: Column names in placeholders
────────────────────────────────────────────────────────────────

❌ WRONG:
    db.prepare('SELECT * FROM students ORDER BY ?')
      .all('name');
    
    Problem: ? is for VALUES, not identifiers (table/column names)

✅ CORRECT (whitelist approach):
    const allowedColumns = ['name', 'age', 'grade'];
    const sortBy = req.query.sort;
    
    if (!allowedColumns.includes(sortBy)) {
      sortBy = 'name';  // Default
    }
    
    db.prepare(`SELECT * FROM students ORDER BY ${sortBy}`)
      .all();
    
    Safe: sortBy validated against whitelist


MISTAKE #4: Building partial query strings
────────────────────────────────────────────────────────────────

❌ WRONG:
    const whereClause = req.body.filter 
      ? `WHERE grade = '${req.body.filter}'`
      : '';
    
    db.prepare(`SELECT * FROM students ${whereClause}`).all();
    
    Problem: String concatenation in whereClause

✅ CORRECT:
    const query = req.body.filter
      ? 'SELECT * FROM students WHERE grade = ?'
      : 'SELECT * FROM students';
    
    const params = req.body.filter ? [req.body.filter] : [];
    
    db.prepare(query).all(...params);


═══════════════════════════════════════════════════════════════════════════
 REAL-WORLD EXAMPLE: Complete Secure CRUD
═══════════════════════════════════════════════════════════════════════════

// CREATE - Insert with validation
app.post('/students/add', (req, res) => {
  // Validate first (server-side)
  if (!req.body.name || req.body.name.length < 2) {
    return res.status(400).send('Invalid name');
  }
  
  // Use prepared statement
  const stmt = db.prepare(`
    INSERT INTO students (student_id, name, age, grade)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    req.body.student_id,
    req.body.name,
    parseInt(req.body.age),
    req.body.grade
  );
  
  res.redirect('/students');
});


// READ - Search with LIKE
app.get('/students/search', (req, res) => {
  const searchTerm = req.query.q || '';
  
  const students = db.prepare(`
    SELECT * FROM students
    WHERE name LIKE ? OR student_id LIKE ?
    ORDER BY name
  `).all(`%${searchTerm}%`, `%${searchTerm}%`);
  
  res.render('students', { students });
});


// UPDATE - Edit with validation
app.post('/students/edit/:id', (req, res) => {
  // Validate ID is numeric
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).send('Invalid ID');
  }
  
  // Prepared statement for update
  const stmt = db.prepare(`
    UPDATE students
    SET name = ?, age = ?, grade = ?
    WHERE id = ?
  `);
  
  const result = stmt.run(
    req.body.name,
    parseInt(req.body.age),
    req.body.grade,
    id
  );
  
  if (result.changes === 0) {
    return res.status(404).send('Student not found');
  }
  
  res.redirect('/students');
});


// DELETE - Remove with confirmation
app.post('/students/delete/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  // Get name for confirmation message
  const student = db.prepare('SELECT name FROM students WHERE id = ?')
    .get(id);
  
  if (!student) {
    return res.status(404).send('Student not found');
  }
  
  // Delete using prepared statement
  db.prepare('DELETE FROM students WHERE id = ?').run(id);
  
  req.flash('success', `${student.name} deleted`);
  res.redirect('/students');
});


═══════════════════════════════════════════════════════════════════════════
 ADDITIONAL SECURITY LAYERS
═══════════════════════════════════════════════════════════════════════════

1. INPUT VALIDATION (First line of defense)
────────────────────────────────────────────────────────────────
   function validateEmail(email) {
     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     return regex.test(email);
   }
   
   function validateAge(age) {
     const parsed = parseInt(age);
     return !isNaN(parsed) && parsed >= 0 && parsed <= 120;
   }


2. SANITIZATION (Remove/escape dangerous characters)
────────────────────────────────────────────────────────────────
   function sanitizeName(name) {
     return name.trim()
       .replace(/[<>]/g, '')  // Remove HTML tags
       .slice(0, 100);         // Limit length
   }


3. PRINCIPLE OF LEAST PRIVILEGE (Database permissions)
────────────────────────────────────────────────────────────────
   // Use read-only database user for SELECT queries
   // Use limited-access user for web app (not root)
   // Different credentials for different environments


4. ERROR HANDLING (Don't expose database details)
────────────────────────────────────────────────────────────────
   ❌ WRONG:
     } catch (err) {
       res.send(`Database error: ${err.message}`);
     }
   
   ✅ CORRECT:
     } catch (err) {
       console.error(err);  // Log for debugging
       res.status(500).send('Something went wrong');
     }


┌─────────────────────────────────────────────────────────────┐
│                    KEY TAKEAWAYS                            │
└─────────────────────────────────────────────────────────────┘

1. ✅ ALWAYS use prepared statements (? placeholders)
2. ❌ NEVER concatenate user input into SQL queries
3. ✅ Validate and sanitize input BEFORE database operations
4. ✅ Use parseInt() for numeric inputs
5. ✅ Whitelist column names for dynamic ORDER BY
6. ✅ Build LIKE patterns outside query, pass as parameter
7. ✅ Handle errors gracefully, don't expose details
8. ✅ Use .run() for INSERT/UPDATE/DELETE
9. ✅ Use .get() for single row, .all() for multiple
10. ✅ Check result.changes to confirm operations

💡 REMEMBER: Prepared statements are NOT optional - they're REQUIRED
   for secure applications!
```

---

## Usage in Lecture

**Reference this diagram when:**
- First introducing database queries (App 07)
- Teaching INSERT/UPDATE operations (App 08)
- Discussing security best practices
- Debugging SQL injection vulnerabilities

**Key teaching points:**
1. SQL injection is a critical security risk (OWASP Top 10)
2. Prepared statements are the ONLY safe way to handle user input
3. ? placeholders prevent input from becoming code
4. Always validate input, even with prepared statements

---

## Related Diagrams

- **Diagram 02**: SQL Operations (shows ? placeholder syntax)
- **Diagram 07**: Error Handling (related to security practices)
