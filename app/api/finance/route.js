import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getClient, query } from '@/lib/db';
import { randomBytes } from 'node:crypto';

const FINANCE_ROLES = ['bursar', 'cashier', 'school_admin', 'headteacher', 'school_owner'];

export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!FINANCE_ROLES.includes(user.activeRole)) {
      return NextResponse.json({ error: 'Finance access is restricted to authorised school finance and leadership roles.' }, { status: 403 });
    }

    const schoolId = user.activeSchool?.id;
    if (!schoolId) return NextResponse.json({ error: 'No active school assigned' }, { status: 400 });

    const url = new URL(request.url);
    const classId = url.searchParams.get('classId');

    const schoolRes = await query(
      `SELECT CASE WHEN country='Rwanda' THEN 'RWF' ELSE COALESCE(settings->>'currency','USD') END AS currency
       FROM schools WHERE id=$1`,
      [schoolId]
    );
    const currency = schoolRes.rows[0]?.currency || 'RWF';

    // ── If a specific class is requested → return invoices for that class ──
    if (classId) {
      const invoicesRes = await query(
        `SELECT i.id, i.invoice_number, i.total_amount, i.amount_paid, i.balance, i.status, i.due_date,
                s.id as student_id, s.admission_number, s.first_name, s.last_name, s.gender
         FROM invoices i
         JOIN students s ON s.id = i.student_id
         JOIN enrollments e ON e.student_id = s.id AND e.class_id = $2 AND e.status = 'active'
         JOIN classes c ON c.id = e.class_id AND c.school_id = $1
         WHERE i.school_id = $1
         ORDER BY s.last_name, s.first_name`,
        [schoolId, classId]
      );
      return NextResponse.json({ role: user.activeRole, currency, invoices: invoicesRes.rows });
    }

    // ── Overview: group invoices by class ──
    const classesRes = await query(
      `SELECT c.id, c.name, c.level,
              COUNT(DISTINCT e.student_id)::int AS student_count,
              COALESCE(SUM(i.total_amount), 0)::float AS total_invoiced,
              COALESCE(SUM(i.amount_paid), 0)::float AS total_collected,
              COALESCE(SUM(i.balance), 0)::float AS total_outstanding,
              COUNT(CASE WHEN i.balance > 0 THEN 1 END)::int AS unpaid_count,
              CASE WHEN SUM(i.total_amount) > 0
                   THEN ROUND((SUM(i.amount_paid) / SUM(i.total_amount)) * 100)
                   ELSE 0 END AS paid_pct
       FROM classes c
       LEFT JOIN enrollments e ON e.class_id = c.id AND e.status = 'active'
       LEFT JOIN invoices i ON i.student_id = e.student_id AND i.school_id = c.school_id
       WHERE c.school_id = $1
       GROUP BY c.id, c.name, c.level
       ORDER BY c.level, c.name`,
      [schoolId]
    );

    // ── Recent payments ──
    const paymentsRes = await query(
      `SELECT p.id, p.receipt_number, p.amount, p.payment_method, p.reference_code,
              p.paid_by_name, p.payment_date,
              s.admission_number, s.first_name, s.last_name,
              i.invoice_number,
              c.name as class_name
       FROM payments p
       JOIN students s ON s.id = p.student_id
       LEFT JOIN invoices i ON i.id = p.invoice_id
       LEFT JOIN enrollments e ON e.student_id = s.id AND e.status = 'active'
       LEFT JOIN classes c ON c.id = e.class_id
       WHERE p.school_id = $1
       ORDER BY p.payment_date DESC LIMIT 20`,
      [schoolId]
    );

    // ── Totals ──
    const totalsRes = await query(
      `SELECT COALESCE(SUM(total_amount),0)::float AS total_invoiced,
              COALESCE(SUM(amount_paid),0)::float AS total_collected,
              COALESCE(SUM(balance),0)::float AS total_outstanding
       FROM invoices WHERE school_id=$1`,
      [schoolId]
    );

    return NextResponse.json({
      role: user.activeRole,
      currency,
      classes: classesRes.rows,
      invoices: [], // overview doesn't expose raw invoices (use class drilldown)
      payments: paymentsRes.rows,
      totals: totalsRes.rows[0],
    });
  } catch (error) {
    console.error('Finance GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve financial records.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const paymentRoles = ['bursar', 'cashier', 'school_admin'];
    if (!paymentRoles.includes(user.activeRole)) {
      return NextResponse.json({ error: 'Forbidden: payment recording requires Cashier / Bursar role.' }, { status: 403 });
    }

    const schoolId = user.activeSchool?.id;
    if (!schoolId) return NextResponse.json({ error: 'No active school assigned' }, { status: 400 });

    const schoolRes = await query(
      `SELECT CASE WHEN country='Rwanda' THEN 'RWF' ELSE COALESCE(settings->>'currency','USD') END AS currency
       FROM schools WHERE id=$1`,
      [schoolId]
    );
    const currency = schoolRes.rows[0]?.currency || 'RWF';

    const { invoice_id, amount, payment_method, reference_code, paid_by_name, notes } = await request.json();
    const parsedAmount = Number(amount);
    const payAmount = Math.round(parsedAmount * 100) / 100;
    const supportedMethods = ['cash', 'bank_transfer', 'mobile_money', 'cheque', 'pos'];

    if (!invoice_id || !Number.isFinite(parsedAmount) || parsedAmount <= 0 || Math.abs(parsedAmount - payAmount) > 0.000001) {
      return NextResponse.json({ error: 'Invoice and valid payment amount are required.' }, { status: 400 });
    }
    if (payment_method && !supportedMethods.includes(payment_method)) {
      return NextResponse.json({ error: 'Choose a supported payment method.' }, { status: 400 });
    }

    const client = await getClient();
    let paymentRes;
    let receiptNumber;
    let newBalance;
    try {
      await client.query('BEGIN');
      const invRes = await client.query(
        `SELECT id, student_id, total_amount, amount_paid, balance
         FROM invoices WHERE id = $1 AND school_id = $2 FOR UPDATE`,
        [invoice_id, schoolId]
      );
      if (invRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });
      }

      const inv = invRes.rows[0];
      const balance = Number(inv.balance);
      if (payAmount > balance) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Payment cannot exceed the invoice balance.' }, { status: 400 });
      }

      const newPaid = Number((Number(inv.amount_paid) + payAmount).toFixed(2));
      newBalance = Math.max(0, Number((balance - payAmount).toFixed(2)));
      const newStatus = newBalance === 0 ? 'paid' : 'partially_paid';
      receiptNumber = `REC-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;

      paymentRes = await client.query(
        `INSERT INTO payments (school_id, invoice_id, student_id, receipt_number, amount, payment_method, reference_code, paid_by_name, recorded_by, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, receipt_number, payment_date`,
        [schoolId, invoice_id, inv.student_id, receiptNumber, payAmount, payment_method || 'cash', reference_code || null, paid_by_name || 'Guardian', user.id, notes || null]
      );

      await client.query(
        `UPDATE invoices SET amount_paid=$1, balance=$2, status=$3 WHERE id=$4 AND school_id=$5`,
        [newPaid, newBalance, newStatus, invoice_id, schoolId]
      );

      await client.query(
        `INSERT INTO audit_logs (school_id, user_id, action, module, details)
         VALUES ($1,$2,'PAYMENT_RECORDED','finance',$3)`,
        [schoolId, user.id, JSON.stringify({ receipt_number: receiptNumber, amount: payAmount, invoice_id, new_balance: newBalance })]
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return NextResponse.json({
      success: true,
      message: `Payment recorded. Receipt #${receiptNumber} generated.`,
      receipt: {
        receiptNumber,
        amount: payAmount,
        date: paymentRes.rows[0].payment_date,
        balanceRemaining: newBalance,
      },
    });
  } catch (error) {
    console.error('Record payment error:', error);
    return NextResponse.json({ error: 'Failed to record payment.' }, { status: 500 });
  }
}
