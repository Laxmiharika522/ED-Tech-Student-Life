require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs    = require('fs');
const path  = require('path');
const mysql = require('mysql2/promise');

const DB_HOST     = process.env.DB_HOST     || 'localhost';
const DB_PORT     = parseInt(process.env.DB_PORT) || 3306;
const DB_USER     = process.env.DB_USER     || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'Laxmiharika12124@';
const DB_NAME     = process.env.DB_NAME     || 'campus_catalyst';

const run = async () => {
  // Step 1 — connect WITHOUT a database so we can CREATE it
  const connection = await mysql.createConnection({
    host:               DB_HOST,
    port:               DB_PORT,
    user:               DB_USER,
    password:           DB_PASSWORD,
    multipleStatements: true,
  });

  console.log(`🔌  Connected to MySQL @ ${DB_HOST}:${DB_PORT}`);

  // Step 2 — create the database if it doesn't exist
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  console.log(`🗄️   Database "${DB_NAME}" ready.`);

  // Step 3 — switch into it
  await connection.query(`USE \`${DB_NAME}\`;`);

  // Step 4 — read schema.sql, strip its own CREATE DATABASE / USE lines
  //          since we already handled them above
  const schemaPath = path.join(__dirname, 'schema.sql');
  let sql = fs.readFileSync(schemaPath, 'utf8');

  sql = sql
    .replace(/CREATE DATABASE IF NOT EXISTS[\s\S]*?;/gi, '')
    .replace(/USE\s+\S+\s*;/gi, '')
    .trim();

  console.log('📦  Running schema.sql ...');
  await connection.query(sql);
  console.log('✅  All tables created successfully.');
  console.log(`\n📋  Tables created in "${DB_NAME}":`);
  console.log('    users, notes, roommate_profiles, roommate_matches, tasks\n');

  await connection.end();
  process.exit(0);
};

run().catch((err) => {
  console.error('❌  Migration failed:', err.message);
  process.exit(1);
});