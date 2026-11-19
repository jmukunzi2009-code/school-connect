'use client';

import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Building, Shield } from 'lucide-react';

export default function SchoolSettingsPage() {
  const [settings, setSettings] = useState({
    name: 'Kigali Heights International Academy',
    motto: 'Excellence, Integrity and Innovation',
    email: 'info@kigaliheights.edu',
    phone: '+250 788 123 456',
    address: 'KG 543 St, Kigali, Rwanda',
    currency: 'USD ($)',
    timezone: 'UTC+02:00 (Kigali)',
    enable_boarding: true,
    enable_transport: true,
    enable_clinic: true,
    enable_cafeteria: true,
    enable_library: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
          School Workspace Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Configure institutional profile, active operational modules, and currency standards.
        </p>
      </div>

      {saved && (
        <div style={{ backgroundColor: '#E6F5EC', color: '#126338', padding: '14px 18px', borderRadius: '8px', border: '1px solid #B7E4C7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> School settings saved and synchronized across active modules!
        </div>
      )}

      <form onSubmit={handleSave} className="card">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-forest)', marginBottom: '16px' }}>
          Institutional Identity
        </h3>

        <div className="form-group">
          <label className="form-label">School Name</label>
          <input
            type="text"
            required
            value={settings.name}
            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">School Motto</label>
          <input
            type="text"
            value={settings.motto}
            onChange={(e) => setSettings({ ...settings, motto: e.target.value })}
            className="form-input"
          />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Official Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Hotline Phone</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="form-input"
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Operating Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="form-select"
            >
              <option value="USD ($)">USD ($)</option>
              <option value="RWF (Frw)">RWF (Frw)</option>
              <option value="UGX (USh)">UGX (USh)</option>
              <option value="KES (KSh)">KES (KSh)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Timezone</label>
            <input
              type="text"
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="form-input"
            />
          </div>
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-forest)', margin: '24px 0 16px 0' }}>
          Operational Modules Toggles
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { key: 'enable_library', label: 'Library Management System' },
            { key: 'enable_clinic', label: 'Health & Infirmary Clinic' },
            { key: 'enable_transport', label: 'Student Fleet & Bus Routes' },
            { key: 'enable_boarding', label: 'Boarding & Dormitory Allocations' },
            { key: 'enable_cafeteria', label: 'Daily Cafeteria & Meal Menus' },
          ].map((m) => (
            <label key={m.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings[m.key]}
                onChange={(e) => setSettings({ ...settings, [m.key]: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-forest)' }}
              />
              <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{m.label}</span>
            </label>
          ))}
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Save size={18} /> Save Workspace Settings
        </button>
      </form>
    </div>
  );
}
