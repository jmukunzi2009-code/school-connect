'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Users,
} from 'lucide-react';

export default function AttendancePage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchClassesAndStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ date: selectedDate });
      if (selectedClass) params.append('classId', selectedClass);
      if (selectedStream) params.append('streamId', selectedStream);

      const res = await fetch(`/api/attendance?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load attendance roster');
      const data = await res.json();
      setClasses(data.classes || []);
      setStudents(data.students || []);

      if (data.classes?.length > 0 && !selectedClass) {
        setSelectedClass(data.classes[0].id);
        setSelectedStream(data.classes[0].streams?.[0]?.id || '');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassesAndStudents();
  }, [selectedClass, selectedStream, selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setStudents((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, attendance_status: status } : s))
    );
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const records = students.map((s) => ({
        student_id: s.student_id,
        status: s.attendance_status,
      }));

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: selectedClass,
          stream_id: selectedStream,
          date: selectedDate,
          records,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save attendance');

      setSuccessMsg(data.message);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentClassObj = classes.find((c) => c.id === selectedClass);
  const presentCount = students.filter((s) => s.attendance_status === 'present').length;
  const absentCount = students.filter((s) => s.attendance_status === 'absent').length;
  const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
            Daily Student Attendance Register
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Roll call synced across Class Teachers, Headteacher dashboard, and Guardian portal.
          </p>
        </div>

        {students.length > 0 && (
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="btn-gold"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Attendance Record'}
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

      {/* Selector card */}
      <div className="card" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ minWidth: '200px' }}>
            <label className="form-label">Academic Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                const c = classes.find((item) => item.id === e.target.value);
                setSelectedStream(c?.streams?.[0]?.id || '');
              }}
              className="form-select"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {currentClassObj && (
            <div style={{ minWidth: '180px' }}>
              <label className="form-label">Stream / Section</label>
              <select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="form-select"
              >
                {currentClassObj.streams?.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="form-label">Roll Call Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Quick Metrics */}
          {students.length > 0 && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Present</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E7E4A' }}>{presentCount}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Absent</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#C0392B' }}>{absentCount}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Rate</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-forest)' }}>{attendanceRate}%</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Roster Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Student Name</th>
                <th>Gender</th>
                <th style={{ textAlign: 'center' }}>Attendance Marking</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                    Loading enrolled students...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                    No students currently enrolled in this class stream.
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.student_id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-forest)' }}>{st.admission_number}</td>
                    <td style={{ fontWeight: 600 }}>{st.first_name} {st.last_name}</td>
                    <td>{st.gender}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {['present', 'absent', 'late', 'excused'].map((status) => {
                          const isCurrent = st.attendance_status === status;
                          let bg = 'rgba(0, 0, 0, 0.05)';
                          let color = 'var(--text-secondary)';
                          if (isCurrent) {
                            if (status === 'present') {
                              bg = '#1E7E4A';
                              color = '#FFFFFF';
                            } else if (status === 'absent') {
                              bg = '#C0392B';
                              color = '#FFFFFF';
                            } else if (status === 'late') {
                              bg = '#B47214';
                              color = '#FFFFFF';
                            } else {
                              bg = '#226F8A';
                              color = '#FFFFFF';
                            }
                          }

                          return (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(st.student_id, status)}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                textTransform: 'capitalize',
                                backgroundColor: bg,
                                color: color,
                                cursor: 'pointer',
                                border: 'none',
                                transition: 'all 0.1s ease',
                              }}
                            >
                              {status}
                            </button>
                          );
                        })}
                      </div>
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
