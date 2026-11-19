'use client';
/**
 * CLASS MANAGEMENT — School Admin
 * - View all classes with student count and class teacher
 * - Assign class teacher to any class
 * - Assign subject teachers to classes
 * - Promote students from one class to another
 * - Add new students to a class (via Students API)
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen, Users, ChevronRight, ArrowLeft, PlusCircle, UserCheck,
  CheckCircle2, AlertCircle, TrendingUp, Award, X, Edit2, ArrowRight,
  Search, Layers, GraduationCap,
} from 'lucide-react';

export default function ClassManagementPage() {
  const [view, setView]           = useState('grid');   // 'grid' | 'detail'
  const [classes, setClasses]     = useState([]);
  const [teachers, setTeachers]   = useState([]);
  const [subjects, setSubjects]   = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [classTeachers, setClassTeachers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [userRole, setUserRole]   = useState(null);
  const [error, setError]         = useState(null);
  const [success, setSuccess]     = useState(null);
  const [search, setSearch]       = useState('');

  // Modal state
  const [modal, setModal]         = useState(null); // 'assign_ct' | 'assign_st' | 'promote'
  const [selTeacher, setSelTeacher] = useState('');
  const [selSubject, setSelSubject] = useState('');
  const [selStudentEnr, setSelStudentEnr] = useState('');
  const [selPromoteTo, setSelPromoteTo]   = useState('');
  const [promoting, setPromoting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = ['school_admin', 'headteacher', 'deputy_headteacher_academics', 'director_of_studies'].includes(userRole);

  // ─── Load data ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [clsRes, meRes] = await Promise.all([
          fetch('/api/classes'),
          fetch('/api/auth/me'),
        ]);
        const [classData, sessionData] = await Promise.all([clsRes.json(), meRes.json()]);
        if (!clsRes.ok) throw new Error(classData.error || 'Failed to load class data.');
        if (!meRes.ok) throw new Error(sessionData.error || 'Failed to load your account details.');
        setClasses(classData.classes || []);
        setTeachers(classData.teachers || []);
        setSubjects(classData.subjects || []);
        setUserRole(sessionData.user?.activeRole);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const openClass = async (cls) => {
    setSelectedClass(cls);
    setView('detail');
    setSearch('');
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/classes?classId=${cls.id}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to load this class.');
      setClassStudents(d.students || []);
      setClassTeachers(d.teachers || []);
    } catch (e) { setError(e.message); }
    finally { setDetailLoading(false); }
  };

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(null), 4000); };

  // ─── Assign class teacher ──────────────────────────────
  const handleAssignCT = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign_class_teacher', class_id: selectedClass?.id, teacher_user_id: selTeacher }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      showSuccess(d.message);
      setModal(null);
      openClass(selectedClass);
      // Refresh class list
      const clsRes = await fetch('/api/classes');
      const classData = await clsRes.json();
      if (!clsRes.ok) throw new Error(classData.error || 'Assignment saved, but the class list could not be refreshed.');
      setClasses(classData.classes || []);
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  // ─── Assign subject teacher ────────────────────────────
  const handleAssignST = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign_subject_teacher', class_id: selectedClass?.id, teacher_user_id: selTeacher, subject_id: selSubject }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      showSuccess(d.message);
      setModal(null);
      openClass(selectedClass);
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  // ─── Promote student ───────────────────────────────────
  const handlePromote = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'promote_student', enrollment_id: selStudentEnr, to_class_id: selPromoteTo }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      showSuccess(d.message);
      setModal(null);
      openClass(selectedClass);
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  const filteredStudents = classStudents.filter(s =>
    `${s.first_name} ${s.last_name} ${s.admission_number}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ padding: '32px', color: 'var(--text-secondary)' }}>Loading classes…</div>;

  return (
    <div className="dashboard-classes-page" style={{ padding: '28px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        {view === 'detail' && (
          <button onClick={() => { setView('grid'); setSelectedClass(null); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#60798C', fontSize: '0.85rem', fontWeight: 600 }}>
            <ArrowLeft size={15} /> All Classes
          </button>
        )}
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {view === 'grid' ? 'Class Management' : selectedClass?.name}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {view === 'grid' ? 'Manage classes, assign teachers, and promote students.' : `Class roster · Subject teachers · Promotions`}
        </p>
      </div>

      {/* Alerts */}
      {error && <div style={alertStyle('#FDE8E8', '#A51D24')}><AlertCircle size={15} /> {error} <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#A51D24' }}><X size={14} /></button></div>}
      {success && <div style={alertStyle('#E8F5EE', '#126338')}><CheckCircle2 size={15} /> {success}</div>}

      {/* ══ GRID VIEW ══ */}
      {view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {classes.map(cls => (
            <button key={cls.id} onClick={() => openClass(cls)}
              style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: '16px', padding: '22px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'block', width: '100%' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#125A91'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(18,90,145,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#125A91,#1687D1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={22} color="#D6AD55" />
                </div>
                <ChevronRight size={16} color="#9BAEA2" />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{cls.name}</div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}><Users size={12} style={{ verticalAlign: 'middle' }} /> {cls.student_count ?? 0} students</span>
              </div>
              {cls.class_teacher_name ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', borderRadius: '8px', background: 'rgba(18,90,145,0.06)' }}>
                  <UserCheck size={13} color="#125A91" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#125A91' }}>{cls.class_teacher_name}</span>
                </div>
              ) : (
                <div style={{ padding: '7px 10px', borderRadius: '8px', background: '#EAF6FF', fontSize: '0.78rem', color: '#125A91', fontWeight: 600 }}>
                  ⚠ No class teacher assigned
                </div>
              )}
            </button>
          ))}
          {classes.length === 0 && (
            <div style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <BookOpen size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
              <div>No classes yet. Create them in Academics & Classes.</div>
            </div>
          )}
        </div>
      )}

      {/* ══ DETAIL VIEW ══ */}
      {view === 'detail' && selectedClass && (
        <>
          {/* Info + Actions bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {isAdmin && [
              { label: '+ Assign Class Teacher', action: 'assign_ct', color: '#125A91' },
              { label: '+ Assign Subject Teacher', action: 'assign_st', color: '#226F8A' },
              { label: '↑ Promote Student', action: 'promote', color: '#B47214' },
            ].map(b => (
              <button key={b.action} onClick={() => { setModal(b.action); setSelTeacher(''); setSelSubject(''); setSelStudentEnr(''); setSelPromoteTo(''); }}
                style={{ padding: '9px 18px', borderRadius: '10px', background: `${b.color}18`, border: `1.5px solid ${b.color}44`, color: b.color, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                {b.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
            {/* Students table */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  Students ({classStudents.length})
                </h2>
                <div style={{ position: 'relative' }}>
                  <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#60798C' }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                    style={{ padding: '7px 10px 7px 28px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontSize: '0.82rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none', width: '180px' }} />
                </div>
              </div>
              {detailLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading…</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-primary)' }}>
                      {['#', 'Student', 'Adm. No.', 'Gender', isAdmin ? 'Action' : ''].filter(Boolean).map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.4px' }}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, i) => (
                      <tr key={s.id} style={{ borderTop: '1px solid var(--border-color)', background: i % 2 === 1 ? 'var(--bg-primary)' : 'transparent' }}>
                        <td style={{ padding: '11px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{i + 1}</td>
                        <td style={{ padding: '11px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#125A91,#1687D1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#D6AD55', flexShrink: 0 }}>
                              {s.first_name?.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.first_name} {s.last_name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '11px 16px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{s.admission_number}</td>
                        <td style={{ padding: '11px 16px', fontSize: '0.82rem' }}>
                          <span style={{ padding: '3px 8px', borderRadius: '8px', background: s.gender === 'Female' ? '#F9EEF3' : '#E8F4F8', color: s.gender === 'Female' ? '#8B2252' : '#1A5276', fontWeight: 700, fontSize: '0.74rem' }}>{s.gender}</span>
                        </td>
                        {isAdmin && (
                          <td style={{ padding: '11px 16px' }}>
                            <button onClick={() => { setSelStudentEnr(s.enrollment_id); setModal('promote'); }}
                              style={{ fontSize: '0.76rem', color: '#B47214', fontWeight: 700, background: '#FFF6E5', border: '1px solid #F0D88A', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>
                              Promote
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>No students found</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Right panel: Teachers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Class teacher */}
              <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={15} color="#125A91" /> Class Teacher
                </div>
                {selectedClass.class_teacher_name ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#125A91,#1687D1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#D6AD55' }}>
                      {selectedClass.class_teacher_name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selectedClass.class_teacher_name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{selectedClass.class_teacher_email}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#925807', fontSize: '0.85rem', fontStyle: 'italic' }}>Not assigned yet</div>
                )}
              </div>

              {/* Subject teachers */}
              <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={15} color="#125A91" /> Subject Teachers ({classTeachers.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {classTeachers.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>No subject teachers assigned yet.</div>}
                  {classTeachers.map(t => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>{t.teacher_name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#125A91', fontWeight: 700 }}>{t.subject_name} ({t.code})</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══ MODAL: Assign Class Teacher ══ */}
      {modal === 'assign_ct' && (
        <ModalWrapper title={`Assign Class Teacher — ${selectedClass?.name}`} onClose={() => setModal(null)}>
          <form onSubmit={handleAssignCT}>
            <label style={lblS}>Select Teacher *</label>
            <select required value={selTeacher} onChange={e => setSelTeacher(e.target.value)} style={{ ...inpS, marginBottom: '20px' }}>
              <option value="">Choose a teacher…</option>
              {teachers.filter(t => ['teacher', 'class_teacher'].includes(t.role)).map(t => <option key={t.id} value={t.id}>{t.full_name} ({t.role?.replace(/_/g, ' ')})</option>)}
            </select>
            <button type="submit" disabled={submitting} style={btnStyle}>{submitting ? 'Saving…' : 'Assign Class Teacher'}</button>
          </form>
        </ModalWrapper>
      )}

      {/* ══ MODAL: Assign Subject Teacher ══ */}
      {modal === 'assign_st' && (
        <ModalWrapper title={`Assign Subject Teacher — ${selectedClass?.name}`} onClose={() => setModal(null)}>
          <form onSubmit={handleAssignST}>
            <label style={lblS}>Select Subject *</label>
            <select required value={selSubject} onChange={e => setSelSubject(e.target.value)} style={{ ...inpS, marginBottom: '14px' }}>
              <option value="">Choose subject…</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
            <label style={lblS}>Select Teacher *</label>
            <select required value={selTeacher} onChange={e => setSelTeacher(e.target.value)} style={{ ...inpS, marginBottom: '20px' }}>
              <option value="">Choose teacher…</option>
              {teachers.filter(t => ['teacher', 'class_teacher'].includes(t.role)).map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
            <button type="submit" disabled={submitting} style={btnStyle}>{submitting ? 'Saving…' : 'Assign Subject Teacher'}</button>
          </form>
        </ModalWrapper>
      )}

      {/* ══ MODAL: Promote Student ══ */}
      {modal === 'promote' && (
        <ModalWrapper title="Promote Student to Another Class" onClose={() => setModal(null)}>
          <form onSubmit={handlePromote}>
            {!selStudentEnr && (
              <>
                <label style={lblS}>Select Student *</label>
                <select required value={selStudentEnr} onChange={e => setSelStudentEnr(e.target.value)} style={{ ...inpS, marginBottom: '14px' }}>
                  <option value="">Choose student…</option>
                  {classStudents.map(s => <option key={s.enrollment_id} value={s.enrollment_id}>{s.first_name} {s.last_name} ({s.admission_number})</option>)}
                </select>
              </>
            )}
            {selStudentEnr && (
              <div style={{ marginBottom: '14px', padding: '10px', borderRadius: '8px', background: '#EAF6FF', fontSize: '0.88rem', color: '#125A91' }}>
                Promoting: <strong>{classStudents.find(s => s.enrollment_id === selStudentEnr)?.first_name} {classStudents.find(s => s.enrollment_id === selStudentEnr)?.last_name}</strong> from <strong>{selectedClass?.name}</strong>
              </div>
            )}
            <label style={lblS}>Promote To Class *</label>
            <select required value={selPromoteTo} onChange={e => setSelPromoteTo(e.target.value)} style={{ ...inpS, marginBottom: '20px' }}>
              <option value="">Choose target class…</option>
              {classes.filter(c => c.id !== selectedClass?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{ background: '#EAF6FF', border: '1px solid #B9DFF3', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', fontSize: '0.82rem', color: '#125A91' }}>
              ⚠ This immediately moves the student's enrollment to the selected class. The student will appear in the new class roster right away.
            </div>
            <button type="submit" disabled={submitting} style={{ ...btnStyle, background: 'linear-gradient(135deg,#1687D1,#125A91)', color: '#fff' }}>
              {submitting ? 'Promoting…' : 'Confirm Promotion'}
            </button>
          </form>
        </ModalWrapper>
      )}
    </div>
  );
}

function ModalWrapper({ title, children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: '20px', padding: '28px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
        <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '20px' }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

const alertStyle = (bg, color) => ({ display: 'flex', alignItems: 'center', gap: '8px', background: bg, color, borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.88rem', fontWeight: 600 });
const lblS = { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px', letterSpacing: '0.3px' };
const inpS = { width: '100%', padding: '10px 13px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontSize: '0.9rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none' };
const btnStyle = { width: '100%', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg,#125A91,#1687D1)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer' };
