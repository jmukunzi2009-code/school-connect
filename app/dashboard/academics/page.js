'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Layers,
  GraduationCap,
  Users,
  X,
} from 'lucide-react';

export default function AcademicsPage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modals
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', grade_level: '9', stream_name: 'Stream A' });

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '', department_id: '', credits: '3' });

  const fetchAcademics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/academics');
      if (!res.ok) throw new Error('Failed to load academic structures');
      const data = await res.json();
      setClasses(data.classes || []);
      setSubjects(data.subjects || []);
      setDepartments(data.departments || []);
      setAcademicYears(data.academicYears || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademics();
  }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/academics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_class', ...newClass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create class');
      setSuccessMsg(data.message);
      setClassModalOpen(false);
      await fetchAcademics();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/academics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_subject', ...newSubject }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create subject');
      setSuccessMsg(data.message);
      setSubjectModalOpen(false);
      await fetchAcademics();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
            Academic Structure & Curriculum
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Classes, streams, departments, and course curricula configured for this school.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setSubjectModalOpen(true)} className="btn-secondary">
            + Add Subject
          </button>
          <button onClick={() => setClassModalOpen(true)} className="btn-gold">
            <PlusCircle size={18} /> + Add Class & Stream
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: '#E6F5EC', color: '#126338', padding: '14px 18px', borderRadius: '8px', border: '1px solid #B7E4C7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* Classes Grid */}
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-forest)', marginBottom: '16px' }}>
          Classrooms & Streams
        </h3>
        <div className="grid-2">
          {classes.map((c) => (
            <div
              key={c.id}
              style={{
                padding: '18px 20px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'rgba(18, 59, 42, 0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
                  {c.name}
                </span>
                <span className="badge badge-gold">Grade {c.grade_level}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Streams / Divisions:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {c.streams?.map((st) => (
                  <span
                    key={st.id}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(18, 59, 42, 0.1)',
                      color: 'var(--color-forest)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    {st.name} ({st.capacity || 40} capacity)
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subjects Catalog */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-forest)' }}>
            Curriculum Subject Catalog
          </h3>
        </div>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Course Code</th>
                <th>Department</th>
                <th>Credit Hours</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub) => (
                <tr key={sub.id}>
                  <td style={{ fontWeight: 700, color: 'var(--color-deep-forest)' }}>{sub.name}</td>
                  <td>
                    <span className="badge badge-info">{sub.code}</span>
                  </td>
                  <td>{sub.department_name || 'General Academic'}</td>
                  <td style={{ fontWeight: 600 }}>{sub.credits} Credits</td>
                  <td>
                    <span className="badge badge-success">Core Curriculum</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Class Modal */}
      {classModalOpen && (
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
          <div className="card" style={{ maxWidth: '480px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Add New Class</h3>
              <button onClick={() => setClassModalOpen(false)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateClass}>
              <div className="form-group">
                <label className="form-label">Class Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior 3"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Grade Level *</label>
                  <input
                    type="number"
                    min="1"
                    max="13"
                    value={newClass.grade_level}
                    onChange={(e) => setNewClass({ ...newClass, grade_level: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">First Stream Name</label>
                  <input
                    type="text"
                    value={newClass.stream_name}
                    onChange={(e) => setNewClass({ ...newClass, stream_name: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              <button type="submit" className="btn-gold" style={{ width: '100%', marginTop: '10px' }}>
                Save Class to Neon
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Subject Modal */}
      {subjectModalOpen && (
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
          <div className="card" style={{ maxWidth: '480px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Add Curriculum Subject</h3>
              <button onClick={() => setSubjectModalOpen(false)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubject}>
              <div className="form-group">
                <label className="form-label">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PHY-101"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <input
                    type="number"
                    min="1"
                    value={newSubject.credits}
                    onChange={(e) => setNewSubject({ ...newSubject, credits: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Add Subject to Database
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
