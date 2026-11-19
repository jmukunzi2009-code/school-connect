'use client';

import React, { useState } from 'react';
import { CheckSquare, CheckCircle2, XCircle, Clock, User, AlertCircle } from 'lucide-react';

export default function ApprovalsPage() {
  const [requests, setRequests] = useState([
    {
      id: 'REQ-101',
      type: 'Staff Annual Leave',
      applicant: 'Patrick Gasana (Mathematics Teacher)',
      department: 'Sciences',
      details: 'Requesting 3 days leave from March 20 to March 23 for family bereavement.',
      date: '2026-03-01',
      status: 'pending',
    },
    {
      id: 'REQ-102',
      type: 'Laboratory Procurement',
      applicant: 'Emmanuel Habimana (Bursar)',
      department: 'Finance',
      details: 'Approval for purchase of 20 chemistry reagent kits ($340.00).',
      date: '2026-03-02',
      status: 'approved',
    },
  ]);

  const handleAction = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
          Unified Approvals & Decision Engine
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Leave requests, department requisitions, marks corrections, and fee waiver authorizations.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Request Type</th>
                <th>Applicant</th>
                <th>Department</th>
                <th>Justification & Details</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Decision</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--color-forest)' }}>{r.id}</td>
                  <td style={{ fontWeight: 600 }}>{r.type}</td>
                  <td>{r.applicant}</td>
                  <td>{r.department}</td>
                  <td style={{ maxWidth: '320px', fontSize: '0.86rem' }}>{r.details}</td>
                  <td>{r.date}</td>
                  <td>
                    <span
                      className={`badge ${
                        r.status === 'approved'
                          ? 'badge-success'
                          : r.status === 'rejected'
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}
                    >
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {r.status === 'pending' ? (
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleAction(r.id, 'approved')}
                          className="btn-primary"
                          style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(r.id, 'rejected')}
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.78rem', color: '#C0392B' }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Decided</span>
                    )}
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
