'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen, CalendarCheck, Award, Library, Bell, Clock,
  TrendingUp, User, FileText, Layers, Star, Activity,
  CheckCircle2, ChevronRight,
} from 'lucide-react';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user));
  }, []);

  // Demo student data
  const subjects = [
    { name: 'Mathematics', teacher: 'Mr. Kamanzi', grade: 'A', score: 88, homework: 2 },
    { name: 'English Language', teacher: 'Mrs. Uwimana', grade: 'B+', score: 78, homework: 1 },
    { name: 'Biology', teacher: 'Dr. Nkusi', grade: 'A-', score: 85, homework: 0 },
    { name: 'Chemistry', teacher: 'Mr. Habimana', grade: 'B+', score: 76, homework: 3 },
    { name: 'History & Social Studies', teacher: 'Mrs. Mukamana', grade: 'B', score: 72, homework: 1 },
    { name: 'Physical Education', teacher: 'Mr. Nsengiyumva', grade: 'A', score: 95, homework: 0 },
  ];

  const timetable = [
    { day: 'Mon', periods: ['Math', 'English', 'Biology', '— Break —', 'Chemistry', 'History', 'P.E.'] },
    { day: 'Tue', periods: ['English', 'Math', 'Chemistry', '— Break —', 'Biology', 'History', 'Free'] },
    { day: 'Wed', periods: ['Biology', 'Chemistry', 'Math', '— Break —', 'English', 'P.E.', 'History'] },
    { day: 'Thu', periods: ['History', 'P.E.', 'English', '— Break —', 'Math', 'Biology', 'Chemistry'] },
    { day: 'Fri', periods: ['Chemistry', 'Biology', 'History', '— Break —', 'P.E.', 'Math', 'English'] },
  ];

  const today = new Date().getDay(); // 0=Sun, 1=Mon...
  const todayIdx = today === 0 || today === 6 ? 0 : today - 1;

  const gradeColor = (g) => g?.startsWith('A') ? '#1E7E4A' : g?.startsWith('B') ? '#226F8A' : '#B47214';

  const announcements = [
    { text: 'Term 2 Exams begin on 2nd December 2026', type: 'exam', date: '2026-11-14' },
    { text: 'Library book returns due by 25th November', type: 'library', date: '2026-11-14' },
    { text: 'Inter-school football match on Saturday', type: 'sports', date: '2026-11-13' },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Student Portal
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Welcome{user ? `, ${user.full_name}` : ''}! Here's your academic overview for Term 2, 2026.
            </p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #125A91, #1687D1)', borderRadius: '14px', padding: '14px 20px', color: '#fff', textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, fontWeight: 600 }}>CLASS</div>
            <div style={{ fontSize: '1rem', fontWeight: 800 }}>Form 3A</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '2px' }}>ADM-2024-001</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Attendance', val: '94.2%', icon: CalendarCheck, color: '#1E7E4A' },
          { label: 'Overall Grade', val: 'B+', icon: Award, color: '#226F8A' },
          { label: 'Subjects', val: subjects.length, icon: BookOpen, color: '#125A91' },
          { label: 'Pending Tasks', val: subjects.reduce((a, s) => a + s.homework, 0), icon: CheckCircle2, color: '#B47214' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: 'var(--bg-surface)', borderRadius: '14px', padding: '20px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{s.label}</span>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} color={s.color} />
                </div>
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: s.color }}>{s.val}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        {/* Subject Grades */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>
            My Subjects & Grades
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {subjects.map(sub => (
              <div key={sub.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{sub.name}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{sub.teacher}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: gradeColor(sub.grade), fontSize: '0.95rem' }}>{sub.grade}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{sub.score}%</div>
                </div>
                {sub.homework > 0 && (
                  <div style={{ background: '#FEF0EE', color: '#C0392B', fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', flexShrink: 0 }}>
                    {sub.homework} task{sub.homework > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Today's Timetable */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#D6AD55" /> Today's Schedule
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(timetable[todayIdx]?.periods || timetable[0].periods).map((period, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '10px', alignItems: 'center',
                  padding: '8px 10px', borderRadius: '8px',
                  background: period.includes('Break') ? 'rgba(214,173,85,0.08)' : 'var(--bg-primary)',
                  border: `1px solid ${period.includes('Break') ? 'rgba(214,173,85,0.2)' : 'var(--border-color)'}`,
                }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', width: '28px', flexShrink: 0 }}>P{i + 1}</span>
                  <span style={{ fontSize: '0.84rem', fontWeight: period.includes('Break') ? 700 : 500, color: period.includes('Break') ? '#B47214' : 'var(--text-primary)' }}>{period}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} color="#226F8A" /> Announcements
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {announcements.map((a, i) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: '10px', background: 'var(--bg-primary)', borderLeft: `3px solid ${a.type === 'exam' ? '#C0392B' : a.type === 'library' ? '#D6AD55' : '#1E7E4A'}`, fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {a.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
