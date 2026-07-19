const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3000;

// Database connection
const dbPath = path.join(__dirname, 'data', 'barangay.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================================================================
// ROUTES
// ============================================================================

// Home - List all residents with barangay info
app.get('/', (req, res) => {
  try {
    const residents = db.prepare(`
      SELECT 
        residents.id,
        residents.name,
        residents.age,
        residents.address,
        barangays.name as barangay_name,
        barangays.id as barangay_id
      FROM residents
      INNER JOIN barangays ON residents.barangay_id = barangays.id
      ORDER BY residents.name
    `).all();

    const barangays = db.prepare('SELECT * FROM barangays ORDER BY name').all();

    res.render('index', { residents, barangays });
  } catch (error) {
    console.error('Error fetching residents:', error);
    res.status(500).send('Database error');
  }
});

// Add resident form
app.get('/add', (req, res) => {
  try {
    const barangays = db.prepare('SELECT * FROM barangays ORDER BY name').all();
    res.render('add', { barangays });
  } catch (error) {
    console.error('Error loading form:', error);
    res.status(500).send('Database error');
  }
});

// Add resident (POST)
app.post('/add', (req, res) => {
  const { name, age, address, barangay_id } = req.body;

  // Validation
  if (!name || !age || !address || !barangay_id) {
    return res.status(400).send('All fields are required');
  }

  const ageNum = parseInt(age);
  if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
    return res.status(400).send('Please enter a valid age (0-150)');
  }

  try {
    // Verify barangay exists
    const barangay = db.prepare('SELECT id FROM barangays WHERE id = ?').get(barangay_id);
    if (!barangay) {
      return res.status(400).send('Invalid barangay selected');
    }

    // Insert resident
    const stmt = db.prepare(`
      INSERT INTO residents (name, age, address, barangay_id)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(name.trim(), ageNum, address.trim(), barangay_id);

    res.redirect('/');
  } catch (error) {
    console.error('Error adding resident:', error);
    res.status(500).send('Database error');
  }
});

// View single resident
app.get('/resident/:id', (req, res) => {
  try {
    const resident = db.prepare(`
      SELECT 
        residents.*,
        barangays.name as barangay_name,
        barangays.captain as barangay_captain
      FROM residents
      INNER JOIN barangays ON residents.barangay_id = barangays.id
      WHERE residents.id = ?
    `).get(req.params.id);

    if (!resident) {
      return res.status(404).send('Resident not found');
    }

    res.render('view', { resident });
  } catch (error) {
    console.error('Error fetching resident:', error);
    res.status(500).send('Database error');
  }
});

// Edit resident form
app.get('/edit/:id', (req, res) => {
  try {
    const resident = db.prepare('SELECT * FROM residents WHERE id = ?').get(req.params.id);
    
    if (!resident) {
      return res.status(404).send('Resident not found');
    }

    const barangays = db.prepare('SELECT * FROM barangays ORDER BY name').all();

    res.render('edit', { resident, barangays });
  } catch (error) {
    console.error('Error loading edit form:', error);
    res.status(500).send('Database error');
  }
});

// Update resident (POST)
app.post('/edit/:id', (req, res) => {
  const { name, age, address, barangay_id } = req.body;

  // Validation
  if (!name || !age || !address || !barangay_id) {
    return res.status(400).send('All fields are required');
  }

  const ageNum = parseInt(age);
  if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
    return res.status(400).send('Please enter a valid age (0-150)');
  }

  try {
    // Verify barangay exists
    const barangay = db.prepare('SELECT id FROM barangays WHERE id = ?').get(barangay_id);
    if (!barangay) {
      return res.status(400).send('Invalid barangay selected');
    }

    // Update resident
    const stmt = db.prepare(`
      UPDATE residents
      SET name = ?,
          age = ?,
          address = ?,
          barangay_id = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(name.trim(), ageNum, address.trim(), barangay_id, req.params.id);

    if (result.changes === 0) {
      return res.status(404).send('Resident not found');
    }

    res.redirect(`/resident/${req.params.id}`);
  } catch (error) {
    console.error('Error updating resident:', error);
    res.status(500).send('Database error');
  }
});

// Delete resident (POST)
app.post('/delete/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM residents WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).send('Resident not found');
    }

    res.redirect('/');
  } catch (error) {
    console.error('Error deleting resident:', error);
    res.status(500).send('Database error');
  }
});

// Search residents
app.get('/search', (req, res) => {
  const searchTerm = req.query.q || '';

  try {
    const residents = db.prepare(`
      SELECT 
        residents.id,
        residents.name,
        residents.age,
        residents.address,
        barangays.name as barangay_name
      FROM residents
      INNER JOIN barangays ON residents.barangay_id = barangays.id
      WHERE residents.name LIKE ? OR residents.address LIKE ?
      ORDER BY residents.name
    `).all(`%${searchTerm}%`, `%${searchTerm}%`);

    const barangays = db.prepare('SELECT * FROM barangays ORDER BY name').all();

    res.render('index', { residents, barangays, searchTerm });
  } catch (error) {
    console.error('Error searching residents:', error);
    res.status(500).send('Database error');
  }
});

// Filter by barangay
app.get('/barangay/:id', (req, res) => {
  try {
    const barangay = db.prepare('SELECT * FROM barangays WHERE id = ?').get(req.params.id);
    
    if (!barangay) {
      return res.status(404).send('Barangay not found');
    }

    const residents = db.prepare(`
      SELECT 
        residents.id,
        residents.name,
        residents.age,
        residents.address,
        barangays.name as barangay_name
      FROM residents
      INNER JOIN barangays ON residents.barangay_id = barangays.id
      WHERE barangays.id = ?
      ORDER BY residents.name
    `).all(req.params.id);

    const barangays = db.prepare('SELECT * FROM barangays ORDER BY name').all();

    res.render('index', { residents, barangays, selectedBarangay: barangay });
  } catch (error) {
    console.error('Error filtering by barangay:', error);
    res.status(500).send('Database error');
  }
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 Barangay Directory running at http://localhost:${PORT}`);
  console.log(`📊 Database: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  console.log('\n✓ Database closed');
  process.exit();
});
