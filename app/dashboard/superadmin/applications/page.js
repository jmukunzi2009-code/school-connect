'use client';

import React, { useState, useEffect } from 'react';
import {
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Filter,
  Search,
  X,
  Sparkles,
} from 'lucide-react';

export default function SuperAdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/superadmin/applications');
      if (!res.ok) throw new Error('Failed to load applications');
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = async (applicationId, action) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/superadmin/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      setNotification({ type: 'success', message: data.message });
      setSelectedApp(null);
      await fetchApplications();
      setTimeout(() => setNotification(null), 4000);
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = applications.filter((a) =>
    filterStatus === 'all' ? true : a.status === filterStatus
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
          School Onboarding Applications
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Platform level vetting. Super Administrator reviews school credentials and provisions isolated workspaces.
        </p>
      </div>

      {notification && (
        <div style={{ backgroundColor: '#E6F5EC', color: '#126338', padding: '14px 18px', borderRadius: '8px', border: '1px solid #B7E4C7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {notification.message}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px' }}>
        {['all', 'pending', 'approved', 'rejected'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            style={{
              padding: '10px 18px',
              fontWeight: 700,
              fontSize: '0.92rem',
              color: filterStatus === st ? 'var(--color-forest)' : 'var(--text-secondary)',
              borderBottom: filterStatus === st ? '3px solid var(--color-forest)' : '3px solid transparent',
              background: 'none',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {st} ({applications.filter((a) => (st === 'all' ? true : a.status === st)).length})
          </button>
        ))}
      </div>

      {/* Applications Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Reference</th>
                <th>School Name</th>
                <th>Official Email</th>
                <th>Country</th>
                <th>Representative</th>
                <th>Status</th>
                <th>Submitted</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                    Loading applications from database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                    No applications found with status: {filterStatus}.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-forest)' }}>{a.application_reference}</td>
                    <td style={{ fontWeight: 600 }}>{a.school_name}</td>
                    <td>{a.school_email}</td>
                    <td>{a.country}</td>
                    <td>
                      <div>{a.rep_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{a.rep_position}</div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          a.status === 'approved'
                            ? 'badge-success'
                            : a.status === 'rejected'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedApp(a)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <Eye size={14} /> Review Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div className="card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
                  {selectedApp.school_name}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-forest)', fontWeight: 700 }}>
                  Reference: {selectedApp.application_reference}
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.92rem', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>School Email:</span>
                <span style={{ fontWeight: 600 }}>{selectedApp.school_email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Phone Number:</span>
                <span style={{ fontWeight: 600 }}>{selectedApp.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Campus Location:</span>
                <span style={{ fontWeight: 600 }}>{selectedApp.district}, {selectedApp.country}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Authorized Representative:</span>
                <span style={{ fontWeight: 600 }}>{selectedApp.rep_name} ({selectedApp.rep_position})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Representative Email:</span>
                <span style={{ fontWeight: 600 }}>{selectedApp.rep_email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Current Status:</span>
                <span className="badge badge-warning">{selectedApp.status.toUpperCase()}</span>
              </div>
            </div>

            {selectedApp.status === 'pending' && (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction(selectedApp.id, 'reject')}
                  className="btn-secondary"
                  style={{ color: '#C0392B' }}
                >
                  Reject Application
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction(selectedApp.id, 'approve')}
                  className="btn-primary"
                >
                  {actionLoading ? 'Provisioning...' : 'Approve & Provision School Workspace'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
