// ============================================================================
// GATE G4 · SOLUTION (teacher reference). Run with:  node app.solution.js
// ============================================================================

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// TODO 1
app.get('/', (req, res) => {
  res.render('form', { error: null });
});

// TODO 2
app.post('/greet', (req, res) => {
  const { name } = req.body;

  // SERVER-SIDE validation (the form has no `required`, so this is the only guard)
  if (!name || name.trim() === '') {
    return res.render('form', { error: 'Please enter your name.' });
  }

  res.render('greet', { name: name.trim() });
});

app.listen(PORT, () => {
  console.log(`✅ Solution server running at http://localhost:${PORT}`);
});
