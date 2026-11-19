const { Pool } = require('pg');
const fs = require('fs');

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envContent.split(/\r?\n/);
  let dbUrl = '';
  for (const line of lines) {
    if (line.startsWith('DATABASE_URL=')) {
      dbUrl = line.substring('DATABASE_URL='.length).trim();
      if ((dbUrl.startsWith('"') && dbUrl.endsWith('"')) || (dbUrl.startsWith("'") && dbUrl.endsWith("'"))) {
        dbUrl = dbUrl.slice(1, -1);
      }
      break;
    }
  }

  if (!dbUrl) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log('Testing connection to Neon PostgreSQL...');
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")
    .then(res => {
      console.log('CONNECTED_SUCCESSFULLY!');
      console.log('Found ' + res.rows.length + ' tables:');
      console.log(JSON.stringify(res.rows.map(r => r.table_name), null, 2));
      pool.end();
      process.exit(0);
    })
    .catch(err => {
      console.error('Connection failed:', err.message);
      pool.end();
      process.exit(1);
    });
} catch (e) {
  console.error('Script error:', e);
  process.exit(1);
}
