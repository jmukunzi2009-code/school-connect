import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        isPlatformAdmin: user.is_platform_admin,
        activeRole: user.activeRole,
        activeSchool: user.activeSchool,
        memberships: user.memberships || [],
      },
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
