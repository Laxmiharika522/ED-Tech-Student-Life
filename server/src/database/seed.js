require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'Laxmiharika12124@';
const DB_NAME = process.env.DB_NAME || 'campus_catalyst';

const seed = async () => {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    multipleStatements: true,
  });

  console.log('🌱  Seeding database...\n');

  // ─── Users ───────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 12);
  const studentHash = await bcrypt.hash('student123', 12);

  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  await connection.query('TRUNCATE TABLE roommate_matches');
  await connection.query('TRUNCATE TABLE roommate_profiles');
  await connection.query('TRUNCATE TABLE tasks');
  await connection.query('TRUNCATE TABLE notes');
  await connection.query('TRUNCATE TABLE users');
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');

  const [userResult] = await connection.query(
    `INSERT INTO users (name, email, password_hash, role, university) VALUES
      ('Admin User',   'admin@campus.com',   ?, 'admin',   'Campus University')`,
    [adminHash]
  );
  console.log('✅  Admin user seeded');

  // ─── Tasks ───────────────────────────────────────────────────────────────
  await connection.query(
    `INSERT INTO tasks (title, description, category, assigned_to, created_by, status, due_date) VALUES
      ('Review Calculus Topic 5', 'Summarize the key points and solve practice problems.', 'Academic', NULL, 1, 'pending', DATE_ADD(CURDATE(), INTERVAL 2 DAY)),
      ('Complete Quiz 1', 'Finish the online quiz for Database Management.', 'Academic', NULL, 1, 'pending', DATE_ADD(CURDATE(), INTERVAL 3 DAY)),
      ('Campus Workshop', 'Participate in the upcoming Python workshop.', 'Event', NULL, 1, 'pending', DATE_ADD(CURDATE(), INTERVAL 5 DAY)),
      ('Hackathon Registration', 'Register for the annual campus hackathon.', 'Event', NULL, 1, 'in_progress', DATE_ADD(CURDATE(), INTERVAL 7 DAY)),
      ('Organize Club Meeting', 'Help organize the weekly coding club meeting.', 'Event', NULL, 1, 'pending', DATE_ADD(CURDATE(), INTERVAL 1 DAY)),
      ('Fill Feedback Form', 'Complete the course feedback form for Semester 1.', 'Administrative', NULL, 1, 'pending', DATE_ADD(CURDATE(), INTERVAL 4 DAY)),
      ('Update Profile Details', 'Ensure your major and contact info are current.', 'Administrative', NULL, 1, 'done', DATE_ADD(CURDATE(), INTERVAL 0 DAY)),
      ('Report Campus Issue', 'Report any maintenance issues via the portal.', 'Administrative', NULL, 1, 'pending', DATE_ADD(CURDATE(), INTERVAL 10 DAY))`
  );
  console.log('✅  Global tasks seeded');

  console.log('\n🎉  Database seeded successfully!');
  console.log('\n📋  Admin credentials:');
  console.log('   Email: admin@campus.com');
  console.log('   Pass:  admin123');
  console.log('\n📝  Upload notes manually via the Notes Hub.');

  await connection.end();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌  Seeding failed:', err.message);
  process.exit(1);
});