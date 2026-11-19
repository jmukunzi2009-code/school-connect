import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = user.activeSchool?.id;
    if (!schoolId) {
      return NextResponse.json({ error: 'No active school assigned' }, { status: 400 });
    }

    // 1. Classes with streams
    const classesRes = await query(
      `SELECT c.id, c.name, c.grade_level,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', st.id,
                    'name', st.name,
                    'capacity', st.capacity,
                    'room_number', st.room_number
                  )
                ) FILTER (WHERE st.id IS NOT NULL), '[]'
              ) as streams
       FROM classes c
       LEFT JOIN streams st ON st.class_id = c.id
       WHERE c.school_id = $1
       GROUP BY c.id, c.name, c.grade_level
       ORDER BY c.grade_level ASC`,
      [schoolId]
    );

    // 2. Subjects
    const subjectsRes = await query(
      `SELECT s.id, s.name, s.code, s.credits, s.is_elective, d.name as department_name
       FROM subjects s
       LEFT JOIN departments d ON d.id = s.department_id
       WHERE s.school_id = $1
       ORDER BY s.name ASC`,
      [schoolId]
    );

    // 3. Departments
    const deptRes = await query(
      `SELECT id, name, code FROM departments WHERE school_id = $1 ORDER BY name ASC`,
      [schoolId]
    );

    // 4. Academic Years
    const yearsRes = await query(
      `SELECT id, name, start_date, end_date, is_current, status
       FROM academic_years WHERE school_id = $1 ORDER BY start_date DESC`,
      [schoolId]
    );

    return NextResponse.json({
      classes: classesRes.rows,
      subjects: subjectsRes.rows,
      departments: deptRes.rows,
      academicYears: yearsRes.rows,
    });
  } catch (error) {
    console.error('Academics GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve academic structures.' }, { status: 500 });
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

    const body = await request.json();
    const { action } = body;

    if (action === 'create_class') {
      const { name, grade_level, stream_name } = body;
      if (!name || !grade_level) {
        return NextResponse.json({ error: 'Class name and grade level are required.' }, { status: 400 });
      }

      const cRes = await query(
        `INSERT INTO classes (school_id, name, grade_level)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [schoolId, name.trim(), parseInt(grade_level, 10)]
      );

      // Create initial stream
      await query(
        `INSERT INTO streams (school_id, class_id, name, capacity)
         VALUES ($1, $2, $3, 40)`,
        [schoolId, cRes.rows[0].id, stream_name ? stream_name.trim() : 'Stream A']
      );

      return NextResponse.json({ success: true, message: `Class "${name}" created with stream.` });
    }

    if (action === 'create_subject') {
      const { name, code, department_id, credits } = body;
      if (!name || !code) {
        return NextResponse.json({ error: 'Subject name and code are required.' }, { status: 400 });
      }

      await query(
        `INSERT INTO subjects (school_id, name, code, department_id, credits)
         VALUES ($1, $2, $3, $4, $5)`,
        [schoolId, name.trim(), code.trim().toUpperCase(), department_id || null, parseInt(credits, 10) || 3]
      );

      return NextResponse.json({ success: true, message: `Subject "${name}" added to curriculum.` });
    }

    return NextResponse.json({ error: 'Invalid academic action.' }, { status: 400 });
  } catch (error) {
    console.error('Academics POST error:', error);
    return NextResponse.json({ error: 'Failed to process academic modification.' }, { status: 500 });
  }
}
