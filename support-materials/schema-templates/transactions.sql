-- Transactions/Audit Log Schema Template
-- Ready-to-use schema for tracking changes, financial transactions, and audit trails

-- Enable foreign keys (add to your setup script)
PRAGMA foreign_keys = ON;

-- =============================================================================
-- Financial Transactions Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Transaction identification
  transaction_id TEXT NOT NULL UNIQUE,  -- Unique reference number (e.g., 'TXN-2024-001')
  transaction_type TEXT NOT NULL,  -- 'sale', 'refund', 'payment', 'adjustment'
  
  -- Related entities
  user_id INTEGER,  -- Who initiated the transaction
  customer_id INTEGER,  -- Customer involved (if applicable)
  order_id INTEGER,  -- Related order (if applicable)
  
  -- Financial details
  amount REAL NOT NULL CHECK (amount != 0),  -- Positive = income, Negative = expense
  currency TEXT DEFAULT 'PHP',
  payment_method TEXT,  -- 'cash', 'credit_card', 'gcash', 'bank_transfer'
  reference_number TEXT,  -- External reference (e.g., payment gateway ID)
  
  -- Transaction status
  status TEXT DEFAULT 'completed',  -- 'pending', 'completed', 'failed', 'cancelled'
  
  -- Description and notes
  description TEXT NOT NULL,
  notes TEXT,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  cancelled_at DATETIME,
  
  -- Constraints
  CHECK (transaction_type IN ('sale', 'refund', 'payment', 'adjustment', 'transfer')),
  CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'gcash', 'paymaya', 'bank_transfer', 'other'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- =============================================================================
-- Audit Log Table (Track all database changes)
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- What was changed
  table_name TEXT NOT NULL,  -- Which table was affected
  record_id INTEGER NOT NULL,  -- ID of the affected record
  action TEXT NOT NULL,  -- 'INSERT', 'UPDATE', 'DELETE'
  
  -- Who made the change
  user_id INTEGER,  -- Who performed the action
  username TEXT,  -- Username (for reference even if user is deleted)
  
  -- Change details
  old_values TEXT,  -- JSON string of old values (for UPDATE/DELETE)
  new_values TEXT,  -- JSON string of new values (for INSERT/UPDATE)
  
  -- When and where
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- =============================================================================
-- Activity Log Table (Track user actions)
-- =============================================================================

CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Who
  user_id INTEGER,
  username TEXT,
  
  -- What
  action TEXT NOT NULL,  -- 'login', 'logout', 'view_page', 'export_data', 'delete_record'
  entity_type TEXT,  -- 'product', 'user', 'order', etc.
  entity_id INTEGER,  -- ID of the affected entity
  
  -- Description
  description TEXT NOT NULL,  -- Human-readable description
  
  -- Request details
  ip_address TEXT,
  user_agent TEXT,
  request_method TEXT,  -- GET, POST, PUT, DELETE
  request_url TEXT,
  
  -- Metadata
  metadata TEXT,  -- JSON string for additional data
  
  -- Timing
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

-- =============================================================================
-- Error Log Table (Track application errors)
-- =============================================================================

CREATE TABLE IF NOT EXISTS error_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Error details
  error_type TEXT NOT NULL,  -- 'validation', 'database', 'authentication', 'system'
  error_message TEXT NOT NULL,
  error_code TEXT,
  stack_trace TEXT,
  
  -- Context
  user_id INTEGER,
  request_url TEXT,
  request_method TEXT,
  request_body TEXT,
  
  -- Environment
  severity TEXT DEFAULT 'error',  -- 'info', 'warning', 'error', 'critical'
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  resolved_by INTEGER,
  
  -- Constraints
  CHECK (severity IN ('info', 'warning', 'error', 'critical'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_error_log_error_type ON error_log(error_type);
CREATE INDEX IF NOT EXISTS idx_error_log_severity ON error_log(severity);
CREATE INDEX IF NOT EXISTS idx_error_log_created_at ON error_log(created_at);

-- =============================================================================
-- Sample Data
-- =============================================================================

-- Sample transactions
INSERT OR IGNORE INTO transactions (
  transaction_id, transaction_type, amount, payment_method, 
  description, status
) VALUES
  ('TXN-2024-001', 'sale', 1500.00, 'cash', 'Product sale - Order #123', 'completed'),
  ('TXN-2024-002', 'sale', 2999.00, 'gcash', 'Product sale - Order #124', 'completed'),
  ('TXN-2024-003', 'refund', -500.00, 'cash', 'Refund for damaged item', 'completed'),
  ('TXN-2024-004', 'payment', 10000.00, 'bank_transfer', 'Supplier payment', 'completed');

-- =============================================================================
-- Common Queries
-- =============================================================================

-- Get transactions by date range
-- SELECT * FROM transactions
-- WHERE DATE(created_at) BETWEEN ? AND ?
-- ORDER BY created_at DESC;

-- Get transaction summary by type
-- SELECT 
--   transaction_type,
--   COUNT(*) as count,
--   SUM(amount) as total
-- FROM transactions
-- WHERE status = 'completed'
-- GROUP BY transaction_type;

-- Get daily sales
-- SELECT 
--   DATE(created_at) as date,
--   COUNT(*) as transaction_count,
--   SUM(amount) as total_sales
-- FROM transactions
-- WHERE transaction_type = 'sale' AND status = 'completed'
-- GROUP BY DATE(created_at)
-- ORDER BY date DESC;

-- Get audit trail for specific record
-- SELECT * FROM audit_log
-- WHERE table_name = ? AND record_id = ?
-- ORDER BY created_at DESC;

-- Get user activity
-- SELECT * FROM activity_log
-- WHERE user_id = ?
-- ORDER BY created_at DESC
-- LIMIT 50;

-- Get recent errors
-- SELECT * FROM error_log
-- WHERE severity IN ('error', 'critical')
-- ORDER BY created_at DESC
-- LIMIT 20;

-- =============================================================================
-- JavaScript Usage Examples (with better-sqlite3)
-- =============================================================================

/*

const Database = require('better-sqlite3');
const db = new Database('database.db');

// ============================================================================
// Generate Transaction ID
// ============================================================================

function generateTransactionId() {
  const year = new Date().getFullYear();
  const count = db.prepare(`
    SELECT COUNT(*) as count 
    FROM transactions 
    WHERE transaction_id LIKE ?
  `).get(`TXN-${year}-%`).count;
  
  const nextNumber = String(count + 1).padStart(6, '0');
  return `TXN-${year}-${nextNumber}`;
}

// ============================================================================
// Record Transaction
// ============================================================================

function recordTransaction(transactionData) {
  const stmt = db.prepare(`
    INSERT INTO transactions (
      transaction_id, transaction_type, user_id, amount, 
      payment_method, description, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const transactionId = generateTransactionId();
  
  const result = stmt.run(
    transactionId,
    transactionData.type,
    transactionData.userId,
    transactionData.amount,
    transactionData.paymentMethod,
    transactionData.description,
    transactionData.status || 'completed'
  );
  
  return {
    id: result.lastInsertRowid,
    transactionId
  };
}

// ============================================================================
// Audit Log Helper
// ============================================================================

function logAuditTrail(tableName, recordId, action, userId, oldValues = null, newValues = null) {
  const stmt = db.prepare(`
    INSERT INTO audit_log (
      table_name, record_id, action, user_id, username, 
      old_values, new_values, ip_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  // Get username
  const user = userId ? db.prepare('SELECT username FROM users WHERE id = ?').get(userId) : null;
  
  stmt.run(
    tableName,
    recordId,
    action,
    userId,
    user?.username || 'system',
    oldValues ? JSON.stringify(oldValues) : null,
    newValues ? JSON.stringify(newValues) : null,
    '127.0.0.1'  // Replace with actual IP from req.ip
  );
}

// ============================================================================
// Activity Log Helper
// ============================================================================

function logActivity(userId, action, entityType, entityId, description, req = null) {
  const stmt = db.prepare(`
    INSERT INTO activity_log (
      user_id, username, action, entity_type, entity_id,
      description, ip_address, user_agent, request_method, request_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const user = userId ? db.prepare('SELECT username FROM users WHERE id = ?').get(userId) : null;
  
  stmt.run(
    userId,
    user?.username || 'anonymous',
    action,
    entityType,
    entityId,
    description,
    req?.ip || null,
    req?.get('user-agent') || null,
    req?.method || null,
    req?.originalUrl || null
  );
}

// ============================================================================
// Error Log Helper
// ============================================================================

function logError(error, errorType, userId = null, req = null) {
  const stmt = db.prepare(`
    INSERT INTO error_log (
      error_type, error_message, error_code, stack_trace,
      user_id, request_url, request_method, request_body, severity
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    errorType,
    error.message,
    error.code || null,
    error.stack || null,
    userId,
    req?.originalUrl || null,
    req?.method || null,
    req?.body ? JSON.stringify(req.body) : null,
    'error'
  );
}

// ============================================================================
// Get Transaction Report
// ============================================================================

function getTransactionReport(startDate, endDate) {
  const summary = db.prepare(`
    SELECT 
      transaction_type,
      COUNT(*) as count,
      SUM(amount) as total,
      AVG(amount) as average
    FROM transactions
    WHERE status = 'completed'
      AND DATE(created_at) BETWEEN ? AND ?
    GROUP BY transaction_type
  `).all(startDate, endDate);
  
  const daily = db.prepare(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as transaction_count,
      SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expenses,
      SUM(amount) as net
    FROM transactions
    WHERE status = 'completed'
      AND DATE(created_at) BETWEEN ? AND ?
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `).all(startDate, endDate);
  
  return { summary, daily };
}

// ============================================================================
// Get Audit Trail
// ============================================================================

function getAuditTrail(tableName, recordId) {
  return db.prepare(`
    SELECT * FROM audit_log
    WHERE table_name = ? AND record_id = ?
    ORDER BY created_at DESC
  `).all(tableName, recordId);
}

// ============================================================================
// Get Recent Activity
// ============================================================================

function getRecentActivity(userId, limit = 50) {
  return db.prepare(`
    SELECT * FROM activity_log
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(userId, limit);
}

// ============================================================================
// Middleware: Log All Requests
// ============================================================================

function logRequestMiddleware(req, res, next) {
  // Skip logging for static files
  if (req.url.startsWith('/public') || req.url.startsWith('/css') || req.url.startsWith('/js')) {
    return next();
  }
  
  const userId = req.session?.userId || null;
  
  logActivity(
    userId,
    'page_view',
    null,
    null,
    `Accessed ${req.method} ${req.originalUrl}`,
    req
  );
  
  next();
}

// ============================================================================
// Middleware: Log Errors
// ============================================================================

function errorLogMiddleware(err, req, res, next) {
  logError(err, 'application', req.session?.userId, req);
  
  // Send error response
  res.status(500).render('error', {
    message: 'An error occurred',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
}

// ============================================================================
// Routes Example
// ============================================================================

// Record a sale
app.post('/sales', (req, res) => {
  const transaction = recordTransaction({
    type: 'sale',
    userId: req.session.userId,
    amount: req.body.amount,
    paymentMethod: req.body.paymentMethod,
    description: `Sale - Order #${req.body.orderId}`,
    status: 'completed'
  });
  
  logActivity(
    req.session.userId,
    'create_sale',
    'transaction',
    transaction.id,
    `Created sale transaction ${transaction.transactionId}`,
    req
  );
  
  res.redirect('/transactions');
});

// View transaction history
app.get('/transactions', (req, res) => {
  const transactions = db.prepare(`
    SELECT * FROM transactions
    ORDER BY created_at DESC
    LIMIT 100
  `).all();
  
  res.render('transactions/index', { transactions });
});

// View transaction report
app.get('/reports/transactions', (req, res) => {
  const startDate = req.query.start || '2024-01-01';
  const endDate = req.query.end || new Date().toISOString().split('T')[0];
  
  const report = getTransactionReport(startDate, endDate);
  
  res.render('reports/transactions', { report, startDate, endDate });
});

// View audit trail for a record
app.get('/audit/:table/:id', (req, res) => {
  const auditTrail = getAuditTrail(req.params.table, req.params.id);
  res.render('audit/view', { auditTrail });
});

// View user activity log
app.get('/activity', (req, res) => {
  const activities = getRecentActivity(req.session.userId);
  res.render('activity/index', { activities });
});

// View error log (admin only)
app.get('/admin/errors', requireAdmin, (req, res) => {
  const errors = db.prepare(`
    SELECT * FROM error_log
    WHERE severity IN ('error', 'critical')
    ORDER BY created_at DESC
    LIMIT 100
  `).all();
  
  res.render('admin/errors', { errors });
});

// Use middleware
app.use(logRequestMiddleware);
app.use(errorLogMiddleware);

// ============================================================================
// Automated Cleanup (run daily)
// ============================================================================

function cleanupOldLogs() {
  // Delete activity logs older than 90 days
  db.prepare(`
    DELETE FROM activity_log
    WHERE created_at < datetime('now', '-90 days')
  `).run();
  
  // Delete error logs older than 180 days (keep errors longer)
  db.prepare(`
    DELETE FROM error_log
    WHERE created_at < datetime('now', '-180 days')
      AND severity NOT IN ('critical')
  `).run();
  
  console.log('Old logs cleaned up');
}

// Run cleanup daily
setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);

*/

-- =============================================================================
-- Triggers (Optional - Auto-audit on changes)
-- =============================================================================

-- Example: Auto-audit product updates
-- CREATE TRIGGER IF NOT EXISTS audit_products_update
-- AFTER UPDATE ON products
-- FOR EACH ROW
-- BEGIN
--   INSERT INTO audit_log (table_name, record_id, action, old_values, new_values)
--   VALUES (
--     'products',
--     OLD.id,
--     'UPDATE',
--     json_object('name', OLD.name, 'price', OLD.price, 'stock', OLD.stock),
--     json_object('name', NEW.name, 'price', NEW.price, 'stock', NEW.stock)
--   );
-- END;

-- =============================================================================
-- Views (Optional - Common queries)
-- =============================================================================

-- Daily sales summary
CREATE VIEW IF NOT EXISTS daily_sales_summary AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as transaction_count,
  SUM(amount) as total_sales,
  AVG(amount) as average_sale
FROM transactions
WHERE transaction_type = 'sale' AND status = 'completed'
GROUP BY DATE(created_at);

-- Monthly revenue
CREATE VIEW IF NOT EXISTS monthly_revenue AS
SELECT 
  strftime('%Y-%m', created_at) as month,
  COUNT(*) as transaction_count,
  SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
  SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expenses,
  SUM(amount) as net_revenue
FROM transactions
WHERE status = 'completed'
GROUP BY strftime('%Y-%m', created_at);

-- =============================================================================
-- Best Practices
-- =============================================================================

-- ✓ Always log sensitive operations (user changes, deletions, financial transactions)
-- ✓ Include user_id in all audit records for accountability
-- ✓ Store old and new values for UPDATE operations
-- ✓ Use transactions for operations that modify multiple tables
-- ✓ Implement log rotation to prevent database bloat
-- ✓ Back up audit logs separately (critical for compliance)
-- ✓ Don't log sensitive data (passwords, credit cards) in plaintext
-- ✓ Add indexes on commonly queried fields (user_id, created_at)
-- ✓ Consider archiving old logs to separate tables
-- ✓ Use descriptive action names ('user_login', 'product_delete')
-- ✓ Include request details (IP, user agent) for security analysis
-- ✓ Implement log viewing permissions (audit logs = admin only)

-- =============================================================================
-- Notes
-- =============================================================================

-- 1. Audit logs should NEVER be deleted by regular users
-- 2. Consider write-only access for audit logs (no updates/deletes)
-- 3. For high-traffic apps, consider async logging (queue system)
-- 4. Implement log search functionality (by date, user, action)
-- 5. Export logs to external systems for long-term storage
-- 6. Monitor error logs for patterns (repeated errors = fix needed)
-- 7. Use activity logs for user behavior analysis
-- 8. Implement alerts for critical errors
-- 9. Regular backups are CRITICAL for audit trail integrity
-- 10. Consider encryption for sensitive log data

-- =============================================================================
-- Compliance Notes
-- =============================================================================

-- For GDPR/Data Privacy compliance:
-- - Log all access to personal data
-- - Implement data retention policies
-- - Allow users to request their activity logs
-- - Implement right-to-erasure (with audit trail)
-- - Log consent changes
-- - Keep audit trails even after user deletion (anonymize user_id)
