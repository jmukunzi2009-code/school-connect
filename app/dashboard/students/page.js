'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  Phone,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';

export default function StudentsDirectoryPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Registration modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(null);
  const [formError, setFormError] = useState(null);
  const [newStudent, setNewStudent] = useState({
    first_name: '',
    last_name: '',
    gender: 'Male',
    date_of_birth: '2011-05-15',
    blood_group: 'O+',
    class_id: '',
    stream_id: '',
    guardian_name: '',
    guardian_phone: '+250 788 ',
    guardian_relationship: 'Parent',
  });

  // Profile view modal
  const [profileStudent, setProfileStudent] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedClass) params.append('classId', selectedClass);
      if (selectedStream) params.append('streamId', selectedStream);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/students?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load students');
      const data = await res.json();
      setStudents(data.students || []);
      setClasses(data.classes || []);

      if (data.classes?.length > 0 && !newStudent.class_id) {
        const firstClass = data.classes[0];
        setNewStudent((prev) => ({
          ...prev,
          class_id: firstClass.id,
          stream_id: firstClass.streams?.[0]?.id || '',
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedClass, selectedStream]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setFormSuccess(data.message);
      // Reset form
      setNewStudent((prev) => ({
        ...prev,
        first_name: '',
        last_name: '',
      }));
      await fetchStudents();
      setTimeout(() => {
        setModalOpen(false);
        setFormSuccess(null);
      }, 1500);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const currentClassObj = classes.find((c) => c.id === selectedClass);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
            Student Directory & Enrollment Loop
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Centralized student database. All records flow automatically to Teachers, Library, Dispensary, and Accounts.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-gold"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <PlusCircle size={18} /> Register New Student
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search box */}
          <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by student name or admission number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px' }}
            />
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
            />
          </form>

          {/* Class Filter */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedStream('');
              }}
              className="form-select"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stream Filter */}
          {currentClassObj && (
            <div style={{ minWidth: '180px' }}>
              <select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="form-select"
              >
                <option value="">All Streams</option>
                {currentClassObj.streams?.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button onClick={fetchStudents} className="btn-secondary" style={{ padding: '10px 16px' }}>
            Apply Filter
          </button>
        </div>
      </div>

      {/* Student List Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Student Full Name</th>
                <th>Gender</th>
                <th>Class & Stream</th>
                <th>Guardian Contact</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                    Loading students from Neon database...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                    No students found matching your filters.
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-forest)' }}>
                      {st.admission_number}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {st.first_name} {st.last_name} {st.other_names || ''}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        DOB: {st.date_of_birth ? new Date(st.date_of_birth).toLocaleDateString() : 'N/A'} • Blood: {st.blood_group || 'O+'}
                      </div>
                    </td>
                    <td>{st.gender}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{st.class_name || 'Class Unassigned'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                        {st.stream_name || 'General Stream'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.86rem' }}>
                        {st.guardian_first ? `${st.guardian_first} ${st.guardian_last}` : 'Primary Contact'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {st.guardian_phone || st.emergency_phone || 'None'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-success">
                        {st.status?.toUpperCase() || 'ENROLLED'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setProfileStudent(st)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <Eye size={14} /> View Record
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= REGISTER STUDENT MODAL ================= */}
      {modalOpen && (
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
          <div className="card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
                  Register New Student
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Enrolls student into the connected database loop across all school departments.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {formSuccess && (
              <div style={{ backgroundColor: '#E6F5EC', color: '#126338', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <CheckCircle2 size={18} /> {formSuccess}
              </div>
            )}

            {formError && (
              <div style={{ backgroundColor: '#FDE8E8', color: '#9B1C1C', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} /> {formError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Divine"
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mugisha"
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                    className="form-select"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    value={newStudent.date_of_birth}
                    onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select
                    value={newStudent.blood_group}
                    onChange={(e) => setNewStudent({ ...newStudent, blood_group: e.target.value })}
                    className="form-select"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {/* Class & Stream Assignment */}
              <div style={{ backgroundColor: 'rgba(18, 59, 42, 0.04)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-forest)', marginBottom: '10px', fontSize: '0.92rem' }}>
                  Class & Stream Enrollment:
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Class *</label>
                    <select
                      required
                      value={newStudent.class_id}
                      onChange={(e) => {
                        const cid = e.target.value;
                        const c = classes.find((item) => item.id === cid);
                        setNewStudent({
                          ...newStudent,
                          class_id: cid,
                          stream_id: c?.streams?.[0]?.id || '',
                        });
                      }}
                      className="form-select"
                    >
                      <option value="">Select Class...</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stream *</label>
                    <select
                      required
                      value={newStudent.stream_id}
                      onChange={(e) => setNewStudent({ ...newStudent, stream_id: e.target.value })}
                      className="form-select"
                    >
                      <option value="">Select Stream...</option>
                      {classes
                        .find((c) => c.id === newStudent.class_id)
                        ?.streams?.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Parent / Guardian Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Charles Mugisha"
                    value={newStudent.guardian_name}
                    onChange={(e) => setNewStudent({ ...newStudent, guardian_name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Guardian Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+250 788 123 456"
                    value={newStudent.guardian_phone}
                    onChange={(e) => setNewStudent({ ...newStudent, guardian_phone: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-gold"
                style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '10px' }}
              >
                {submitting ? 'Registering & Generating Enrollment...' : 'Register Student in Neon DB'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= STUDENT PROFILE MODAL ================= */}
      {profileStudent && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-forest)',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                  }}
                >
                  {profileStudent.first_name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
                    {profileStudent.first_name} {profileStudent.last_name}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-forest)', fontWeight: 700 }}>
                    Adm No: {profileStudent.admission_number}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setProfileStudent(null)}
                style={{ background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Academic Class:</span>
                <span style={{ fontWeight: 700 }}>{profileStudent.class_name || 'Senior 1'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Stream:</span>
                <span style={{ fontWeight: 700 }}>{profileStudent.stream_name || 'Stream A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Gender & Blood Group:</span>
                <span style={{ fontWeight: 600 }}>{profileStudent.gender} • Blood {profileStudent.blood_group || 'O+'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Guardian:</span>
                <span style={{ fontWeight: 600 }}>{profileStudent.guardian_first ? `${profileStudent.guardian_first} ${profileStudent.guardian_last}` : 'Registered Guardian'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Contact Phone:</span>
                <span style={{ fontWeight: 600 }}>{profileStudent.guardian_phone || '+250 788 123 456'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span className="badge badge-success">ACTIVE & ENROLLED</span>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setProfileStudent(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
