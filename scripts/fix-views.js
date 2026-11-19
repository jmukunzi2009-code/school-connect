const { Client } = require('pg');
const DB = 'postgresql://neondb_owner:npg_9ae5oqwRiDFb@ep-dark-fog-beaqzelq-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
async function run() {
  const c = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await c.connect();

  // Check exam_assessments columns
  const asCols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='exam_assessments'`);
  console.log('exam_assessments cols:', asCols.rows.map(r => r.column_name).join(', '));

  // Fix exam_marks view - join through assessments to get subject_id and class_id
  await c.query(`
    CREATE OR REPLACE VIEW exam_marks AS
    SELECT sm.id, sm.student_id, sm.school_id,
           ea.subject_id,
           ea.class_id,
           sm.score AS marks_obtained,
           COALESCE(sm.grade, '') AS grade,
           COALESCE(sm.comments, '') AS remarks,
           sm.created_at
    FROM student_marks sm
    LEFT JOIN exam_assessments ea ON ea.id = sm.assessment_id
  `);
  console.log('✅ exam_marks view fixed');

  // Check student_attendance columns
  const attCols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='student_attendance'`);
  console.log('student_attendance cols:', attCols.rows.map(r => r.column_name).join(', '));

  const colNames = attCols.rows.map(r => r.column_name);
  const hasDate = colNames.includes('date') || colNames.includes('attendance_date');
  const dateCol = colNames.includes('date') ? 'date' : (colNames.includes('attendance_date') ? 'attendance_date' : null);

  if (dateCol) {
    await c.query(`
      CREATE OR REPLACE VIEW attendance AS
      SELECT id, student_id,
             ${colNames.includes('class_id') ? 'class_id,' : 'NULL::uuid AS class_id,'}
             ${colNames.includes('school_id') ? 'school_id,' : 'NULL::uuid AS school_id,'}
             ${colNames.includes('status') ? 'status,' : "'present' AS status,"}
             ${dateCol} AS date,
             ${colNames.includes('remarks') ? 'COALESCE(remarks, \'\')' : "''"}  AS remarks
      FROM student_attendance
    `);
    console.log('✅ attendance view fixed');
  } else {
    console.log('⚠ No date column found in student_attendance');
  }

  await c.end();
}
run().catch(e => { console.error('Error:', e.message); process.exit(1); });
