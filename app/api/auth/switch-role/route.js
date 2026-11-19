import { NextResponse } from 'next/server';
import { getSessionUser, signToken, TOKEN_COOKIE_NAME } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { schoolId, role } = await request.json();

    // Check if user is platform admin switching to super_admin
    if (user.is_platform_admin && role === 'super_admin') {
      const token = signToken({
        userId: user.id,
        email: user.email,
        isPlatformAdmin: true,
        activeSchoolId: null,
        activeRole: 'super_admin',
      });

      const response = NextResponse.json({ success: true, activeRole: 'super_admin' });
      response.cookies.set({
        name: TOKEN_COOKIE_NAME,
        value: token,
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    // Verify membership exists for schoolId and role
    const memRes = await query(
      `SELECT m.id, m.school_id, m.role, s.name as school_name
       FROM user_memberships m
       JOIN schools s ON s.id = m.school_id
       WHERE m.user_id = $1 AND m.school_id = $2 AND m.role = $3 AND m.status = 'active'`,
      [user.id, schoolId, role]
    );

    if (memRes.rows.length === 0) {
      return NextResponse.json({ error: 'Role or school membership not authorized.' }, { status: 403 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      isPlatformAdmin: user.is_platform_admin,
      activeSchoolId: schoolId,
      activeRole: role,
    });

    const response = NextResponse.json({
      success: true,
      activeSchoolId: schoolId,
      activeRole: role,
      schoolName: memRes.rows[0].school_name,
    });

    response.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Switch role error:', error);
    return NextResponse.json({ error: 'Failed to switch role context.' }, { status: 500 });
  }
}
