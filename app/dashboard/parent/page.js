'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, CalendarCheck, Award, CreditCard, Bell, BookOpen,
  TrendingUp, CheckCircle2, AlertCircle, Clock, ChevronRight,
  Heart, Phone, MapPin, Star, Activity
} from 'lucide-react';

export default function ParentDashboard() {
  const [user, setUser] = useState(null);
  const [activeChild, setActiveChild] = useState(0);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user));
  }, []);

  // Demo children data
  const children = [
    {
      name: 'Emma Johnson',
      class: 'Form 3A',
      admNumber: 'ADM-2024-001',
      photo: null,
      attendance: 94.2,
      avgGrade: 'B+',
      feeBalance: 45000,
      subjects: [
        { name: 'Mathematics', grade: 'A', score: 88 },
        { name: 'English', grade: 'B+', score: 78 },
        { name: 'Sciences', grade: 'A-', score: 85 },
        { name: 'History', grade: 'B', score: 72 },
        { name: 'Geography', grade: 'B+', score: 76 },
      ],
      recentAbsences: 2,
      announcements: [
        { title: 'Parent-Teacher Meeting', date: '2026-11-20', type: 'info' },
        { title: 'Term Exam Schedule Released', date: '2026-11-15', type: 'exam' },
      ],
    },
    {
      name: 'James Johnson',
      class: 'Primary 5B',
      admNumber: 'ADM-2024-042',
      photo: null,
      attendance: 97.8,
      avgGrade: 'A-',
      feeBalance: 0,
      subjects: [
        { name: 'Mathematics', grade: 'A', score: 92 },
        { name: 'English', grade: 'A-', score: 88 },
        { name: 'Science', grade: 'B+', score: 80 },
        { name: 'Social Studies', grade: 'A', score: 90 },
      ],
      recentAbsences: 0,
      announcements: [
        { title: 'Sports Day - 25th November', date: '2026-11-14', type: 'event' },
      ],
    },
  ];

  const child = children[activeChild];

  const gradeColor = (g) => {
    if (g.startsWith('A')) return '#1E7E4A';
    if (g.startsWith('B')) return '#226F8A';
    if (g.startsWith('C')) return '#B47214';
    return '#C0392B';
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Parent Portal
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Welcome back{user ? `, ${user.full_name}` : ''}! Track your children's progress in real-time.
        </p>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {children.map((c, i) => (
            <button key={i} onClick={() => setActiveChild(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 20px', borderRadius: '12px',
                border: `2px solid ${activeChild === i ? 'var(--color-forest)' : 'var(--border-color)'}`,
                background: activeChild === i ? 'rgba(18,59,42,0.06)' : 'var(--bg-surface)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `hsl(${i * 60 + 120}, 50%, 75%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                {c.name.charAt(0)}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{c.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{c.class}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Attendance Rate', val: `${child.attendance}%`, icon: CalendarCheck, color: '#1E7E4A', trend: '+2.1%' },
          { label: 'Average Grade', val: child.avgGrade, icon: Award, color: '#226F8A', trend: 'Term 2' },
          { label: 'Fee Balance', val: child.feeBalance > 0 ? `RWF ${child.feeBalance.toLocaleString()}` : 'Paid ✓', icon: CreditCard, color: child.feeBalance > 0 ? '#C0392B' : '#1E7E4A', trend: child.feeBalance > 0 ? 'Outstanding' : 'All clear' },
          { label: 'Absences This Term', val: child.recentAbsences, icon: Clock, color: child.recentAbsences > 3 ? '#B47214' : '#5E6D62', trend: child.recentAbsences === 0 ? 'Perfect!' : 'days' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: 'var(--bg-surface)', borderRadius: '14px', padding: '20px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{s.label}</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={s.color} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: s.color, marginBottom: '4px' }}>{s.val}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s.trend}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Subject Performance */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="#226F8A" /> Subject Grades — {child.name.split(' ')[0]}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {child.subjects.map(sub => (
              <div key={sub.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{sub.name}</span>
                  <span style={{ fontWeight: 800, color: gradeColor(sub.grade), fontSize: '0.88rem' }}>{sub.grade} ({sub.score}%)</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'var(--border-color)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${sub.score}%`, background: `linear-gradient(to right, ${gradeColor(sub.grade)}, ${gradeColor(sub.grade)}99)`, borderRadius: '3px', transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} color="#D6AD55" /> School Announcements
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {child.announcements.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.type === 'exam' ? '#C0392B' : a.type === 'event' ? '#1E7E4A' : '#226F8A', flexShrink: 0, marginTop: '5px' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{a.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{a.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'View Report Card', icon: BookOpen, color: '#123B2A' },
                { label: 'Fee Statement', icon: CreditCard, color: '#226F8A' },
                { label: 'Contact Teacher', icon: Phone, color: '#1E7E4A' },
                { label: 'Attendance Log', icon: CalendarCheck, color: '#B47214' },
              ].map(({ label, icon: Icon, color }) => (
                <button key={label} style={{ padding: '12px', borderRadius: '10px', background: `${color}10`, border: `1px solid ${color}30`, color, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', textAlign: 'left' }}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
