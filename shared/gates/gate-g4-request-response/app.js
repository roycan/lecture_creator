// ============================================================================
// GATE G4 · Request -> Response · 30 minutes · NO AI · individual
// Barangay Greeting Server.  Implement the TWO routes below (the TODOs).
// Run:  npm install  &&  npm start   ->  http://localhost:3000
// ============================================================================

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// EJS view engine + form parsing are already wired for you.
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// ============================================================
// TODO 1: GET /
//   Render the 'form' view. Pass { error: null } so the template works.
//   Hint:  res.render('form', { error: null });
// ============================================================
// YOUR CODE HERE


// ============================================================
// TODO 2: POST /greet
//   - Read the name from req.body.
//   - SERVER-SIDE validation: if the name is empty or just spaces,
//     re-render 'form' WITH an error: { error: 'Please enter your name.' }
//     (then return, so the rest does not run).
//   - Otherwise render the 'greet' view with the name.
//   Hint:
//     const { name } = req.body;
//     if (!name || name.trim() === '') { res.render('form', { error: 'Please enter your name.' }); return; }
//     res.render('greet', { name });
//
//   NOTE: The form has NO `required` attribute, so only your SERVER check
//   can stop an empty submit. That is on purpose.
// ============================================================
// YOUR CODE HERE


app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
