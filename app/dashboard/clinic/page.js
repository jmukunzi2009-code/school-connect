'use client';

import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Shield,
  Thermometer,
  Activity,
  X,
  Sparkles,
} from 'lucide-react';

export default function ClinicPage() {
  const [visits, setVisits] = useState([]);
  const [classesWithStudents, setClassesWithStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [formData, setFormData] = useState({
    student_id: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    medication_given: '',
    temperature: '36.8 C',
    nurse_notes: '',
    status: 'treated',
  });

  const fetchClinicData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/clinic');
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to load clinic records');
      }
      const data = await res.json();
      setVisits(data.visits || []);
      setClassesWithStudents(data.classesWithStudents || []);

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
    fetchClinicData();
  }, []);

  const handleRecordVisit = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.symptoms) {
      alert('Please select a student and describe symptoms.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/clinic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record visit');

      setSuccessMsg(data.message);
      setModalOpen(false);
      setFormData({
        student_id: '',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        medication_given: '',
        temperature: '36.8 C',
        nurse_notes: '',
        status: 'treated',
      });
      await fetchClinicData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const activeClassObj = classesWithStudents.find((c) => c.id === selectedClassId);
  const enrolledStudents = activeClassObj?.students || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
              Infirmary & Health Clinic
            </h1>
            <span className="badge badge-danger">Restricted Medical Records</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Attending Nurse logs student infirmary visits, symptom diagnostics, temperature vitals, and prescribed medications.
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn-gold">
          <PlusCircle size={18} /> Record Clinic Visit
        </button>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: '#E6F5EC', color: '#126338', padding: '14px 18px', borderRadius: '8px', border: '1px solid #B7E4C7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#FDE8E8', color: '#9B1C1C', padding: '14px 18px', borderRadius: '8px', border: '1px solid #F8B4B4', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Visits Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Patient (Student)</th>
                <th>Class / Stream</th>
                <th>Symptoms & Vitals</th>
                <th>Diagnosis & Treatment</th>
                <th>Prescription Dispensed</th>
                <th>Status</th>
                <th>Visit Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                    Loading medical records securely...
                  </td>
                </tr>
              ) : visits.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                    No clinic visits logged today.
                  </td>
                </tr>
              ) : (
                visits.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-deep-forest)' }}>
                        {v.first_name} {v.last_name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-forest)' }}>
                        {v.admission_number} • Blood {v.blood_group || 'O+'}
                      </div>
                    </td>
                    <td>
                      <span>{v.class_name || 'Senior 1'}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{v.symptoms}</div>
                      <div style={{ fontSize: '0.78rem', color: '#B47214' }}>
                        Temp: {v.temperature || '36.8 C'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{v.diagnosis || 'Observation'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v.treatment || 'Rest and hydration'}</div>
                    </td>
                    <td>
                      <span className="badge badge-info">{v.medication_given || 'None'}</span>
                    </td>
                    <td>
                      <span className={`badge ${v.status === 'treated' ? 'badge-success' : 'badge-warning'}`}>
                        {v.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(v.visit_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                      {new Date(v.visit_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= RECORD VISIT MODAL ================= */}
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
          <div className="card" style={{ maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
                  Record Infirmary Clinic Visit
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Confidential medical record. Pick class to load student roster automatically.
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordVisit}>
              {/* Loop: Choose Class, Then Choose Student */}
              <div style={{ backgroundColor: 'rgba(18, 59, 42, 0.04)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-forest)', marginBottom: '10px' }}>
                  <Sparkles size={16} color="var(--color-gold)" /> Select Enrolled Student via Class:
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Step 1: Choose Class</label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => {
                        setSelectedClassId(e.target.value);
                        setFormData({ ...formData, student_id: '' });
                      }}
                      className="form-select"
                    >
                      <option value="">Select class...</option>
                      {classesWithStudents.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Step 2: Choose Student *</label>
                    <select
                      required
                      value={formData.student_id}
                      onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                      className="form-select"
                    >
                      <option value="">Select enrolled student...</option>
                      {enrolledStudents.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.admission_number})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Reported Symptoms *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. High fever, stomach cramps"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Temperature / Vitals</label>
                  <input
                    type="text"
                    placeholder="e.g. 37.8 C"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Preliminary Diagnosis</label>
                  <input
                    type="text"
                    placeholder="e.g. Mild viral infection"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Medication Dispensed</label>
                  <input
                    type="text"
                    placeholder="e.g. Paracetamol 500mg, ORS"
                    value={formData.medication_given}
                    onChange={(e) => setFormData({ ...formData, medication_given: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confidential Nurse Observation Notes</label>
                <textarea
                  rows={2}
                  placeholder="Record confidential observation details..."
                  value={formData.nurse_notes}
                  onChange={(e) => setFormData({ ...formData, nurse_notes: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-gold"
                style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '10px' }}
              >
                {submitting ? 'Recording Visit...' : 'Log Infirmary Visit to Neon DB'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
