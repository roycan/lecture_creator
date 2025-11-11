# Database Diagram 06: Transaction Flow

**Purpose:** Explain database transactions, ACID properties, and error handling

**Format:** Flow diagrams showing transaction lifecycle with examples

---

## The Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE TRANSACTIONS                            │
│                   (ACID Properties, BEGIN/COMMIT/ROLLBACK)               │
└─────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
 WHAT IS A TRANSACTION?
═══════════════════════════════════════════════════════════════════════════

A transaction is a sequence of database operations that are treated as a
single unit of work. Either ALL operations succeed, or ALL fail (no partial
updates).

ANALOGY: Bank Transfer
────────────────────────────────────────────────────────────────

Transfer $100 from Account A to Account B:

Step 1: Subtract $100 from Account A
Step 2: Add $100 to Account B

PROBLEM WITHOUT TRANSACTIONS:
  What if power goes out after Step 1?
  • Account A lost $100
  • Account B didn't receive $100
  • Money disappeared! 💸

SOLUTION WITH TRANSACTIONS:
  BEGIN TRANSACTION
    Step 1: Subtract $100 from Account A
    Step 2: Add $100 to Account B
  COMMIT (if both succeed)
  
  If ANY step fails → ROLLBACK (undo ALL changes)


═══════════════════════════════════════════════════════════════════════════
 ACID PROPERTIES
═══════════════════════════════════════════════════════════════════════════

Transactions must follow ACID principles:

┌─────────────────────────────────────────────────────────────┐
│ A - Atomicity                                               │
├─────────────────────────────────────────────────────────────┤
│ All operations succeed, or ALL fail (no partial updates)    │
│                                                             │
│ Example: Transfer money                                     │
│   ✅ Both accounts updated                                  │
│   ✅ OR neither account updated                             │
│   ❌ NEVER one account updated without the other            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ C - Consistency                                             │
├─────────────────────────────────────────────────────────────┤
│ Database moves from one valid state to another valid state  │
│                                                             │
│ Example: Total money before = Total money after             │
│   Before: A=$500, B=$300 → Total=$800                       │
│   After:  A=$400, B=$400 → Total=$800 ✅                    │
│                                                             │
│ Constraints are ALWAYS satisfied (NOT NULL, UNIQUE, etc.)   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ I - Isolation                                               │
├─────────────────────────────────────────────────────────────┤
│ Concurrent transactions don't interfere with each other     │
│                                                             │
│ Example: Two users editing same record                      │
│   User A changes name → isolated                            │
│   User B changes age  → isolated                            │
│   Results don't conflict                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ D - Durability                                              │
├─────────────────────────────────────────────────────────────┤
│ Once committed, changes are permanent (survive crashes)     │
│                                                             │
│ Example: After COMMIT                                       │
│   Power failure → Data still saved ✅                       │
│   Server crash → Data still saved ✅                        │
│   Database writes to disk immediately                       │
└─────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
 TRANSACTION COMMANDS
═══════════════════════════════════════════════════════════════════════════

BEGIN / BEGIN TRANSACTION:
────────────────────────────────────────────────────────────────
  Start a new transaction
  All subsequent operations are part of this transaction


COMMIT:
────────────────────────────────────────────────────────────────
  Save all changes permanently
  Transaction succeeds


ROLLBACK:
────────────────────────────────────────────────────────────────
  Undo all changes since BEGIN
  Transaction fails, database returns to state before BEGIN


═══════════════════════════════════════════════════════════════════════════
 BASIC TRANSACTION FLOW
═══════════════════════════════════════════════════════════════════════════

SUCCESSFUL TRANSACTION:
────────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│  BEGIN TRANSACTION                                          │
│  ↓                                                          │
│  Operation 1 (INSERT student)         ✅ Success           │
│  ↓                                                          │
│  Operation 2 (UPDATE section count)   ✅ Success           │
│  ↓                                                          │
│  Operation 3 (INSERT audit log)       ✅ Success           │
│  ↓                                                          │
│  COMMIT                                                     │
│  ↓                                                          │
│  ✅ All changes saved permanently                           │
└─────────────────────────────────────────────────────────────┘


FAILED TRANSACTION:
────────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│  BEGIN TRANSACTION                                          │
│  ↓                                                          │
│  Operation 1 (INSERT student)         ✅ Success           │
│  ↓                                                          │
│  Operation 2 (UPDATE section count)   ❌ ERROR             │
│  ↓                                                          │
│  ROLLBACK                                                   │
│  ↓                                                          │
│  ❌ All changes undone (including Operation 1)              │
│  ↓                                                          │
│  Database returns to state before BEGIN                    │
└─────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
 JAVASCRIPT EXAMPLES (better-sqlite3)
═══════════════════════════════════════════════════════════════════════════

EXAMPLE 1: Transfer Student Between Sections
────────────────────────────────────────────────────────────────

WITHOUT TRANSACTION (❌ Dangerous):
────────────────────────────────────────────────────────────────

// Decrement old section count
db.prepare('UPDATE sections SET student_count = student_count - 1 WHERE id = ?')
  .run(oldSectionId);

// ⚡ Power failure here = inconsistent data!

// Increment new section count
db.prepare('UPDATE sections SET student_count = student_count + 1 WHERE id = ?')
  .run(newSectionId);


WITH TRANSACTION (✅ Safe):
────────────────────────────────────────────────────────────────

const transferStudent = db.transaction((studentId, newSectionId) => {
  // Get old section
  const student = db.prepare('SELECT section_id FROM students WHERE id = ?')
    .get(studentId);
  
  // Update student's section
  db.prepare('UPDATE students SET section_id = ? WHERE id = ?')
    .run(newSectionId, studentId);
  
  // Decrement old section count
  db.prepare('UPDATE sections SET student_count = student_count - 1 WHERE id = ?')
    .run(student.section_id);
  
  // Increment new section count
  db.prepare('UPDATE sections SET student_count = student_count + 1 WHERE id = ?')
    .run(newSectionId);
});

// Execute transaction
try {
  transferStudent(studentId, newSectionId);
  console.log('✅ Transfer complete');
} catch (err) {
  console.log('❌ Transfer failed, all changes rolled back');
}


EXAMPLE 2: E-commerce Order
────────────────────────────────────────────────────────────────

const createOrder = db.transaction((userId, productId, quantity) => {
  // 1. Check stock
  const product = db.prepare('SELECT stock, price FROM products WHERE id = ?')
    .get(productId);
  
  if (product.stock < quantity) {
    throw new Error('Insufficient stock');
  }
  
  // 2. Create order
  const orderResult = db.prepare(`
    INSERT INTO orders (user_id, total)
    VALUES (?, ?)
  `).run(userId, product.price * quantity);
  
  const orderId = orderResult.lastInsertRowid;
  
  // 3. Add order items
  db.prepare(`
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (?, ?, ?, ?)
  `).run(orderId, productId, quantity, product.price);
  
  // 4. Update stock
  db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?')
    .run(quantity, productId);
  
  return orderId;
});

// Use transaction
app.post('/orders/create', (req, res) => {
  try {
    const orderId = createOrder(
      req.session.userId,
      req.body.productId,
      req.body.quantity
    );
    
    res.json({ success: true, orderId });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});


EXAMPLE 3: Manual Transaction Control
────────────────────────────────────────────────────────────────

// For more complex scenarios, use manual BEGIN/COMMIT/ROLLBACK

app.post('/complex-operation', (req, res) => {
  try {
    // Start transaction
    db.prepare('BEGIN TRANSACTION').run();
    
    // Multiple operations
    db.prepare('INSERT INTO table1 ...').run(...);
    db.prepare('UPDATE table2 ...').run(...);
    db.prepare('DELETE FROM table3 ...').run(...);
    
    // Commit if all succeed
    db.prepare('COMMIT').run();
    
    res.json({ success: true });
  } catch (err) {
    // Rollback on any error
    db.prepare('ROLLBACK').run();
    
    res.status(500).json({ success: false, error: err.message });
  }
});


═══════════════════════════════════════════════════════════════════════════
 WHEN TO USE TRANSACTIONS
═══════════════════════════════════════════════════════════════════════════

✅ USE TRANSACTIONS FOR:
────────────────────────────────────────────────────────────────

1. RELATED UPDATES (multiple tables)
   • Transfer student between sections (update student + 2 sections)
   • Create order (insert order + order_items, update stock)
   • Delete user (remove from users + delete their posts)

2. FINANCIAL OPERATIONS
   • Money transfers
   • Payment processing
   • Inventory management

3. DATA CONSISTENCY REQUIREMENTS
   • Total counts must match (students_count in sections table)
   • Relationships must stay valid (foreign keys)
   • Business rules must be satisfied

4. BATCH OPERATIONS
   • Import 1000 students (all or nothing)
   • Delete multiple related records
   • Update many rows consistently


❌ DON'T NEED TRANSACTIONS FOR:
────────────────────────────────────────────────────────────────

1. SINGLE OPERATION
   • Insert one student (atomic by default)
   • Update one field
   • Delete one record

2. READ-ONLY QUERIES
   • SELECT statements (no changes to rollback)
   • Reporting queries
   • Data export

3. INDEPENDENT OPERATIONS
   • Log entry (failure OK)
   • Cache update (can retry)
   • Non-critical operations


═══════════════════════════════════════════════════════════════════════════
 ERROR HANDLING IN TRANSACTIONS
═══════════════════════════════════════════════════════════════════════════

PATTERN: Try-Catch with Rollback
────────────────────────────────────────────────────────────────

function safeTransaction() {
  try {
    db.prepare('BEGIN').run();
    
    // Your operations here
    db.prepare('INSERT INTO ...').run(...);
    db.prepare('UPDATE ...').run(...);
    
    db.prepare('COMMIT').run();
    return { success: true };
    
  } catch (err) {
    db.prepare('ROLLBACK').run();
    console.error('Transaction failed:', err);
    return { success: false, error: err.message };
  }
}


COMMON ERRORS TO HANDLE:
────────────────────────────────────────────────────────────────

1. CONSTRAINT VIOLATIONS
   • UNIQUE constraint failed (duplicate email)
   • NOT NULL constraint failed (missing required field)
   • FOREIGN KEY constraint failed (invalid section_id)

2. CHECK CONSTRAINT FAILURES
   • Age out of range (age CHECK constraint)
   • Invalid enum value (status CHECK constraint)

3. BUSINESS LOGIC ERRORS
   • Insufficient stock
   • Permission denied
   • Invalid state transition

4. DATABASE ERRORS
   • Database locked
   • Disk full
   • Connection lost


═══════════════════════════════════════════════════════════════════════════
 TRANSACTION ISOLATION LEVELS (Advanced)
═══════════════════════════════════════════════════════════════════════════

SQLite supports these isolation levels:

READ UNCOMMITTED (least safe):
────────────────────────────────────────────────────────────────
  • Can read data from uncommitted transactions
  • Dirty reads possible
  • Not recommended


READ COMMITTED:
────────────────────────────────────────────────────────────────
  • Only reads committed data
  • No dirty reads


SERIALIZABLE (most safe, SQLite default):
────────────────────────────────────────────────────────────────
  • Transactions execute as if they were serial (one after another)
  • No conflicts possible
  • Highest consistency, but slower


FOR THIS COURSE: Use default (SERIALIZABLE)
  SQLite handles it automatically, you don't need to configure


═══════════════════════════════════════════════════════════════════════════
 REAL-WORLD EXAMPLE: Complete Flow
═══════════════════════════════════════════════════════════════════════════

SCENARIO: Student Enrollment
────────────────────────────────────────────────────────────────

Requirements:
  1. Insert student record
  2. Update section student_count
  3. Create audit log entry
  4. If ANY fails, undo ALL


CODE:
────────────────────────────────────────────────────────────────

const enrollStudent = db.transaction((studentData, sectionId, userId) => {
  // 1. Validate section capacity
  const section = db.prepare(`
    SELECT student_count, capacity 
    FROM sections 
    WHERE id = ?
  `).get(sectionId);
  
  if (!section) {
    throw new Error('Section not found');
  }
  
  if (section.student_count >= section.capacity) {
    throw new Error('Section is full');
  }
  
  // 2. Insert student
  const studentResult = db.prepare(`
    INSERT INTO students (student_id, first_name, last_name, section_id)
    VALUES (?, ?, ?, ?)
  `).run(
    studentData.student_id,
    studentData.first_name,
    studentData.last_name,
    sectionId
  );
  
  const newStudentId = studentResult.lastInsertRowid;
  
  // 3. Update section count
  db.prepare(`
    UPDATE sections 
    SET student_count = student_count + 1
    WHERE id = ?
  `).run(sectionId);
  
  // 4. Create audit log
  db.prepare(`
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    userId,
    'CREATE',
    'students',
    newStudentId,
    JSON.stringify(studentData)
  );
  
  return newStudentId;
});


// Use in Express route
app.post('/students/enroll', (req, res) => {
  try {
    const newStudentId = enrollStudent(
      {
        student_id: req.body.student_id,
        first_name: req.body.first_name,
        last_name: req.body.last_name
      },
      req.body.section_id,
      req.session.userId
    );
    
    req.flash('success', 'Student enrolled successfully!');
    res.redirect(`/students/${newStudentId}`);
    
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/students/add');
  }
});


WHAT HAPPENS IF ERROR OCCURS:
────────────────────────────────────────────────────────────────

Scenario: Section is full

┌─────────────────────────────────────────────────────────────┐
│  BEGIN TRANSACTION                                          │
│  ↓                                                          │
│  Get section (student_count=35, capacity=35)               │
│  ↓                                                          │
│  Check: 35 >= 35 → TRUE                                     │
│  ↓                                                          │
│  throw new Error('Section is full')                        │
│  ↓                                                          │
│  AUTOMATIC ROLLBACK                                         │
│  ↓                                                          │
│  ✅ No changes made to database                             │
│  ✅ Error message shown to user                             │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                    KEY TAKEAWAYS                            │
└─────────────────────────────────────────────────────────────┘

1. Transactions ensure ALL operations succeed or ALL fail
2. ACID properties guarantee data consistency
3. Use db.transaction() for related operations
4. Always wrap transactions in try-catch
5. ROLLBACK undoes all changes since BEGIN
6. COMMIT saves all changes permanently
7. Use transactions for: financial ops, multi-table updates, batch operations
8. Don't need transactions for: single operations, read-only queries
9. SQLite handles isolation automatically (SERIALIZABLE by default)
10. Test error scenarios to verify rollback works correctly
```

---

## Usage in Lecture

**Reference this diagram when:**
- Teaching complex operations (App 10 with relationships)
- Introducing audit logging (Part 2C)
- Discussing data integrity
- Showing error handling patterns

**Key teaching points:**
1. Transactions prevent partial updates (atomicity)
2. Always use try-catch with transactions
3. Test error scenarios to verify rollback
4. Transactions are critical for financial/inventory operations

---

## Related Diagrams

- **Diagram 07**: Error Handling (related to transaction errors)
- **Diagram 02**: SQL Operations (individual operations within transactions)
