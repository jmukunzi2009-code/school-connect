const {Client}=require('pg');
const DB='postgresql://neondb_owner:npg_9ae5oqwRiDFb@ep-dark-fog-beaqzelq-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
async function run(){
  const c=new Client({connectionString:DB,ssl:{rejectUnauthorized:false}});
  await c.connect();
  // Sample data to understand status values
  const r1=await c.query('SELECT status, COUNT(*) FROM user_memberships GROUP BY status');
  console.log('membership status values:', JSON.stringify(r1.rows));
  const r2=await c.query('SELECT status, COUNT(*) FROM students GROUP BY status');
  console.log('student status values:', JSON.stringify(r2.rows));
  const r3=await c.query('SELECT is_active FROM user_memberships LIMIT 1');
  console.log('membership is_active sample:', r3.rows[0] ?? 'no rows');
  await c.end();
}
run().catch(e=>console.error(e.message));
