const { Client } = require('pg');
const DB = 'postgresql://neondb_owner:npg_9ae5oqwRiDFb@ep-dark-fog-beaqzelq-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
async function run() {
  const c = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const cols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='student_marks'`);
  console.log('student_marks cols:', cols.rows.map(r => r.column_name).join(', '));
  
  // Fix exam_marks view using actual columns
  await c.query(`
    CREATE OR REPLACE VIEW exam_marks AS
    SELECT sm.id, sm.student_id, sm.subject_id, sm.school_id,
           sm.score AS marks_obtained,
           COALESCE(sm.grade, '') AS grade,
           COALESCE(sm.remarks, '') AS remarks,
           sm.class_id,
           sm.created_at
    FROM student_marks sm
  `);
  console.log('exam_marks view created with class_id from student_marks');
  
  const attCols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='student_attendance'`);
  console.log('student_attendance cols:', attCols.rows.map(r => r.column_name).join(', '));
  
  await c.end();
}
run().catch(e => console.error(e.message));
