-- Users Table Schema Template
-- Ready-to-use schema for user accounts with authentication

-- Enable foreign keys (add to your setup script)
PRAGMA foreign_keys = ON;

-- =============================================================================
-- Users Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Authentication
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,  -- bcrypt hash (never store plain passwords!)
  
  -- Profile information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  
  -- Account status
  is_active INTEGER DEFAULT 1,  -- 1 = active, 0 = deactivated
  is_verified INTEGER DEFAULT 0,  -- Email verification status
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME,
  
  -- Constraints
  CHECK (email LIKE '%_@_%._%'),  -- Basic email validation
  CHECK (LENGTH(username) >= 3),  -- Minimum username length
  CHECK (is_active IN (0, 1)),
  CHECK (is_verified IN (0, 1))
);

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- Speed up login queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Speed up active user queries
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- =============================================================================
-- User Roles Table (Optional)
-- =============================================================================

CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,  -- 'admin', 'moderator', 'user'
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Link users to roles (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  
  -- Each user can have each role only once
  UNIQUE(user_id, role_id)
);

-- Indexes for role queries
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- =============================================================================
-- Password Reset Tokens (Optional)
-- =============================================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,  -- 0 = not used, 1 = already used
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (used IN (0, 1))
);

-- Speed up token validation
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- =============================================================================
-- User Sessions (Optional - if not using express-session)
-- =============================================================================

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Speed up session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- =============================================================================
-- Sample Data (for development)
-- =============================================================================

-- Insert default roles
INSERT OR IGNORE INTO roles (name, description) VALUES
  ('admin', 'Full system access'),
  ('moderator', 'Can moderate content'),
  ('user', 'Regular user access');

-- Insert test user (password: 'password123' hashed with bcrypt)
-- Note: Use bcrypt.hash() in your actual application!
INSERT OR IGNORE INTO users (
  email, 
  username, 
  password_hash, 
  first_name, 
  last_name,
  is_verified
) VALUES (
  'admin@example.com',
  'admin',
  '$2b$10$YourBcryptHashHere',  -- Replace with actual bcrypt hash
  'Admin',
  'User',
  1
);

-- =============================================================================
-- Common Queries
-- =============================================================================

-- Find user by email (for login)
-- SELECT * FROM users WHERE email = ? AND is_active = 1;

-- Find user by username
-- SELECT * FROM users WHERE username = ? AND is_active = 1;

-- Get user with roles
-- SELECT 
--   users.*,
--   GROUP_CONCAT(roles.name) as roles
-- FROM users
-- LEFT JOIN user_roles ON users.id = user_roles.user_id
-- LEFT JOIN roles ON user_roles.role_id = roles.id
-- WHERE users.id = ?
-- GROUP BY users.id;

-- Check if user has specific role
-- SELECT COUNT(*) as has_role
-- FROM user_roles
-- WHERE user_id = ? AND role_id = (SELECT id FROM roles WHERE name = ?);

-- Update last login timestamp
-- UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?;

-- Deactivate user
-- UPDATE users SET is_active = 0 WHERE id = ?;

-- Clean expired password reset tokens
-- DELETE FROM password_reset_tokens 
-- WHERE expires_at < CURRENT_TIMESTAMP OR used = 1;

-- Clean expired sessions
-- DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP;

-- =============================================================================
-- JavaScript Usage Examples (with better-sqlite3)
-- =============================================================================

/*

const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const db = new Database('database.db');

// ============================================================================
// Registration
// ============================================================================

async function registerUser(email, username, password, firstName, lastName) {
  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert user
    const stmt = db.prepare(`
      INSERT INTO users (email, username, password_hash, first_name, last_name)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(email, username, passwordHash, firstName, lastName);
    
    // Assign default 'user' role
    const roleId = db.prepare('SELECT id FROM roles WHERE name = ?').get('user').id;
    db.prepare('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)').run(result.lastInsertRowid, roleId);
    
    return result.lastInsertRowid;
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      if (error.message.includes('email')) {
        throw new Error('Email already registered');
      } else if (error.message.includes('username')) {
        throw new Error('Username already taken');
      }
    }
    throw error;
  }
}

// ============================================================================
// Login
// ============================================================================

async function loginUser(email, password) {
  // Find user
  const user = db.prepare(`
    SELECT * FROM users 
    WHERE email = ? AND is_active = 1
  `).get(email);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  
  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }
  
  // Update last login
  db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
  
  return user;
}

// ============================================================================
// Get User with Roles
// ============================================================================

function getUserWithRoles(userId) {
  const user = db.prepare(`
    SELECT 
      users.*,
      GROUP_CONCAT(roles.name) as roles
    FROM users
    LEFT JOIN user_roles ON users.id = user_roles.user_id
    LEFT JOIN roles ON user_roles.role_id = roles.id
    WHERE users.id = ?
    GROUP BY users.id
  `).get(userId);
  
  if (user) {
    user.roles = user.roles ? user.roles.split(',') : [];
  }
  
  return user;
}

// ============================================================================
// Check Permission
// ============================================================================

function hasRole(userId, roleName) {
  const result = db.prepare(`
    SELECT COUNT(*) as has_role
    FROM user_roles
    JOIN roles ON user_roles.role_id = roles.id
    WHERE user_roles.user_id = ? AND roles.name = ?
  `).get(userId, roleName);
  
  return result.has_role > 0;
}

// ============================================================================
// Middleware: Require Login
// ============================================================================

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  
  // Attach user to request
  req.user = getUserWithRoles(req.session.userId);
  
  if (!req.user || !req.user.is_active) {
    req.session.destroy();
    return res.redirect('/login');
  }
  
  next();
}

// ============================================================================
// Middleware: Require Role
// ============================================================================

function requireRole(roleName) {
  return (req, res, next) => {
    if (!req.user || !hasRole(req.user.id, roleName)) {
      return res.status(403).send('Access denied');
    }
    next();
  };
}

// ============================================================================
// Routes Example
// ============================================================================

// Registration
app.post('/register', async (req, res) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;
    
    const userId = await registerUser(email, username, password, firstName, lastName);
    
    req.session.userId = userId;
    res.redirect('/dashboard');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await loginUser(email, password);
    
    req.session.userId = user.id;
    res.redirect('/dashboard');
  } catch (error) {
    res.status(401).send(error.message);
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Protected route
app.get('/dashboard', requireLogin, (req, res) => {
  res.render('dashboard', { user: req.user });
});

// Admin-only route
app.get('/admin', requireLogin, requireRole('admin'), (req, res) => {
  res.render('admin', { user: req.user });
});

*/

-- =============================================================================
-- Triggers (Optional - Auto-update timestamps)
-- =============================================================================

-- Automatically update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =============================================================================
-- Security Best Practices
-- =============================================================================

-- ✓ Never store plain passwords (use bcrypt)
-- ✓ Use prepared statements (prevent SQL injection)
-- ✓ Validate email format before inserting
-- ✓ Enforce minimum password length (8+ characters)
-- ✓ Require password complexity (uppercase, lowercase, numbers, symbols)
-- ✓ Implement rate limiting for login attempts
-- ✓ Use HTTPS in production
-- ✓ Validate and sanitize all user input
-- ✓ Implement session timeouts
-- ✓ Log authentication events (failed logins, password changes)
-- ✓ Implement account lockout after failed attempts
-- ✓ Use secure session configuration (httpOnly, secure, sameSite)

-- =============================================================================
-- Notes
-- =============================================================================

-- 1. Replace '$2b$10$YourBcryptHashHere' with actual bcrypt hash
-- 2. Password reset flow requires email sending (use nodemailer)
-- 3. For sessions, consider using express-session with connect-sqlite3
-- 4. Implement CSRF protection for forms
-- 5. Add email verification flow for new registrations
-- 6. Consider adding 2FA (two-factor authentication) for sensitive operations
-- 7. Regularly backup your users table
-- 8. Never expose password hashes in API responses
-- 9. Implement password strength meter on frontend
-- 10. Consider using OAuth (Google, Facebook) for authentication
