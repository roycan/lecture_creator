// ============================================================================
// GATE G5 · Data Modeling + SQLite CRUD · 30 minutes · NO AI · individual
// Resident Records.  Implement the FOUR routes below (the TODOs).
// EVERY query MUST use a prepared statement with ? placeholders.
// Run:  npm install  &&  npm start   ->  http://localhost:3000
// ============================================================================

const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// DATABASE SETUP (given)
// ==========================================
const db = new Database(path.join(__dirname, 'residents.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS residents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    purok TEXT NOT NULL
  )
`);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// ============================================================
// TODO 1: GET /
//   SELECT all residents ordered by name, then render 'index'.
//   Hint:
//     const residents = db.prepare('SELECT * FROM residents ORDER BY name').all();
//     res.render('index', { residents });
// ============================================================
// YOUR CODE HERE


// ============================================================
// TODO 2: GET /add
//   Render the 'add' form view.
// ============================================================
// YOUR CODE HERE


// ============================================================
// TODO 3: POST /add
//   Insert a resident using a PREPARED STATEMENT (the ? placeholders).
//   Read name + purok from req.body, then redirect to /.
//   Hint:
//     const { name, purok } = req.body;
//     db.prepare('INSERT INTO residents (name, purok) VALUES (?, ?)').run(name, purok);
//     res.redirect('/');
//
//   ⚠️  INSTANT FAIL: building the SQL with string concatenation
//       (e.g. `INSERT ... VALUES ('${name}')`) is SQL INJECTION.
//       Always use  ?  placeholders.
// ============================================================
// YOUR CODE HERE


// ============================================================
// TODO 4: POST /delete/:id
//   Delete the resident by id using a PREPARED STATEMENT, then redirect to /.
//   Hint:
//     db.prepare('DELETE FROM residents WHERE id = ?').run(req.params.id);
//     res.redirect('/');
// ============================================================
// YOUR CODE HERE


app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
