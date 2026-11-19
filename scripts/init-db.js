const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load .env.local if present
try {
  if (fs.existsSync('.env.local')) {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {
  console.warn('Could not parse .env.local:', e.message);
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('ERROR: DATABASE_URL not found.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function runInit() {
  console.log('🚀 Initializing SchoolConnect 360 Database on Neon...');
  const client = await pool.connect();

  try {
    // 1. Run database.sql
    const sqlPath = path.join(process.cwd(), 'database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('Applying relational schema (non-destructive)...');
    await client.query(sqlContent);
    console.log('✅ Relational schema verified and applied.');

    // 2. Bootstrap Super Admin if not already exists
    const superEmail = (process.env.SUPER_ADMIN_EMAIL || 'admin@schoolconnect360.com').toLowerCase().trim();
    const superPassword = process.env.SUPER_ADMIN_PASSWORD || 'SchoolConnect2026!';

    const existingAdmin = await client.query('SELECT id, email FROM users WHERE email = $1', [superEmail]);
    let superAdminId;

    if (existingAdmin.rows.length === 0) {
      console.log(`Bootstrapping Super Administrator (${superEmail})...`);
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(superPassword, salt);
      const adminRes = await client.query(
        `INSERT INTO users (email, password_hash, full_name, phone, is_platform_admin, is_active)
         VALUES ($1, $2, $3, $4, TRUE, TRUE)
         RETURNING id`,
        [superEmail, hash, 'SchoolConnect Super Admin', '+250 788 000 000']
      );
      superAdminId = adminRes.rows[0].id;
      console.log('✅ Super Administrator created with ID:', superAdminId);
    } else {
      superAdminId = existingAdmin.rows[0].id;
      console.log('ℹ️ Super Administrator already exists (ID: ' + superAdminId + ')');
    }

    // 3. Seed demo school if no schools exist
    const schoolCountRes = await client.query('SELECT COUNT(*) FROM schools');
    if (parseInt(schoolCountRes.rows[0].count, 10) === 0) {
      console.log('Seeding initial demonstration school: "Kigali Heights International Academy"...');
      
      const schoolRes = await client.query(
        `INSERT INTO schools (name, slug, email, phone, country, district, address, school_type, motto, status, settings)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id`,
        [
          'Kigali Heights International Academy',
          'kigali-heights',
          'info@kigaliheights.edu',
          '+250 788 123 456',
          'Rwanda',
          'Gasabo',
          'KG 543 St, Kigali',
          'combined',
          'Excellence, Integrity and Innovation',
          'active',
          JSON.stringify({ currency: 'RWF', timezone: 'Africa/Kigali', enable_boarding: true, enable_transport: true, enable_clinic: true, enable_cafeteria: true })
        ]
      );
      const schoolId = schoolRes.rows[0].id;

      // Create subscription
      await client.query(
        `INSERT INTO subscriptions (school_id, plan_name, status, billing_cycle, amount)
         VALUES ($1, 'Enterprise', 'active', 'yearly', 1200.00)`,
        [schoolId]
      );

      // Create Academic Year & Terms
      const yearRes = await client.query(
        `INSERT INTO academic_years (school_id, name, start_date, end_date, is_current, status)
         VALUES ($1, '2026-2027 Academic Year', '2026-01-10', '2026-11-20', TRUE, 'active')
         RETURNING id`,
        [schoolId]
      );
      const yearId = yearRes.rows[0].id;

      const termRes = await client.query(
        `INSERT INTO terms (school_id, academic_year_id, name, term_number, start_date, end_date, is_current)
         VALUES ($1, $2, 'Term 1', 1, '2026-01-10', '2026-04-15', TRUE)
         RETURNING id`,
        [schoolId, yearId]
      );
      const termId = termRes.rows[0].id;

      // Create Departments
      const deptRes = await client.query(
        `INSERT INTO departments (school_id, name, code)
         VALUES ($1, 'Science & Mathematics', 'SCIMATH'), ($1, 'Humanities & Languages', 'HUMAN')
         RETURNING id, name`,
        [schoolId]
      );
      const sciDeptId = deptRes.rows[0].id;

      // Create Classes
      const classRes = await client.query(
        `INSERT INTO classes (school_id, name, grade_level, department_id)
         VALUES ($1, 'Senior 1 (Grade 9)', 9, $2), ($1, 'Senior 2 (Grade 10)', 10, $2)
         RETURNING id, name`,
        [schoolId, sciDeptId]
      );
      const class1Id = classRes.rows[0].id;
      const class2Id = classRes.rows[1].id;

      // Create Streams
      const streamRes = await client.query(
        `INSERT INTO streams (school_id, class_id, name, capacity, room_number)
         VALUES ($1, $2, 'Stream A (Emerald)', 40, 'Room 101'), ($1, $2, 'Stream B (Gold)', 40, 'Room 102')
         RETURNING id, name`,
        [schoolId, class1Id]
      );
      const streamAId = streamRes.rows[0].id;

      // Create Subjects
      const subjRes = await client.query(
        `INSERT INTO subjects (school_id, name, code, department_id, credits)
         VALUES 
         ($1, 'Mathematics', 'MATH-101', $2, 4),
         ($1, 'English Literature', 'ENG-101', $2, 3),
         ($1, 'Integrated Science', 'SCI-101', $2, 4)
         RETURNING id, name`,
        [schoolId, sciDeptId]
      );
      const mathId = subjRes.rows[0].id;

      // Create Sample Staff Users (Principal, Teacher, Bursar, Nurse, Librarian)
      const salt = await bcrypt.genSalt(10);
      const defaultPass = await bcrypt.hash('School2026!', salt);

      const staffUsers = [
        { email: 'principal@kigaliheights.edu', name: 'Dr. Jean Bosco Mugabo', role: 'headteacher', phone: '+250 788 111 222' },
        { email: 'admin@kigaliheights.edu', name: 'Marie Claire Uwera', role: 'school_admin', phone: '+250 788 222 333' },
        { email: 'teacher@kigaliheights.edu', name: 'Patrick Gasana', role: 'teacher', phone: '+250 788 333 444' },
        { email: 'classteacher@kigaliheights.edu', name: 'Alice Mutoni', role: 'class_teacher', phone: '+250 788 444 555' },
        { email: 'bursar@kigaliheights.edu', name: 'Emmanuel Habimana', role: 'bursar', phone: '+250 788 555 666' },
        { email: 'nurse@kigaliheights.edu', name: 'Sister Grace Mukamana', role: 'nurse', phone: '+250 788 666 777' },
        { email: 'librarian@kigaliheights.edu', name: 'Claude Niyonzima', role: 'librarian', phone: '+250 788 777 888' },
        { email: 'registrar@kigaliheights.edu', name: 'Diane Umutoni', role: 'registrar', phone: '+250 788 888 999' }
      ];

      for (const s of staffUsers) {
        const u = await client.query(
          `INSERT INTO users (email, password_hash, full_name, phone, is_platform_admin, is_active)
           VALUES ($1, $2, $3, $4, FALSE, TRUE)
           ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
           RETURNING id`,
          [s.email, defaultPass, s.name, s.phone]
        );
        const staffUserId = u.rows[0].id;

        await client.query(
          `INSERT INTO user_memberships (user_id, school_id, role, is_primary, status)
           VALUES ($1, $2, $3, TRUE, 'active')
           ON CONFLICT (user_id, school_id, role) DO NOTHING`,
          [staffUserId, schoolId, s.role]
        );
      }

      // Create Sample Students in the Connected Loop!
      const studentsData = [
        { adm: 'KHIA-2026-001', first: 'Arthur', last: 'Kayiranga', gender: 'Male', dob: '2010-04-12', blood: 'O+' },
        { adm: 'KHIA-2026-002', first: 'Chloe', last: 'Inyange', gender: 'Female', dob: '2010-09-25', blood: 'A+' },
        { adm: 'KHIA-2026-003', first: 'David', last: 'Mugisha', gender: 'Male', dob: '2010-01-18', blood: 'B+' },
        { adm: 'KHIA-2026-004', first: 'Esther', last: 'Ganza', gender: 'Female', dob: '2011-03-05', blood: 'O-' },
        { adm: 'KHIA-2026-005', first: 'Felix', last: 'Kwizera', gender: 'Male', dob: '2010-11-30', blood: 'AB+' }
      ];

      console.log('Adding students & enrolling them into the connected loop...');
      const studentIds = [];
      for (const st of studentsData) {
        const studRes = await client.query(
          `INSERT INTO students (school_id, admission_number, first_name, last_name, gender, date_of_birth, blood_group, nationality, emergency_contact, emergency_phone)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'Rwandan', 'Parent Emergency', '+250 788 999 000')
           RETURNING id`,
          [schoolId, st.adm, st.first, st.last, st.gender, st.dob, st.blood]
        );
        const studentId = studRes.rows[0].id;
        studentIds.push(studentId);

        // Create enrollment into Senior 1 - Stream A
        await client.query(
          `INSERT INTO enrollments (school_id, student_id, academic_year_id, class_id, stream_id, status)
           VALUES ($1, $2, $3, $4, $5, 'active')`,
          [schoolId, studentId, yearId, class1Id, streamAId]
        );

        // Create Invoice for Tuition
        const invRes = await client.query(
          `INSERT INTO invoices (school_id, invoice_number, student_id, academic_year_id, term_id, total_amount, amount_paid, balance, status, due_date)
           VALUES ($1, $2, $3, $4, $5, 450000.00, 200000.00, 250000.00, 'partially_paid', '2026-03-31')
           RETURNING id`,
          [schoolId, 'INV-' + st.adm, studentId, yearId, termId]
        );

        // Record a partial payment
        await client.query(
          `INSERT INTO payments (school_id, invoice_id, student_id, receipt_number, amount, payment_method, reference_code, paid_by_name)
           VALUES ($1, $2, $3, $4, 200000.00, 'bank_transfer', 'BK-REF-8891', 'Guardian Payment')`,
          [schoolId, invRes.rows[0].id, studentId, 'REC-' + st.adm]
        );

        // Add sample clinic visit for Chloe
        if (st.first === 'Chloe') {
          await client.query(
            `INSERT INTO clinic_visits (school_id, student_id, symptoms, diagnosis, treatment, medication_given, temperature, nurse_notes, status)
             VALUES ($1, $2, 'Mild headache and fatigue', 'Tension headache', 'Rest and hydration', 'Paracetamol 500mg', '36.8 C', 'Student rested in infirmary for 30 minutes, improved and returned to class.', 'treated')`,
            [schoolId, studentId]
          );
        }
      }

      const englishId = subjRes.rows.find((subject) => subject.name === 'English Literature').id;
      const examRes = await client.query(
        `INSERT INTO examinations (school_id, academic_year_id, term_id, name, exam_type, start_date, end_date, is_published)
         VALUES ($1, $2, $3, 'Term 1 Mid-Term Examinations', 'mid_term', '2026-03-01', '2026-03-15', TRUE)
         RETURNING id`,
        [schoolId, yearId, termId]
      );
      const assessmentRes = await client.query(
        `INSERT INTO exam_assessments (examination_id, subject_id, class_id, max_score, passing_score)
         VALUES ($1, $2, $3, 100.00, 50.00)
         RETURNING id`,
        [examRes.rows[0].id, englishId, class1Id]
      );
      const demoMarks = [
        { score: 84, grade: 'A', comments: 'Strong comprehension and clear written work.' },
        { score: 76, grade: 'B', comments: 'Good progress; continue practising essay structure.' },
        { score: 68, grade: 'C', comments: 'Steady effort with room to strengthen vocabulary.' },
        { score: 91, grade: 'A', comments: 'Excellent analysis and consistent preparation.' },
        { score: 47, grade: 'F', comments: 'Please attend the upcoming reading support sessions.' },
      ];

      for (const [index, mark] of demoMarks.entries()) {
        await client.query(
          `INSERT INTO student_marks (school_id, assessment_id, student_id, score, grade, comments, is_verified)
           VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
          [schoolId, assessmentRes.rows[0].id, studentIds[index], mark.score, mark.grade, mark.comments]
        );
      }

      // Seed Library Books
      await client.query(
        `INSERT INTO library_books (school_id, isbn, title, author, category, shelf_location, total_copies, available_copies)
         VALUES 
         ($1, '978-0134685991', 'Effective Java Third Edition', 'Joshua Bloch', 'Computer Science', 'Shelf CS-01', 5, 4),
         ($1, '978-0199535569', 'Things Fall Apart', 'Chinua Achebe', 'African Literature', 'Shelf LIT-04', 10, 8),
         ($1, '978-0141439518', 'Pride and Prejudice', 'Jane Austen', 'Classic Literature', 'Shelf LIT-02', 8, 7)`,
        [schoolId]
      );

      // Seed Initial Announcement
      await client.query(
        `INSERT INTO announcements (school_id, title, content, target_audience, is_published)
         VALUES ($1, 'Welcome to SchoolConnect 360 Term 1', 'We are pleased to welcome all faculty, parents and students to the new academic term. Please ensure all student registrations are finalized.', 'all', TRUE)`,
        [schoolId]
      );

      console.log('✅ Demo school initialized with connected data across students, finances, clinic & library.');
    } else {
      console.log('ℹ️ Schools already exist in the database; skipping demo seed.');
    }

    console.log('🎉 SchoolConnect 360 database initialization completed successfully!');
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

runInit();
