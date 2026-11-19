const { Client } = require('pg');
const DB = 'postgresql://neondb_owner:npg_9ae5oqwRiDFb@ep-dark-fog-beaqzelq-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function run() {
  const c = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  console.log('Tables:', r.rows.map(t => t.table_name).join(', '));
  await c.end();
}
run().catch(e => console.error(e.message));
