// ============================================================================
// GATE G5 · SOLUTION (teacher reference). Run with:  node app.solution.js
// All queries use prepared statements (? placeholders) — no string concat.
// ============================================================================

const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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

// TODO 1
app.get('/', (req, res) => {
  const residents = db.prepare('SELECT * FROM residents ORDER BY name').all();
  res.render('index', { residents });
});

// TODO 2
app.get('/add', (req, res) => {
  res.render('add');
});

// TODO 3 — prepared statement prevents SQL injection
app.post('/add', (req, res) => {
  const { name, purok } = req.body;
  db.prepare('INSERT INTO residents (name, purok) VALUES (?, ?)').run(name, purok);
  res.redirect('/');
});

// TODO 4 — prepared statement
app.post('/delete/:id', (req, res) => {
  db.prepare('DELETE FROM residents WHERE id = ?').run(req.params.id);
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`✅ Solution server running at http://localhost:${PORT}`);
});
