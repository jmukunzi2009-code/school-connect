'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/brand-logo';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Key,
  ChevronRight,
  School,
  FileText,
  UserCheck,
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'School Details', icon: Building, desc: 'Basic school information' },
  { id: 2, title: 'Representative', icon: User, desc: 'Your contact details' },
  { id: 3, title: 'Admin Account', icon: Key, desc: 'Set your login credentials' },
  { id: 4, title: 'Review & Submit', icon: CheckCircle2, desc: 'Confirm and send application' },
];

export default function RegisterSchoolPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    school_name: '',
    school_email: '',
    phone: '',
    country: 'Rwanda',
    district: '',
    address: '',
    school_type: 'secondary',
    website: '',
    rep_name: '',
    rep_position: 'Principal / Headteacher',
    rep_email: '',
    admin_email: '',
    admin_password: '',
    admin_password_confirm: '',
    additional_info: '',
    agreed_to_terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateStep = () => {
    setError(null);
    if (step === 1) {
      if (!formData.school_name || !formData.school_email || !formData.phone || !formData.address) {
        setError('Please fill in all required school fields.');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.rep_name || !formData.rep_email) {
        setError('Please fill in your name and email.');
        return false;
      }
    }
    if (step === 3) {
      if (!formData.admin_email || !formData.admin_password) {
        setError('Please provide your admin email and password.');
        return false;
      }
      if (formData.admin_password.length < 8) {
        setError('Password must be at least 8 characters.');
        return false;
      }
      if (formData.admin_password !== formData.admin_password_confirm) {
        setError('Passwords do not match.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 4));
  };
  const handleBack = () => { setError(null); setStep((s) => Math.max(s - 1, 1)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.agreed_to_terms) {
      setError('You must confirm authorization and agree to the platform terms.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/register-school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit application');
      setSuccessResult(data.application);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = formData.admin_password;
    if (!p) return { level: 0, label: '', color: '#ccc' };
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: score, label: 'Weak', color: '#e74c3c' };
    if (score <= 2) return { level: score, label: 'Fair', color: '#f39c12' };
    if (score <= 3) return { level: score, label: 'Good', color: '#2ecc71' };
    return { level: score, label: 'Strong', color: '#1abc9c' };
  };

  const strength = passwordStrength();

  if (!mounted) return null;

  if (successResult) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0B3557 0%, #125A91 50%, #147FC6 100%)', padding: '40px 20px' }}>
        <div style={{ background: '#fff', borderRadius: '24px', padding: '60px 50px', maxWidth: '580px', width: '100%', textAlign: 'center', boxShadow: '0 40px 80px rgba(0,0,0,0.3)' }}>
          {/* Animated checkmark */}
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #125A91, #1687D1)', margin: '0 auto 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(18,90,145,0.4)', animation: 'successPop 0.5s ease' }}>
            <CheckCircle2 size={46} color="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#125A91', marginBottom: '12px' }}>Application Submitted!</h1>
          <p style={{ color: '#60798C', marginBottom: '32px', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Your school registration application has been submitted to SchoolConnect 360. Our team will review it within 2–5 business days.
          </p>

          <div style={{ background: 'linear-gradient(135deg, #F4FAFF, #EEF2EE)', borderRadius: '16px', padding: '24px', marginBottom: '28px', border: '2px solid #D8EAF6' }}>
            <div style={{ fontSize: '0.8rem', color: '#60798C', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>APPLICATION REFERENCE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#125A91', letterSpacing: '2px', fontFamily: 'monospace' }}>{successResult.reference}</div>
          </div>

          <div style={{ background: '#EFF8FE', border: '1px solid #1687D1', borderRadius: '12px', padding: '16px', marginBottom: '32px', fontSize: '0.9rem', color: '#125A91' }}>
            💡 <strong>Save this reference.</strong> You'll need it to track your application status. Once approved, you'll receive access instructions for your admin account.
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ padding: '12px 28px', borderRadius: '10px', background: '#125A91', color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Return to Home</Link>
            <Link href="/login" style={{ padding: '12px 28px', borderRadius: '10px', background: '#1687D1', color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem' }}>Go to Login</Link>
          </div>
        </div>
        <style>{`@keyframes successPop { 0%{transform:scale(0.5);opacity:0} 80%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }`}</style>
      </div>
    );
  }

  return (
    <div className="registration-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="public-site-header" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" aria-label="SchoolConnect 360 home">
            <BrandLogo />
          </Link>
          <Link href="/login" style={{ padding: '8px 20px', borderRadius: '8px', border: '2px solid #125A91', color: '#125A91', fontWeight: 700, fontSize: '0.9rem' }}>Sign In</Link>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="registration-hero" style={{ background: 'linear-gradient(135deg, #0B3557 0%, #125A91 60%, #147FC6 100%)', padding: '56px 24px 48px', position: 'relative', overflow: 'hidden' }}>
        {/* Background decorations */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(22,135,209,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        {/* Floating dots */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            width: `${6 + (i % 3) * 4}px`, height: `${6 + (i % 3) * 4}px`,
            background: 'rgba(22,135,209,0.3)',
            top: `${10 + (i * 11) % 70}%`,
            left: `${5 + (i * 13) % 90}%`,
            animation: `floatDot ${3 + i * 0.4}s ease-in-out infinite alternate`,
            pointerEvents: 'none',
          }} />
        ))}

        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(22,135,209,0.15)', border: '1px solid rgba(22,135,209,0.4)', borderRadius: '50px', padding: '6px 16px', marginBottom: '20px' }}>
            <School size={14} color="#1687D1" />
            <span style={{ color: '#1687D1', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>SCHOOL REGISTRATION</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, color: '#fff', marginBottom: '16px', lineHeight: 1.2 }}>
            Join the SchoolConnect<br /><span style={{ color: '#1687D1' }}>360 Platform</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '580px', margin: '0 auto' }}>
            Complete this application to register your school. Once approved, you'll get instant access to all platform modules.
          </p>
        </div>
      </div>

      {/* Step Indicators */}
      <div style={{ background: '#fff', borderBottom: '1px solid #D8EAF6', padding: '24px' }}>
        <div className="registration-stepper" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0' }}>
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <React.Fragment key={s.id}>
                <div className="registration-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '80px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: isDone ? '#125A91' : isActive ? '#1687D1' : '#D8EAF6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? '0 0 0 4px rgba(22,135,209,0.25)' : isDone ? '0 0 0 4px rgba(18,90,145,0.15)' : 'none',
                  }}>
                    {isDone ? <CheckCircle2 size={20} color="#fff" /> : <Icon size={20} color={isActive ? '#FFFFFF' : '#7894A8'} />}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isActive ? '#1687D1' : isDone ? '#125A91' : '#7894A8', textAlign: 'center', letterSpacing: '0.3px' }}>{s.title}</div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="registration-step-connector" style={{ flex: 1, height: '3px', background: isDone ? '#125A91' : '#D8EAF6', margin: '0 4px', marginBottom: '20px', transition: 'background 0.3s ease', maxWidth: '80px' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Form */}
      <div className="registration-content" style={{ flex: 1, padding: '40px 24px 60px', maxWidth: '860px', margin: '0 auto', width: '100%' }}>
        {error && (
          <div style={{ background: '#FDF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: '#991B1B' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.95rem' }}>{error}</span>
          </div>
        )}

        <div className="registration-form-card" style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 24px rgba(18,90,145,0.08)', border: '1px solid #D8EAF6', overflow: 'hidden' }}>
          {/* Step 1: School Details */}
          {step === 1 && (
            <div className="registration-form-step" style={{ padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg, #125A91, #1687D1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={24} color="#1687D1" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#125A91' }}>School Information</h2>
                  <p style={{ color: '#60798C', fontSize: '0.9rem' }}>Tell us about your institution</p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '20px' }}>
                <FormField label="School Name *" icon={<Building size={16} />}>
                  <input name="school_name" value={formData.school_name} onChange={handleChange} placeholder="e.g. Kigali Heights International Academy" style={inputStyle} />
                </FormField>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <FormField label="Official School Email *" icon={<Mail size={16} />}>
                    <input name="school_email" type="email" value={formData.school_email} onChange={handleChange} placeholder="info@yourschool.edu" style={inputStyle} />
                  </FormField>
                  <FormField label="Phone Number *" icon={<Phone size={16} />}>
                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+250 788 000 000" style={inputStyle} />
                  </FormField>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <FormField label="Country *" icon={<MapPin size={16} />}>
                    <select name="country" value={formData.country} onChange={handleChange} style={inputStyle}>
                      {['Rwanda', 'Uganda', 'Kenya', 'Tanzania', 'Ethiopia', 'Nigeria', 'Ghana', 'South Africa', 'Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </FormField>
                  <FormField label="District / Region" icon={<MapPin size={16} />}>
                    <input name="district" value={formData.district} onChange={handleChange} placeholder="e.g. Gasabo, Nairobi West" style={inputStyle} />
                  </FormField>
                </div>

                <FormField label="Physical Address *" icon={<MapPin size={16} />}>
                  <input name="address" value={formData.address} onChange={handleChange} placeholder="Street, Area, City" style={inputStyle} />
                </FormField>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <FormField label="School Type *" icon={<School size={16} />}>
                    <select name="school_type" value={formData.school_type} onChange={handleChange} style={inputStyle}>
                      <option value="nursery">Nursery / Pre-School</option>
                      <option value="primary">Primary School</option>
                      <option value="secondary">Secondary School</option>
                      <option value="combined">Primary + Secondary (Combined)</option>
                      <option value="college">College / Institute</option>
                      <option value="special">Special Needs School</option>
                      <option value="vocational">Vocational / Technical</option>
                    </select>
                  </FormField>
                  <FormField label="School Website" icon={<Globe size={16} />}>
                    <input name="website" value={formData.website} onChange={handleChange} placeholder="https://yourschool.com" style={inputStyle} />
                  </FormField>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Representative */}
          {step === 2 && (
            <div className="registration-form-step" style={{ padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg, #1687D1, #125A91)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={24} color="#0B3557" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#125A91' }}>School Representative</h2>
                  <p style={{ color: '#60798C', fontSize: '0.9rem' }}>The authorized person submitting this application</p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <FormField label="Full Name *" icon={<User size={16} />}>
                    <input name="rep_name" value={formData.rep_name} onChange={handleChange} placeholder="John Doe" style={inputStyle} />
                  </FormField>
                  <FormField label="Position / Title *" icon={<Briefcase size={16} />}>
                    <select name="rep_position" value={formData.rep_position} onChange={handleChange} style={inputStyle}>
                      {['Principal / Headteacher', 'School Owner / Proprietor', 'School Director', 'Deputy Headteacher', 'School Board Member', 'Other Authorized Representative'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </FormField>
                </div>

                <FormField label="Representative Email *" icon={<Mail size={16} />}>
                  <input name="rep_email" type="email" value={formData.rep_email} onChange={handleChange} placeholder="representative@yourschool.com" style={inputStyle} />
                </FormField>

                <FormField label="Additional Information" icon={<FileText size={16} />}>
                  <textarea name="additional_info" value={formData.additional_info} onChange={handleChange}
                    placeholder="Any additional information about your school, special programs, accreditations, etc."
                    rows={4} style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }} />
                </FormField>
              </div>
            </div>
          )}

          {/* Step 3: Admin Account */}
          {step === 3 && (
            <div className="registration-form-step" style={{ padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg, #125A91, #125A91)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Key size={24} color="#fff" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#125A91' }}>Admin Account Setup</h2>
                  <p style={{ color: '#60798C', fontSize: '0.9rem' }}>Create credentials for your School Admin dashboard access</p>
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #EEF7F1, #E8F5ED)', border: '1px solid #BFE0CA', borderRadius: '12px', padding: '16px 20px', marginBottom: '28px', display: 'flex', gap: '12px' }}>
                <ShieldCheck size={20} color="#125A91" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.9rem', color: '#125A91', lineHeight: 1.6 }}>
                  <strong>These credentials will be used to access your School Admin dashboard</strong> once your application is approved. Choose a strong password — it protects your entire school's data.
                </div>
              </div>

              <div style={{ display: 'grid', gap: '20px' }}>
                <FormField label="Admin Login Email *" icon={<Mail size={16} />}>
                  <input name="admin_email" type="email" value={formData.admin_email} onChange={handleChange}
                    placeholder="schooladmin@yourschool.com (this will be your login email)" style={inputStyle} />
                </FormField>

                <FormField label="Admin Password *" icon={<Lock size={16} />}>
                  <div style={{ position: 'relative' }}>
                    <input name="admin_password" type={showPassword ? 'text' : 'password'} value={formData.admin_password}
                      onChange={handleChange} placeholder="Minimum 8 characters" style={{ ...inputStyle, paddingRight: '48px' }} />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: '#60798C', padding: '4px' }}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* Password strength bar */}
                  {formData.admin_password && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= strength.level ? strength.color : '#D8EAF6', transition: 'background 0.3s' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: strength.color, fontWeight: 700 }}>Password strength: {strength.label}</span>
                    </div>
                  )}
                </FormField>

                <FormField label="Confirm Password *" icon={<Lock size={16} />}>
                  <div style={{ position: 'relative' }}>
                    <input name="admin_password_confirm" type={showConfirm ? 'text' : 'password'} value={formData.admin_password_confirm}
                      onChange={handleChange} placeholder="Re-enter your password" style={{ ...inputStyle, paddingRight: '48px', borderColor: formData.admin_password_confirm && formData.admin_password !== formData.admin_password_confirm ? '#e74c3c' : undefined }} />
                    <button type="button" onClick={() => setShowConfirm(p => !p)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: '#60798C', padding: '4px' }}>
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formData.admin_password_confirm && formData.admin_password !== formData.admin_password_confirm && (
                    <div style={{ marginTop: '6px', color: '#e74c3c', fontSize: '0.82rem' }}>⚠ Passwords do not match</div>
                  )}
                  {formData.admin_password_confirm && formData.admin_password === formData.admin_password_confirm && (
                    <div style={{ marginTop: '6px', color: '#1687D1', fontSize: '0.82rem' }}>✓ Passwords match</div>
                  )}
                </FormField>

                <div style={{ background: '#EFF8FE', border: '1px solid #B9DFF3', borderRadius: '10px', padding: '14px', fontSize: '0.85rem', color: '#125A91' }}>
                  <strong>Password tips:</strong> Use at least 8 characters. Mix uppercase, numbers, and symbols for a stronger password. Avoid using your school name or common words.
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="registration-form-step" style={{ padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg, #1687D1, #125A91)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={24} color="#fff" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#125A91' }}>Review Application</h2>
                  <p style={{ color: '#60798C', fontSize: '0.9rem' }}>Verify your details before submitting</p>
                </div>
              </div>

              {[
                {
                  title: 'School Details', items: [
                    ['School Name', formData.school_name],
                    ['Email', formData.school_email],
                    ['Phone', formData.phone],
                    ['Country', formData.country],
                    ['District', formData.district || '—'],
                    ['Address', formData.address],
                    ['School Type', formData.school_type],
                    ['Website', formData.website || '—'],
                  ]
                },
                {
                  title: 'Representative', items: [
                    ['Name', formData.rep_name],
                    ['Position', formData.rep_position],
                    ['Email', formData.rep_email],
                  ]
                },
                {
                  title: 'Admin Account', items: [
                    ['Admin Login Email', formData.admin_email],
                    ['Password', '••••••••••••'],
                  ]
                },
              ].map(section => (
                <div key={section.title} style={{ marginBottom: '24px', border: '1px solid #D8EAF6', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ background: '#F4FAFF', padding: '12px 20px', fontWeight: 700, fontSize: '0.85rem', color: '#125A91', letterSpacing: '0.5px', borderBottom: '1px solid #D8EAF6' }}>
                    {section.title.toUpperCase()}
                  </div>
                  <div style={{ padding: '4px 0' }}>
                    {section.items.map(([label, val]) => (
                      <div key={label} style={{ display: 'flex', padding: '10px 20px', borderBottom: '1px solid #F0F2F0' }}>
                        <span style={{ flex: '0 0 180px', fontSize: '0.85rem', color: '#60798C', fontWeight: 600 }}>{label}</span>
                        <span style={{ fontSize: '0.9rem', color: '#202923', fontWeight: 500 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Terms */}
              <label style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', cursor: 'pointer', padding: '20px', background: '#F4FAFF', borderRadius: '12px', border: `2px solid ${formData.agreed_to_terms ? '#125A91' : '#D8EAF6'}` }}>
                <input type="checkbox" name="agreed_to_terms" checked={formData.agreed_to_terms} onChange={handleChange}
                  style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: '#125A91', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', color: '#202923', lineHeight: 1.6 }}>
                  I confirm that I am an authorized representative of this school and that all information provided is accurate. I agree to the SchoolConnect 360{' '}
                  <a href="#" style={{ color: '#125A91', fontWeight: 700, textDecoration: 'underline' }}>Terms of Service</a> and{' '}
                  <a href="#" style={{ color: '#125A91', fontWeight: 700, textDecoration: 'underline' }}>Privacy Policy</a>.
                </span>
              </label>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="registration-form-footer" style={{ padding: '24px 40px', borderTop: '1px solid #D8EAF6', background: '#F4FAFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {step > 1 && (
                <button type="button" onClick={handleBack}
                  style={{ padding: '11px 24px', borderRadius: '10px', border: '2px solid #D8EAF6', background: '#fff', color: '#60798C', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
                  ← Back
                </button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: '#7894A8' }}>Step {step} of {STEPS.length}</span>
              {step < 4 ? (
                <button type="button" onClick={handleNext}
                  style={{ padding: '11px 28px', borderRadius: '10px', background: 'linear-gradient(135deg, #125A91, #1687D1)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(18,90,145,0.25)' }}>
                  Continue <ChevronRight size={18} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={loading || !formData.agreed_to_terms}
                  style={{ padding: '11px 28px', borderRadius: '10px', background: loading ? '#ccc' : 'linear-gradient(135deg, #1687D1, #125A91)', color: '#FFFFFF', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(22,135,209,0.3)' }}>
                  {loading ? 'Submitting...' : (<>Submit Application <ArrowRight size={18} /></>)}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Help text */}
        <p style={{ textAlign: 'center', marginTop: '24px', color: '#7894A8', fontSize: '0.85rem' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#125A91', fontWeight: 700 }}>Sign in here</Link>
          {' '} · Have questions?{' '}
          <Link href="/contact" style={{ color: '#125A91', fontWeight: 700 }}>Contact us</Link>
        </p>
      </div>

      <style>{`
        @keyframes floatDot {
          0% { transform: translateY(0px); opacity: 0.3; }
          100% { transform: translateY(-12px); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

function FormField({ label, icon, children }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: '#202923', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ color: '#60798C' }}>{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1.5px solid #D8EAF6',
  fontSize: '0.95rem',
  color: '#202923',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: 'inherit',
};
