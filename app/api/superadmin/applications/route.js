import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user || (!user.is_platform_admin && user.activeRole !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized: Platform admin only' }, { status: 403 });
    }

    const res = await query(
      `SELECT id, application_reference, school_name, school_email, phone, country, district,
              school_type, rep_name, rep_position, rep_email, admin_email, status, created_at, reviewer_notes
       FROM school_applications
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ applications: res.rows });
  } catch (error) {
    console.error('Superadmin get applications error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user || (!user.is_platform_admin && user.activeRole !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized: Platform admin only' }, { status: 403 });
    }

    const { applicationId, action, notes } = await request.json();

    if (!applicationId || !['approve', 'reject', 'info_required'].includes(action)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Get application
    const appRes = await query(`SELECT * FROM school_applications WHERE id = $1`, [applicationId]);
    if (appRes.rows.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    const app = appRes.rows[0];

    if (action === 'approve') {
      // 1. Create or retrieve school
      const slug =
        app.school_name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50) +
        '-' +
        Math.floor(Math.random() * 1000);

      const schoolRes = await query(
        `INSERT INTO schools (name, slug, email, phone, country, district, address, school_type, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
         RETURNING id`,
        [
          app.school_name,
          slug,
          app.school_email,
          app.phone,
          app.country,
          app.district,
          app.address,
          app.school_type,
        ]
      );
      const schoolId = schoolRes.rows[0].id;

      // 2. Create enterprise subscription
      await query(
        `INSERT INTO subscriptions (school_id, plan_name, status, billing_cycle, amount)
         VALUES ($1, 'Enterprise', 'active', 'yearly', 1200.00)`,
        [schoolId]
      );

      // 3. Use admin credentials from the application (set by the registering school rep)
      //    Fall back to rep_email + default password only if the admin credentials were not captured
      const adminEmail = app.admin_email || app.rep_email;
      let adminPasswordHash = app.admin_password_hash;

      if (!adminPasswordHash) {
        // Legacy fallback: application submitted before this feature was added
        adminPasswordHash = await hashPassword('SchoolAdmin2026!');
      }

      const userRes = await query(
        `INSERT INTO users (email, password_hash, full_name, phone, is_platform_admin, is_active)
         VALUES ($1, $2, $3, $4, FALSE, TRUE)
         ON CONFLICT (email) DO UPDATE SET
           password_hash = CASE WHEN EXCLUDED.password_hash IS NOT NULL THEN EXCLUDED.password_hash ELSE users.password_hash END,
           full_name = EXCLUDED.full_name,
           is_active = TRUE
         RETURNING id`,
        [adminEmail, adminPasswordHash, app.rep_name, app.phone]
      );
      const repUserId = userRes.rows[0].id;

      // 4. Assign School Admin role to rep
      await query(
        `INSERT INTO user_memberships (user_id, school_id, role, is_primary, status)
         VALUES ($1, $2, 'school_admin', TRUE, 'active')
         ON CONFLICT (user_id, school_id, role) DO UPDATE SET status = 'active'`,
        [repUserId, schoolId]
      );

      // 5. Update application status
      await query(
        `UPDATE school_applications
         SET status = 'approved', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP, reviewer_notes = $2
         WHERE id = $3`,
        [user.id, notes || 'Approved by Super Administrator. School workspace provisioned.', applicationId]
      );

      // 6. Log audit
      await query(
        `INSERT INTO audit_logs (school_id, user_id, action, module, details)
         VALUES ($1, $2, 'SCHOOL_APPLICATION_APPROVED', 'school_applications', $3)`,
        [
          schoolId,
          user.id,
          JSON.stringify({ applicationId, schoolName: app.school_name, adminEmail }),
        ]
      );

      return NextResponse.json({
        success: true,
        message: `School "${app.school_name}" approved. Admin account activated (${adminEmail}).`,
        schoolId,
        adminEmail,
      });
    } else if (action === 'reject') {
      await query(
        `UPDATE school_applications
         SET status = 'rejected', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP, reviewer_notes = $2
         WHERE id = $3`,
        [user.id, notes || 'Application rejected by platform administration.', applicationId]
      );

      await query(
        `INSERT INTO audit_logs (user_id, action, module, details)
         VALUES ($1, 'SCHOOL_APPLICATION_REJECTED', 'school_applications', $2)`,
        [user.id, JSON.stringify({ applicationId, schoolName: app.school_name })]
      );

      return NextResponse.json({ success: true, message: `Application for "${app.school_name}" rejected.` });
    } else {
      await query(
        `UPDATE school_applications
         SET status = 'info_required', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP, reviewer_notes = $2
         WHERE id = $3`,
        [user.id, notes || 'Additional accreditation documentation requested.', applicationId]
      );

      return NextResponse.json({ success: true, message: 'Requested additional information from applicant.' });
    }
  } catch (error) {
    console.error('Superadmin application action error:', error);
    return NextResponse.json({ error: 'Failed to process application action.' }, { status: 500 });
  }
}
