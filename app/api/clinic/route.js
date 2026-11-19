import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { isAccessRestricted } from '@/lib/permissions';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Confidentiality enforcement: Nurse role check
    const isNurseOrDoctor = ['nurse', 'school_admin'].includes(user.activeRole);
    if (isAccessRestricted(user.activeRole, 'clinic') && !isNurseOrDoctor) {
      return NextResponse.json(
        { error: 'Confidentiality violation: You are not authorized to inspect student infirmary records.' },
        { status: 403 }
      );
    }

    const schoolId = user.activeSchool?.id;
    if (!schoolId) {
      return NextResponse.json({ error: 'No active school assigned' }, { status: 400 });
    }

    // 1. Fetch clinic visits
    const visitsRes = await query(
      `SELECT cv.id, cv.visit_date, cv.symptoms, cv.diagnosis, cv.treatment, cv.medication_given,
              cv.temperature, cv.blood_pressure, cv.nurse_notes, cv.status, cv.follow_up_required,
              s.id as student_id, s.admission_number, s.first_name, s.last_name, s.gender, s.blood_group,
              c.name as class_name, st.name as stream_name
       FROM clinic_visits cv
       JOIN students s ON s.id = cv.student_id
       LEFT JOIN enrollments e ON e.student_id = s.id AND e.status = 'active'
       LEFT JOIN classes c ON c.id = e.class_id
       LEFT JOIN streams st ON st.id = e.stream_id
       WHERE cv.school_id = $1
       ORDER BY cv.visit_date DESC LIMIT 30`,
      [schoolId]
    );

    // 2. Fetch classes with enrolled students for the quick selection loop
    const classesRes = await query(
      `SELECT c.id, c.name,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', s.id,
                    'admission_number', s.admission_number,
                    'name', s.first_name || ' ' || s.last_name,
                    'blood_group', s.blood_group
                  )
                ) FILTER (WHERE s.id IS NOT NULL), '[]'
              ) as students
       FROM classes c
       LEFT JOIN enrollments e ON e.class_id = c.id AND e.status = 'active'
       LEFT JOIN students s ON s.id = e.student_id
       WHERE c.school_id = $1
       GROUP BY c.id, c.name
       ORDER BY c.grade_level ASC`,
      [schoolId]
    );

    return NextResponse.json({
      visits: visitsRes.rows,
      classesWithStudents: classesRes.rows,
    });
  } catch (error) {
    console.error('Clinic GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve infirmary data.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.activeRole !== 'nurse' && user.activeRole !== 'school_admin') {
      return NextResponse.json({ error: 'Unauthorized: Only designated nurses can record clinic visits.' }, { status: 403 });
    }

    const schoolId = user.activeSchool?.id;
    if (!schoolId) {
      return NextResponse.json({ error: 'No active school assigned' }, { status: 400 });
    }

    const body = await request.json();
    const {
      student_id,
      symptoms,
      diagnosis,
      treatment,
      medication_given,
      temperature,
      blood_pressure,
      nurse_notes,
      follow_up_required,
      status,
    } = body;

    if (!student_id || !symptoms) {
      return NextResponse.json({ error: 'Student and symptoms are required.' }, { status: 400 });
    }

    const insertRes = await query(
      `INSERT INTO clinic_visits (
        school_id, student_id, symptoms, diagnosis, treatment, medication_given,
        temperature, blood_pressure, nurse_notes, follow_up_required, status, attending_nurse_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, visit_date`,
      [
        schoolId,
        student_id,
        symptoms.trim(),
        diagnosis ? diagnosis.trim() : null,
        treatment ? treatment.trim() : null,
        medication_given ? medication_given.trim() : null,
        temperature || '36.8 C',
        blood_pressure || null,
        nurse_notes || null,
        !!follow_up_required,
        status || 'treated',
        user.id,
      ]
    );

    // Audit log (sanitized, does not leak private diagnostic text into platform audit)
    await query(
      `INSERT INTO audit_logs (school_id, user_id, action, module, details)
       VALUES ($1, $2, 'CLINIC_VISIT_RECORDED', 'health', $3)`,
      [schoolId, user.id, JSON.stringify({ visit_id: insertRes.rows[0].id, student_id })]
    );

    return NextResponse.json({
      success: true,
      message: 'Clinic visit logged in secure medical register.',
      visit: insertRes.rows[0],
    });
  } catch (error) {
    console.error('Clinic POST error:', error);
    return NextResponse.json({ error: 'Failed to record clinic visit.' }, { status: 500 });
  }
}
