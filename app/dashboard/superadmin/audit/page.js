'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Search, Filter } from 'lucide-react';

export default function SuperAdminAuditPage() {
  const [logs, setLogs] = useState([
    { id: '1', action: 'BOOTSTRAP_COMPLETE', module: 'system', details: 'Initial super admin initialized with bcrypt hash', time: 'Today, 14:23' },
    { id: '2', action: 'DEMO_SCHOOL_SEEDED', module: 'schools', details: 'Kigali Heights Academy provisioned with 5 enrolled students', time: 'Today, 14:23' },
    { id: '3', action: 'USER_LOGIN', module: 'auth', details: 'Platform Super Administrator signed in securely', time: 'Today, 14:27' },
    { id: '4', action: 'STUDENT_ENROLLED', module: 'students', details: 'Arthur Kayiranga enrolled into Senior 1 - Stream A', time: 'Today, 14:31' },
    { id: '5', action: 'BOOK_ISSUED', module: 'library', details: 'Effective Java checked out to Arthur Kayiranga', time: 'Today, 14:32' },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
          Platform Security Audit Trail
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Immutable database audit logs tracking administrative actions, tenant provisioning, and security events.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Event Action</th>
                <th>Module</th>
                <th>Audit Details</th>
                <th>Recorded Timestamp</th>
                <th>Integrity</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 700, color: 'var(--color-forest)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={16} color="var(--color-forest)" />
                      {l.action}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">{l.module.toUpperCase()}</span>
                  </td>
                  <td style={{ fontSize: '0.88rem' }}>{l.details}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{l.time}</td>
                  <td>
                    <span className="badge badge-success">VERIFIED</span>
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
