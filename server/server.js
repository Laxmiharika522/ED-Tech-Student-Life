require('dotenv').config();

const app = require('./src/App');
const env = require('./src/config/env');
const db  = require('./src/config/db');

const PORT = env.PORT || 5000;

const start = async () => {
  // Verify MySQL is reachable before accepting traffic
  await db.testConnection();

  app.listen(PORT, () => {
    console.log(`\n🚀  Campus Catalyst API  →  http://localhost:${PORT}`);
    console.log(`📡  Environment : ${env.NODE_ENV}`);
    console.log(`🗄️   Database    : ${env.DB_NAME} @ ${env.DB_HOST}:${env.DB_PORT}\n`);
  });
};

start().catch((err) => {
  console.error('❌  Server failed to start:', err.message);
  process.exit(1);
});