'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/brand-logo';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="public-site-header" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-color)', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" aria-label="SchoolConnect 360 home">
            <BrandLogo />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>Home</Link>
            <Link href="/login" className="btn-outline" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>Sign In</Link>
          </div>
        </div>
      </header>

      <main style={{ padding: '60px 24px', flex: 1, backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="badge badge-gold" style={{ marginBottom: '10px' }}>SUPPORT & INQUIRIES</span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
              Get in Touch with our Platform Team
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
              Have questions regarding school onboarding, enterprise pricing, or custom deployment? We are here to assist.
            </p>
          </div>

          <div className="grid-2">
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--color-forest)' }}>
                Platform Support Contacts
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <Mail size={22} style={{ color: 'var(--color-forest)', marginTop: '3px' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Support Email</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>support@schoolconnect360.com</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <Phone size={22} style={{ color: 'var(--color-forest)', marginTop: '3px' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Hotline</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>+250 788 000 360 / +250 788 123 456</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <MapPin size={22} style={{ color: 'var(--color-forest)', marginTop: '3px' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Headquarters</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Innovation City Campus, KG 9 Ave, Kigali</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <CheckCircle2 size={48} style={{ color: '#1E7E4A', margin: '0 auto 16px auto' }} />
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-deep-forest)' }}>
                    Thank you! Message Received.
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '8px' }}>
                    Our representative will reply to {formData.email} within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', color: 'var(--color-deep-forest)' }}>
                    Send an Inquiry
                  </h3>
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea
                      rows={3}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="form-textarea"
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '6px' }}>
                    Send Inquiry <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
