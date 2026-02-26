const mysql = require('mysql2/promise');
const env   = require('./env');

const pool = mysql.createPool({
  host:             env.DB_HOST,
  port:             env.DB_PORT,
  user:             env.DB_USER,
  password:         env.DB_PASSWORD,
  database:         env.DB_NAME,
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0,
  timezone:         '+00:00',
  charset:          'utf8mb4',
});

const query = async (sql, params = []) => {
  // Use pool.query (not pool.execute) — more lenient with param types
  const [rows] = await pool.query(sql, params);
  return rows;
};

const getConnection = async () => pool.getConnection();

const testConnection = async () => {
  const connection = await pool.getConnection();
  console.log(`✅  MySQL connected → ${env.DB_HOST}:${env.DB_PORT} / ${env.DB_NAME}`);
  connection.release();
};

module.exports = { pool, query, getConnection, testConnection };