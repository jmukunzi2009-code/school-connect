import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getClient, query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { ROLE_DEFINITIONS } from '@/lib/permissions';

const ACCOUNT_MANAGERS = ['school_admin', 'headteacher', 'school_owner', 'hr_manager'];

async function isValidSchoolRole(role, schoolId) {
  if (typeof role !== 'string' || role.length > 60) return false;
  if (Object.hasOwn(ROLE_DEFINITIONS, role) && !['super_admin', 'custom_role'].includes(role)) return true;
  const customRole = await query(
    'SELECT 1 FROM custom_roles WHERE school_id = $1 AND role_key = $2',
    [schoolId, role]
  );
  return customRole.rows.length > 0;
}

// GET /api/accounts — list all users in school
export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user || !ACCOUNT_MANAGERS.includes(user.activeRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const schoolId = user.activeSchool?.id;
    if (!schoolId) return NextResponse.json({ error: 'No school context' }, { status: 400 });

    const { rows } = await query(`
      SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at,
             um.role, um.id AS membership_id,
             um.status AS membership_status,
             (um.status = 'active') AS membership_active
      FROM user_memberships um
      JOIN users u ON u.id = um.user_id
      WHERE um.school_id = $1
      ORDER BY u.full_name ASC
    `, [schoolId]);

    return NextResponse.json({ users: rows });
  } catch (err) {
    console.error('GET /api/accounts error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/accounts — various account management actions
export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user || !ACCOUNT_MANAGERS.includes(user.activeRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const schoolId = user.activeSchool?.id;
    if (!schoolId) return NextResponse.json({ error: 'No school context' }, { status: 400 });

    const body = await request.json();
    const { action } = body;

    // ---- Create new user and assign to school ----
    if (action === 'create_user') {
      const { full_name, email, password, phone, role } = body;
      if (!full_name || !email || !password || !role) {
        return NextResponse.json({ error: 'full_name, email, password, and role are required' }, { status: 400 });
      }
      if (typeof full_name !== 'string' || !full_name.trim() || full_name.trim().length > 200 ||
          typeof email !== 'string' || email.trim().length > 255 ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
          typeof password !== 'string' || password.length < 6 ||
          (phone != null && typeof phone !== 'string') ||
          !(await isValidSchoolRole(role, schoolId))) {
        return NextResponse.json({ error: 'Enter a valid name, email, password, and school role.' }, { status: 400 });
      }

      // Check email not already taken
      const existing = await query('SELECT id FROM users WHERE lower(email) = lower($1)', [email.trim()]);
      if (existing.rows.length > 0) {
        // User exists — just add membership if not already in school
        const existingUser = existing.rows[0];
        const memberCheck = await query(
          'SELECT id, status FROM user_memberships WHERE user_id = $1 AND school_id = $2 AND role = $3',
          [existingUser.id, schoolId, role]
        );
        if (memberCheck.rows.length > 0) {
          if (memberCheck.rows[0].status !== 'active') {
            await query(
              `UPDATE user_memberships SET status = 'active' WHERE id = $1`,
              [memberCheck.rows[0].id]
            );
            return NextResponse.json({ success: true, message: 'Existing user membership reactivated.' });
          }
          return NextResponse.json({ error: 'This user already has that role in your school.' }, { status: 400 });
        }
        await query(
          `INSERT INTO user_memberships (user_id, school_id, role, status)
           VALUES ($1, $2, $3, 'active')
           ON CONFLICT (user_id, school_id, role)
           DO UPDATE SET status = 'active'`,
          [existingUser.id, schoolId, role]
        );
        return NextResponse.json({ success: true, message: 'Existing user added to school with new role.' });
      }

      const hash = await bcrypt.hash(password, 12);
      const client = await getClient();
      try {
        await client.query('BEGIN');
        const newUser = await client.query(`
          INSERT INTO users (full_name, email, password_hash, phone, is_active)
          VALUES ($1, $2, $3, $4, true) RETURNING id, full_name, email
        `, [full_name.trim(), email.toLowerCase().trim(), hash, phone?.trim() || null]);

        await client.query(
          `INSERT INTO user_memberships (user_id, school_id, role, status)
           VALUES ($1, $2, $3, 'active')`,
          [newUser.rows[0].id, schoolId, role]
        );
        await client.query('COMMIT');
        return NextResponse.json({ success: true, user: newUser.rows[0] });
      } catch (error) {
        await client.query('ROLLBACK');
        if (error.code === '23505') {
          return NextResponse.json({ error: 'That email address is already in use.' }, { status: 409 });
        }
        throw error;
      } finally {
        client.release();
      }
    }

    // ---- Assign / update role for existing user ----
    if (action === 'assign_role') {
      const { userId, role, membershipId } = body;
      if (!role || !(await isValidSchoolRole(role, schoolId))) {
        return NextResponse.json({ error: 'Select a valid role for this school.' }, { status: 400 });
      }
      if (membershipId) {
        let updated;
        try {
          updated = await query(
            `UPDATE user_memberships SET role = $1
             WHERE id = $2 AND school_id = $3 RETURNING id`,
            [role, membershipId, schoolId]
          );
        } catch (error) {
          if (error.code === '23505') {
            return NextResponse.json({ error: 'This user already has that role in your school.' }, { status: 409 });
          }
          throw error;
        }
        if (updated.rows.length === 0) return NextResponse.json({ error: 'School membership not found.' }, { status: 404 });
      } else {
        const target = await query('SELECT id FROM users WHERE id = $1 AND is_active = true', [userId]);
        if (!userId || target.rows.length === 0) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        // Add new membership
        const assigned = await query(
          `INSERT INTO user_memberships (user_id, school_id, role, status) VALUES ($1, $2, $3, 'active')
           ON CONFLICT (user_id, school_id, role)
           DO UPDATE SET status = 'active'
           WHERE user_memberships.status <> 'active'
           RETURNING id`,
          [userId, schoolId, role]
        );
        if (assigned.rows.length === 0) {
          return NextResponse.json({ error: 'This user already has that active role in your school.' }, { status: 409 });
        }
      }
      return NextResponse.json({ success: true, message: 'School role assigned.' });
    }

    if (action === 'update_user') {
      const { userId, membershipId, full_name, email, phone, role } = body;
      if (!userId || !membershipId || typeof full_name !== 'string' || !full_name.trim() ||
          full_name.trim().length > 200 || typeof email !== 'string' ||
          email.trim().length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
          !(await isValidSchoolRole(role, schoolId))) {
        return NextResponse.json({ error: 'Enter a valid name, email, and school role.' }, { status: 400 });
      }

      const client = await getClient();
      try {
        await client.query('BEGIN');
        const membership = await client.query(
          `SELECT user_id FROM user_memberships WHERE id = $1 AND school_id = $2 FOR UPDATE`,
          [membershipId, schoolId]
        );
        if (membership.rows.length === 0 || membership.rows[0].user_id !== userId) {
          await client.query('ROLLBACK');
          return NextResponse.json({ error: 'School membership not found.' }, { status: 404 });
        }

        const emailOwner = await client.query(
          'SELECT id FROM users WHERE lower(email) = lower($1) AND id <> $2',
          [email.trim(), userId]
        );
        if (emailOwner.rows.length > 0) {
          await client.query('ROLLBACK');
          return NextResponse.json({ error: 'That email address is already in use.' }, { status: 409 });
        }

        await client.query(
          `UPDATE users SET full_name = $1, email = $2, phone = $3 WHERE id = $4`,
          [full_name.trim(), email.trim().toLowerCase(), typeof phone === 'string' ? phone.trim() || null : null, userId]
        );
        await client.query(
          `UPDATE user_memberships SET role = $1 WHERE id = $2 AND school_id = $3`,
          [role, membershipId, schoolId]
        );
        await client.query('COMMIT');
        return NextResponse.json({ success: true, message: 'Account details and role updated.' });
      } catch (error) {
        await client.query('ROLLBACK');
        if (error.code === '23505') {
          return NextResponse.json({ error: 'That email or role is already assigned.' }, { status: 409 });
        }
        throw error;
      } finally {
        client.release();
      }
    }

    // ---- Toggle user active status ----
    if (action === 'toggle_status') {
      const { membershipId } = body;
      const target = await query(
        'SELECT user_id FROM user_memberships WHERE id = $1 AND school_id = $2',
        [membershipId, schoolId]
      );
      if (target.rows.length === 0) return NextResponse.json({ error: 'School membership not found.' }, { status: 404 });
      if (target.rows[0].user_id === user.id) {
        return NextResponse.json({ error: 'You cannot suspend your own active school access.' }, { status: 400 });
      }
      const updated = await query(
        `UPDATE user_memberships
         SET status = CASE WHEN status = 'active' THEN 'suspended' ELSE 'active' END
         WHERE id = $1 AND school_id = $2
         RETURNING status`,
        [membershipId, schoolId]
      );
      return NextResponse.json({ success: true, status: updated.rows[0].status });
    }

    // ---- Reset password ----
    if (action === 'reset_password') {
      const { userId, newPassword } = body;
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      // Verify user belongs to this school
      const memberCheck = await query(
        'SELECT id FROM user_memberships WHERE user_id = $1 AND school_id = $2',
        [userId, schoolId]
      );
      if (memberCheck.rows.length === 0) {
        return NextResponse.json({ error: 'User not in this school' }, { status: 403 });
      }
      const hash = await bcrypt.hash(newPassword, 12);
      await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);
      return NextResponse.json({ success: true });
    }

    // ---- Remove membership ----
    if (action === 'remove_membership') {
      const { membershipId } = body;
      const target = await query(
        'SELECT user_id FROM user_memberships WHERE id = $1 AND school_id = $2',
        [membershipId, schoolId]
      );
      if (target.rows.length === 0) return NextResponse.json({ error: 'School membership not found.' }, { status: 404 });
      if (target.rows[0].user_id === user.id) {
        return NextResponse.json({ error: 'You cannot remove your own active school access.' }, { status: 400 });
      }
      await query(
        'DELETE FROM user_memberships WHERE id = $1 AND school_id = $2',
        [membershipId, schoolId]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('POST /api/accounts error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
