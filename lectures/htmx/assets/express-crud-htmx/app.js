const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// Helper: read officials from JSON file
function readOfficials() {
  const raw = fs.readFileSync(path.join(__dirname, 'data', 'officials.json'), 'utf-8');
  return JSON.parse(raw);
}

// Helper: write officials to JSON file
function writeOfficials(data) {
  fs.writeFileSync(
    path.join(__dirname, 'data', 'officials.json'),
    JSON.stringify(data, null, 2),
    'utf-8'
  );
}

// GET / — full page
app.get('/', (req, res) => {
  const officials = readOfficials();
  res.render('index', { officials, error: null });
});

// GET /directory/rows — returns table body fragment (for hx-get)
app.get('/directory/rows', (req, res) => {
  const officials = readOfficials();
  res.render('partials/official-rows', { officials });
});

// POST /officials — add a new official
app.post('/officials', (req, res) => {
  const { name, position } = req.body;
  if (!name || !position) {
    return res.render('partials/official-form', { error: 'Both name and position are required.' });
  }
  const officials = readOfficials();
  const newId = officials.length > 0 ? Math.max(...officials.map(o => o.id)) + 1 : 1;
  officials.push({ id: newId, name: name.trim(), position: position.trim() });
  writeOfficials(officials);
  res.set('HX-Trigger', 'officialAdded');
  res.render('partials/official-form', { error: null });
});

// GET /official/:id — returns detail fragment (master-detail pattern)
app.get('/official/:id', (req, res) => {
  const officials = readOfficials();
  const official = officials.find(o => o.id === parseInt(req.params.id));
  if (!official) {
    return res.status(404).send('<p class="has-text-danger">Official not found.</p>');
  }
  res.render('partials/official-detail', { official });
});

// GET /official/:id/edit — returns inline edit input
app.get('/official/:id/edit', (req, res) => {
  const officials = readOfficials();
  const official = officials.find(o => o.id === parseInt(req.params.id));
  if (!official) {
    return res.status(404).send('<p class="has-text-danger">Official not found.</p>');
  }
  res.render('partials/official-edit', { official });
});

// POST /official/:id/update — save edited name, return updated display
app.post('/official/:id/update', (req, res) => {
  const officials = readOfficials();
  const official = officials.find(o => o.id === parseInt(req.params.id));
  if (!official) {
    return res.status(404).send('<p class="has-text-danger">Official not found.</p>');
  }
  const newName = (req.body.name || '').trim();
  if (!newName) {
    return res.render('partials/official-edit', { official, error: 'Name cannot be empty.' });
  }
  official.name = newName;
  writeOfficials(officials);
  // Return the display fragment (not the edit input) — the updated row
  res.render('partials/official-detail', { official });
});

// GET /directory/search — search officials by name
app.get('/directory/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const officials = readOfficials();
  const filtered = q
    ? officials.filter(o => o.name.toLowerCase().includes(q) || o.position.toLowerCase().includes(q))
    : officials;
  res.render('partials/official-rows', { officials: filtered });
});

app.listen(PORT, () => {
  console.log(`Barangay Directory htmx demo running at http://localhost:${PORT}`);
});
