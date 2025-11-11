# Database Diagram 05: Database Schema Design

**Purpose:** Guide to designing database tables, choosing data types, and constraints

**Format:** Schema patterns with best practices and common mistakes

---

## The Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATABASE SCHEMA DESIGN                             │
│              (Tables, Columns, Data Types, Constraints)                 │
└─────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
 BASIC TABLE STRUCTURE
═══════════════════════════════════════════════════════════════════════════

CREATE TABLE table_name (
  column_name DATA_TYPE CONSTRAINTS,
  column_name DATA_TYPE CONSTRAINTS,
  ...
  TABLE_CONSTRAINTS
);


EXAMPLE: Students Table
────────────────────────────────────────────────────────────────

CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,    ← Primary key (unique ID)
  student_id TEXT NOT NULL UNIQUE,         ← Business identifier
  first_name TEXT NOT NULL,                ← Required text field
  last_name TEXT NOT NULL,                 ← Required text field
  email TEXT UNIQUE,                       ← Optional, but unique if provided
  age INTEGER CHECK (age >= 0 AND age <= 120), ← Validated numeric
  grade TEXT,                              ← Optional text
  gpa REAL DEFAULT 0.0,                    ← Decimal with default value
  is_active INTEGER DEFAULT 1,             ← Boolean (0 or 1)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, ← Auto timestamp
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP  ← Auto timestamp
);


═══════════════════════════════════════════════════════════════════════════
 SQLite DATA TYPES
═══════════════════════════════════════════════════════════════════════════

SQLite has 5 storage classes (others are aliases):

┌─────────────┬──────────────────────┬─────────────────────────────┐
│ Storage Class│ Description         │ Use Cases                   │
├─────────────┼──────────────────────┼─────────────────────────────┤
│ INTEGER     │ Signed integers      │ IDs, counts, ages, years    │
│             │ 1, 2, 3, -10, 0      │ Booleans (0/1)              │
├─────────────┼──────────────────────┼─────────────────────────────┤
│ REAL        │ Floating-point       │ Prices, GPA, percentages    │
│             │ 3.14, 99.99, -0.5    │ Measurements, ratings       │
├─────────────┼──────────────────────┼─────────────────────────────┤
│ TEXT        │ String (UTF-8)       │ Names, emails, descriptions │
│             │ "Juan Cruz"          │ JSON strings, URLs          │
├─────────────┼──────────────────────┼─────────────────────────────┤
│ BLOB        │ Binary data          │ Images, files (NOT in scope)│
│             │ Stored as-is         │ Use external storage instead│
├─────────────┼──────────────────────┼─────────────────────────────┤
│ NULL        │ Missing value        │ Optional fields             │
│             │                      │                             │
└─────────────┴──────────────────────┴─────────────────────────────┘


COMMON TYPE ALIASES:
────────────────────────────────────────────────────────────────

VARCHAR(255)  → TEXT    (SQLite ignores length)
CHAR(10)      → TEXT
INT           → INTEGER
FLOAT         → REAL
DOUBLE        → REAL
BOOLEAN       → INTEGER (use 0/1)
DATE          → TEXT    (or INTEGER for Unix timestamp)
DATETIME      → TEXT    (ISO 8601 format)
TIMESTAMP     → TEXT


DATA TYPE SELECTION GUIDE:
────────────────────────────────────────────────────────────────

Scenario                         | Recommended Type
─────────────────────────────────┼────────────────────────────
Primary key (auto-increment)     | INTEGER PRIMARY KEY AUTOINCREMENT
Foreign key                      | INTEGER
Name, address, description       | TEXT
Email, URL, phone                | TEXT
Age, quantity, count             | INTEGER
Price, rating, GPA               | REAL
Boolean (yes/no, active/inactive)| INTEGER (0 or 1)
Date/time                        | TEXT (ISO 8601) or INTEGER (Unix)
JSON data                        | TEXT


═══════════════════════════════════════════════════════════════════════════
 CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════

PRIMARY KEY:
────────────────────────────────────────────────────────────────
  Uniquely identifies each row

  id INTEGER PRIMARY KEY AUTOINCREMENT

  Features:
    • Automatically indexed
    • Cannot be NULL
    • Must be unique
    • AUTOINCREMENT: Starts at 1, increments for each new row


NOT NULL:
────────────────────────────────────────────────────────────────
  Field must have a value (cannot be empty)

  first_name TEXT NOT NULL

  Use for: Required fields (name, email, required foreign keys)


UNIQUE:
────────────────────────────────────────────────────────────────
  Value must be unique across all rows

  email TEXT UNIQUE

  Use for: Email addresses, usernames, student IDs
  Note: Can be NULL (NULL is unique)


DEFAULT:
────────────────────────────────────────────────────────────────
  Provides default value if none specified

  is_active INTEGER DEFAULT 1
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  gpa REAL DEFAULT 0.0

  Use for: Status flags, timestamps, initial values


CHECK:
────────────────────────────────────────────────────────────────
  Validates values meet a condition

  age INTEGER CHECK (age >= 0 AND age <= 120)
  grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D', 'F'))
  price REAL CHECK (price >= 0)

  Use for: Business rules, value ranges


FOREIGN KEY:
────────────────────────────────────────────────────────────────
  Links to another table (covered in Diagram 03)

  section_id INTEGER NOT NULL,
  FOREIGN KEY (section_id) REFERENCES sections(id)


═══════════════════════════════════════════════════════════════════════════
 TIMESTAMPS (Auto-tracking)
═══════════════════════════════════════════════════════════════════════════

PATTERN: created_at and updated_at
────────────────────────────────────────────────────────────────

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


INSERT (created_at set automatically):
────────────────────────────────────────────────────────────────

INSERT INTO products (name, price)
VALUES ('Laptop', 999.99);

Result:
┌────┬────────┬────────┬─────────────────────┬─────────────────────┐
│ id │ name   │ price  │ created_at          │ updated_at          │
├────┼────────┼────────┼─────────────────────┼─────────────────────┤
│ 1  │ Laptop │ 999.99 │ 2024-01-15 10:30:00 │ 2024-01-15 10:30:00 │
└────┴────────┴────────┴─────────────────────┴─────────────────────┘


UPDATE (manually update updated_at):
────────────────────────────────────────────────────────────────

UPDATE products
SET price = 899.99,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

Result:
┌────┬────────┬────────┬─────────────────────┬─────────────────────┐
│ id │ name   │ price  │ created_at          │ updated_at          │
├────┼────────┼────────┼─────────────────────┼─────────────────────┤
│ 1  │ Laptop │ 899.99 │ 2024-01-15 10:30:00 │ 2024-01-16 14:20:00 │
└────┴────────┴────────┴─────────────────────┴─────────────────────┘
                         ↑ Original            ↑ Updated!


BEST PRACTICE:
  • Always include created_at (never changes)
  • Always include updated_at (update on every change)
  • Use DATETIME type with DEFAULT CURRENT_TIMESTAMP


═══════════════════════════════════════════════════════════════════════════
 INDEXES (Performance Optimization)
═══════════════════════════════════════════════════════════════════════════

WHY INDEXES?
────────────────────────────────────────────────────────────────

Without index: Database scans ALL rows (slow for large tables)
With index: Database uses lookup table (fast, like book index)


WHEN TO CREATE INDEXES:
────────────────────────────────────────────────────────────────

✅ Foreign key columns (section_id)
✅ Frequently searched columns (email, username)
✅ Columns in WHERE clauses (status, category)
✅ Columns in ORDER BY clauses (created_at, name)

❌ Small tables (<1000 rows) - not worth it
❌ Columns rarely queried
❌ Columns with low cardinality (only 2-3 unique values)


SYNTAX:
────────────────────────────────────────────────────────────────

Single column:
    CREATE INDEX idx_students_email ON students(email);

Multiple columns (composite):
    CREATE INDEX idx_students_name ON students(last_name, first_name);

Unique index (enforces uniqueness):
    CREATE UNIQUE INDEX idx_students_student_id ON students(student_id);


AUTOMATIC INDEXES:
────────────────────────────────────────────────────────────────

Primary keys: Automatically indexed
Unique constraints: Automatically indexed

No need to create manually!


═══════════════════════════════════════════════════════════════════════════
 NAMING CONVENTIONS
═══════════════════════════════════════════════════════════════════════════

TABLES:
────────────────────────────────────────────────────────────────
  ✅ Lowercase, plural nouns: students, products, orders
  ❌ Avoid: Students, STUDENTS, tbl_students


COLUMNS:
────────────────────────────────────────────────────────────────
  ✅ Lowercase, snake_case: first_name, created_at, is_active
  ❌ Avoid: firstName, FirstName, fname


PRIMARY KEYS:
────────────────────────────────────────────────────────────────
  ✅ Always use: id
  ❌ Avoid: student_id, StudentID (use for business ID instead)


FOREIGN KEYS:
────────────────────────────────────────────────────────────────
  ✅ Singular table name + _id: section_id, user_id, category_id
  ❌ Avoid: sectionId, sec_id


BOOLEAN COLUMNS:
────────────────────────────────────────────────────────────────
  ✅ Prefix with is_, has_, can_: is_active, has_permission
  ❌ Avoid: active, permission (ambiguous)


INDEXES:
────────────────────────────────────────────────────────────────
  ✅ idx_table_column: idx_students_email, idx_products_category
  ❌ Avoid: index1, student_index


═══════════════════════════════════════════════════════════════════════════
 COMMON SCHEMA PATTERNS
═══════════════════════════════════════════════════════════════════════════

PATTERN 1: User Accounts
────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,              ← Never store plain passwords!
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active INTEGER DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);


PATTERN 2: Products (E-commerce)
────────────────────────────────────────────────────────────────

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT NOT NULL UNIQUE,                 ← Stock Keeping Unit
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL CHECK (price >= 0),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  category TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);


PATTERN 3: Audit Log (Activity Tracking)
────────────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL,                     ← 'CREATE', 'UPDATE', 'DELETE'
  table_name TEXT NOT NULL,                 ← Which table was affected
  record_id INTEGER NOT NULL,               ← Which record ID
  old_values TEXT,                          ← JSON string (before)
  new_values TEXT,                          ← JSON string (after)
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_table ON audit_logs(table_name, record_id);


PATTERN 4: Settings (Key-Value Store)
────────────────────────────────────────────────────────────────

CREATE TABLE settings (
  key TEXT PRIMARY KEY,                     ← Unique setting name
  value TEXT NOT NULL,                      ← Setting value
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

Examples:
  ('site_name', 'My School', 'Website name')
  ('max_students_per_section', '35', 'Class size limit')
  ('maintenance_mode', '0', 'Site maintenance flag')


═══════════════════════════════════════════════════════════════════════════
 SCHEMA DESIGN BEST PRACTICES
═══════════════════════════════════════════════════════════════════════════

1. ALWAYS INCLUDE:
────────────────────────────────────────────────────────────────
   ✅ id INTEGER PRIMARY KEY AUTOINCREMENT
   ✅ created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   ✅ updated_at DATETIME DEFAULT CURRENT_TIMESTAMP


2. USE NOT NULL FOR REQUIRED FIELDS:
────────────────────────────────────────────────────────────────
   ✅ name TEXT NOT NULL
   ❌ name TEXT  (allows empty values)


3. ADD UNIQUE CONSTRAINTS:
────────────────────────────────────────────────────────────────
   ✅ email TEXT UNIQUE
   ✅ username TEXT UNIQUE
   ✅ sku TEXT UNIQUE


4. USE CHECK CONSTRAINTS FOR VALIDATION:
────────────────────────────────────────────────────────────────
   ✅ age INTEGER CHECK (age >= 0)
   ✅ price REAL CHECK (price >= 0)
   ✅ status TEXT CHECK (status IN ('active', 'inactive'))


5. PROVIDE DEFAULT VALUES:
────────────────────────────────────────────────────────────────
   ✅ is_active INTEGER DEFAULT 1
   ✅ role TEXT DEFAULT 'user'
   ✅ quantity INTEGER DEFAULT 0


6. INDEX FOREIGN KEYS:
────────────────────────────────────────────────────────────────
   CREATE INDEX idx_students_section ON students(section_id);


7. USE MEANINGFUL NAMES:
────────────────────────────────────────────────────────────────
   ✅ first_name, last_name, is_active
   ❌ fn, ln, active


8. NORMALIZE DATA (avoid duplication):
────────────────────────────────────────────────────────────────
   ❌ Store adviser name in every student record
   ✅ Store section_id, JOIN to get adviser


9. DOCUMENT YOUR SCHEMA:
────────────────────────────────────────────────────────────────
   Add comments explaining business rules:
   
   CREATE TABLE students (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     -- Student ID format: YYYY-NNNN (e.g., 2024-0001)
     student_id TEXT NOT NULL UNIQUE,
     -- Age must be 0-120 (validates human age)
     age INTEGER CHECK (age >= 0 AND age <= 120)
   );


═══════════════════════════════════════════════════════════════════════════
 COMMON MISTAKES
═══════════════════════════════════════════════════════════════════════════

MISTAKE #1: No Primary Key
────────────────────────────────────────────────────────────────
   ❌ CREATE TABLE students (name TEXT, age INTEGER);
   
   Problem: Cannot uniquely identify rows
   
   ✅ CREATE TABLE students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        age INTEGER
      );


MISTAKE #2: Using TEXT for Numbers
────────────────────────────────────────────────────────────────
   ❌ age TEXT
   
   Problem: Cannot do math, sorting wrong ('10' < '2')
   
   ✅ age INTEGER


MISTAKE #3: Storing Multiple Values in One Column
────────────────────────────────────────────────────────────────
   ❌ subjects TEXT  (stores "Math, Science, English")
   
   Problem: Hard to query, can't JOIN
   
   ✅ Create related table:
      CREATE TABLE enrollments (
        student_id INTEGER,
        subject_id INTEGER
      );


MISTAKE #4: No Timestamps
────────────────────────────────────────────────────────────────
   ❌ No created_at or updated_at
   
   Problem: Can't track when data added/changed
   
   ✅ Always include timestamps


MISTAKE #5: No Validation Constraints
────────────────────────────────────────────────────────────────
   ❌ age INTEGER  (allows -1, 999, etc.)
   
   Problem: Invalid data enters database
   
   ✅ age INTEGER CHECK (age >= 0 AND age <= 120)


MISTAKE #6: Poor Naming
────────────────────────────────────────────────────────────────
   ❌ fn, ln, dt, stat
   
   Problem: Unclear, hard to maintain
   
   ✅ first_name, last_name, created_at, is_active


┌─────────────────────────────────────────────────────────────┐
│                    KEY TAKEAWAYS                            │
└─────────────────────────────────────────────────────────────┘

1. Always use INTEGER PRIMARY KEY AUTOINCREMENT for id
2. Add NOT NULL to required fields
3. Use UNIQUE for fields that must be unique (email, username)
4. Use CHECK constraints for validation
5. Add DEFAULT values for common scenarios
6. Include created_at and updated_at timestamps
7. Index foreign keys and frequently queried columns
8. Use snake_case naming convention
9. Choose appropriate data types (INTEGER for numbers, TEXT for strings)
10. Document schema with comments
```

---

## Usage in Lecture

**Reference this diagram when:**
- Creating first database tables (App 07)
- Discussing data types and constraints (App 08)
- Designing related tables (App 10)
- Reviewing best practices throughout Part 2A

**Key teaching points:**
1. Schema design is critical (hard to change later)
2. Constraints enforce data integrity at database level
3. Good naming makes code self-documenting
4. Timestamps are essential for tracking changes

---

## Related Diagrams

- **Diagram 03**: Table Relationships (foreign keys in detail)
- **Diagram 02**: SQL Operations (how schema affects queries)
- **Support Material**: schema-templates/ (ready-to-use schemas)
