import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';

// GET /api/teacher — teacher's assigned classes and students
export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const schoolId = user.activeSchool?.id;
    if (!schoolId) return NextResponse.json({ error: 'No active school' }, { status: 400 });

    const url = new URL(request.url);
    const classId = url.searchParams.get('classId');

    // Find classes where this teacher is the class teacher OR assigned to teach a subject
    const myClassesRes = await query(
      `SELECT DISTINCT c.id, c.name, c.level,
              CASE WHEN ct.user_id = $2 THEN true ELSE false END AS is_class_teacher,
              (SELECT COUNT(*)::int FROM enrollments e WHERE e.class_id = c.id AND e.status = 'active') AS student_count,
              STRING_AGG(DISTINCT sub.name, ', ') AS subjects_teaching
       FROM classes c
       LEFT JOIN class_teachers ct ON ct.class_id = c.id AND ct.school_id = $1
       LEFT JOIN teacher_assignments ta ON ta.class_id = c.id AND ta.user_id = $2
       LEFT JOIN subjects sub ON sub.id = ta.subject_id
       WHERE c.school_id = $1 AND (ct.user_id = $2 OR ta.user_id = $2)
       GROUP BY c.id, c.name, c.level, ct.user_id
       ORDER BY c.level, c.name`,
      [schoolId, user.id]
    );

    if (classId) {
      // Get students in this class
      const studentsRes = await query(
        `SELECT s.id, s.first_name, s.last_name, s.admission_number, s.gender,
                e.id AS enrollment_id, e.roll_number
         FROM enrollments e
         JOIN students s ON s.id = e.student_id
         WHERE e.class_id = $1 AND e.status = 'active'
         ORDER BY s.last_name, s.first_name`,
        [classId]
      );

      // Check if requester is class teacher
      const ctCheck = await query(
        `SELECT user_id FROM class_teachers WHERE class_id = $1 AND user_id = $2 LIMIT 1`,
        [classId, user.id]
      );
      const isClassTeacher = ctCheck.rows.length > 0;

      // Get subjects assigned to me in this class
      const mySubjectsRes = await query(
        `SELECT ta.subject_id, sub.name AS subject_name, sub.code
         FROM teacher_assignments ta
         JOIN subjects sub ON sub.id = ta.subject_id
         WHERE ta.class_id = $1 AND ta.user_id = $2`,
        [classId, user.id]
      );

      // Get ALL subject teachers for this class (class teacher sees everyone)
      let allTeachers = [];
      if (isClassTeacher) {
        const atRes = await query(
          `SELECT ta.subject_id, sub.name AS subject_name, u.full_name AS teacher_name
           FROM teacher_assignments ta
           JOIN subjects sub ON sub.id = ta.subject_id
           JOIN users u ON u.id = ta.user_id
           WHERE ta.class_id = $1`,
          [classId]
        );
        allTeachers = atRes.rows;
      }

      // Get marks summary using direct student_marks table joined through exam_assessments
      const marksRes = await query(
        `SELECT sm.student_id, sm.score AS marks_obtained, sm.grade,
                COALESCE(sm.comments,'') AS remarks,
                sub.name AS subject_name, sub.code
         FROM student_marks sm
         JOIN exam_assessments ea ON ea.id = sm.assessment_id
         JOIN subjects sub ON sub.id = ea.subject_id
         WHERE ea.class_id = $1 AND sm.school_id = $2
         ORDER BY sub.name, sm.student_id`,
        [classId, schoolId]
      );

      // Recent attendance using direct student_attendance table
      const attendanceRes = await query(
        `SELECT a.student_id, a.status, a.date, COALESCE(a.remarks,'') AS remarks
         FROM student_attendance a
         WHERE a.class_id = $1 AND a.school_id = $2
         AND a.date >= CURRENT_DATE - INTERVAL '7 days'
         ORDER BY a.date DESC, a.student_id`,
        [classId, schoolId]
      );

      return NextResponse.json({
        students: studentsRes.rows,
        isClassTeacher,
        mySubjects: mySubjectsRes.rows,
        allTeachers,
        marks: marksRes.rows,
        recentAttendance: attendanceRes.rows,
      });
    }

    return NextResponse.json({ myClasses: myClassesRes.rows });
  } catch (error) {
    console.error('Teacher GET error:', error);
    return NextResponse.json({ error: 'Failed to load teacher data' }, { status: 500 });
  }
}

// POST /api/teacher — record mark or add comment
export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const schoolId = user.activeSchool?.id;
    if (!schoolId) return NextResponse.json({ error: 'No active school' }, { status: 400 });

    const body = await request.json();
    const { action } = body;

    if (action === 'add_comment') {
      const { student_id, class_id, comment, is_private } = body;

      // Only class teacher can see all comments; subject teachers can add
      await query(
        `INSERT INTO student_notes (school_id, student_id, class_id, teacher_id, note_type, notes, is_confidential)
         VALUES ($1,$2,$3,$4,'academic_comment',$5,$6)`,
        [schoolId, student_id, class_id, user.id, comment, is_private ? true : false]
      );

      return NextResponse.json({ success: true, message: 'Comment added.' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Teacher POST error:', error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
