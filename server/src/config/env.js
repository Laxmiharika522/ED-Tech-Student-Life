require('dotenv').config();

const env = {
  // ─── Server ───────────────────────────────────────────────────────────────
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // ─── MySQL Database ───────────────────────────────────────────────────────
  DB_HOST:     process.env.DB_HOST     || 'localhost',
  DB_PORT:     parseInt(process.env.DB_PORT) || 3306,
  DB_USER:     process.env.DB_USER     || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || 'Laxmiharika12124@',
  DB_NAME:     process.env.DB_NAME     || 'campus_catalyst',

  // ─── JWT ──────────────────────────────────────────────────────────────────
  JWT_SECRET:     process.env.JWT_SECRET     || 'fallback_secret_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // ─── Email ────────────────────────────────────────────────────────────────
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT) || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'Campus Catalyst <noreply@campuscatalyst.com>',

  // ─── File Upload ──────────────────────────────────────────────────────────
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB

  // ─── Client ───────────────────────────────────────────────────────────────
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

// Validate critical variables on startup
const required = ['JWT_SECRET', 'DB_USER', 'DB_NAME'];

const missing = required.filter(
  (key) => !process.env[key]
);

if (missing.length > 0) {
  console.warn(`⚠️  Missing recommended env variables: ${missing.join(', ')}`);
  console.warn('   Copy .env.example → .env and fill in the values.\n');
}

module.exports = env;