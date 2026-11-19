import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const streamId = searchParams.get('streamId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const schoolId = user.activeSchool?.id;
    if (!schoolId) {
      return NextResponse.json({ error: 'No active school assigned' }, { status: 400 });
    }
    const isTeachingRole = ['teacher', 'class_teacher'].includes(user.activeRole);
    const teacherFilter = isTeachingRole
      ? `AND (
           EXISTS (SELECT 1 FROM class_teachers ct WHERE ct.class_id = c.id AND ct.school_id = c.school_id AND ct.user_id = $2)
           OR EXISTS (SELECT 1 FROM teacher_assignments ta WHERE ta.class_id = c.id AND ta.teacher_id = $2)
         )`
      : '';

    // Fetch classes & streams
    const classesRes = await query(
      `SELECT c.id, c.name,
              COALESCE(json_agg(json_build_object('id', st.id, 'name', st.name)) FILTER (WHERE st.id IS NOT NULL), '[]') as streams
       FROM classes c
       LEFT JOIN streams st ON st.class_id = c.id
       WHERE c.school_id = $1 ${teacherFilter}
       GROUP BY c.id, c.name
       ORDER BY c.grade_level ASC`,
      isTeachingRole ? [schoolId, user.id] : [schoolId]
    );

    // If class and stream provided, fetch enrolled students along with attendance record for the date
    let students = [];
    if (classId) {
      if (isTeachingRole) {
        const assignedClassRes = await query(
          `SELECT c.id
           FROM classes c
           WHERE c.id = $1 AND c.school_id = $2
             AND (
               EXISTS (SELECT 1 FROM class_teachers ct WHERE ct.class_id = c.id AND ct.school_id = c.school_id AND ct.user_id = $3)
               OR EXISTS (SELECT 1 FROM teacher_assignments ta WHERE ta.class_id = c.id AND ta.teacher_id = $3)
             )
           LIMIT 1`,
          [classId, schoolId, user.id]
        );
        if (!assignedClassRes.rows.length) {
          return NextResponse.json({ error: 'This class is not assigned to your account.' }, { status: 404 });
        }
      }

      let q = `
        SELECT s.id as student_id, s.admission_number, s.first_name, s.last_name, s.gender,
               sa.status as attendance_status, sa.remarks
        FROM enrollments e
        JOIN students s ON s.id = e.student_id
        LEFT JOIN student_attendance sa ON sa.student_id = s.id AND sa.date = $3
        WHERE e.school_id = $1 AND e.class_id = $2 AND e.status = 'active' AND s.school_id = $1
      `;
      const params = [schoolId, classId, date];
      if (streamId) {
        params.push(streamId);
        q += ` AND e.stream_id = $4`;
      }
      q += ` ORDER BY s.admission_number ASC`;

      const studRes = await query(q, params);
      students = studRes.rows.map((row) => ({
        ...row,
        attendance_status: row.attendance_status || 'present', // default present
      }));
    }

    return NextResponse.json({
      classes: classesRes.rows,
      students,
      date,
    });
  } catch (error) {
    console.error('Attendance GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve attendance data.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = user.activeSchool?.id;
    if (!schoolId) {
      return NextResponse.json({ error: 'No active school assigned' }, { status: 400 });
    }

    const { class_id, stream_id, date, records } = await request.json();

    if (!class_id || !date || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Class, date, and attendance records are required.' }, { status: 400 });
    }

    const isTeachingRole = ['teacher', 'class_teacher'].includes(user.activeRole);
    const classAccessRes = await query(
      `SELECT c.id
       FROM classes c
       WHERE c.id = $1 AND c.school_id = $2
         AND (
           $3::boolean = false
           OR EXISTS (SELECT 1 FROM class_teachers ct WHERE ct.class_id = c.id AND ct.school_id = c.school_id AND ct.user_id = $4)
           OR EXISTS (SELECT 1 FROM teacher_assignments ta WHERE ta.class_id = c.id AND ta.teacher_id = $4)
         )
       LIMIT 1`,
      [class_id, schoolId, isTeachingRole, user.id]
    );
    if (!classAccessRes.rows.length) {
      return NextResponse.json({ error: 'This class is not assigned to your account.' }, { status: 404 });
    }

    const studentIds = [...new Set(records.map((record) => record.student_id))];
    const enrolledStudentsRes = await query(
      `SELECT COUNT(DISTINCT e.student_id)::int AS count
       FROM enrollments e
       JOIN students s ON s.id = e.student_id
       WHERE e.school_id = $1 AND e.class_id = $2 AND e.status = 'active'
         AND s.school_id = $1 AND e.student_id = ANY($3::uuid[])`,
      [schoolId, class_id, studentIds]
    );
    if (Number(enrolledStudentsRes.rows[0].count) !== studentIds.length) {
      return NextResponse.json({ error: 'Attendance can only be recorded for students enrolled in this class.' }, { status: 400 });
    }

    // Save attendance for each student
    for (const r of records) {
      await query(
        `INSERT INTO student_attendance (school_id, student_id, class_id, stream_id, date, status, remarks, recorded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (student_id, date)
         DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks, recorded_by = EXCLUDED.recorded_by`,
        [schoolId, r.student_id, class_id, stream_id || null, date, r.status, r.remarks || null, user.id]
      );
    }

    // Log audit
    await query(
      `INSERT INTO audit_logs (school_id, user_id, action, module, details)
       VALUES ($1, $2, 'ATTENDANCE_RECORDED', 'attendance', $3)`,
      [schoolId, user.id, JSON.stringify({ class_id, stream_id, date, student_count: records.length })]
    );

    return NextResponse.json({ success: true, message: `Attendance saved for ${records.length} students on ${date}.` });
  } catch (error) {
    console.error('Attendance POST error:', error);
    return NextResponse.json({ error: 'Failed to save attendance.' }, { status: 500 });
  }
}
