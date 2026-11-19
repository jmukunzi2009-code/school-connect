'use client';

import React, { useState } from 'react';
import { Gavel, PlusCircle, AlertCircle, CheckCircle2, User } from 'lucide-react';

export default function DisciplinePage() {
  const [records] = useState([
    {
      id: '1',
      student_name: 'Felix Kwizera',
      admission_number: 'KHIA-2026-005',
      class_name: 'Senior 1 - Stream A',
      incident_type: 'Late arrival to morning assembly',
      action: 'Verbal Warning',
      parent_notified: true,
      date: '2026-03-02',
      status: 'resolved',
    },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
            Student Discipline & Conduct Records
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Managed by Discipline Officer and Deputy Headteacher. Confidential counselling records remain isolated.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Infraction Type</th>
                <th>Corrective Action</th>
                <th>Parent Notified</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.student_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{r.admission_number}</div>
                  </td>
                  <td>{r.class_name}</td>
                  <td style={{ fontWeight: 600 }}>{r.incident_type}</td>
                  <td>
                    <span className="badge badge-warning">{r.action}</span>
                  </td>
                  <td>
                    {r.parent_notified ? (
                      <span style={{ color: '#1E7E4A', fontWeight: 600, fontSize: '0.85rem' }}>✓ Yes (SMS)</span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No</span>
                    )}
                  </td>
                  <td>{r.date}</td>
                  <td>
                    <span className="badge badge-success">{r.status.toUpperCase()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
