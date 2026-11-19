import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { activeRole, activeSchool, is_platform_admin } = user;

    // 1. SUPER ADMIN PLATFORM OVERVIEW
    if (activeRole === 'super_admin' || is_platform_admin) {
      const [
        schoolsCountRes,
        activeSchoolsRes,
        pendingAppsRes,
        approvedAppsRes,
        usersCountRes,
        subsCountRes,
        recentAppsRes,
        recentLogsRes,
      ] = await Promise.all([
        query(`SELECT COUNT(*) FROM schools`),
        query(`SELECT COUNT(*) FROM schools WHERE status = 'active'`),
        query(`SELECT COUNT(*) FROM school_applications WHERE status = 'pending'`),
        query(`SELECT COUNT(*) FROM school_applications WHERE status = 'approved'`),
        query(`SELECT COUNT(*) FROM users`),
        query(`SELECT COUNT(*) FROM subscriptions WHERE status = 'active'`),
        query(
          `SELECT id, application_reference, school_name, school_email, country, status, created_at
           FROM school_applications
           ORDER BY created_at DESC LIMIT 6`
        ),
        query(
          `SELECT id, action, module, created_at
           FROM audit_logs
           ORDER BY created_at DESC LIMIT 8`
        ),
      ]);

      return NextResponse.json({
        type: 'super_admin',
        stats: {
          totalSchools: parseInt(schoolsCountRes.rows[0].count, 10),
          activeSchools: parseInt(activeSchoolsRes.rows[0].count, 10),
          pendingApplications: parseInt(pendingAppsRes.rows[0].count, 10),
          approvedApplications: parseInt(approvedAppsRes.rows[0].count, 10),
          totalUsers: parseInt(usersCountRes.rows[0].count, 10),
          activeSubscriptions: parseInt(subsCountRes.rows[0].count, 10),
        },
        recentApplications: recentAppsRes.rows,
        recentLogs: recentLogsRes.rows,
      });
    }

    // 2. SCHOOL LEVEL ROLES OVERVIEW
    if (!activeSchool || !activeSchool.id) {
      return NextResponse.json({ error: 'No active school assigned.' }, { status: 400 });
    }

    const schoolId = activeSchool.id;
    const canViewFinance = ['school_owner', 'headteacher', 'school_admin', 'bursar', 'cashier'].includes(activeRole);
    const canViewLibrary = ['school_owner', 'headteacher', 'school_admin', 'librarian'].includes(activeRole);
    const canViewClinicSummary = ['school_owner', 'headteacher', 'school_admin', 'nurse'].includes(activeRole);
    const canViewRoster = ['school_owner', 'headteacher', 'school_admin', 'registrar', 'class_teacher'].includes(activeRole);
    const canViewSchoolPulse = ['school_owner', 'headteacher', 'school_admin', 'deputy_headteacher_academics', 'deputy_headteacher_discipline'].includes(activeRole);

    // Query core school metrics
    const [
      studentCountRes,
      classCountRes,
      staffCountRes,
      bookCountRes,
      feeCollectionRes,
      clinicVisitsRes,
      recentStudentsRes,
      announcementsRes,
      attendanceSummaryRes,
      recentActivityRes,
    ] = await Promise.all([
      query(
        `SELECT COUNT(*) FROM students WHERE school_id = $1 AND status = 'enrolled'`,
        [schoolId]
      ),
      query(
        `SELECT COUNT(*) FROM classes WHERE school_id = $1`,
        [schoolId]
      ),
      canViewRoster
        ? query(
            `SELECT COUNT(DISTINCT user_id) FROM user_memberships WHERE school_id = $1 AND status = 'active'`,
            [schoolId]
          )
        : Promise.resolve(null),
      canViewLibrary
        ? query(
          `SELECT COALESCE(SUM(total_copies), 0) as total, COALESCE(SUM(available_copies), 0) as available
           FROM library_books WHERE school_id = $1`,
          [schoolId]
        )
        : Promise.resolve(null),
      canViewFinance
        ? query(
          `SELECT COALESCE(SUM(amount_paid), 0) as collected, COALESCE(SUM(balance), 0) as outstanding
           FROM invoices WHERE school_id = $1`,
          [schoolId]
        )
        : Promise.resolve(null),
      canViewClinicSummary
        ? query(
          `SELECT COUNT(*) FROM clinic_visits WHERE school_id = $1`,
          [schoolId]
        )
        : Promise.resolve(null),
      canViewRoster
        ? query(
          `SELECT s.id, s.admission_number, s.first_name, s.last_name, s.gender, s.created_at,
                  c.name as class_name, st.name as stream_name
           FROM students s
           LEFT JOIN enrollments e ON e.student_id = s.id AND e.status = 'active'
           LEFT JOIN classes c ON c.id = e.class_id
           LEFT JOIN streams st ON st.id = e.stream_id
           WHERE s.school_id = $1
           ORDER BY s.created_at DESC LIMIT 5`,
          [schoolId]
        )
        : Promise.resolve({ rows: [] }),
      query(
        `SELECT id, title, content, target_audience, created_at
         FROM announcements
         WHERE school_id = $1 OR school_id IS NULL
         ORDER BY created_at DESC LIMIT 3`,
        [schoolId]
      ),
      canViewSchoolPulse
        ? query(
            `SELECT COUNT(DISTINCT s.id)::int AS enrolled,
                    COUNT(sa.id)::int AS marked,
                    COUNT(sa.id) FILTER (WHERE sa.status = 'present')::int AS present,
                    COUNT(sa.id) FILTER (WHERE sa.status = 'absent')::int AS absent,
                    COUNT(sa.id) FILTER (WHERE sa.status = 'late')::int AS late
             FROM students s
             LEFT JOIN student_attendance sa
               ON sa.student_id = s.id AND sa.school_id = s.school_id AND sa.date = CURRENT_DATE
             WHERE s.school_id = $1 AND s.status = 'enrolled'`,
            [schoolId]
          )
        : Promise.resolve(null),
      canViewSchoolPulse
        ? query(
            `SELECT action, module, created_at
             FROM audit_logs
             WHERE school_id = $1
             ORDER BY created_at DESC LIMIT 6`,
            [schoolId]
          )
        : Promise.resolve({ rows: [] }),
    ]);

    return NextResponse.json({
      type: 'school_user',
      role: activeRole,
      school: activeSchool,
      permissions: { canViewFinance, canViewLibrary, canViewClinicSummary, canViewRoster, canViewSchoolPulse },
      stats: {
        totalStudents: parseInt(studentCountRes.rows[0].count, 10),
        totalClasses: parseInt(classCountRes.rows[0].count, 10),
        ...(canViewRoster && { totalStaff: parseInt(staffCountRes.rows[0].count, 10) }),
        ...(bookCountRes && {
          totalBooks: parseInt(bookCountRes.rows[0].total, 10),
          availableBooks: parseInt(bookCountRes.rows[0].available, 10),
        }),
        ...(feeCollectionRes && {
          feesCollected: parseFloat(feeCollectionRes.rows[0].collected),
          feesOutstanding: parseFloat(feeCollectionRes.rows[0].outstanding),
        }),
        ...(clinicVisitsRes && { clinicVisits: parseInt(clinicVisitsRes.rows[0].count, 10) }),
        ...(attendanceSummaryRes && {
          attendanceToday: attendanceSummaryRes.rows[0],
        }),
      },
      recentStudents: recentStudentsRes.rows,
      announcements: announcementsRes.rows,
      recentActivity: recentActivityRes.rows,
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    const message = process.env.NODE_ENV === 'development'
      ? error.message
      : 'Failed to fetch dashboard metrics.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
