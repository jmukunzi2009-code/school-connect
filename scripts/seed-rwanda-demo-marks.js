const fs = require('fs');
const { Client } = require('pg');

if (fs.existsSync('.env.local')) {
  for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator < 0) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not found.');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const demoMarks = [
  { score: 84, grade: 'A', comments: 'Strong comprehension and clear written work.' },
  { score: 76, grade: 'B', comments: 'Good progress; continue practising essay structure.' },
  { score: 68, grade: 'C', comments: 'Steady effort with room to strengthen vocabulary.' },
  { score: 91, grade: 'A', comments: 'Excellent analysis and consistent preparation.' },
  { score: 47, grade: 'F', comments: 'Please attend the upcoming reading support sessions.' },
];

const expectedAdmissions = Array.from({ length: 5 }, (_, index) =>
  `KHIA-2026-${String(index + 1).padStart(3, '0')}`
);

async function seedDemoMarks() {
  await client.connect();
  await client.query('BEGIN');

  try {
    const schoolRes = await client.query(
      `SELECT id FROM schools WHERE slug = 'kigali-heights' AND country = 'Rwanda' FOR UPDATE`
    );
    if (schoolRes.rows.length !== 1) {
      throw new Error('Expected exactly one Kigali Heights Rwanda demo school.');
    }
    const schoolId = schoolRes.rows[0].id;

    const assessmentRes = await client.query(
      `SELECT ea.id, c.id AS class_id
       FROM exam_assessments ea
       JOIN examinations ex ON ex.id = ea.examination_id
       JOIN subjects sub ON sub.id = ea.subject_id
       JOIN classes c ON c.id = ea.class_id
       WHERE ex.school_id = $1
         AND ex.name = 'Term 1 Mid-Term Examinations'
         AND ex.is_published = TRUE
         AND sub.name = 'English Literature'
         AND c.name = 'Senior 1 (Grade 9)'
       FOR UPDATE OF ea`,
      [schoolId]
    );
    if (assessmentRes.rows.length !== 1) {
      throw new Error('Expected exactly one published Senior 1 English Literature demo assessment.');
    }
    const assessment = assessmentRes.rows[0];

    const studentsRes = await client.query(
      `SELECT s.id, s.admission_number
       FROM enrollments e
       JOIN students s ON s.id = e.student_id
       WHERE e.school_id = $1 AND e.class_id = $2 AND e.status = 'active'
       ORDER BY s.admission_number
       FOR UPDATE OF s`,
      [schoolId, assessment.class_id]
    );
    const students = studentsRes.rows;
    if (
      students.length !== expectedAdmissions.length ||
      students.some((student, index) => student.admission_number !== expectedAdmissions[index])
    ) {
      throw new Error('Senior 1 enrolments do not match the five-student demo fixture.');
    }

    const marksRes = await client.query(
      `SELECT student_id, score, grade, comments
       FROM student_marks
       WHERE assessment_id = $1
       ORDER BY student_id
       FOR UPDATE`,
      [assessment.id]
    );

    if (marksRes.rows.length === 0) {
      for (const [index, student] of students.entries()) {
        const mark = demoMarks[index];
        await client.query(
          `INSERT INTO student_marks (school_id, assessment_id, student_id, score, grade, comments, is_verified)
           VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
          [schoolId, assessment.id, student.id, mark.score, mark.grade, mark.comments]
        );
      }
    } else {
      const currentMarks = new Map(marksRes.rows.map((mark) => [mark.student_id, mark]));
      const matchesFixture = students.every((student, index) => {
        const mark = currentMarks.get(student.id);
        const expected = demoMarks[index];
        return mark &&
          Number(mark.score) === expected.score &&
          mark.grade === expected.grade &&
          mark.comments === expected.comments;
      });
      if (marksRes.rows.length !== students.length || !matchesFixture) {
        throw new Error('Existing assessment marks differ from the demo fixture; no records were changed.');
      }
    }

    await client.query('COMMIT');
    console.log(`Kigali Heights demo marks ready: ${students.length} student scores verified or added.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

seedDemoMarks()
  .catch((error) => {
    console.error('Kigali Heights demo marks setup failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => client.end());
