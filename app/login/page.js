'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  KeyRound,
  CheckCircle2,
  School,
  ChevronRight,
  UserPlus,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (userEmail, userPassword) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #edf4ee 0%, #f8f6f1 45%, #eef5f3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
      <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexWrap: 'wrap', gap: '28px', alignItems: 'stretch' }}>
        <div style={{ flex: '1.1 1 420px', minWidth: '320px', background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(18,59,42,0.08)', borderRadius: '30px', boxShadow: '0 24px 70px rgba(15,29,24,0.12)', backdropFilter: 'blur(12px)', padding: '28px 28px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #123B2A, #1E7E4A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(18,59,42,0.2)' }}>
                <GraduationCap size={22} color="#F2C66D" />
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#123B2A' }}>SchoolConnect <span style={{ color: '#D6AD55' }}>360</span></div>
            </Link>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#5E6D62', fontWeight: 700, fontSize: '0.82rem' }}>
              Home <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ marginBottom: '26px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(214,173,85,0.12)', color: '#7F5B1A', padding: '8px 12px', borderRadius: '999px', border: '1px solid rgba(214,173,85,0.35)', fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.9px', textTransform: 'uppercase' }}>
              <ShieldCheck size={14} /> Secure access
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0B241B', marginTop: '18px', letterSpacing: '-0.06em' }}>Welcome back</h1>
            <p style={{ color: '#5E6D62', fontSize: '0.98rem', marginTop: '8px', lineHeight: 1.5 }}>Sign in to your workspace and continue managing your school, students, staff, and reports.</p>
          </div>

          {error && (
            <div style={{ background: '#FEF3F3', color: '#9B1C1C', border: '1px solid #F6C2C2', borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', fontSize: '0.9rem', fontWeight: 600 }}>
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder="name@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '44px', background: '#F9FBF9', borderRadius: '14px', border: '1px solid rgba(18,59,42,0.08)', height: '52px' }}
                />
                <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#5E6D62' }} />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <Link href="#" style={{ fontSize: '0.8rem', color: '#1E7E4A', fontWeight: 700 }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '44px', background: '#F9FBF9', borderRadius: '14px', border: '1px solid rgba(18,59,42,0.08)', height: '52px' }}
                />
                <KeyRound size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#5E6D62' }} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', height: '52px', borderRadius: '14px', fontWeight: 800, fontSize: '1rem', marginTop: '6px' }}>
              {loading ? 'Signing in...' : 'Sign in to dashboard'} <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: '24px', borderTop: '1px solid rgba(18,59,42,0.08)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 800, color: '#123B2A', fontSize: '0.79rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <Sparkles size={14} color="#1687D1" /> Explore role dashboards
            </div>
            <div className="demo-role-grid">
              {[
                ['jmukunzi2009@gmail.com', 'godson2009', '👑 Super Admin'],
                ['principal@kigaliheights.edu', 'School2026!', '🎓 Headteacher'],
                ['admin@kigaliheights.edu', 'School2026!', '⚙️ School Admin'],
                ['teacher@kigaliheights.edu', 'School2026!', '📚 Subject Teacher'],
                ['classteacher@kigaliheights.edu', 'School2026!', '🧑‍🏫 Class Teacher'],
                ['bursar@kigaliheights.edu', 'School2026!', '💳 Bursar / Finance'],
                ['librarian@kigaliheights.edu', 'School2026!', '📖 Librarian'],
                ['registrar@kigaliheights.edu', 'School2026!', '📝 Registrar'],
                ['nurse@kigaliheights.edu', 'School2026!', '🩺 School Nurse'],
              ].map(([userEmail, userPassword, label]) => (
                <button key={label} type="button" onClick={() => fillQuickDemo(userEmail, userPassword)} className="demo-role-button">
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#125A91' }}>{label}</div>
                  <div style={{ fontSize: '0.7rem', color: '#60798C', marginTop: '3px' }}>Fill demo sign-in</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '0.9rem', color: '#5E6D62' }}>
            Don’t have an account yet?{' '}
            <Link href="/register-school" style={{ color: '#123B2A', fontWeight: 800 }}>Create your school account</Link>
          </div>
        </div>

        <div style={{ flex: '0.9 1 420px', minWidth: '280px', minHeight: '680px', position: 'relative', borderRadius: '30px', overflow: 'hidden', backgroundImage: 'linear-gradient(140deg, rgba(11,36,27,0.78), rgba(18,59,42,0.72)), url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 24px 70px rgba(15,29,24,0.18)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,36,27,0.08), rgba(11,36,27,0.55))' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '34px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', padding: '8px 14px', color: '#F4E7C8', fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <School size={14} /> School operations
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={20} color="#D6AD55" />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.76rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#E8F1EB', opacity: 0.9 }}>Unified campus platform</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.3rem)', lineHeight: 1.06, color: '#FFFFFF', marginTop: '14px', maxWidth: '400px', letterSpacing: '-0.06em' }}>All your school systems in one digital campus.</h2>
              <p style={{ marginTop: '14px', color: 'rgba(255,255,255,0.84)', fontSize: '1rem', maxWidth: '420px', lineHeight: 1.7 }}>Track attendance, fees, student progress, staff activity, and institutional performance from one secure dashboard.</p>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {[{ label: 'Students connected', value: '12k+' }, { label: 'Attendance synced', value: '96.4%' }, { label: 'Operational insights', value: '24/7' }].map((item, idx) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '16px', padding: '14px 16px', backdropFilter: 'blur(8px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: idx === 0 ? 'rgba(214,173,85,0.18)' : idx === 1 ? 'rgba(30,126,74,0.18)' : 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {idx === 0 ? <UserPlus size={16} color="#F2C66D" /> : idx === 1 ? <BarChart3 size={16} color="#BFE4C7" /> : <ShieldCheck size={16} color="#FFFFFF" />}
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{item.label}</span>
                  </div>
                  <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1rem' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
