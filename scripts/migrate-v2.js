const { Client } = require('pg');
const DB = 'postgresql://neondb_owner:npg_9ae5oqwRiDFb@ep-dark-fog-beaqzelq-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function migrate() {
  const c = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await c.connect();
  console.log('Connected. Running migrations...');

  // Messages table
  await c.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subject VARCHAR(255) DEFAULT 'No subject',
      body TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await c.query(`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)`);
  await c.query(`CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id)`);
  console.log('✅ messages table ready');

  // Class teachers table
  await c.query(`
    CREATE TABLE IF NOT EXISTS class_teachers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
      academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
      assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(class_id, academic_year_id)
    )
  `);
  console.log('✅ class_teachers table ready');

  // Student notes/comments table
  await c.query(`
    CREATE TABLE IF NOT EXISTS student_notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
      student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
      teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      note_type VARCHAR(100) DEFAULT 'academic_comment',
      notes TEXT NOT NULL,
      is_confidential BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ student_notes table ready');

  // Ensure teacher_assignments has proper unique constraint
  await c.query(`
    ALTER TABLE teacher_assignments
      ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE CASCADE
  `);
  // Try to add unique constraint (ignore if exists)
  try {
    await c.query(`ALTER TABLE teacher_assignments ADD CONSTRAINT ta_class_subject_unique UNIQUE(class_id, subject_id)`);
    console.log('✅ teacher_assignments unique constraint added');
  } catch(e) {
    console.log('ℹ teacher_assignments unique constraint already exists');
  }

  // Add exam_marks alias view if student_marks exists
  const tableCheck = await c.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='student_marks'
  `);
  if (tableCheck.rows.length > 0) {
    await c.query(`
      CREATE OR REPLACE VIEW exam_marks AS
      SELECT sm.id, sm.student_id, sm.subject_id, sm.school_id,
             sm.marks_obtained, sm.grade,
             COALESCE(sm.remarks, '') AS remarks,
             e.class_id,
             sm.created_at
      FROM student_marks sm
      LEFT JOIN examinations e ON e.id = sm.examination_id
    `);
    console.log('✅ exam_marks view ready (aliases student_marks)');
  }

  // Add attendance view if student_attendance exists
  const attCheck = await c.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND table_name='student_attendance'
  `);
  if (attCheck.rows.length > 0) {
    // Check columns in student_attendance
    const cols = await c.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='student_attendance'
    `);
    const colNames = cols.rows.map(r => r.column_name);
    console.log('student_attendance columns:', colNames.join(', '));

    const hasClassId = colNames.includes('class_id');
    const hasSchoolId = colNames.includes('school_id');
    const hasStatus = colNames.includes('status');

    if (hasClassId && hasSchoolId && hasStatus) {
      await c.query(`
        CREATE OR REPLACE VIEW attendance AS
        SELECT id, student_id, class_id, school_id, status, date,
               COALESCE(remarks, '') AS remarks
        FROM student_attendance
      `);
      console.log('✅ attendance view ready');
    } else {
      console.log('ℹ student_attendance missing some columns, skipping attendance view');
    }
  }

  // Add academic_years is_current column if missing
  const ayCheck = await c.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='academic_years'
  `);
  const ayColNames = ayCheck.rows.map(r => r.column_name);
  if (!ayColNames.includes('is_current')) {
    await c.query(`ALTER TABLE academic_years ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE`);
    console.log('✅ academic_years.is_current added');
  }

  // Add enrollment roll_number if missing
  const enrCheck = await c.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='enrollments'
  `);
  const enrCols = enrCheck.rows.map(r => r.column_name);
  if (!enrCols.includes('roll_number')) {
    await c.query(`ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS roll_number INT`);
    console.log('✅ enrollments.roll_number added');
  }

  // Check users table columns
  const userCols = await c.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='users'
  `);
  console.log('users columns:', userCols.rows.map(r => r.column_name).join(', '));

  await c.end();
  console.log('\n✅ All migrations completed!');
}

migrate().catch(e => { console.error('Migration error:', e.message); process.exit(1); });
