'use client';

import React, { useState, useEffect } from 'react';
import {
  Library,
  BookOpen,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Search,
  RotateCcw,
  Sparkles,
  Calendar,
  X,
  UserCheck,
} from 'lucide-react';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('borrowings'); // 'borrowings' | 'catalog'
  const [books, setBooks] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [classesWithStudents, setClassesWithStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Issue modal
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [issuing, setIssuing] = useState(false);

  // Add book modal
  const [addBookModalOpen, setAddBookModalOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    category: 'Literature',
    isbn: '',
    shelf_location: 'Shelf A-1',
    total_copies: 5,
  });

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/library');
      if (!res.ok) throw new Error('Failed to load library data');
      const data = await res.json();
      setBooks(data.books || []);
      setBorrowings(data.borrowings || []);
      setClassesWithStudents(data.classesWithStudents || []);

      if (data.books?.length > 0 && !selectedBookId) {
        setSelectedBookId(data.books[0].id);
      }
      if (data.classesWithStudents?.length > 0 && !selectedClassId) {
        setSelectedClassId(data.classesWithStudents[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!selectedBookId || !selectedStudentId) {
      setError('Please select both a book and an enrolled student.');
      return;
    }

    setIssuing(true);
    setError(null);
    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'issue',
          book_id: selectedBookId,
          student_id: selectedStudentId,
          due_date: dueDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue book');

      setSuccessMsg(data.message);
      setIssueModalOpen(false);
      await fetchLibraryData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIssuing(false);
    }
  };

  const handleReturnBook = async (borrowingId) => {
    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'return', borrowing_id: borrowingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to return book');
      setSuccessMsg(data.message);
      await fetchLibraryData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_book', ...newBook }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add book');
      setSuccessMsg(data.message);
      setAddBookModalOpen(false);
      await fetchLibraryData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  // Find students in currently selected class in the Issue modal
  const activeClassObj = classesWithStudents.find((c) => c.id === selectedClassId);
  const enrolledStudentsInClass = activeClassObj?.students || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
            Library Information & Lending System
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Connected directly to student enrollments. Pick any class to see enrolled students and issue books instantly.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setAddBookModalOpen(true)} className="btn-secondary">
            + Add New Title
          </button>
          <button onClick={() => setIssueModalOpen(true)} className="btn-gold">
            <PlusCircle size={18} /> Issue Book to Student
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: '#E6F5EC', color: '#126338', padding: '14px 18px', borderRadius: '8px', border: '1px solid #B7E4C7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('borrowings')}
          style={{
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'borrowings' ? 'var(--color-forest)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'borrowings' ? '3px solid var(--color-forest)' : '3px solid transparent',
            background: 'none',
            cursor: 'pointer',
          }}
        >
          Active Borrowings & Returns ({borrowings.filter((b) => b.status === 'borrowed').length})
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'catalog' ? 'var(--color-forest)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'catalog' ? '3px solid var(--color-forest)' : '3px solid transparent',
            background: 'none',
            cursor: 'pointer',
          }}
        >
          Books Catalog ({books.length})
        </button>
      </div>

      {/* ================= TAB 1: ACTIVE BORROWINGS ================= */}
      {activeTab === 'borrowings' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Book Title & Author</th>
                  <th>Borrower (Student)</th>
                  <th>Class / Stream</th>
                  <th>Borrowed Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                      Loading library borrowings...
                    </td>
                  </tr>
                ) : borrowings.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                      No active book borrowings recorded. Click "Issue Book to Student" to lend a book.
                    </td>
                  </tr>
                ) : (
                  borrowings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--color-deep-forest)' }}>{b.book_title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.book_author}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.first_name} {b.last_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-forest)' }}>{b.admission_number}</div>
                      </td>
                      <td>
                        <span>{b.class_name || 'Senior 1'}</span> • <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{b.stream_name || 'Stream A'}</span>
                      </td>
                      <td>{new Date(b.borrow_date).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 600 }}>{new Date(b.due_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${b.status === 'borrowed' ? 'badge-warning' : 'badge-success'}`}>
                          {b.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {b.status === 'borrowed' ? (
                          <button
                            onClick={() => handleReturnBook(b.id)}
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            <RotateCcw size={14} /> Return Book
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#1E7E4A', fontWeight: 600 }}>
                            Returned on {new Date(b.return_date || Date.now()).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: BOOKS CATALOG ================= */}
      {activeTab === 'catalog' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>ISBN</th>
                  <th>Shelf Location</th>
                  <th>Available Copies</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {books.map((bk) => (
                  <tr key={bk.id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-forest)' }}>{bk.title}</td>
                    <td>{bk.author}</td>
                    <td>
                      <span className="badge badge-info">{bk.category}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{bk.isbn || 'N/A'}</td>
                    <td>{bk.shelf_location || 'General Stacks'}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: bk.available_copies > 0 ? '#1E7E4A' : '#C0392B' }}>
                        {bk.available_copies} / {bk.total_copies} available
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedBookId(bk.id);
                          setIssueModalOpen(true);
                        }}
                        disabled={bk.available_copies <= 0}
                        className="btn-gold"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        Issue
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= ISSUE BOOK MODAL (THE CONNECTED LOOP) ================= */}
      {issueModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div className="card" style={{ maxWidth: '580px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
                  Issue Library Book
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Connected student loop: Select class to instantly populate enrolled students without re-entering names!
                </p>
              </div>
              <button onClick={() => setIssueModalOpen(false)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleIssueBook}>
              {/* Select Book */}
              <div className="form-group">
                <label className="form-label">Select Book from Catalog *</label>
                <select
                  required
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="form-select"
                >
                  <option value="">Choose a book...</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.available_copies <= 0}>
                      {b.title} by {b.author} ({b.available_copies} available)
                    </option>
                  ))}
                </select>
              </div>

              {/* The Loop: Select Class, Then Select Enrolled Student */}
              <div style={{ backgroundColor: 'rgba(18, 59, 42, 0.04)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-forest)', marginBottom: '10px' }}>
                  <Sparkles size={16} color="var(--color-gold)" /> Select Student via Enrolled Class:
                </div>

                <div className="form-group">
                  <label className="form-label">Step 1: Choose Class</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => {
                      setSelectedClassId(e.target.value);
                      setSelectedStudentId('');
                    }}
                    className="form-select"
                  >
                    <option value="">Select a class...</option>
                    {classesWithStudents.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.students?.length || 0} Enrolled Students)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Step 2: Choose Enrolled Student *</label>
                  <select
                    required
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Choose student from class roster...</option>
                    {enrolledStudentsInClass.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.admission_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div className="form-group">
                <label className="form-label">Return Due Date *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={issuing}
                className="btn-gold"
                style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '10px' }}
              >
                {issuing ? 'Recording in Database...' : 'Confirm & Issue Book to Student'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD NEW BOOK MODAL ================= */}
      {addBookModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div className="card" style={{ maxWidth: '520px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
                Add New Book to Catalog
              </h3>
              <button onClick={() => setAddBookModalOpen(false)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddBook}>
              <div className="form-group">
                <label className="form-label">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clean Code"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Author *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert C. Martin"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    value={newBook.category}
                    onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    value={newBook.total_copies}
                    onChange={(e) => setNewBook({ ...newBook, total_copies: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Save to Catalog
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
