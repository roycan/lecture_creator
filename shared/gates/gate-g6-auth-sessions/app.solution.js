// ============================================================================
// GATE G6 · SOLUTION (teacher reference). Run with:  node app.solution.js
// Test login:  admin  /  barangay123
// ============================================================================

const express = require('express');
const session = require('express-session');
const path = require('path');
const { verifyUser } = require('./auth-helper');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'gate-g6-secret',
  resave: false,
  saveUninitialized: false
}));

// TODO 1
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// TODO 2
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = verifyUser(username, password);

  if (user) {
    req.session.user = user;
    return res.redirect('/dashboard');
  }
  res.render('login', { error: 'Wrong username or password.' });
});

// TODO 3
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

// TODO 4
app.get('/dashboard', requireLogin, (req, res) => {
  res.render('dashboard', { user: req.session.user });
});

// TODO 5
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`✅ Solution server running at http://localhost:${PORT}`);
});
