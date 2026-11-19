'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, CalendarCheck, CheckSquare, FileText, TrendingUp,
  Clock, User, Briefcase, Phone, Mail, Award, AlertCircle,
  CheckCircle2, XCircle, Building, ChevronRight,
} from 'lucide-react';

export default function HRDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('staff');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user));
  }, []);

  const staff = [
    { id: 1, name: 'Mr. Emmanuel Kamanzi', role: 'Mathematics Teacher', dept: 'Sciences', phone: '+250 788 100 001', email: 'e.kamanzi@school.rw', status: 'active', joined: '2020-09-01', attendance: 97 },
    { id: 2, name: 'Mrs. Grace Uwimana', role: 'English Teacher', dept: 'Languages', phone: '+250 788 100 002', email: 'g.uwimana@school.rw', status: 'active', joined: '2019-01-15', attendance: 95 },
    { id: 3, name: 'Dr. Patrick Nkusi', role: 'Biology Teacher', dept: 'Sciences', phone: '+250 788 100 003', email: 'p.nkusi@school.rw', status: 'active', joined: '2021-08-20', attendance: 92 },
    { id: 4, name: 'Mrs. Alice Mukamana', role: 'History Teacher', dept: 'Humanities', phone: '+250 788 100 004', email: 'a.mukamana@school.rw', status: 'on_leave', joined: '2018-09-01', attendance: 88 },
    { id: 5, name: 'Mr. Joseph Habimana', role: 'Chemistry Teacher', dept: 'Sciences', phone: '+250 788 100 005', email: 'j.habimana@school.rw', status: 'active', joined: '2022-02-01', attendance: 99 },
  ];

  const leaveRequests = [
    { id: 1, name: 'Mrs. Alice Mukamana', type: 'Medical Leave', from: '2026-11-10', to: '2026-11-21', days: 11, status: 'approved', reason: 'Medical procedure and recovery' },
    { id: 2, name: 'Mr. Samuel Nsengiyumva', type: 'Annual Leave', from: '2026-11-25', to: '2026-11-28', days: 3, status: 'pending', reason: 'Family event' },
    { id: 3, name: 'Dr. Patrick Nkusi', type: 'Study Leave', from: '2026-12-01', to: '2026-12-05', days: 5, status: 'pending', reason: 'Academic conference in Nairobi' },
  ];

  const statusBadge = (s) => ({
    active: { label: 'Active', bg: '#E8F5EE', color: '#1E7E4A' },
    on_leave: { label: 'On Leave', bg: '#FEF8EE', color: '#B47214' },
    inactive: { label: 'Inactive', bg: '#FEF0EE', color: '#C0392B' },
    approved: { label: 'Approved', bg: '#E8F5EE', color: '#1E7E4A' },
    pending: { label: 'Pending', bg: '#FEF8EE', color: '#B47214' },
    rejected: { label: 'Rejected', bg: '#FEF0EE', color: '#C0392B' },
  }[s] || { label: s, bg: '#F0F2F0', color: '#60798C' });

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '6px' }}>HR Management</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Staff directory, attendance, and leave management.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Staff', val: 32, icon: Users, color: '#125A91', sub: 'All departments' },
          { label: 'On Leave Today', val: 2, icon: Clock, color: '#B47214', sub: '6.25% of staff' },
          { label: 'Pending Requests', val: 2, icon: CheckSquare, color: '#226F8A', sub: 'Awaiting review' },
          { label: 'Avg Attendance', val: '94.2%', icon: CalendarCheck, color: '#1E7E4A', sub: 'This month' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: 'var(--bg-surface)', borderRadius: '14px', padding: '20px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{s.label}</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} color={s.color} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: s.color, marginBottom: '4px' }}>{s.val}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '24px', gap: '0' }}>
        {[['staff', 'Staff Directory'], ['leave', 'Leave Requests'], ['attendance', 'Attendance']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ padding: '10px 24px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', color: activeTab === id ? 'var(--color-forest)' : 'var(--text-secondary)', borderBottom: activeTab === id ? '2px solid var(--color-forest)' : '2px solid transparent', marginBottom: '-2px', transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Staff Tab */}
      {activeTab === 'staff' && (
        <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Staff Directory ({staff.length} records)</h2>
            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>+ Add Staff</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  {['Staff Member', 'Role', 'Department', 'Contact', 'Attendance', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.map((s, i) => {
                  const badge = statusBadge(s.status);
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-primary)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #125A91, #1687D1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#D6AD55', flexShrink: 0 }}>
                            {s.name.split(' ').slice(-1)[0].charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{s.name}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Joined {s.joined.substring(0, 7)}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500 }}>{s.role}</td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.dept}</td>
                      <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.email}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'var(--border-color)', minWidth: '60px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${s.attendance}%`, background: s.attendance >= 95 ? '#1E7E4A' : s.attendance >= 85 ? '#B47214' : '#C0392B', borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.attendance}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 700, background: badge.bg, color: badge.color }}>{badge.label}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button style={{ fontSize: '0.8rem', color: 'var(--color-forest)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Tab */}
      {activeTab === 'leave' && (
        <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Leave Requests</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {leaveRequests.map((r, i) => {
              const badge = statusBadge(r.status);
              return (
                <div key={r.id} style={{ padding: '20px 24px', borderBottom: i < leaveRequests.length - 1 ? '1px solid var(--border-color)' : 'none', display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{r.name}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{r.type} · {r.days} day{r.days > 1 ? 's' : ''}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{r.from} → {r.to}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{r.reason}"</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, background: badge.bg, color: badge.color }}>{badge.label}</span>
                    {r.status === 'pending' && (
                      <>
                        <button style={{ padding: '5px 12px', borderRadius: '8px', background: '#E8F5EE', color: '#1E7E4A', border: '1px solid #BFE0CA', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>Approve</button>
                        <button style={{ padding: '5px 12px', borderRadius: '8px', background: '#FEF0EE', color: '#C0392B', border: '1px solid #FEC5BC', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>Reject</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <CalendarCheck size={48} color="#DCE3DC" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Staff Attendance Register</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Daily staff attendance tracking with automated reporting is available here. Connect to your attendance hardware or input manually.</p>
        </div>
      )}
    </div>
  );
}
