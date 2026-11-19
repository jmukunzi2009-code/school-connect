'use client';

import React from 'react';
import { CreditCard, CheckCircle2, Shield, Sparkles } from 'lucide-react';

export default function SubscriptionsPage() {
  const tiers = [
    {
      name: 'Starter Campus',
      price: '$499 / year',
      schools: 'Small & Nursery Schools',
      features: ['Up to 300 Students', '10 Staff Roles', 'Daily Attendance & Marks', 'Basic Fee Receipts'],
    },
    {
      name: 'Growth Academy',
      price: '$899 / year',
      schools: 'Primary & Secondary Schools',
      features: ['Up to 1,000 Students', 'All 34 User Roles', 'Infirmary & Library Systems', 'Full Invoicing & Receipts'],
    },
    {
      name: 'Enterprise Network',
      price: '$1,200 / year',
      schools: 'Comprehensive & Multi-Campus',
      features: ['Unlimited Students', 'Full 47 Modules Enabled', 'Custom Domain & Database Backups', '24/7 Priority SLA Hotline'],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
          Platform Subscriptions & Billing Tiers
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Manage software license subscriptions, recurring renewals, and enterprise tenant quotas.
        </p>
      </div>

      <div className="grid-3">
        {tiers.map((t, i) => (
          <div key={i} className="card" style={{ borderTop: i === 2 ? '4px solid var(--color-gold)' : '4px solid var(--color-forest)' }}>
            <span className="badge badge-gold" style={{ marginBottom: '12px' }}>{t.schools}</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>{t.name}</h3>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-forest)', margin: '10px 0 16px 0' }}>
              {t.price}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {t.features.map((f, fi) => (
                <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#1E7E4A" /> {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
