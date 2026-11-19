import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      school_name,
      school_email,
      phone,
      country,
      district,
      address,
      school_type,
      website,
      rep_name,
      rep_position,
      rep_email,
      admin_email,
      admin_password,
      additional_info,
      agreed_to_terms,
    } = body;

    // Validation
    if (!school_name || !school_email || !phone || !country || !address || !rep_name || !rep_email) {
      return NextResponse.json(
        { error: 'Please fill in all required fields.' },
        { status: 400 }
      );
    }

    if (!admin_email || !admin_password) {
      return NextResponse.json(
        { error: 'Please provide your admin email and password for your school account.' },
        { status: 400 }
      );
    }

    if (admin_password.length < 8) {
      return NextResponse.json(
        { error: 'Admin password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    if (!agreed_to_terms) {
      return NextResponse.json(
        { error: 'You must agree to the platform terms and privacy guidelines.' },
        { status: 400 }
      );
    }

    // Hash the admin password before storing
    const adminPasswordHash = await hashPassword(admin_password);

    // Generate unique application reference: SC360-APP-XXXXX
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const applicationReference = `SC360-APP-${randomSuffix}`;

    const insertRes = await query(
      `INSERT INTO school_applications (
        application_reference, school_name, school_email, phone, country, district,
        address, school_type, website, rep_name, rep_position, rep_email,
        admin_email, admin_password_hash,
        additional_info, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'pending')
      RETURNING id, application_reference, status, created_at`,
      [
        applicationReference,
        school_name.trim(),
        school_email.trim().toLowerCase(),
        phone.trim(),
        country.trim(),
        district ? district.trim() : '',
        address.trim(),
        school_type || 'secondary',
        website ? website.trim() : null,
        rep_name.trim(),
        rep_position || 'School Representative',
        rep_email.trim().toLowerCase(),
        admin_email.trim().toLowerCase(),
        adminPasswordHash,
        additional_info ? additional_info.trim() : null,
      ]
    );

    const application = insertRes.rows[0];

    // Log platform audit
    await query(
      `INSERT INTO audit_logs (action, module, details)
       VALUES ($1, $2, $3)`,
      [
        'APPLICATION_SUBMITTED',
        'school_applications',
        JSON.stringify({
          application_id: application.id,
          reference: application.application_reference,
          school_name,
          admin_email: admin_email.trim().toLowerCase(),
        }),
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'School registration application submitted successfully.',
      application: {
        id: application.id,
        reference: application.application_reference,
        status: application.status,
        created_at: application.created_at,
      },
    });
  } catch (error) {
    console.error('Registration application error:', error);
    return NextResponse.json(
      { error: 'Failed to submit registration. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
