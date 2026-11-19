import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { query } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'schoolconnect360_ultra_secure_jwt_token_secret_key_2026';
export const TOKEN_COOKIE_NAME = 'schoolconnect_session';

export async function hashPassword(plainText) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function comparePassword(plainText, hash) {
  return bcrypt.compare(plainText, hash);
}

export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Extracts and verifies the current session user along with active school and role.
 */
export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) return null;

    // Fetch user from DB
    const userRes = await query(
      `SELECT id, email, full_name, phone, avatar_url, is_platform_admin, is_active
       FROM users WHERE id = $1 AND is_active = TRUE`,
      [decoded.userId]
    );

    if (userRes.rows.length === 0) return null;
    const user = userRes.rows[0];

    // Fetch user's school memberships and roles
    const membershipsRes = await query(
      `SELECT m.id as membership_id, m.school_id, m.role, m.status, m.is_primary,
              s.name as school_name, s.slug as school_slug, s.status as school_status, s.logo_url,
              s.country, s.settings
       FROM user_memberships m
       JOIN schools s ON s.id = m.school_id
       WHERE m.user_id = $1 AND m.status = 'active' AND s.status = 'active'`,
      [user.id]
    );

    user.memberships = membershipsRes.rows;

    // Determine active school & active role
    // Prefer decoded activeSchoolId & activeRole if user has that membership, or default to first/primary
    let activeMembership = null;
    if (decoded.activeSchoolId && decoded.activeRole) {
      activeMembership = user.memberships.find(
        (m) => m.school_id === decoded.activeSchoolId && m.role === decoded.activeRole
      );
    }
    if (!activeMembership && user.memberships.length > 0) {
      activeMembership = user.memberships.find((m) => m.is_primary) || user.memberships[0];
    }

    user.activeSchool = activeMembership
      ? {
          id: activeMembership.school_id,
          name: activeMembership.school_name,
          slug: activeMembership.school_slug,
          status: activeMembership.school_status,
          logo_url: activeMembership.logo_url,
          country: activeMembership.country,
          settings: activeMembership.settings,
        }
      : null;

    user.activeRole = activeMembership ? activeMembership.role : (user.is_platform_admin ? 'super_admin' : 'viewer');

    return user;
  } catch (error) {
    console.error('getSessionUser error:', error.message);
    return null;
  }
}
