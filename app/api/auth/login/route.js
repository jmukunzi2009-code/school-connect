import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword, signToken, TOKEN_COOKIE_NAME } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query user
    const userRes = await query(
      `SELECT id, email, password_hash, full_name, phone, avatar_url, is_platform_admin, is_active
       FROM users WHERE email = $1`,
      [cleanEmail]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return NextResponse.json({ error: 'Your account has been deactivated. Please contact administration.' }, { status: 403 });
    }

    // Verify password
    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Fetch user memberships
    const memRes = await query(
      `SELECT m.id, m.school_id, m.role, m.is_primary, s.name as school_name, s.slug, s.status as school_status
       FROM user_memberships m
       JOIN schools s ON s.id = m.school_id
       WHERE m.user_id = $1 AND m.status = 'active' AND s.status = 'active'`,
      [user.id]
    );

    let activeSchoolId = null;
    let activeRole = 'viewer';

    if (user.is_platform_admin) {
      activeRole = 'super_admin';
    } else if (memRes.rows.length > 0) {
      const primary = memRes.rows.find((m) => m.is_primary) || memRes.rows[0];
      activeSchoolId = primary.school_id;
      activeRole = primary.role;
    } else {
      return NextResponse.json(
        { error: 'No active school memberships found for this account. Contact your School Administrator.' },
        { status: 403 }
      );
    }

    // Update last login
    await query(`UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`, [user.id]);

    // Sign JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      isPlatformAdmin: user.is_platform_admin,
      activeSchoolId,
      activeRole,
    });

    // Write audit log
    await query(
      `INSERT INTO audit_logs (school_id, user_id, action, module, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        activeSchoolId,
        user.id,
        'USER_LOGIN',
        'auth',
        JSON.stringify({ role: activeRole, email: user.email }),
      ]
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        isPlatformAdmin: user.is_platform_admin,
        activeRole,
        activeSchoolId,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login route error:', error);
    return NextResponse.json({ error: 'Internal server error during authentication.' }, { status: 500 });
  }
}
