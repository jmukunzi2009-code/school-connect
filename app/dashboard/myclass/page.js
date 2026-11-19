'use client';
/**
 * MY CLASS — Teacher / Class Teacher Dashboard
 * 
 * Class Teacher sees:
 *   - Full roster of their class
 *   - Marks from ALL subject teachers
 *   - Attendance records
 *   - Other teachers' comments
 *   - Can add students (class teacher only)
 *   - Can add comments on students
 * 
 * Subject Teacher sees:
 *   - Students in their assigned class(es)
 *   - Only their subject marks
 *   - Can record marks and attendance
 *   - Can add comments
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen, Users, Award, CalendarCheck, MessageSquare, ChevronRight,
  ArrowLeft, CheckCircle2, AlertCircle, X, Edit2, PlusCircle,
  UserCheck, TrendingUp, Layers, FileText, Star,
} from 'lucide-react';

const gradeColor = (g) => {
  if (!g) return '#5E6D62';
  if (g.startsWith('A')) return '#1E7E4A';
  if (g.startsWith('B')) return '#226F8A';
  if (g.startsWith('C')) return '#B47214';
  return '#C0392B';
};

export default function MyClassPage() {
  const [myClasses, setMyClasses]   = useState([]);
  const [user, setUser]             = useState(null);
  const [view, setView]             = useState('list'); // 'list' | 'class'
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents]     = useState([]);
  const [mySubjects, setMySubjects] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [marks, setMarks]           = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [classLoading, setClassLoading] = useState(false);
  const [activeTab, setActiveTab]   = useState('roster');
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(null);

  // Comment modal
  const [commentModal, setCommentModal] = useState(null); // { student }
  const [comment, setComment]       = useState('');
  const [isPrivate, setIsPrivate]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [tRes, meRes] = await Promise.all([
          fetch('/api/teacher').then(r => r.json()),
          fetch('/api/auth/me').then(r => r.json()),
        ]);
        setMyClasses(tRes.myClasses || []);
        setUser(meRes.user);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const openClass = async (cls) => {
    setSelectedClass(cls);
    setView('class');
    setActiveTab('roster');
    setClassLoading(true);
    try {
      const res = await fetch(`/api/teacher?classId=${cls.id}`);
      const d = await res.json();
      setStudents(d.students || []);
      setMySubjects(d.mySubjects || []);
      setAllTeachers(d.allTeachers || []);
      setMarks(d.marks || []);
      setAttendance(d.recentAttendance || []);
      setIsClassTeacher(d.isClassTeacher || false);
    } catch (e) { setError(e.message); }
    finally { setClassLoading(false); }
  };

  // Marks per student lookup
  const marksForStudent = (studentId) => marks.filter(m => m.student_id === studentId);
  const avgMarks = (studentId) => {
    const sm = marksForStudent(studentId);
    if (!sm.length) return null;
    return Math.round(sm.reduce((acc, m) => acc + parseFloat(m.marks_obtained || 0), 0) / sm.length);
  };

  // Attendance rate per student (from recent 7 days)
  const attendanceRate = (studentId) => {
    const records = attendance.filter(a => a.student_id === studentId);
    if (!records.length) return null;
    const present = records.filter(a => a.status === 'present').length;
    return Math.round((present / records.length) * 100);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_comment', student_id: commentModal.id, class_id: selectedClass?.id, comment, is_private: isPrivate }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setSuccess(d.message);
      setCommentModal(null);
      setComment('');
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); setTimeout(() => setSuccess(null), 3000); }
  };

  if (loading) return <div style={{ padding: '32px', color: 'var(--text-secondary)' }}>Loading your classes…</div>;

  return (
    <div style={{ padding: '28px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        {view === 'class' && (
          <button onClick={() => { setView('list'); setSelectedClass(null); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#5E6D62', fontSize: '0.85rem', fontWeight: 600 }}>
            <ArrowLeft size={15} /> My Classes
          </button>
        )}
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {view === 'list' ? 'My Classes' : selectedClass?.name}
          {isClassTeacher && view === 'class' && <span style={{ marginLeft: '10px', fontSize: '0.8rem', background: 'rgba(214,173,85,0.15)', color: '#B47214', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, verticalAlign: 'middle' }}>Class Teacher</span>}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {view === 'list' ? 'Your assigned classes and subjects.' : `${students.length} students · ${mySubjects.length} subject${mySubjects.length !== 1 ? 's' : ''} you teach`}
        </p>
      </div>

      {error && <div style={alertS('#FDE8E8','#A51D24')}><AlertCircle size={14} /> {error} <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#A51D24' }}><X size={13} /></button></div>}
      {success && <div style={alertS('#E8F5EE','#126338')}><CheckCircle2 size={14} /> {success}</div>}

      {/* ══ LIST VIEW ══ */}
      {view === 'list' && (
        <>
          {myClasses.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <BookOpen size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
              <div style={{ fontWeight: 600, marginBottom: '6px' }}>No classes assigned yet</div>
              <div style={{ fontSize: '0.88rem' }}>Ask your School Admin to assign you to a class and subject.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {myClasses.map(cls => (
                <button key={cls.id} onClick={() => openClass(cls)}
                  style={{ background: 'var(--bg-surface)', border: `2px solid ${cls.is_class_teacher ? '#D6AD55' : 'var(--border-color)'}`, borderRadius: '16px', padding: '22px', textAlign: 'left', cursor: 'pointer', display: 'block', width: '100%', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(18,59,42,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: cls.is_class_teacher ? 'linear-gradient(135deg,#D6AD55,#C29A44)' : 'linear-gradient(135deg,#123B2A,#1E6A45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {cls.is_class_teacher ? <UserCheck size={20} color="#0B241B" /> : <BookOpen size={20} color="#D6AD55" />}
                    </div>
                    <ChevronRight size={16} color="#9BAEA2" />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{cls.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    <Users size={12} style={{ verticalAlign: 'middle' }} /> {cls.student_count} students
                  </div>
                  {cls.is_class_teacher && (
                    <div style={{ background: 'rgba(214,173,85,0.12)', borderRadius: '8px', padding: '6px 10px', fontSize: '0.76rem', fontWeight: 700, color: '#B47214' }}>★ Class Teacher</div>
                  )}
                  {cls.subjects_teaching && (
                    <div style={{ marginTop: '8px', fontSize: '0.76rem', color: '#226F8A', fontWeight: 600 }}>Subjects: {cls.subjects_teaching}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══ CLASS VIEW ══ */}
      {view === 'class' && selectedClass && (
        <>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '24px', gap: '0' }}>
            {[
              ['roster', 'Class Roster', Users],
              ['marks', 'Marks & Grades', Award],
              ['attendance', 'Attendance', CalendarCheck],
              ...(isClassTeacher ? [['teachers', 'Subject Teachers', Layers]] : []),
            ].map(([id, label, Icon]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                style={{ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px', color: activeTab === id ? '#123B2A' : 'var(--text-secondary)', borderBottom: activeTab === id ? '2px solid #123B2A' : '2px solid transparent', marginBottom: '-2px', transition: 'all 0.2s' }}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {classLoading ? <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading class data…</div> : (
            <>
              {/* ── Roster ── */}
              {activeTab === 'roster' && (
                <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Students in {selectedClass.name} ({students.length})</span>
                    {isClassTeacher && <span style={{ fontSize: '0.78rem', color: '#1E7E4A', fontWeight: 700 }}>✓ You manage this class</span>}
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-primary)' }}>
                        {['#', 'Student', 'Adm. No.', 'Avg Mark', 'Attendance', 'Comment'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.4px' }}>{h.toUpperCase()}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => {
                        const avg = avgMarks(s.id);
                        const att = attendanceRate(s.id);
                        return (
                          <tr key={s.id} style={{ borderTop: '1px solid var(--border-color)', background: i % 2 === 1 ? 'var(--bg-primary)' : 'transparent' }}>
                            <td style={{ padding: '11px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{i + 1}</td>
                            <td style={{ padding: '11px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#123B2A,#1E6A45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#D6AD55', flexShrink: 0 }}>
                                  {s.first_name?.charAt(0)}
                                </div>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.first_name} {s.last_name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '11px 16px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{s.admission_number}</td>
                            <td style={{ padding: '11px 16px', fontWeight: 700, color: avg !== null ? gradeColor(avg >= 80 ? 'A' : avg >= 65 ? 'B' : avg >= 50 ? 'C' : 'D') : '#9BAEA2' }}>
                              {avg !== null ? `${avg}%` : '—'}
                            </td>
                            <td style={{ padding: '11px 16px', fontWeight: 700, color: att !== null ? (att >= 90 ? '#1E7E4A' : att >= 75 ? '#B47214' : '#C0392B') : '#9BAEA2' }}>
                              {att !== null ? `${att}%` : '—'}
                            </td>
                            <td style={{ padding: '11px 16px' }}>
                              <button onClick={() => setCommentModal(s)}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(34,111,138,0.08)', border: '1px solid rgba(34,111,138,0.2)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.76rem', color: '#226F8A', fontWeight: 700, cursor: 'pointer' }}>
                                <MessageSquare size={12} /> Add
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── Marks ── */}
              {activeTab === 'marks' && (
                <div>
                  {mySubjects.length === 0 && !isClassTeacher ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                      No subjects assigned to you in this class. Contact your School Admin.
                    </div>
                  ) : (
                    <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                          {isClassTeacher ? 'All Subject Marks (Full Class View)' : `Marks — ${mySubjects.map(s => s.subject_name).join(', ')}`}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {isClassTeacher ? 'As class teacher you can see marks from all subject teachers' : 'Go to Examinations to record or update marks.'}
                        </div>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-primary)' }}>
                            {['Student', ...Array.from(new Set(marks.map(m => m.subject_name)))].map(h => (
                              <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.4px' }}>{h.toUpperCase()}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((s, i) => (
                            <tr key={s.id} style={{ borderTop: '1px solid var(--border-color)', background: i % 2 === 1 ? 'var(--bg-primary)' : 'transparent' }}>
                              <td style={{ padding: '11px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.first_name} {s.last_name}</td>
                              {Array.from(new Set(marks.map(m => m.subject_name))).map(subName => {
                                const m = marks.find(mk => mk.student_id === s.id && mk.subject_name === subName);
                                return (
                                  <td key={subName} style={{ padding: '11px 16px', fontWeight: 700, color: m ? gradeColor(m.grade) : '#DCE3DC' }}>
                                    {m ? `${m.marks_obtained} (${m.grade})` : '—'}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── Attendance ── */}
              {activeTab === 'attendance' && (
                <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '24px' }}>
                  <div style={{ fontWeight: 800, marginBottom: '16px' }}>Recent Attendance (Last 7 Days)</div>
                  {attendance.length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '32px' }}>No attendance records yet. Use the Attendance module to mark daily rolls.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {students.map(s => {
                        const recs = attendance.filter(a => a.student_id === s.id);
                        const present = recs.filter(a => a.status === 'present').length;
                        return (
                          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', flex: 1 }}>{s.first_name} {s.last_name}</div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {recs.slice(0, 7).map((r, ri) => (
                                <div key={ri} title={`${r.date}: ${r.status}`} style={{ width: '20px', height: '20px', borderRadius: '4px', background: r.status === 'present' ? '#1E7E4A' : r.status === 'absent' ? '#C0392B' : '#B47214', cursor: 'help' }} />
                              ))}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: recs.length ? (present / recs.length >= 0.9 ? '#1E7E4A' : '#B47214') : '#9BAEA2' }}>
                              {recs.length ? `${Math.round((present / recs.length) * 100)}%` : '—'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── All Teachers (Class Teacher only) ── */}
              {activeTab === 'teachers' && isClassTeacher && (
                <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontWeight: 800 }}>Subject Teachers in {selectedClass.name}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {allTeachers.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No subject teachers assigned yet.</div>}
                    {allTeachers.map((t, i) => (
                      <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.teacher_name}</div>
                        <div style={{ fontSize: '0.84rem', color: '#226F8A', fontWeight: 700 }}>{t.subject_name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Comment Modal */}
      {commentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '20px', padding: '28px', maxWidth: '460px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Add Comment</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>{commentModal.first_name} {commentModal.last_name}</p>
              </div>
              <button onClick={() => setCommentModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddComment}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>Comment *</label>
              <textarea required value={comment} onChange={e => setComment(e.target.value)} rows={4}
                placeholder="Write your observation about this student…"
                style={{ width: '100%', padding: '10px 13px', borderRadius: '10px', border: '1.5px solid var(--border-color)', fontSize: '0.9rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none', resize: 'vertical', marginBottom: '14px' }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '20px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} style={{ accentColor: '#123B2A', width: '16px', height: '16px' }} />
                Private (only class teacher and school admin can see this)
              </label>
              <button type="submit" disabled={submitting} style={{ width: '100%', padding: '11px', borderRadius: '10px', background: '#123B2A', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                {submitting ? 'Saving…' : 'Add Comment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const alertS = (bg, color) => ({ display: 'flex', alignItems: 'center', gap: '8px', background: bg, color, borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.88rem', fontWeight: 600 });
