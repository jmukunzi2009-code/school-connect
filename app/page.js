'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Shield,
  Layers,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  CreditCard,
  HeartPulse,
  Library,
  Truck,
  Building,
  Lock,
  TrendingUp,
  Activity,
  Award,
  CalendarCheck,
  BarChart3,
  Gavel,
  School,
  Globe,
  Star,
  Zap,
  ChevronRight,
  Play,
  Monitor,
  Smartphone,
  Bell,
  FileText,
  UserCheck,
  PieChart,
  MessageSquare,
  Clock,
  CheckSquare,
  Menu,
  X,
} from 'lucide-react';

// ===========================================================
// ANIMATED COUNTER HOOK
// ===========================================================
function useCounter(end, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

// ===========================================================
// MODULES DATA
// ===========================================================
const MODULES = [
  { icon: Users, color: '#123B2A', bg: '#E8F4EE', title: 'Student Management', desc: 'Complete student lifecycle from enrollment to graduation with profiles, records, and history.' },
  { icon: CalendarCheck, color: '#1E7E4A', bg: '#E8F5EE', title: 'Attendance Tracking', desc: 'Real-time daily attendance registers for every class with absence alerts and reports.' },
  { icon: Award, color: '#D6AD55', bg: '#FFF8E8', title: 'Examinations & Grades', desc: 'Exam scheduling, marks entry, automatic grade calculation and official report cards.' },
  { icon: CreditCard, color: '#226F8A', bg: '#E8F4F8', title: 'Finance & Fees', desc: 'Fee structures, invoicing, payment tracking, receipts, and financial analytics.' },
  { icon: Library, color: '#6B4D00', bg: '#FFF5E0', title: 'Library System', desc: 'Digital catalog, book issuance, return tracking, overdue management and fines.' },
  { icon: HeartPulse, color: '#C0392B', bg: '#FEF0EE', title: 'Health & Clinic', desc: 'Secure infirmary visit records, student health profiles, and medical follow-ups.' },
  { icon: Truck, color: '#7B4EA8', bg: '#F3EEF8', title: 'Transport & Boarding', desc: 'Bus routes, driver assignments, student allocations and boarding dormitory management.' },
  { icon: BarChart3, color: '#1E7E4A', bg: '#EBF7F0', title: 'Analytics & Reports', desc: 'Real-time dashboards, trend analysis, and exportable reports for every stakeholder.' },
  { icon: Shield, color: '#123B2A', bg: '#E8EEF4', title: 'Role-Based Access', desc: '34 specialized roles with granular permissions and confidential data protections.' },
  { icon: Bell, color: '#B47214', bg: '#FEF8EE', title: 'Communications', desc: 'Announcements, newsletters, parent broadcasts and cross-platform notifications.' },
  { icon: Gavel, color: '#8B2252', bg: '#F9EEF3', title: 'Discipline Module', desc: 'Conduct records, incident logs, suspension tracking and behavioral follow-ups.' },
  { icon: FileText, color: '#226F8A', bg: '#E8F4F8', title: 'Academic Records', desc: 'Official transcripts, enrolment certificates, results archives and corrections.' },
];

// ===========================================================
// ROLE CARDS
// ===========================================================
const ROLES = [
  { title: 'Super Admin', desc: 'Platform oversight, school applications, subscriptions', icon: Star, color: '#D6AD55' },
  { title: 'School Admin', desc: 'Complete school configuration, accounts, operations', icon: Building, color: '#123B2A' },
  { title: 'Headteacher', desc: 'Academic overview, staff, students, approvals', icon: GraduationCap, color: '#1E7E4A' },
  { title: 'Teachers', desc: 'Classes, attendance, marks, assignments', icon: BookOpen, color: '#226F8A' },
  { title: 'Parents', desc: "Children's performance, attendance, fee balances", icon: Users, color: '#7B4EA8' },
  { title: 'Students', desc: 'Personal timetable, marks, library, announcements', icon: Sparkles, color: '#C0392B' },
  { title: 'Finance Team', desc: 'Invoices, payments, receipts, reconciliation', icon: CreditCard, color: '#B47214' },
  { title: '+27 More Roles', desc: 'Nurse, Librarian, HR, Counsellor, Safeguarding...', icon: Zap, color: '#5E6D62' },
];

// ===========================================================
// HERO SVG ILLUSTRATION (animated dashboard preview)
// ===========================================================
function HeroIllustration() {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '580px', margin: '0 auto' }}>
      {/* Main floating card */}
      <div style={{
        background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px',
        padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        animation: 'floatCard 4s ease-in-out infinite',
      }}>
        {/* Fake dashboard header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#D6AD55', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={18} color="#0B241B" />
          </div>
          <div>
            <div style={{ height: '10px', width: '140px', background: 'rgba(255,255,255,0.7)', borderRadius: '4px', marginBottom: '5px' }} />
            <div style={{ height: '7px', width: '90px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px' }} />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
            {['#4CAF50','#D6AD55','#f44336'].map(c => <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />)}
          </div>
        </div>

        {/* Stat cards row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Students', val: '1,247', color: '#4CAF50', up: '+12' },
            { label: 'Attendance', val: '94.2%', color: '#D6AD55', up: '+2.1%' },
            { label: 'School fees', val: 'RWF 48m', color: '#85DBF4', up: '+8%' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '4px' }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>{s.val}</div>
              <div style={{ fontSize: '0.65rem', color: s.color, fontWeight: 700 }}>{s.up}</div>
            </div>
          ))}
        </div>

        {/* Fake chart bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '60px', marginBottom: '16px' }}>
          {[40, 65, 50, 80, 55, 90, 70, 85, 60, 75].map((h, i) => (
            <div key={i} style={{
              flex: 1, borderRadius: '4px 4px 0 0',
              background: i === 7 ? '#D6AD55' : 'rgba(255,255,255,0.15)',
              height: `${h}%`,
              animation: `barGrow 0.8s ease ${i * 0.08}s both`,
            }} />
          ))}
        </div>

        {/* Activity list */}
        {['Student enrollment completed', 'Fees payment received', 'Attendance marked'].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: ['rgba(76,175,80,0.2)', 'rgba(214,173,85,0.2)', 'rgba(34,111,138,0.2)'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {[
                <CheckCircle2 key="enrollment" size={12} color="#4CAF50" />,
                <CreditCard key="fees" size={12} color="#D6AD55" />,
                <CalendarCheck key="attendance" size={12} color="#226F8A" />,
              ][i]}
            </div>
            <div style={{ height: '8px', flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: '4px' }} />
            <div style={{ height: '8px', width: '40px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }} />
          </div>
        ))}
      </div>

      {/* Floating notification badge */}
      <div style={{
        position: 'absolute', top: '-16px', right: '20px',
        background: '#D6AD55', borderRadius: '12px', padding: '8px 14px',
        boxShadow: '0 8px 24px rgba(214,173,85,0.5)',
        display: 'flex', alignItems: 'center', gap: '6px',
        animation: 'floatBadge 3s ease-in-out infinite',
      }}>
        <Bell size={14} color="#0B241B" />
        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0B241B' }}>3 New Approvals</span>
      </div>

      {/* Floating role badge */}
      <div style={{
        position: 'absolute', bottom: '-14px', left: '24px',
        background: 'rgba(18,59,42,0.9)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(214,173,85,0.3)',
        borderRadius: '12px', padding: '8px 14px',
        display: 'flex', alignItems: 'center', gap: '8px',
        animation: 'floatBadge2 3.5s ease-in-out infinite',
      }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#D6AD55', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GraduationCap size={14} color="#0B241B" />
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Logged in as</div>
          <div style={{ fontSize: '0.82rem', color: '#D6AD55', fontWeight: 700 }}>School Administrator</div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================
// HOW IT WORKS - ANIMATED STEPS
// ===========================================================
function HowItWorksStep({ num, title, desc, icon: Icon, color, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}22, ${color}44)`,
          border: `2px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '0',
        }}>
          <Icon size={32} color={color} />
        </div>
        <div style={{
          position: 'absolute', top: '-6px', right: '-6px',
          width: '28px', height: '28px', borderRadius: '50%',
          background: color, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8rem', fontWeight: 800,
        }}>{num}</div>
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#123B2A', marginBottom: '10px' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', color: '#5E6D62', lineHeight: 1.65, maxWidth: '220px' }}>{desc}</p>
    </div>
  );
}

// ===========================================================
// STAT SECTION
// ===========================================================
function StatSection() {
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const schools = useCounter(500, 1800, started);
  const students = useCounter(85000, 2000, started);
  const roles = useCounter(34, 1200, started);
  const uptime = useCounter(99, 1500, started);

  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.1)' }}>
      {[
        { val: schools + '+', label: 'Schools Trust Us', icon: Building },
        { val: students.toLocaleString() + '+', label: 'Students Managed', icon: Users },
        { val: roles, label: 'Specialized Roles', icon: UserCheck },
        { val: uptime + '.9%', label: 'Platform Uptime', icon: Activity },
      ].map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} style={{ padding: '40px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
            <Icon size={28} color="#D6AD55" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', marginTop: '8px', fontWeight: 600 }}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ===========================================================
// MAIN PAGE
// ===========================================================
export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'inherit' }}>

      {/* ═══════════════════════════════════════════════════
          NAVIGATION
      ═══════════════════════════════════════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid #DCE3DC' : '1px solid transparent',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 2px 20px rgba(18,59,42,0.08)' : 'none',
      }}>
        <div className="home-header-inner" style={{ maxWidth: '1280px', margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #39B6E9, #147FC6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(18,59,42,0.16)' }}>
              <GraduationCap size={24} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#125A91', letterSpacing: '-0.5px', lineHeight: 1 }}>
                SchoolConnect <span style={{ color: '#1687D1' }}>360</span>
              </div>
              <div style={{ fontSize: '0.62rem', color: '#5E6D62', fontWeight: 700, letterSpacing: '1px' }}>ENTERPRISE SCHOOL OS</div>
            </div>
          </Link>

          <button
            type="button"
            className="home-menu-toggle"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <nav className={`home-nav${mobileMenuOpen ? ' is-open' : ''}`}>
            {[['Features', '/features'], ['About', '/about'], ['Contact', '/contact']].map(([label, href]) => (
              <Link key={label} href={href} onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600, color: '#5E6D62', fontSize: '0.95rem', transition: 'color 0.2s' }}>{label}</Link>
            ))}
          </nav>

          <div className={`home-actions${mobileMenuOpen ? ' is-open' : ''}`}>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ padding: '9px 20px', borderRadius: '8px', border: '2px solid #DCE3DC', color: '#123B2A', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s' }}>Sign In</Link>
            <Link href="/register-school" onClick={() => setMobileMenuOpen(false)} style={{ padding: '9px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #1687D1, #16A8DC)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(18,59,42,0.16)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Register School <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════ */}
      <section className="home-hero" style={{ background: 'linear-gradient(118deg, #0879BC 0%, #078DCF 48%, #10A9D6 100%)', padding: 'clamp(56px,8vw,96px) 24px', position: 'relative', overflow: 'hidden', minHeight: 'min(820px, calc(100vh - 74px))', display: 'flex', alignItems: 'center' }}>
        {/* Background geometric shapes */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {/* Large circle top right */}
          <div style={{ position: 'absolute', top: '-150px', right: '-150px', width: '500px', height: '500px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)', animation: 'rotateSlow 20s linear infinite' }} />
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '340px', height: '340px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.13)' }} />
          {/* Grid dots pattern */}
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.07 }}>
            <defs>
              <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#FFFFFF" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
          {/* Glow blobs */}
          <div style={{ position: 'absolute', top: '20%', left: '5%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,230,245,0.22) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          {/* Animated flowing lines */}
          <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', opacity: 0.08 }} viewBox="0 0 1440 200">
            <path d="M0,160 C240,80 480,200 720,120 C960,40 1200,160 1440,100 L1440,200 L0,200 Z" fill="#FFFFFF" />
          </svg>
        </div>

        <div className="home-hero-inner" style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          {/* Left text */}
          <div className="home-hero-copy">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.32)', borderRadius: '50px', padding: '8px 18px', marginBottom: '28px', animation: 'fadeInDown 0.6s ease' }}>
              <Sparkles size={14} color="#FFE0A0" />
              <span style={{ color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>MADE FOR RWANDAN SCHOOLS</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: '24px', animation: 'fadeInDown 0.6s ease 0.1s both', letterSpacing: '-1px' }}>
              One school.<br />
              One connected<br />
              <span style={{ color: '#FFE0A0' }}>Rwandan campus.</span>
            </h1>

            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.75, marginBottom: '32px', animation: 'fadeInDown 0.6s ease 0.2s both', maxWidth: '500px' }}>
              SchoolConnect 360 brings students, families, teachers and school leaders together — from class attendance and marks to fees in Rwandan francs.
            </p>

            <div className="home-hero-actions" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', animation: 'fadeInDown 0.6s ease 0.3s both' }}>
              <Link href="/register-school" style={{ padding: '15px 28px', borderRadius: '12px', background: '#FFFFFF', color: '#0879BC', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(0,53,91,0.2)', transition: 'all 0.2s' }}>
                Register Your School <ArrowRight size={18} />
              </Link>
              <Link href="/login" style={{ padding: '15px 28px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(8px)' }}>
                <Play size={16} /> View Demo
              </Link>
            </div>

            {/* Trust signals */}
            <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '20px', animation: 'fadeInDown 0.6s ease 0.4s both', flexWrap: 'wrap' }}>
              {['✓ Rwanda-ready workflows', '✓ RWF fee tracking', '✓ 34 role types'].map(t => (
                <span key={t} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Right illustration */}
          <div className="home-hero-art" style={{ animation: 'fadeInRight 0.8s ease 0.3s both' }}>
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          STATS BANNER
      ═══════════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg, #0B241B, #123B2A)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <StatSection />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: 'clamp(60px,8vw,100px) 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EEF4F1', borderRadius: '50px', padding: '6px 16px', marginBottom: '16px' }}>
              <Zap size={14} color="#123B2A" />
              <span style={{ color: '#123B2A', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px' }}>HOW IT WORKS</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, color: '#123B2A', marginBottom: '14px' }}>
              From Registration to <span style={{ color: '#D6AD55' }}>Full Operation</span>
            </h2>
            <p style={{ color: '#5E6D62', fontSize: '1.05rem', maxWidth: '540px', margin: '0 auto', lineHeight: 1.7 }}>
              Get your school up and running in four simple steps.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', position: 'relative' }}>
            {/* Connecting line */}
            <div style={{ position: 'absolute', top: '40px', left: '12.5%', right: '12.5%', height: '2px', background: 'linear-gradient(to right, #DCE3DC, #D6AD55, #DCE3DC)', zIndex: 0 }} />

            <HowItWorksStep num="1" title="Register School" icon={Building} color="#123B2A" delay={0}
              desc="Submit your school's registration application with all details through our secure portal." />
            <HowItWorksStep num="2" title="Application Review" icon={CheckSquare} color="#D6AD55" delay={150}
              desc="Our team reviews and approves your application within 2–5 business days." />
            <HowItWorksStep num="3" title="Set Up Workspace" icon={Settings2} color="#226F8A" delay={300}
              desc="Configure your school profile, academic year, classes, subjects, and add your team." />
            <HowItWorksStep num="4" title="Go Live!" icon={Zap} color="#1E7E4A" delay={450}
              desc="All roles are active. Teachers, parents, students — everyone connected, working together." />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          MODULES GRID
      ═══════════════════════════════════════════════════ */}
      <section style={{ background: '#F7F8F5', padding: 'clamp(60px,8vw,100px) 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EEF4F1', borderRadius: '50px', padding: '6px 16px', marginBottom: '16px' }}>
              <Layers size={14} color="#123B2A" />
              <span style={{ color: '#123B2A', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px' }}>PLATFORM MODULES</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, color: '#123B2A', marginBottom: '14px' }}>
              Everything a School <span style={{ color: '#D6AD55' }}>Needs</span>
            </h2>
            <p style={{ color: '#5E6D62', fontSize: '1.05rem', maxWidth: '580px', margin: '0 auto', lineHeight: 1.7 }}>
              12 fully integrated management modules covering every aspect of school operations.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {MODULES.map(({ icon: Icon, color, bg, title, desc }) => (
              <ModuleCard key={title} Icon={Icon} color={color} bg={bg} title={title} desc={desc} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          ROLE SECTION
      ═══════════════════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: 'clamp(60px,8vw,100px) 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            {/* Text */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EEF4F1', borderRadius: '50px', padding: '6px 16px', marginBottom: '20px' }}>
                <UserCheck size={14} color="#123B2A" />
                <span style={{ color: '#123B2A', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px' }}>34 SPECIALIZED ROLES</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, color: '#123B2A', marginBottom: '16px', lineHeight: 1.2 }}>
                Every Person.<br />
                <span style={{ color: '#D6AD55' }}>Their Perfect View.</span>
              </h2>
              <p style={{ color: '#5E6D62', fontSize: '1.05rem', lineHeight: 1.75, marginBottom: '28px' }}>
                SchoolConnect 360 provides precisely tailored dashboards for each of the 34 roles in a school. No role sees more than it needs — and everyone sees exactly what they need.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {['Granular permission engine — no accidental data exposure', 'Confidential modules: Clinic, Counselling, Safeguarding', 'Multi-school access with independent role contexts', 'Role-switching for users with multiple responsibilities'].map(item => (
                  <div key={item} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <CheckCircle2 size={18} color="#1E7E4A" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.95rem', color: '#202923' }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/register-school" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '10px', background: '#123B2A', color: '#fff', fontWeight: 700 }}>
                Start Your School <ArrowRight size={16} />
              </Link>
            </div>

            {/* Role cards grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {ROLES.map(({ title, desc, icon: Icon, color }) => (
                <div key={title} style={{ padding: '18px', borderRadius: '14px', border: '1.5px solid #E8ECE8', background: '#F7F8F5', transition: 'all 0.2s' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#202923', marginBottom: '4px' }}>{title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#5E6D62', lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          DESIGN/DEVICE SHOWCASE
      ═══════════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg, #0B241B 0%, #123B2A 100%)', padding: 'clamp(60px,8vw,100px) 24px', position: 'relative', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', opacity: 0.06 }} viewBox="0 0 1440 200">
          <path d="M0,80 C360,160 720,0 1080,100 C1260,150 1380,60 1440,80 L1440,200 L0,200 Z" fill="#D6AD55" />
        </svg>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>
            Accessible on <span style={{ color: '#D6AD55' }}>Every Device</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', marginBottom: '48px', maxWidth: '480px', margin: '0 auto 48px' }}>
            Fully responsive design — manage your school from desktop, tablet, or mobile, anywhere in the world.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
            {[
              { icon: Monitor, label: 'Desktop Dashboard', desc: 'Full-featured admin & analytics' },
              { icon: Smartphone, label: 'Mobile Responsive', desc: 'On-the-go access for all roles' },
              { icon: Globe, label: 'Web-Based', desc: 'No installation required' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={30} color="#D6AD55" />
                </div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{label}</div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', maxWidth: '140px', textAlign: 'center' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TESTIMONIALS / BENEFITS
      ═══════════════════════════════════════════════════ */}
      <section style={{ background: '#F7F8F5', padding: 'clamp(60px,8vw,100px) 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 900, color: '#123B2A', marginBottom: '14px' }}>
              Why Schools <span style={{ color: '#D6AD55' }}>Choose Us</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { icon: Shield, color: '#123B2A', title: 'Bank-Level Security', desc: 'End-to-end encrypted data storage, role-based access controls and comprehensive audit trails for every action.' },
              { icon: TrendingUp, color: '#D6AD55', title: 'Real-Time Insights', desc: 'Live dashboards give headteachers, owners and admins instant visibility into attendance, fees, and performance.' },
              { icon: Clock, color: '#1E7E4A', title: 'Save 10+ Hours/Week', desc: 'Automate attendance registers, grade calculations, fee invoicing and report generation — focus on teaching.' },
              { icon: Globe, color: '#226F8A', title: 'Multi-School Support', desc: 'Managing a network of schools? One platform, centralized oversight, independent school workspaces.' },
              { icon: MessageSquare, color: '#7B4EA8', title: 'Parent Engagement', desc: 'Parents get real-time access to their children\'s attendance, grades, and fees — building school community trust.' },
              { icon: Award, color: '#B47214', title: 'Exam Excellence', desc: 'From marks entry to official report cards — the entire examination workflow handled in one integrated system.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #E8ECE8', boxShadow: '0 2px 12px rgba(18,59,42,0.05)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#202923', marginBottom: '10px' }}>{title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#5E6D62', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg, #071A11 0%, #0B241B 50%, #123B2A 100%)', padding: 'clamp(60px,8vw,100px) 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <svg width="100%" height="100%" style={{ opacity: 0.05 }}>
            <defs>
              <pattern id="dots2" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#D6AD55" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots2)" />
          </svg>
        </div>
        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🏫</div>
          <h2 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, color: '#fff', marginBottom: '20px', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            Ready to Transform<br />
            <span style={{ color: '#D6AD55' }}>Your School?</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '40px' }}>
            Join hundreds of schools already managing smarter with SchoolConnect 360. Register today and get your school connected.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register-school" style={{ padding: '16px 36px', borderRadius: '12px', background: 'linear-gradient(135deg, #D6AD55, #C29A44)', color: '#0B241B', fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(214,173,85,0.4)' }}>
              Register Your School <ArrowRight size={18} />
            </Link>
            <Link href="/contact" style={{ padding: '16px 28px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>
              Talk to Us
            </Link>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '24px' }}>
            Free setup assistance · No hidden fees · Cancel anytime
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════ */}
      <footer style={{ background: '#071A11', color: 'rgba(255,255,255,0.65)', padding: '48px 24px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#123B2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={18} color="#D6AD55" />
                </div>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>SchoolConnect <span style={{ color: '#D6AD55' }}>360</span></span>
              </div>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.7, maxWidth: '280px' }}>
                One Platform. Every School. Connected for Success. The complete enterprise school management operating system.
              </p>
            </div>
            {[
              { title: 'Platform', links: ['Features', 'About', 'Contact', 'Register School'] },
              { title: 'Solutions', links: ['School Owners', 'Headteachers', 'Teachers', 'Parents'] },
              { title: 'Company', links: ['About Us', 'Privacy Policy', 'Terms of Service', 'Support'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '16px' }}>{col.title.toUpperCase()}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {col.links.map(l => <a key={l} href="#" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}>{l}</a>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.82rem' }}>© 2026 SchoolConnect 360. All rights reserved.</span>
            <span style={{ fontSize: '0.82rem' }}>Built with ❤️ for schools everywhere</span>
          </div>
        </div>
      </footer>

      {/* Global animations */}
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-6px) rotate(0deg); }
        }
        @keyframes floatBadge2 {
          0%, 100% { transform: translateY(0px) rotate(1deg); }
          50% { transform: translateY(-8px) rotate(-1deg); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes barGrow {
          from { transform: scaleY(0); transform-origin: bottom; }
          to { transform: scaleY(1); transform-origin: bottom; }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

function ModuleCard({ Icon, color, bg, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#fff' : '#fff',
        borderRadius: '16px',
        padding: '24px',
        border: hovered ? `1.5px solid ${color}44` : '1.5px solid #E8ECE8',
        boxShadow: hovered ? `0 8px 32px ${color}18` : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        cursor: 'default',
      }}>
      <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
        <Icon size={24} color={color} />
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#202923', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '0.85rem', color: '#5E6D62', lineHeight: 1.65 }}>{desc}</p>
    </div>
  );
}

// Needed placeholder (Settings2 not in lucide – use Settings)
function Settings2(props) {
  return <Layers {...props} />;
}
