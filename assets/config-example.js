// ⚙️ Configuration Management Example
// For: Barangay Certificate System
// This centralizes all app configuration in one place

require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = [
  'SESSION_SECRET',
  'KAGAWAD_PASSWORD',
  'SECRETARY_PASSWORD'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ ERROR: Missing required environment variable: ${envVar}`);
    console.error('Please create a .env file with all required variables.');
    process.exit(1);  // Stop the app
  }
}

// Export configuration object
const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV !== 'production'
  },

  // Barangay Information
  barangay: {
    name: process.env.BARANGAY_NAME || 'Barangay San Juan',
    address: process.env.BARANGAY_ADDRESS || 'Quezon City, Metro Manila',
    captain: process.env.BARANGAY_CAPTAIN || 'Hon. Juan Dela Cruz',
    contactNumber: process.env.BARANGAY_CONTACT || '(02) 1234-5678',
    email: process.env.BARANGAY_EMAIL || 'barangaysanjuan@example.com'
  },

  // Certificate Settings
  certificates: {
    validityDays: parseInt(process.env.CERT_VALIDITY_DAYS) || 90,
    clearanceFee: parseFloat(process.env.CLEARANCE_FEE) || 50.00,
    indigencyFee: parseFloat(process.env.INDIGENCY_FEE) || 0.00,
    residencyFee: parseFloat(process.env.RESIDENCY_FEE) || 50.00,
    requiresSignature: process.env.REQUIRE_SIGNATURE !== 'false',
    printLogo: process.env.PRINT_LOGO !== 'false'
  },

  // Staff Access (Multiple roles)
  auth: {
    kagawad: {
      username: process.env.KAGAWAD_USERNAME || 'kagawad',
      password: process.env.KAGAWAD_PASSWORD
    },
    secretary: {
      username: process.env.SECRETARY_USERNAME || 'secretary',
      password: process.env.SECRETARY_PASSWORD
    },
    captain: {
      username: process.env.CAPTAIN_USERNAME || 'captain',
      password: process.env.CAPTAIN_PASSWORD
    },
    sessionSecret: process.env.SESSION_SECRET,
    sessionMaxAge: 24 * 60 * 60 * 1000  // 24 hours
  },

  // Database Configuration
  database: {
    residentsFile: process.env.RESIDENTS_DB || 'data/residents.db',
    certificatesFile: process.env.CERTIFICATES_DB || 'data/certificates.db',
    backupEnabled: process.env.BACKUP_ENABLED !== 'false',
    backupHour: parseInt(process.env.BACKUP_HOUR) || 2,  // 2 AM
    backupDir: process.env.BACKUP_DIR || 'backups/'
  },

  // Security Settings
  security: {
    // Rate limiting
    rateLimitWindow: 15 * 60 * 1000,      // 15 minutes
    rateLimitMaxGeneral: 100,              // General routes
    rateLimitMaxLogin: 5,                  // Login attempts
    rateLimitMaxCertificate: 10,           // Certificate requests per hour
    
    // Helmet
    helmetEnabled: true,
    
    // CSRF
    csrfEnabled: process.env.CSRF_ENABLED !== 'false',
    
    // Session
    secureCookies: process.env.NODE_ENV === 'production',
    cookieHttpOnly: true
  },

  // Application Settings
  app: {
    name: process.env.APP_NAME || 'Barangay Certificate System',
    url: process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`,
    logoPath: process.env.LOGO_PATH || '/images/barangay-logo.png',
    timezone: process.env.TIMEZONE || 'Asia/Manila'
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    enabled: process.env.LOGGING_ENABLED !== 'false',
    logFile: process.env.LOG_FILE || 'logs/app.log',
    errorLogFile: process.env.ERROR_LOG_FILE || 'logs/error.log'
  },

  // Features (enable/disable features)
  features: {
    allowOnlinePayment: process.env.ALLOW_ONLINE_PAYMENT === 'true',
    enableSMS: process.env.ENABLE_SMS === 'true',
    enableEmail: process.env.ENABLE_EMAIL === 'true',
    enablePrintQueue: process.env.ENABLE_PRINT_QUEUE !== 'false'
  },

  // Display messages
  messages: {
    maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
    maintenanceMessage: process.env.MAINTENANCE_MESSAGE || 'System under maintenance. Please try again later.',
    welcomeMessage: process.env.WELCOME_MESSAGE || 'Welcome to Barangay Certificate System'
  }
};

// Log configuration on startup (hide passwords!)
if (config.server.isDevelopment) {
  console.log('📋 Configuration loaded:');
  console.log('  Environment:', config.server.nodeEnv);
  console.log('  Port:', config.server.port);
  console.log('  Barangay:', config.barangay.name);
  console.log('  Database:', config.database.residentsFile);
  console.log('  Backup enabled:', config.database.backupEnabled);
  console.log('  CSRF enabled:', config.security.csrfEnabled);
  console.log('  Kagawad password:', config.auth.kagawad.password ? '✓ Set' : '✗ Missing');
  console.log('  Secretary password:', config.auth.secretary.password ? '✓ Set' : '✗ Missing');
}

// Export the configuration
module.exports = config;

// ========================================
// USAGE EXAMPLE IN app.js:
// ========================================
/*

const express = require('express');
const config = require('./config/config');

const app = express();

console.log('Starting', config.app.name);
console.log('Environment:', config.server.nodeEnv);

// Use config throughout your app
app.listen(config.server.port, () => {
  console.log(`${config.app.name} running at ${config.app.url}`);
});

// In routes:
app.get('/', (req, res) => {
  res.render('index', {
    barangay: config.barangay,
    welcomeMessage: config.messages.welcomeMessage
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Check against config
  if (username === config.auth.kagawad.username &&
      password === config.auth.kagawad.password) {
    req.session.role = 'kagawad';
    res.redirect('/dashboard');
  } else if (username === config.auth.secretary.username &&
             password === config.auth.secretary.password) {
    req.session.role = 'secretary';
    res.redirect('/dashboard');
  } else {
    res.render('login', { error: 'Invalid credentials' });
  }
});

*/

// ========================================
// CORRESPONDING .env FILE:
// ========================================
/*

# Server Configuration
NODE_ENV=development
PORT=3000

# Barangay Information
BARANGAY_NAME=Barangay San Juan
BARANGAY_ADDRESS=123 Sampaguita St, Quezon City
BARANGAY_CAPTAIN=Hon. Maria Santos
BARANGAY_CONTACT=(02) 8765-4321
BARANGAY_EMAIL=sanjuan@qc.gov.ph

# Certificate Settings
CERT_VALIDITY_DAYS=90
CLEARANCE_FEE=50.00
INDIGENCY_FEE=0.00
RESIDENCY_FEE=50.00
REQUIRE_SIGNATURE=true
PRINT_LOGO=true

# Staff Authentication
KAGAWAD_USERNAME=kagawad_santos
KAGAWAD_PASSWORD=KagawadSecure2024!
SECRETARY_USERNAME=secretary_reyes
SECRETARY_PASSWORD=SecretaryPass2024!
CAPTAIN_USERNAME=captain_dela_cruz
CAPTAIN_PASSWORD=CaptainSecure2024!

# Session Security
SESSION_SECRET=barangay_very_long_random_secret_key_2024

# Database
RESIDENTS_DB=data/residents.db
CERTIFICATES_DB=data/certificates.db
BACKUP_ENABLED=true
BACKUP_HOUR=2
BACKUP_DIR=backups/

# Security
CSRF_ENABLED=true

# Application
APP_NAME=Barangay San Juan Certificate System
APP_URL=http://localhost:3000
LOGO_PATH=/images/barangay-logo.png

# Features
ALLOW_ONLINE_PAYMENT=false
ENABLE_SMS=false
ENABLE_EMAIL=false
ENABLE_PRINT_QUEUE=true

# Maintenance
MAINTENANCE_MODE=false

*/
