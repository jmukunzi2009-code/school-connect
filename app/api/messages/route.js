import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';

const NON_STAFF_ROLES = ['parent', 'student', 'alumni', 'supplier'];

// GET /api/messages — list conversations + messages
export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (NON_STAFF_ROLES.includes(user.activeRole)) {
      return NextResponse.json({ error: 'Staff messaging is available to school staff accounts.' }, { status: 403 });
    }

    const url = new URL(request.url);
    const conversationWith = url.searchParams.get('with'); // other user id
    const schoolId = user.activeSchool?.id;

    if (conversationWith) {
      if (!schoolId) return NextResponse.json({ error: 'No active school assigned' }, { status: 400 });

      const peerRes = await query(
        `SELECT u.id
         FROM users u
         JOIN user_memberships um ON um.user_id = u.id
         WHERE u.id = $1 AND u.is_active = true
           AND um.school_id = $2 AND um.status = 'active'
           AND um.role NOT IN ('parent', 'student', 'alumni', 'supplier')`,
        [conversationWith, schoolId]
      );
      if (peerRes.rows.length === 0) {
        return NextResponse.json({ error: 'Colleague not found in your active school.' }, { status: 404 });
      }

      // Fetch messages in this conversation
      const msgs = await query(
        `SELECT m.id, m.sender_id, m.recipient_id, m.subject, m.body, m.is_read, m.created_at,
                u1.full_name as sender_name, u2.full_name as recipient_name
         FROM messages m
         JOIN users u1 ON u1.id = m.sender_id
         JOIN users u2 ON u2.id = m.recipient_id
         JOIN user_memberships sender_membership
           ON sender_membership.user_id = m.sender_id
          AND sender_membership.school_id = $3
          AND sender_membership.status = 'active'
           AND sender_membership.role NOT IN ('parent', 'student', 'alumni', 'supplier')
         JOIN user_memberships recipient_membership
            ON recipient_membership.user_id = m.recipient_id
           AND recipient_membership.school_id = $3
           AND recipient_membership.status = 'active'
           AND recipient_membership.role NOT IN ('parent', 'student', 'alumni', 'supplier')
         WHERE (m.sender_id = $1 AND m.recipient_id = $2)
            OR (m.sender_id = $2 AND m.recipient_id = $1)
         GROUP BY m.id, u1.full_name, u2.full_name
         ORDER BY m.created_at ASC`,
        [user.id, conversationWith, schoolId]
      );

      // Mark received messages as read
      await query(
        `UPDATE messages SET is_read = true
         WHERE recipient_id = $1 AND sender_id = $2 AND is_read = false
           AND EXISTS (
             SELECT 1 FROM user_memberships
             WHERE user_id = messages.sender_id AND school_id = $3 AND status = 'active'
           )`,
        [user.id, conversationWith, schoolId]
      );

      return NextResponse.json({ messages: msgs.rows });
    }

    // List school colleagues (users in same school)
    let colleagues = [];
    if (schoolId) {
      const colRes = await query(
        `SELECT u.id, u.full_name, string_agg(DISTINCT um.role, ', ' ORDER BY um.role) AS role,
                (SELECT COUNT(*) FROM messages m WHERE m.sender_id = u.id AND m.recipient_id = $2 AND m.is_read = false)::int AS unread_count,
                (SELECT m2.body FROM messages m2
                 WHERE (m2.sender_id = u.id AND m2.recipient_id = $2) OR (m2.sender_id = $2 AND m2.recipient_id = u.id)
                 ORDER BY m2.created_at DESC LIMIT 1) AS last_message,
                (SELECT m2.created_at FROM messages m2
                 WHERE (m2.sender_id = u.id AND m2.recipient_id = $2) OR (m2.sender_id = $2 AND m2.recipient_id = u.id)
                 ORDER BY m2.created_at DESC LIMIT 1) AS last_message_at
         FROM users u
         JOIN user_memberships um
           ON um.user_id = u.id AND um.school_id = $1 AND um.status = 'active'
          AND um.role NOT IN ('parent', 'student', 'alumni', 'supplier')
         WHERE u.id != $2 AND u.is_active = true
         GROUP BY u.id, u.full_name
         ORDER BY last_message_at DESC NULLS LAST, u.full_name`,
        [schoolId, user.id]
      );
      colleagues = colRes.rows;
    }

    // Total unread count
    const unreadRes = schoolId
      ? await query(
          `SELECT COUNT(*)::int AS total
           FROM messages m
           WHERE m.recipient_id = $1 AND m.is_read = false
             AND EXISTS (
               SELECT 1 FROM user_memberships
               WHERE user_id = m.sender_id AND school_id = $2 AND status = 'active'
                 AND role NOT IN ('parent', 'student', 'alumni', 'supplier')
             )`,
          [user.id, schoolId]
        )
      : { rows: [{ total: 0 }] };

    return NextResponse.json({ colleagues, unreadCount: unreadRes.rows[0]?.total || 0 });
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/messages — send message
export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (NON_STAFF_ROLES.includes(user.activeRole)) {
      return NextResponse.json({ error: 'Staff messaging is available to school staff accounts.' }, { status: 403 });
    }

    const schoolId = user.activeSchool?.id;
    if (!schoolId) return NextResponse.json({ error: 'No active school assigned' }, { status: 400 });

    const { recipient_id, subject, body } = await request.json();
    if (!recipient_id || recipient_id === user.id || typeof body !== 'string' || !body.trim()) {
      return NextResponse.json({ error: 'Recipient and message body are required.' }, { status: 400 });
    }
    if (body.trim().length > 5000 || (subject != null && (typeof subject !== 'string' || subject.length > 150))) {
      return NextResponse.json({ error: 'Messages must be 5,000 characters or fewer and subjects 150 characters or fewer.' }, { status: 400 });
    }

    const peerRes = await query(
      `SELECT u.id
       FROM users u
       JOIN user_memberships um ON um.user_id = u.id
       WHERE u.id = $1 AND u.is_active = true
         AND um.school_id = $2 AND um.status = 'active'
         AND um.role NOT IN ('parent', 'student', 'alumni', 'supplier')`,
      [recipient_id, schoolId]
    );
    if (peerRes.rows.length === 0) {
      return NextResponse.json({ error: 'Recipient is not an active colleague in your school.' }, { status: 404 });
    }

    const res = await query(
      `INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES ($1,$2,$3,$4) RETURNING id, created_at`,
      [user.id, recipient_id, subject || 'No subject', body.trim()]
    );

    return NextResponse.json({ success: true, message: res.rows[0] });
  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
