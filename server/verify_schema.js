const { query } = require('./src/config/db');
async function r() {
    const columns = await query('DESCRIBE roommate_profiles');
    console.log('--- COLUMNS ---');
    columns.forEach(c => console.log(c.Field));

    const sample = await query('SELECT * FROM roommate_profiles LIMIT 1');
    console.log('--- DATA SAMPLE ---');
    console.log(JSON.stringify(sample[0] || 'NONE', null, 2));
    process.exit(0);
}
r();
