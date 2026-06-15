// ============================================================================
// PROVIDED — do NOT change.  (Part of the gate scaffold.)
//
// A tiny fake user store so you do NOT hand-roll password crypto.
// In a real app you would hash passwords with a library (e.g. bcrypt) and
// store only the hashes. Here we keep it simple to focus on SESSIONS.
//
// Test login:   username = admin     password = barangay123
// ============================================================================

const USERS = [
  { username: 'admin', password: 'barangay123', name: 'Barangay Admin' }
];

// Returns the matching user object, or null if the credentials are wrong.
function verifyUser(username, password) {
  const user = USERS.find(u => u.username === username && u.password === password);
  return user || null;
}

module.exports = { verifyUser };
