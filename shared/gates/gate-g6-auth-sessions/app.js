// ============================================================================
// GATE G6 · Authentication & Sessions · 30 minutes · NO AI · individual
// Lock the Dashboard.  Implement the FIVE TODOs below.
// Test login (already in auth-helper.js):  admin  /  barangay123
// Run:  npm install  &&  npm start   ->  http://localhost:3000
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

// Session middleware (given — already configured).
app.use(session({
  secret: 'gate-g6-secret',
  resave: false,
  saveUninitialized: false
}));

// ============================================================
// TODO 1: GET /login
//   Render the 'login' view. Pass { error: null }.
// ============================================================
// YOUR CODE HERE


// ============================================================
// TODO 2: POST /login
//   - Read username + password from req.body.
//   - Call verifyUser(username, password).
//       success -> set req.session.user = the user object, redirect to /dashboard
//       failure -> re-render 'login' with { error: 'Wrong username or password.' }
// ============================================================
// YOUR CODE HERE


// ============================================================
// TODO 3: Write a guard middleware  requireLogin.
//   - If req.session.user is missing -> redirect to /login.
//   - Otherwise call next().
//   Hint:
//     function requireLogin(req, res, next) {
//       if (!req.session.user) return res.redirect('/login');
//       next();
//     }
// ============================================================
// YOUR CODE HERE


// ============================================================
// TODO 4: GET /dashboard  (PROTECTED — use requireLogin)
//   Render 'dashboard' with { user: req.session.user } so it can greet them.
//   Hint:  app.get('/dashboard', requireLogin, (req, res) => { ... });
// ============================================================
// YOUR CODE HERE


// ============================================================
// TODO 5: GET /logout
//   Destroy the session, then redirect to /login.
//   Hint:  req.session.destroy(() => res.redirect('/login'));
// ============================================================
// YOUR CODE HERE


// Public entry point (given) — bounces based on login state.
app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
