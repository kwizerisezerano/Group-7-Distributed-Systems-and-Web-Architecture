const path = require('path');
const { runSqlFile } = require('../src/data/db');

async function migrate() {
  const sqlFile = path.join(__dirname, '..', 'sql', 'create_library.sql');
  console.log('Running migration SQL:', sqlFile);
  try {
    await runSqlFile(sqlFile);
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
