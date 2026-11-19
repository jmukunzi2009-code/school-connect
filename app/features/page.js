'use client';

import React from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/brand-logo';
import {
  Users,
  BookOpen,
  CalendarCheck,
  Award,
  CreditCard,
  Library,
  HeartPulse,
  Truck,
  ShieldAlert,
  Gavel,
  CheckCircle2,
} from 'lucide-react';

const MODULE_LIST = [
  { icon: Users, title: 'Admissions & Student Directory', desc: 'Single student profile, guardian linkages, auto admission number generator, and cross-department enrollment.' },
  { icon: BookOpen, title: 'Academic Management', desc: 'Academic calendar, terms, departments, classes, streams, subject catalogs, and teacher assignments.' },
  { icon: CalendarCheck, title: 'Student & Staff Attendance', desc: 'Real-time roll calls by stream, clock-in tracking for teachers, absent alerts, and term attendance reports.' },
  { icon: Award, title: 'Exams, Marks & Report Cards', desc: 'Weight-based grading, assessment rubrics, verification by DOS, and one-click term report card publication.' },
  { icon: CreditCard, title: 'Finance, Fees & Invoices', desc: 'Fee structures per class, automated student billing, partial payments, counter cashiering, and receipts.' },
  { icon: Library, title: 'Library Information System', desc: 'ISBN cataloging, copy counts, instant checkout to enrolled students, return tracking, and fine management.' },
  { icon: HeartPulse, title: 'Infirmary Clinic & Health', desc: 'Restricted clinic visit logs, symptom diagnostics, medication dispensing, student allergies, and vitals.' },
  { icon: ShieldAlert, title: 'Confidential Safeguarding', desc: 'Child protection case files with restricted role permissions, intervention plans, and incident tracking.' },
  { icon: Gavel, title: 'Discipline & Welfare', desc: 'Discipline records, behavioral infractions, corrective actions, and parent communication.' },
  { icon: Truck, title: 'Transport Fleet & Boarding', desc: 'Bus route tracking, driver assignments, dormitory room and bed allocations for boarding students.' },
];

export default function FeaturesPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="public-site-header" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-color)', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" aria-label="SchoolConnect 360 home">
            <BrandLogo />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>Home</Link>
            <Link href="/about" style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>About</Link>
            <Link href="/register-school" className="btn-gold" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>Register School</Link>
          </div>
        </div>
      </header>

      <section style={{ padding: '60px 24px', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span className="badge badge-gold" style={{ marginBottom: '12px' }}>ALL 47 INTEGRATED MODULES</span>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--color-deep-forest)', letterSpacing: '-1px' }}>
            The Full Spectrum of School Operations
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '10px' }}>
            Everything your primary, secondary or comprehensive school requires to manage students, staff, academics, and finances.
          </p>
        </div>
      </section>

      <main style={{ padding: '60px 24px', flex: 1, backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="grid-2" style={{ gap: '24px' }}>
            {MODULE_LIST.map((m, i) => {
              const IconComp = m.icon;
              return (
                <div key={i} className="card" style={{ display: 'flex', gap: '18px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(18, 90, 145, 0.08)',
                      color: 'var(--color-forest)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconComp size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.18rem', fontWeight: 700, color: 'var(--color-deep-forest)', marginBottom: '6px' }}>
                      {m.title}
                    </h3>
                    <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {m.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
