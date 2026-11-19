'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Settings, KeyRound, Building, Bell, LogOut, Edit3, Camera } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user));
  }, []);

  if (!user) return <div style={{ padding: '32px', color: 'var(--text-secondary)' }}>Loading profile...</div>;

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>My Profile</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.95rem' }}>Manage your account settings and credentials.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        {/* Profile Card */}
        <div>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '20px', padding: '32px 24px', border: '1px solid var(--border-color)', textAlign: 'center', marginBottom: '16px' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #123B2A, #1E6A45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: '#D6AD55', margin: '0 auto', boxShadow: '0 8px 24px rgba(18,59,42,0.25)' }}>
                {user.full_name?.charAt(0) || 'U'}
              </div>
              <button style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', borderRadius: '50%', background: '#D6AD55', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={12} color="#0B241B" />
              </button>
            </div>

            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{user.full_name}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>{user.email}</p>

            {/* Role badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {(user.roles || [user.activeRole]).filter(Boolean).map(role => (
                <span key={role} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(18,59,42,0.08)', color: '#123B2A', border: '1px solid rgba(18,59,42,0.15)' }}>
                  {role?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            {[
              { icon: Shield, label: 'Security Settings' },
              { icon: Bell, label: 'Notifications' },
              { icon: Settings, label: 'Preferences' },
            ].map(({ icon: Icon, label }) => (
              <button key={label} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', background: 'none', border: 'none', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, textAlign: 'left' }}>
                <Icon size={16} color="var(--text-secondary)" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Account Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Account Information</h3>
              <button onClick={() => setEditing(!editing)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: '1.5px solid var(--border-color)', background: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-forest)' }}>
                <Edit3 size={14} /> {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {[
                  { label: 'Full Name', value: user.full_name, icon: User },
                  { label: 'Email Address', value: user.email, icon: Mail },
                  { label: 'Phone Number', value: user.phone || '—', icon: Phone },
                  { label: 'Active Role', value: (user.activeRole || '—').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), icon: Shield },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Icon size={12} /> {label.toUpperCase()}
                    </label>
                    {editing ? (
                      <input defaultValue={value} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontSize: '0.9rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }} />
                    ) : (
                      <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
                    )}
                  </div>
                ))}
              </div>
              {editing && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => { setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 3000); }} className="btn-primary" style={{ padding: '10px 24px' }}>Save Changes</button>
                  <button onClick={() => setEditing(false)} className="btn-outline" style={{ padding: '10px 24px' }}>Cancel</button>
                </div>
              )}
              {saved && <div style={{ marginTop: '12px', color: '#1E7E4A', fontSize: '0.88rem', fontWeight: 600 }}>✓ Changes saved successfully</div>}
            </div>
          </div>

          {/* Change Password */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={16} color="var(--text-secondary)" /> Change Password
              </h3>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gap: '14px' }}>
                {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
                  <div key={label}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>{label.toUpperCase()}</label>
                    <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontSize: '0.9rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }} />
                  </div>
                ))}
              </div>
              <button className="btn-primary" style={{ marginTop: '16px', padding: '10px 24px', fontSize: '0.9rem' }}>Update Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
