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
    const search = searchParams.get('search');

    const schoolId = user.activeSchool?.id;
    if (!schoolId && !user.is_platform_admin) {
      return NextResponse.json({ error: 'No active school assigned' }, { status: 400 });
    }

    let sql = `
      SELECT s.id, s.admission_number, s.first_name, s.last_name, s.other_names,
             s.gender, s.date_of_birth, s.blood_group, s.emergency_contact, s.emergency_phone,
             s.status, s.created_at,
             c.id as class_id, c.name as class_name,
             st.id as stream_id, st.name as stream_name,
             ay.name as academic_year_name,
             g.first_name as guardian_first, g.last_name as guardian_last, g.phone as guardian_phone
      FROM students s
      LEFT JOIN enrollments e ON e.student_id = s.id AND e.status = 'active'
      LEFT JOIN classes c ON c.id = e.class_id
      LEFT JOIN streams st ON st.id = e.stream_id
      LEFT JOIN academic_years ay ON ay.id = e.academic_year_id
      LEFT JOIN student_guardians sg ON sg.student_id = s.id AND sg.is_primary = TRUE
      LEFT JOIN guardians g ON g.id = sg.guardian_id
      WHERE s.school_id = $1
    `;
    const params = [schoolId];

    if (classId) {
      params.push(classId);
      sql += ` AND e.class_id = $${params.length}`;
    }

    if (streamId) {
      params.push(streamId);
      sql += ` AND e.stream_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      sql += ` AND (s.first_name ILIKE $${params.length} OR s.last_name ILIKE $${params.length} OR s.admission_number ILIKE $${params.length})`;
    }

    sql += ` ORDER BY s.admission_number ASC`;

    const studentsRes = await query(sql, params);

    // Also fetch classes and streams for dropdown filtering
    const classesRes = await query(
      `SELECT c.id, c.name, 
        COALESCE(json_agg(json_build_object('id', st.id, 'name', st.name)) FILTER (WHERE st.id IS NOT NULL), '[]') as streams
       FROM classes c
       LEFT JOIN streams st ON st.class_id = c.id
       WHERE c.school_id = $1
       GROUP BY c.id, c.name
       ORDER BY c.grade_level ASC`,
      [schoolId]
    );

    return NextResponse.json({
      students: studentsRes.rows,
      classes: classesRes.rows,
    });
  } catch (error) {
    console.error('Students API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve students.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check: Only Registrar, School Admin, or Headteacher can register students
    const allowedRoles = ['registrar', 'school_admin', 'headteacher', 'super_admin'];
    if (!allowedRoles.includes(user.activeRole) && !user.is_platform_admin) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to register students.' }, { status: 403 });
    }

    const schoolId = user.activeSchool?.id;
    if (!schoolId) {
      return NextResponse.json({ error: 'No active school assigned' }, { status: 400 });
    }

    const body = await request.json();
    const {
      first_name,
      last_name,
      gender,
      date_of_birth,
      blood_group,
      class_id,
      stream_id,
      guardian_name,
      guardian_phone,
      guardian_relationship,
      emergency_phone,
    } = body;

    if (!first_name || !last_name || !gender || !class_id || !stream_id) {
      return NextResponse.json({ error: 'Please provide all required student details and class stream.' }, { status: 400 });
    }

    // Auto-generate Admission Number
    const countRes = await query(`SELECT COUNT(*) FROM students WHERE school_id = $1`, [schoolId]);
    const nextNum = parseInt(countRes.rows[0].count, 10) + 1;
    const padNum = String(nextNum).padStart(3, '0');
    const admissionNumber = `KHIA-2026-${padNum}`;

    // 1. Insert Student
    const studentRes = await query(
      `INSERT INTO students (
        school_id, admission_number, first_name, last_name, gender,
        date_of_birth, blood_group, emergency_contact, emergency_phone, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'enrolled')
      RETURNING id, admission_number, first_name, last_name`,
      [
        schoolId,
        admissionNumber,
        first_name.trim(),
        last_name.trim(),
        gender,
        date_of_birth || null,
        blood_group || null,
        guardian_name ? guardian_name.trim() : 'Emergency Contact',
        emergency_phone || guardian_phone || null,
      ]
    );
    const newStudent = studentRes.rows[0];

    // 2. Fetch current academic year
    const yearRes = await query(
      `SELECT id FROM academic_years WHERE school_id = $1 AND is_current = TRUE LIMIT 1`,
      [schoolId]
    );
    let yearId = yearRes.rows[0]?.id;
    if (!yearId) {
      const anyYear = await query(`SELECT id FROM academic_years WHERE school_id = $1 LIMIT 1`, [schoolId]);
      yearId = anyYear.rows[0]?.id;
    }

    // 3. Insert Enrollment (The Connected Loop!)
    if (yearId) {
      await query(
        `INSERT INTO enrollments (school_id, student_id, academic_year_id, class_id, stream_id, status)
         VALUES ($1, $2, $3, $4, $5, 'active')`,
        [schoolId, newStudent.id, yearId, class_id, stream_id]
      );

      // 4. Also fetch active term to generate initial tuition invoice automatically!
      const termRes = await query(
        `SELECT id FROM terms WHERE school_id = $1 AND academic_year_id = $2 AND is_current = TRUE LIMIT 1`,
        [schoolId, yearId]
      );
      const termId = termRes.rows[0]?.id;

      if (termId) {
        await query(
          `INSERT INTO invoices (school_id, invoice_number, student_id, academic_year_id, term_id, total_amount, amount_paid, balance, status, due_date)
           VALUES ($1, $2, $3, $4, $5, 450.00, 0.00, 450.00, 'unpaid', CURRENT_DATE + INTERVAL '30 days')`,
          [schoolId, 'INV-' + admissionNumber, newStudent.id, yearId, termId]
        );
      }
    }

    // 5. Insert Guardian if provided
    if (guardian_name && guardian_phone) {
      const guardianParts = guardian_name.trim().split(' ');
      const gFirst = guardianParts[0];
      const gLast = guardianParts.slice(1).join(' ') || 'Guardian';

      const gRes = await query(
        `INSERT INTO guardians (school_id, first_name, last_name, relationship, phone)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [schoolId, gFirst, gLast, guardian_relationship || 'Parent', guardian_phone.trim()]
      );

      await query(
        `INSERT INTO student_guardians (student_id, guardian_id, is_primary)
         VALUES ($1, $2, TRUE)`,
        [newStudent.id, gRes.rows[0].id]
      );
    }

    // 6. Write audit log
    await query(
      `INSERT INTO audit_logs (school_id, user_id, action, module, details)
       VALUES ($1, $2, 'STUDENT_REGISTERED', 'students', $3)`,
      [
        schoolId,
        user.id,
        JSON.stringify({
          student_id: newStudent.id,
          admission_number: newStudent.admission_number,
          full_name: `${newStudent.first_name} ${newStudent.last_name}`,
        }),
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Student ${newStudent.first_name} ${newStudent.last_name} (${newStudent.admission_number}) registered successfully and enrolled into class.`,
      student: newStudent,
    });
  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json({ error: 'Failed to register student.' }, { status: 500 });
  }
}
