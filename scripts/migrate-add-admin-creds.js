// Migration: Add admin_email and admin_password_hash to school_applications
const { Client } = require('pg');

const DB_URL = "postgresql://neondb_owner:npg_9ae5oqwRiDFb@ep-dark-fog-beaqzelq-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function migrate() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to Neon DB');

  await client.query(`ALTER TABLE school_applications ADD COLUMN IF NOT EXISTS admin_email VARCHAR(255)`);
  console.log('admin_email column ready');

  await client.query(`ALTER TABLE school_applications ADD COLUMN IF NOT EXISTS admin_password_hash VARCHAR(255)`);
  console.log('admin_password_hash column ready');

  await client.end();
  console.log('Migration completed successfully!');
}

migrate().catch(e => { console.error('Migration error:', e.message); process.exit(1); });
