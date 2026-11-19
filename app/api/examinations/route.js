import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = user.activeSchool?.id;
    if (!schoolId) {
      return NextResponse.json({ error: 'No active school assigned' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const classId = searchParams.get('classId');

    // 1. Fetch Subjects & Classes
    const subjectsRes = await query(
      `SELECT id, name, code FROM subjects WHERE school_id = $1 ORDER BY name ASC`,
      [schoolId]
    );

    const classesRes = await query(
      `SELECT id, name FROM classes WHERE school_id = $1 ORDER BY grade_level ASC`,
      [schoolId]
    );

    // 2. Fetch or create Assessment reference
    let examRes = await query(
      `SELECT id, name, is_published FROM examinations WHERE school_id = $1 LIMIT 1`,
      [schoolId]
    );
    let examId = examRes.rows[0]?.id;

    if (!examId) {
      const yearRes = await query(`SELECT id FROM academic_years WHERE school_id = $1 LIMIT 1`, [schoolId]);
      const termRes = await query(`SELECT id FROM terms WHERE school_id = $1 LIMIT 1`, [schoolId]);
      if (yearRes.rows[0] && termRes.rows[0]) {
        const newExam = await query(
          `INSERT INTO examinations (school_id, academic_year_id, term_id, name, start_date, end_date, is_published)
           VALUES ($1, $2, $3, 'Term 1 Mid-Term Examinations', '2026-03-01', '2026-03-15', TRUE)
           RETURNING id, name, is_published`,
          [schoolId, yearRes.rows[0].id, termRes.rows[0].id]
        );
        examId = newExam.rows[0].id;
      }
    }

    // 3. If class and subject selected, fetch enrolled students with their existing marks
    let students = [];
    if (classId && subjectId && examId) {
      // Find or create assessment
      let assessRes = await query(
        `SELECT id FROM exam_assessments WHERE examination_id = $1 AND subject_id = $2 AND class_id = $3`,
        [examId, subjectId, classId]
      );
      let assessmentId;
      if (assessRes.rows.length === 0) {
        const newAss = await query(
          `INSERT INTO exam_assessments (examination_id, subject_id, class_id, max_score, passing_score)
           VALUES ($1, $2, $3, 100.00, 50.00)
           RETURNING id`,
          [examId, subjectId, classId]
        );
        assessmentId = newAss.rows[0].id;
      } else {
        assessmentId = assessRes.rows[0].id;
      }

      // Query enrolled students and their scores
      const marksRes = await query(
        `SELECT s.id as student_id, s.admission_number, s.first_name, s.last_name, s.gender,
                sm.score, sm.grade, sm.comments, sm.is_verified
         FROM enrollments e
         JOIN students s ON s.id = e.student_id
         LEFT JOIN student_marks sm ON sm.student_id = s.id AND sm.assessment_id = $2
         WHERE e.school_id = $1 AND e.class_id = $3 AND e.status = 'active'
         ORDER BY s.admission_number ASC`,
        [schoolId, assessmentId, classId]
      );

      students = marksRes.rows.map((row) => ({
        ...row,
        assessment_id: assessmentId,
        score: row.score !== null ? row.score : '',
        grade: row.grade || '',
        comments: row.comments || '',
      }));
    }

    return NextResponse.json({
      role: user.activeRole,
      subjects: subjectsRes.rows,
      classes: classesRes.rows,
      exam: examRes.rows[0] || null,
      students,
    });
  } catch (error) {
    console.error('Examinations GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve examination records.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const markEditorRoles = [
      'teacher',
      'class_teacher',
      'examination_officer',
      'academic_records_officer',
      'director_of_studies',
      'deputy_headteacher_academics',
    ];
    if (!markEditorRoles.includes(user.activeRole)) {
      return NextResponse.json({ error: 'You have view-only access to marks.' }, { status: 403 });
    }

    const schoolId = user.activeSchool?.id;
    if (!schoolId) {
      return NextResponse.json({ error: 'No active school assigned' }, { status: 400 });
    }

    const { assessment_id, marks } = await request.json();

    if (!assessment_id || !Array.isArray(marks)) {
      return NextResponse.json({ error: 'Assessment ID and marks array are required.' }, { status: 400 });
    }

    for (const m of marks) {
      if (m.score === '' || m.score === null) continue;
      const numScore = parseFloat(m.score);
      let grade = 'F';
      if (numScore >= 80) grade = 'A';
      else if (numScore >= 70) grade = 'B';
      else if (numScore >= 60) grade = 'C';
      else if (numScore >= 50) grade = 'D';

      await query(
        `INSERT INTO student_marks (school_id, assessment_id, student_id, score, grade, comments, entered_by, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
         ON CONFLICT (assessment_id, student_id)
         DO UPDATE SET score = EXCLUDED.score, grade = EXCLUDED.grade, comments = EXCLUDED.comments, updated_at = CURRENT_TIMESTAMP`,
        [schoolId, assessment_id, m.student_id, numScore, grade, m.comments || null, user.id]
      );
    }

    // Write audit log
    await query(
      `INSERT INTO audit_logs (school_id, user_id, action, module, details)
       VALUES ($1, $2, 'MARKS_SUBMITTED', 'examinations', $3)`,
      [schoolId, user.id, JSON.stringify({ assessment_id, count: marks.length })]
    );

    return NextResponse.json({ success: true, message: `Marks submitted successfully for ${marks.length} students.` });
  } catch (error) {
    console.error('Examinations POST error:', error);
    return NextResponse.json({ error: 'Failed to submit marks.' }, { status: 500 });
  }
}
