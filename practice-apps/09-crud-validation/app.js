const express = require('express');
const Database = require('better-sqlite3');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// DATABASE SETUP
// ==========================================

const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH 
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'books.db')
  : path.join(__dirname, 'books.db');

console.log('📁 Database path:', dbPath);

const db = new Database(dbPath);

// Create books table
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE NOT NULL,
    copies INTEGER NOT NULL DEFAULT 1,
    available INTEGER NOT NULL DEFAULT 1,
    category TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert sample data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM books').get();
if (count.count === 0) {
  console.log('📝 Inserting sample books...');
  const insert = db.prepare('INSERT INTO books (title, author, isbn, copies, available, category) VALUES (?, ?, ?, ?, ?, ?)');
  
  insert.run('Noli Me Tangere', 'Jose Rizal', '978-1234567890', 5, 5, 'Filipino Classics');
  insert.run('El Filibusterismo', 'Jose Rizal', '978-1234567891', 4, 3, 'Filipino Classics');
  insert.run('Florante at Laura', 'Francisco Balagtas', '978-1234567892', 6, 6, 'Filipino Classics');
  insert.run('Ang Alamat ng Ampalaya', 'Unknown', '978-1234567893', 3, 2, 'Filipino Literature');
  
  console.log('✅ Sample books inserted!');
}

// ==========================================
// MIDDLEWARE
// ==========================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Session for flash messages
app.use(session({
  secret: 'library-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 } // 1 minute
}));

app.use(flash());

// Make flash messages available to all views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================

function validateBook(data) {
  const errors = [];
  
  // Title validation
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  
  // Author validation
  if (!data.author || data.author.trim().length === 0) {
    errors.push('Author is required');
  } else if (data.author.length > 100) {
    errors.push('Author must be less than 100 characters');
  }
  
  // ISBN validation (basic format check)
  if (!data.isbn || data.isbn.trim().length === 0) {
    errors.push('ISBN is required');
  } else if (!/^978-\d{10}$/.test(data.isbn)) {
    errors.push('ISBN must be in format: 978-XXXXXXXXXX');
  }
  
  // Copies validation
  if (!data.copies || isNaN(data.copies) || parseInt(data.copies) < 1) {
    errors.push('Copies must be at least 1');
  }
  
  // Available validation
  if (!data.available || isNaN(data.available) || parseInt(data.available) < 0) {
    errors.push('Available copies must be 0 or more');
  }
  
  // Available can't be more than total copies
  if (parseInt(data.available) > parseInt(data.copies)) {
    errors.push('Available copies cannot exceed total copies');
  }
  
  // Category validation
  if (!data.category || data.category.trim().length === 0) {
    errors.push('Category is required');
  }
  
  return errors;
}

function checkDuplicateISBN(isbn, excludeId = null) {
  let book;
  if (excludeId) {
    book = db.prepare('SELECT * FROM books WHERE isbn = ? AND id != ?').get(isbn, excludeId);
  } else {
    book = db.prepare('SELECT * FROM books WHERE isbn = ?').get(isbn);
  }
  return book !== undefined;
}

// ==========================================
// ROUTES - READ
// ==========================================

// List all books
app.get('/', (req, res) => {
  const books = db.prepare('SELECT * FROM books ORDER BY title').all();
  const stats = {
    total: books.length,
    totalCopies: books.reduce((sum, b) => sum + b.copies, 0),
    available: books.reduce((sum, b) => sum + b.available, 0),
    borrowed: books.reduce((sum, b) => sum + (b.copies - b.available), 0)
  };
  
  res.render('index', { books, stats });
});

// ==========================================
// ROUTES - CREATE
// ==========================================

// Show add form
app.get('/add', (req, res) => {
  res.render('add', { formData: {} });
});

// Handle add form submission
app.post('/add', (req, res) => {
  // Validate input
  const errors = validateBook(req.body);
  
  // Check duplicate ISBN
  if (checkDuplicateISBN(req.body.isbn)) {
    errors.push('ISBN already exists in database');
  }
  
  // If errors, show form again with errors
  if (errors.length > 0) {
    req.flash('error', errors);
    return res.render('add', { formData: req.body });
  }
  
  // All valid, insert
  const stmt = db.prepare(`
    INSERT INTO books (title, author, isbn, copies, available, category) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  try {
    stmt.run(
      req.body.title.trim(),
      req.body.author.trim(),
      req.body.isbn.trim(),
      parseInt(req.body.copies),
      parseInt(req.body.available),
      req.body.category.trim()
    );
    
    req.flash('success', `Book "${req.body.title}" added successfully!`);
    res.redirect('/');
  } catch (error) {
    console.error('❌ Error adding book:', error.message);
    req.flash('error', 'Database error: ' + error.message);
    res.render('add', { formData: req.body });
  }
});

// ==========================================
// ROUTES - UPDATE
// ==========================================

// Show edit form
app.get('/edit/:id', (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  
  if (!book) {
    req.flash('error', 'Book not found');
    return res.redirect('/');
  }
  
  res.render('edit', { book, formData: book });
});

// Handle edit form submission
app.post('/edit/:id', (req, res) => {
  const id = req.params.id;
  
  // Validate input
  const errors = validateBook(req.body);
  
  // Check duplicate ISBN (excluding current book)
  if (checkDuplicateISBN(req.body.isbn, id)) {
    errors.push('ISBN already exists in database');
  }
  
  // If errors, show form again with errors
  if (errors.length > 0) {
    req.flash('error', errors);
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
    return res.render('edit', { book, formData: req.body });
  }
  
  // All valid, update
  const stmt = db.prepare(`
    UPDATE books 
    SET title = ?, author = ?, isbn = ?, copies = ?, available = ?, category = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `);
  
  try {
    stmt.run(
      req.body.title.trim(),
      req.body.author.trim(),
      req.body.isbn.trim(),
      parseInt(req.body.copies),
      parseInt(req.body.available),
      req.body.category.trim(),
      id
    );
    
    req.flash('success', `Book "${req.body.title}" updated successfully!`);
    res.redirect('/');
  } catch (error) {
    console.error('❌ Error updating book:', error.message);
    req.flash('error', 'Database error: ' + error.message);
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
    res.render('edit', { book, formData: req.body });
  }
});

// ==========================================
// ROUTES - DELETE
// ==========================================

// Handle delete
app.post('/delete/:id', (req, res) => {
  const id = req.params.id;
  const book = db.prepare('SELECT title FROM books WHERE id = ?').get(id);
  
  if (!book) {
    req.flash('error', 'Book not found');
    return res.redirect('/');
  }
  
  try {
    db.prepare('DELETE FROM books WHERE id = ?').run(id);
    req.flash('success', `Book "${book.title}" deleted successfully!`);
  } catch (error) {
    console.error('❌ Error deleting book:', error.message);
    req.flash('error', 'Database error: ' + error.message);
  }
  
  res.redirect('/');
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📚 Books in library: ${db.prepare('SELECT COUNT(*) as count FROM books').get().count}`);
});
