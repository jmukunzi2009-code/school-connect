import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';

// GET /api/classes — class management (teacher assignments, promotions, rosters)
export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const schoolId = user.activeSchool?.id;
    if (!schoolId) return NextResponse.json({ error: 'No active school' }, { status: 400 });

    const url = new URL(request.url);
    const classId = url.searchParams.get('classId');

    // Get all classes with teacher assignments
    const classesRes = await query(
      `SELECT c.id, c.name, c.level, c.capacity,
              (SELECT COUNT(*)::int FROM enrollments e WHERE e.class_id = c.id AND e.status = 'active') AS student_count,
              ct.user_id AS class_teacher_id,
              u.full_name AS class_teacher_name,
              u.email AS class_teacher_email
       FROM classes c
       LEFT JOIN class_teachers ct ON ct.class_id = c.id AND ct.academic_year_id = (
         SELECT id FROM academic_years WHERE school_id = $1 AND is_current = true LIMIT 1
       )
       LEFT JOIN users u ON u.id = ct.user_id
       WHERE c.school_id = $1
       ORDER BY c.level, c.name`,
      [schoolId]
    );

    if (classId) {
      // Get students in class
      const studentsRes = await query(
        `SELECT s.id, s.first_name, s.last_name, s.admission_number, s.gender, s.date_of_birth,
                e.id AS enrollment_id, e.roll_number
         FROM enrollments e
         JOIN students s ON s.id = e.student_id
         WHERE e.class_id = $1 AND e.status = 'active'
         ORDER BY s.last_name, s.first_name`,
        [classId]
      );

      // Get subject teachers for this class
      const teachersRes = await query(
        `SELECT ts.id, ts.subject_id, sub.name AS subject_name, sub.code,
                u.id AS teacher_id, u.full_name AS teacher_name
         FROM teacher_assignments ts
         JOIN subjects sub ON sub.id = ts.subject_id
         JOIN users u ON u.id = ts.user_id
         WHERE ts.class_id = $1 AND ts.school_id = $2
         ORDER BY sub.name`,
        [classId, schoolId]
      );

      return NextResponse.json({
        students: studentsRes.rows,
        teachers: teachersRes.rows,
        class: classesRes.rows.find(c => c.id === classId),
      });
    }

    // Get all teachers
    const teachersRes = await query(
      `SELECT u.id, u.full_name, u.email, um.role
       FROM users u
       JOIN user_memberships um ON um.user_id = u.id AND um.school_id = $1 AND um.status = 'active'
       WHERE um.role IN ('teacher','class_teacher','director_of_studies','headteacher')
       ORDER BY u.full_name`,
      [schoolId]
    );

    // Get subjects
    const subjectsRes = await query(
      `SELECT id, name, code FROM subjects WHERE school_id = $1 ORDER BY name`,
      [schoolId]
    );

    // Get current academic year
    const yearRes = await query(
      `SELECT id, name FROM academic_years WHERE school_id = $1 AND is_current = true LIMIT 1`,
      [schoolId]
    );

    return NextResponse.json({
      classes: classesRes.rows,
      teachers: teachersRes.rows,
      subjects: subjectsRes.rows,
      academicYear: yearRes.rows[0] || null,
    });
  } catch (error) {
    console.error('Classes GET error:', error);
    return NextResponse.json({ error: 'Failed to load class data' }, { status: 500 });
  }
}

// POST /api/classes — assign class teacher, assign subject teacher, promote students
export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allowedRoles = ['school_admin', 'headteacher', 'deputy_headteacher_academics', 'director_of_studies'];
    if (!allowedRoles.includes(user.activeRole) && !user.is_platform_admin) {
      return NextResponse.json({ error: 'Forbidden: School Admin or Headteacher required' }, { status: 403 });
    }

    const schoolId = user.activeSchool?.id;
    if (!schoolId) return NextResponse.json({ error: 'No active school' }, { status: 400 });

    const body = await request.json();
    const { action } = body;

    // ── Assign Class Teacher ──
    if (action === 'assign_class_teacher') {
      const { class_id, teacher_user_id, academic_year_id } = body;

      // Get or create academic year
      let yearId = academic_year_id;
      if (!yearId) {
        const yr = await query(`SELECT id FROM academic_years WHERE school_id=$1 AND is_current=true LIMIT 1`, [schoolId]);
        yearId = yr.rows[0]?.id;
      }

      if (!yearId) return NextResponse.json({ error: 'No active academic year. Create one first.' }, { status: 400 });

      // Upsert class teacher
      await query(
        `INSERT INTO class_teachers (class_id, user_id, school_id, academic_year_id)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (class_id, academic_year_id) DO UPDATE SET user_id = EXCLUDED.user_id`,
        [class_id, teacher_user_id, schoolId, yearId]
      );

      // Update membership role to class_teacher if currently teacher
      await query(
        `UPDATE user_memberships SET role = 'class_teacher'
         WHERE user_id = $1 AND school_id = $2 AND role = 'teacher'`,
        [teacher_user_id, schoolId]
      );

      await query(
        `INSERT INTO audit_logs (school_id, user_id, action, module, details) VALUES ($1,$2,'ASSIGN_CLASS_TEACHER','academics',$3)`,
        [schoolId, user.id, JSON.stringify({ class_id, teacher_user_id })]
      );

      return NextResponse.json({ success: true, message: 'Class teacher assigned successfully.' });
    }

    // ── Assign Subject Teacher to Class ──
    if (action === 'assign_subject_teacher') {
      const { class_id, teacher_user_id, subject_id } = body;

      await query(
        `INSERT INTO teacher_assignments (school_id, class_id, user_id, subject_id)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (class_id, subject_id) DO UPDATE SET user_id = EXCLUDED.user_id`,
        [schoolId, class_id, teacher_user_id, subject_id]
      );

      await query(
        `INSERT INTO audit_logs (school_id, user_id, action, module, details) VALUES ($1,$2,'ASSIGN_SUBJECT_TEACHER','academics',$3)`,
        [schoolId, user.id, JSON.stringify({ class_id, teacher_user_id, subject_id })]
      );

      return NextResponse.json({ success: true, message: 'Subject teacher assigned successfully.' });
    }

    // ── Promote Student to Another Class ──
    if (action === 'promote_student') {
      const { enrollment_id, to_class_id, reason } = body;

      const enrRes = await query(
        `SELECT e.id, e.student_id, e.class_id, s.first_name, s.last_name, c.name AS from_class
         FROM enrollments e
         JOIN students s ON s.id = e.student_id
         JOIN classes c ON c.id = e.class_id
         WHERE e.id = $1`,
        [enrollment_id]
      );
      if (!enrRes.rows.length) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });

      const enr = enrRes.rows[0];
      const toClassRes = await query(`SELECT name FROM classes WHERE id=$1`, [to_class_id]);
      const toClassName = toClassRes.rows[0]?.name || to_class_id;

      // Update enrollment to new class
      await query(`UPDATE enrollments SET class_id=$1 WHERE id=$2`, [to_class_id, enrollment_id]);

      await query(
        `INSERT INTO audit_logs (school_id, user_id, action, module, details) VALUES ($1,$2,'STUDENT_PROMOTED','academics',$3)`,
        [schoolId, user.id, JSON.stringify({ student: `${enr.first_name} ${enr.last_name}`, from: enr.from_class, to: toClassName, reason })]
      );

      return NextResponse.json({ success: true, message: `${enr.first_name} ${enr.last_name} promoted from ${enr.from_class} to ${toClassName}.` });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Classes POST error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
