'use client';

import React, { useState } from 'react';
import { FileHeart, Shield, PlusCircle, CheckCircle2, Lock, User, AlertCircle } from 'lucide-react';

export default function CounsellingPage() {
  const [cases, setCases] = useState([
    {
      case_number: 'CNS-2026-001',
      student_name: 'David Mugisha',
      admission_number: 'KHIA-2026-003',
      issue_type: 'Academic Stress & Study Habits',
      status: 'in_progress',
      referral_source: 'Class Teacher',
      next_session: '2026-03-24',
      action_plan: 'Weekly 30-min time-management mentoring and parental revision support.',
    },
    {
      case_number: 'CNS-2026-002',
      student_name: 'Esther Ganza',
      admission_number: 'KHIA-2026-004',
      issue_type: 'Peer Relationship & Confidence',
      status: 'resolved',
      referral_source: 'Self-referral',
      next_session: 'Completed',
      action_plan: 'Empowerment discussions and peer group communication coaching.',
    },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
              Confidential Guidance & Counselling
            </h1>
            <span className="badge badge-danger">
              <Lock size={12} /> Strictly Confidential
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Protected student emotional guidance case files. Restricted exclusively to authorized School Counsellors.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Case Ref</th>
                <th>Student</th>
                <th>Issue Category</th>
                <th>Referral Source</th>
                <th>Action Plan & Support</th>
                <th>Next Session</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.case_number}>
                  <td style={{ fontWeight: 700, color: 'var(--color-forest)' }}>{c.case_number}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.student_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{c.admission_number}</div>
                  </td>
                  <td>
                    <span className="badge badge-gold">{c.issue_type}</span>
                  </td>
                  <td>{c.referral_source}</td>
                  <td style={{ maxWidth: '300px', fontSize: '0.85rem' }}>{c.action_plan}</td>
                  <td style={{ fontWeight: 600 }}>{c.next_session}</td>
                  <td>
                    <span className={`badge ${c.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>
                      {c.status.toUpperCase()}
                    </span>
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
