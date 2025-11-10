const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database path
const dbPath = path.join(dataDir, 'barangay.db');

console.log('Setting up Barangay Directory database...');
console.log('Database path:', dbPath);

// Open connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('\nCreating tables...');

// Create tables
db.exec(`
  -- Barangays table
  CREATE TABLE IF NOT EXISTS barangays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    captain TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Residents table
  CREATE TABLE IF NOT EXISTS residents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0),
    address TEXT NOT NULL,
    barangay_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barangay_id) REFERENCES barangays(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
  );
`);

console.log('✓ Tables created successfully');

// Create indexes
console.log('\nCreating indexes...');

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_residents_barangay_id ON residents(barangay_id);
  CREATE INDEX IF NOT EXISTS idx_residents_name ON residents(name);
`);

console.log('✓ Indexes created successfully');

// Insert sample data
console.log('\nInserting sample data...');

// Sample barangays
const barangayStmt = db.prepare('INSERT INTO barangays (name, captain) VALUES (?, ?)');
const barangays = [
  ['San Antonio', 'Capt. Juan Dela Cruz'],
  ['Santa Cruz', 'Capt. Maria Santos'],
  ['San Jose', 'Capt. Pedro Reyes']
];

const insertBarangays = db.transaction(() => {
  barangays.forEach(barangay => barangayStmt.run(...barangay));
});

insertBarangays();

console.log(`✓ Inserted ${barangays.length} barangays`);

// Sample residents
const residentStmt = db.prepare('INSERT INTO residents (name, age, address, barangay_id) VALUES (?, ?, ?, ?)');
const residents = [
  ['Juan Cruz', 35, '123 Main St', 1],
  ['Maria Santos', 28, '456 Oak Ave', 1],
  ['Pedro Reyes', 42, '789 Pine Rd', 2],
  ['Ana Garcia', 31, '321 Elm St', 2],
  ['Carlos Lopez', 25, '654 Maple Dr', 3],
  ['Rosa Mendoza', 38, '987 Cedar Ln', 3]
];

const insertResidents = db.transaction(() => {
  residents.forEach(resident => residentStmt.run(...resident));
});

insertResidents();

console.log(`✓ Inserted ${residents.length} residents`);

// Display summary
console.log('\n=== Database Summary ===');
const barangayCount = db.prepare('SELECT COUNT(*) as count FROM barangays').get();
const residentCount = db.prepare('SELECT COUNT(*) as count FROM residents').get();

console.log(`Barangays: ${barangayCount.count}`);
console.log(`Residents: ${residentCount.count}`);

// Test query
console.log('\n=== Sample Query ===');
const sampleQuery = db.prepare(`
  SELECT 
    residents.name,
    residents.age,
    residents.address,
    barangays.name as barangay_name
  FROM residents
  INNER JOIN barangays ON residents.barangay_id = barangays.id
  LIMIT 3
`).all();

console.log('First 3 residents:');
sampleQuery.forEach(resident => {
  console.log(`- ${resident.name}, ${resident.age} years old (${resident.barangay_name})`);
});

db.close();
console.log('\n✓ Database setup complete!');
console.log('Run "npm start" to start the application.');
