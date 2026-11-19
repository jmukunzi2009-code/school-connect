'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';

function ScoreRing({ label, value, color }) {
  const numericScore = Number(value);
  const score = value === '' || value == null || Number.isNaN(numericScore)
    ? null
    : Math.max(0, Math.min(100, numericScore));

  return (
    <div className="score-ring-wrap">
      <div
        className="score-ring"
        style={{
          background: score === null
            ? '#E8F2F9'
            : `conic-gradient(${color} ${score}%, #E8F2F9 0)`,
        }}
        role="img"
        aria-label={`${label}: ${score === null ? 'No mark yet' : `${score}%`}`}
      >
        <span>{score === null ? '—' : `${score}%`}</span>
      </div>
      <span className="score-ring-label">{label}</span>
    </div>
  );
}

export default function ExaminationsPage() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [activeRole, setActiveRole] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchExamData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedSubject) params.append('subjectId', selectedSubject);
        if (selectedClass) params.append('classId', selectedClass);

        const res = await fetch(`/api/examinations?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Failed to load marks');
        const data = await res.json();
        setActiveRole(data.role);
        setSubjects(data.subjects || []);
        setClasses(data.classes || []);
        setStudents(data.students || []);

        if (data.subjects?.length > 0 && !selectedSubject) {
          setSelectedSubject(data.subjects[0].id);
        }
        if (data.classes?.length > 0 && !selectedClass) {
          setSelectedClass(data.classes[0].id);
        }
      } catch (err) {
        if (err.name !== 'AbortError') setErrorMsg(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchExamData();
    return () => controller.abort();
  }, [selectedSubject, selectedClass]);

  const handleScoreChange = (studentId, val) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.student_id === studentId) {
          const num = parseFloat(val);
          let grade = '';
          if (!isNaN(num)) {
            if (num >= 80) grade = 'A';
            else if (num >= 70) grade = 'B';
            else if (num >= 60) grade = 'C';
            else if (num >= 50) grade = 'D';
            else grade = 'F';
          }
          return { ...s, score: val, grade };
        }
        return s;
      })
    );
  };

  const handleCommentsChange = (studentId, val) => {
    setStudents((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, comments: val } : s))
    );
  };

  const handleSaveMarks = async () => {
    if (students.length === 0) return;
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const assessmentId = students[0].assessment_id;
      const marksPayload = students.map((s) => ({
        student_id: s.student_id,
        score: s.score,
        comments: s.comments,
      }));

      const res = await fetch('/api/examinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: assessmentId,
          marks: marksPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save marks');

      setSuccessMsg(data.message);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Compute analytics
  const scoresArray = students.map((s) => parseFloat(s.score)).filter((n) => !isNaN(n));
  const avgScore = scoresArray.length > 0 ? (scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length).toFixed(1) : null;
  const maxScore = scoresArray.length > 0 ? Math.max(...scoresArray) : null;
  const passCount = scoresArray.filter((s) => s >= 50).length;
  const passRate = scoresArray.length > 0 ? Math.round((passCount / scoresArray.length) * 100) : null;
  const canEditMarks = [
    'teacher',
    'class_teacher',
    'examination_officer',
    'academic_records_officer',
    'director_of_studies',
    'deputy_headteacher_academics',
  ].includes(activeRole);

  return (
    <div className="dashboard-page">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
            Assessment Marks & Report Grading
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            {canEditMarks
              ? 'Review class progress and enter marks for enrolled students.'
              : 'View published assessment results and class performance.'}
          </p>
        </div>

        {canEditMarks && students.length > 0 && (
          <button
            onClick={handleSaveMarks}
            disabled={saving}
            className="btn-gold"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save & Publish Marks'}
          </button>
        )}
      </div>

      {successMsg && (
        <div style={{ backgroundColor: '#E6F5EC', color: '#126338', padding: '14px 18px', borderRadius: '8px', border: '1px solid #B7E4C7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ backgroundColor: '#FDE8E8', color: '#9B1C1C', padding: '14px 18px', borderRadius: '8px', border: '1px solid #F8B4B4', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      {activeRole === 'headteacher' && (
        <div className="marks-readonly-note">
          <Award size={18} />
          <span>Headteacher view: marks are available for review and cannot be changed here.</span>
        </div>
      )}

      {/* Selectors card */}
      <div className="card" style={{ padding: '18px 24px' }}>
        <div className="marks-overview">
          <div style={{ minWidth: '220px' }}>
            <label className="form-label">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="form-select"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '200px' }}>
            <label className="form-label">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-select"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Metrics */}
          {students.length > 0 && (
            <div className="marks-rings">
              <ScoreRing label="Class average" value={avgScore} color="#1687D1" />
              <ScoreRing label="Highest mark" value={maxScore} color="#20A878" />
              <ScoreRing label="Pass rate" value={passRate} color="#F1AD42" />
            </div>
          )}
        </div>
      </div>

      {/* Marks Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Student Full Name</th>
                <th>Gender</th>
                <th style={{ width: '150px' }}>Score / 100</th>
                <th style={{ width: '90px' }}>Grade</th>
                <th>Teacher Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                    Loading marksheet from database...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                    No students currently enrolled in this class.
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.student_id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-forest)' }}>{st.admission_number}</td>
                    <td style={{ fontWeight: 600 }}>{st.first_name} {st.last_name}</td>
                    <td>{st.gender}</td>
                    <td>
                      <div className="marks-score-cell">
                        <ScoreRing
                          label={st.grade ? `Grade ${st.grade}` : 'Mark'}
                          value={st.score}
                          color={Number(st.score) >= 50 ? '#1687D1' : '#E68B73'}
                        />
                        {canEditMarks && (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0–100"
                            value={st.score}
                            onChange={(e) => handleScoreChange(st.student_id, e.target.value)}
                            className="form-input"
                            aria-label={`Score for ${st.first_name} ${st.last_name}`}
                            style={{ padding: '6px 10px', fontWeight: 700, maxWidth: '95px' }}
                          />
                        )}
                      </div>
                    </td>
                    <td>
                      {st.grade ? (
                        <span
                          className={`badge ${
                            st.grade === 'A'
                              ? 'badge-success'
                              : st.grade === 'B' || st.grade === 'C'
                              ? 'badge-gold'
                              : st.grade === 'D'
                              ? 'badge-warning'
                              : 'badge-danger'
                          }`}
                          style={{ fontSize: '0.85rem', fontWeight: 800 }}
                        >
                          Grade {st.grade}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Pending</span>
                      )}
                    </td>
                    <td>
                      {canEditMarks ? (
                        <input
                          type="text"
                          placeholder="Teacher remarks"
                          value={st.comments}
                          onChange={(e) => handleCommentsChange(st.student_id, e.target.value)}
                          className="form-input"
                          style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                        />
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>{st.comments || '—'}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
