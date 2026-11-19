'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/brand-logo';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
} from 'lucide-react';

const DEMO_ROLES = [
  ['jmukunzi2009@gmail.com', 'godson2009', 'Super Admin'],
  ['principal@kigaliheights.edu', 'School2026!', 'Headteacher'],
  ['admin@kigaliheights.edu', 'School2026!', 'School Admin'],
  ['teacher@kigaliheights.edu', 'School2026!', 'Subject Teacher'],
  ['classteacher@kigaliheights.edu', 'School2026!', 'Class Teacher'],
  ['bursar@kigaliheights.edu', 'School2026!', 'Bursar / Finance'],
  ['librarian@kigaliheights.edu', 'School2026!', 'Librarian'],
  ['registrar@kigaliheights.edu', 'School2026!', 'Registrar'],
  ['nurse@kigaliheights.edu', 'School2026!', 'School Nurse'],
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="SchoolConnect 360 overview">
        <div className="auth-story-top">
          <Link href="/" className="auth-brand auth-brand-light">
            <BrandLogo variant="light" size="small" />
          </Link>
          <span className="auth-secure-pill"><ShieldCheck size={15} /> Secure school workspace</span>
        </div>

        <div className="auth-story-copy">
          <span className="auth-eyebrow">One connected campus</span>
          <h1>Better school days start with a clearer view.</h1>
          <p>Bring classes, attendance, student progress, and school operations together in one trusted workspace.</p>
        </div>

        <div className="auth-story-highlights">
          {[
            ['01', 'Teaching & learning', 'Keep class work and student progress in reach.'],
            ['02', 'Attendance & wellbeing', 'Spot changes early and follow up with care.'],
            ['03', 'School-wide insights', 'Give every team the view they need to act.'],
          ].map(([number, title, description]) => (
            <div className="auth-story-highlight" key={number}>
              <span>{number}</span>
              <div><strong>{title}</strong><small>{description}</small></div>
              <CheckCircle2 size={17} />
            </div>
          ))}
        </div>
      </section>

      <section className="auth-content">
        <div className="auth-mobile-brand">
          <Link href="/" className="auth-brand">
            <BrandLogo size="small" />
          </Link>
          <Link href="/" className="auth-home-link">Home</Link>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-form-heading">
            <span className="auth-eyebrow">Welcome back</span>
            <h2>Sign in to your account</h2>
            <p>Use your school account to continue to your workspace.</p>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <span className="is-active" role="tab" aria-selected="true">Sign in</span>
            <Link href="/register-school" role="tab" aria-selected="false">Register a school</Link>
          </div>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email address</label>
              <div className="auth-input-wrap">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="name@school.edu"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <KeyRound size={18} aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="form-input"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary auth-submit">
              {loading ? 'Signing in…' : 'Sign in to your workspace'} <ArrowRight size={18} />
            </button>
          </form>

          <details className="auth-demo-details">
            <summary><span>Explore demo role dashboards</span><span>Show accounts</span></summary>
            <p>Choose an account to fill the sign-in form. Demo credentials are for this sample school only.</p>
            <div className="demo-role-grid">
              {DEMO_ROLES.map(([userEmail, userPassword, label]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setEmail(userEmail);
                    setPassword(userPassword);
                    setError(null);
                  }}
                  className="demo-role-button"
                >
                  <strong>{label}</strong>
                  <span>Fill demo sign-in</span>
                </button>
              ))}
            </div>
          </details>

          <p className="auth-register-prompt">
            New to SchoolConnect? <Link href="/register-school">Register your school</Link>
          </p>
        </div>

        <p className="auth-footer">© SchoolConnect 360 · Secure access for your school community</p>
      </section>
    </main>
  );
}
