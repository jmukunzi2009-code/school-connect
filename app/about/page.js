'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, Target, Eye, ShieldCheck, HeartHandshake, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-color)', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)' }}>
              <GraduationCap size={22} />
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-forest)' }}>
              SchoolConnect <span style={{ color: 'var(--color-gold)' }}>360</span>
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link href="/" style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>Home</Link>
            <Link href="/features" style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>Features</Link>
            <Link href="/login" className="btn-outline" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>Sign In</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '70px 24px', backgroundColor: 'var(--color-forest)', color: '#FFFFFF', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span className="badge badge-gold" style={{ marginBottom: '16px' }}>OUR MISSION & VISION</span>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '18px' }}>
            Transforming African Education Through Seamless Connection
          </h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.9, lineHeight: 1.6 }}>
            SchoolConnect 360 was built on a single, powerful conviction: schools thrive when every department,
            from leadership and teachers to accountants, nurses, and parents, works together on a single, harmonious source of truth.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <main style={{ padding: '80px 24px', flex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="grid-3" style={{ marginBottom: '60px' }}>
            <div className="card">
              <div style={{ color: 'var(--color-forest)', marginBottom: '14px' }}>
                <Target size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Our Mission</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: 1.6 }}>
                To empower schools with enterprise-grade cloud software that streamlines operations, eradicates redundant administrative chores, and puts student learning first.
              </p>
            </div>

            <div className="card">
              <div style={{ color: 'var(--color-gold)', marginBottom: '14px' }}>
                <Eye size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Our Vision</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: 1.6 }}>
                To become the premier institutional standard across primary, secondary, and tertiary schools throughout the continent, connecting over 10,000 campuses.
              </p>
            </div>

            <div className="card">
              <div style={{ color: '#1E7E4A', marginBottom: '14px' }}>
                <ShieldCheck size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Uncompromising Privacy</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: 1.6 }}>
                Every school’s data is strictly isolated in its own workspace. Student medical and counselling records are protected with bank-grade confidential permissions.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
