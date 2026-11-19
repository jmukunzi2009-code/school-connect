import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = user.activeSchool?.id;
    if (!schoolId) {
      return NextResponse.json({ error: 'No active school assigned' }, { status: 400 });
    }

    // 1. Fetch library books catalog
    const booksRes = await query(
      `SELECT id, isbn, title, author, category, publisher, publication_year, shelf_location,
              total_copies, available_copies
       FROM library_books
       WHERE school_id = $1
       ORDER BY title ASC`,
      [schoolId]
    );

    // 2. Fetch active borrowings
    const borrowingsRes = await query(
      `SELECT lb.id, lb.book_id, lb.student_id, lb.borrow_date, lb.due_date, lb.return_date,
              lb.status, lb.fine_amount,
              b.title as book_title, b.author as book_author,
              s.first_name, s.last_name, s.admission_number,
              c.name as class_name, st.name as stream_name
       FROM library_borrowings lb
       JOIN library_books b ON b.id = lb.book_id
       LEFT JOIN students s ON s.id = lb.student_id
       LEFT JOIN enrollments e ON e.student_id = s.id AND e.status = 'active'
       LEFT JOIN classes c ON c.id = e.class_id
       LEFT JOIN streams st ON st.id = e.stream_id
       WHERE lb.school_id = $1
       ORDER BY lb.created_at DESC`,
      [schoolId]
    );

    // 3. Fetch classes with their enrolled students for the seamless loop!
    const classesRes = await query(
      `SELECT c.id, c.name,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', s.id,
                    'admission_number', s.admission_number,
                    'name', s.first_name || ' ' || s.last_name
                  )
                ) FILTER (WHERE s.id IS NOT NULL), '[]'
              ) as students
       FROM classes c
       LEFT JOIN enrollments e ON e.class_id = c.id AND e.status = 'active'
       LEFT JOIN students s ON s.id = e.student_id
       WHERE c.school_id = $1
       GROUP BY c.id, c.name
       ORDER BY c.grade_level ASC`,
      [schoolId]
    );

    return NextResponse.json({
      books: booksRes.rows,
      borrowings: borrowingsRes.rows,
      classesWithStudents: classesRes.rows,
    });
  } catch (error) {
    console.error('Library GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve library data.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = user.activeSchool?.id;
    if (!schoolId) {
      return NextResponse.json({ error: 'No active school assigned' }, { status: 400 });
    }

    const body = await request.json();
    const { action, book_id, student_id, due_date, borrowing_id } = body;

    // A. ISSUE BOOK
    if (action === 'issue') {
      if (!book_id || !student_id || !due_date) {
        return NextResponse.json({ error: 'Book, Student, and Due Date are required.' }, { status: 400 });
      }

      // Check available copies
      const bookRes = await query(
        `SELECT id, title, available_copies FROM library_books WHERE id = $1 AND school_id = $2`,
        [book_id, schoolId]
      );
      if (bookRes.rows.length === 0) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      }
      if (bookRes.rows[0].available_copies <= 0) {
        return NextResponse.json({ error: 'No copies currently available for checkout.' }, { status: 400 });
      }

      // Insert borrowing
      await query(
        `INSERT INTO library_borrowings (school_id, book_id, student_id, due_date, status, issued_by)
         VALUES ($1, $2, $3, $4, 'borrowed', $5)`,
        [schoolId, book_id, student_id, due_date, user.id]
      );

      // Decrement available copies
      await query(
        `UPDATE library_books SET available_copies = available_copies - 1 WHERE id = $1`,
        [book_id]
      );

      // Log audit
      await query(
        `INSERT INTO audit_logs (school_id, user_id, action, module, details)
         VALUES ($1, $2, 'BOOK_ISSUED', 'library', $3)`,
        [schoolId, user.id, JSON.stringify({ book_id, student_id, due_date })]
      );

      return NextResponse.json({ success: true, message: `Book "${bookRes.rows[0].title}" issued to student successfully.` });
    }

    // B. RETURN BOOK
    if (action === 'return') {
      if (!borrowing_id) {
        return NextResponse.json({ error: 'Borrowing ID is required.' }, { status: 400 });
      }

      const borrowRes = await query(
        `SELECT id, book_id, due_date FROM library_borrowings WHERE id = $1 AND school_id = $2`,
        [borrowing_id, schoolId]
      );
      if (borrowRes.rows.length === 0) {
        return NextResponse.json({ error: 'Borrowing record not found' }, { status: 404 });
      }

      const b = borrowRes.rows[0];

      // Mark returned
      await query(
        `UPDATE library_borrowings
         SET status = 'returned', return_date = CURRENT_DATE
         WHERE id = $1`,
        [borrowing_id]
      );

      // Increment available copies
      await query(
        `UPDATE library_books SET available_copies = available_copies + 1 WHERE id = $1`,
        [b.book_id]
      );

      return NextResponse.json({ success: true, message: 'Book returned successfully to library inventory.' });
    }

    // C. ADD NEW BOOK TO CATALOG
    if (action === 'add_book') {
      const { title, author, category, isbn, shelf_location, total_copies } = body;
      if (!title || !author) {
        return NextResponse.json({ error: 'Title and Author are required.' }, { status: 400 });
      }

      const copies = parseInt(total_copies, 10) || 1;
      await query(
        `INSERT INTO library_books (school_id, title, author, category, isbn, shelf_location, total_copies, available_copies)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
        [schoolId, title.trim(), author.trim(), category || 'General', isbn || null, shelf_location || 'Main Shelf', copies]
      );

      return NextResponse.json({ success: true, message: `"${title}" added to library catalog.` });
    }

    return NextResponse.json({ error: 'Invalid library action' }, { status: 400 });
  } catch (error) {
    console.error('Library POST error:', error);
    return NextResponse.json({ error: 'Failed to process library action.' }, { status: 500 });
  }
}
