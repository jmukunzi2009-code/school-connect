'use client';

import React, { useState } from 'react';
import { ShieldAlert, Lock, AlertTriangle, CheckCircle2, User } from 'lucide-react';

export default function SafeguardingPage() {
  const [incidents] = useState([
    {
      code: 'SFG-2026-001',
      student_name: 'Arthur Kayiranga',
      admission_number: 'KHIA-2026-001',
      incident_type: 'Bullying Prevention & Peer Conflict',
      severity: 'medium',
      date: '2026-02-18',
      actions: 'Mediation session conducted with Year Coordinator; follow-up monitoring scheduled.',
      status: 'action_taken',
    },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
            Child Protection & Safeguarding Register
          </h1>
          <span className="badge badge-danger">
            <Lock size={12} /> Legal Protection Restricted
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Restricted to designated Safeguarding Officers. All audit trails and access attempts are cryptographically recorded.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Incident Code</th>
                <th>Student</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Incident Date</th>
                <th>Intervention & Action Taken</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.code}>
                  <td style={{ fontWeight: 700, color: 'var(--color-forest)' }}>{inc.code}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{inc.student_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{inc.admission_number}</div>
                  </td>
                  <td>{inc.incident_type}</td>
                  <td>
                    <span className={`badge ${inc.severity === 'high' ? 'badge-danger' : 'badge-warning'}`}>
                      {inc.severity.toUpperCase()}
                    </span>
                  </td>
                  <td>{inc.date}</td>
                  <td style={{ maxWidth: '320px', fontSize: '0.85rem' }}>{inc.actions}</td>
                  <td>
                    <span className="badge badge-success">{inc.status.toUpperCase()}</span>
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
