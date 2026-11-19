'use client';
/**
 * FINANCE PAGE — Class-first payment flow
 * Cashier / Bursar / School Admin:
 *   1. See class cards with payment summary
 *   2. Click a class → see students in that class with their balance
 *   3. Click "Pay" on a student → record payment modal
 *   4. Receipt is generated
 * Headteacher / School Owner:
 *   - View-only: class cards + charts, no payment recording
 */

import React, { useState, useEffect } from 'react';
import {
  CreditCard, Users, ArrowLeft, Search, CheckCircle2,
  AlertCircle, Printer, X, TrendingUp, DollarSign,
  FileText, PieChart, BarChart3, Receipt,
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import { useLanguage } from '@/lib/i18n';

const FMT = (v, cur = 'RWF', locale = 'en-RW') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: cur, maximumFractionDigits: 0, currencyDisplay: 'code' }).format(Number(v) || 0);

const pct = (paid, total) => total > 0 ? Math.round((paid / total) * 100) : 0;

const PIE_COLORS = ['#1E7E4A', '#D6AD55', '#C0392B'];

export default function FinancePage() {
  const { language, t } = useLanguage();
  const locale = { en: 'en-RW', rw: 'rw-RW', fr: 'fr-FR' }[language] || 'en-RW';
  const formatMoney = value => FMT(value, currency, locale);
  const [view, setView]           = useState('classes');   // 'classes' | 'students'
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses]     = useState([]);
  const [students, setStudents]   = useState([]);
  const [payments, setPayments]   = useState([]);
  const [totals, setTotals]       = useState({});
  const [currency, setCurrency]   = useState('RWF');
  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [studLoading, setStudLoading] = useState(false);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [successMsg, setSuccessMsg] = useState(null);

  // Payment modal
  const [payModal, setPayModal]   = useState(null); // {invoice}
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [payerName, setPayerName] = useState('');
  const [refCode, setRefCode]     = useState('');
  const [paying, setPaying]       = useState(false);

  // Receipt modal
  const [receiptModal, setReceiptModal] = useState(null);

  // ─── Load overview ─────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/finance');
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || 'Failed to load finance data.');
        setActiveRole(d.role);
        setCurrency(d.currency || 'RWF');
        setClasses(d.classes || []);
        setPayments(d.payments || []);
        setTotals(d.totals || {});
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const canPay = ['bursar', 'cashier', 'school_admin'].includes(activeRole);

  // ─── Load students in a class ──────────────────────────
  const openClass = async (cls) => {
    setSelectedClass(cls);
    setView('students');
    setSearch('');
    setStudLoading(true);
    try {
      const res = await fetch(`/api/finance?classId=${cls.id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load this class.');
      }
      const d = await res.json();
      setStudents(d.invoices || []);
    } catch (e) { setError(e.message); }
    finally { setStudLoading(false); }
  };

  // ─── Open payment modal ────────────────────────────────
  const openPay = (inv) => {
    setPayModal(inv);
    setPayAmount(String(inv.balance));
    setPayerName(`${inv.first_name}'s Guardian`);
    setRefCode('');
    setPayMethod('cash');
  };

  // ─── Record payment ────────────────────────────────────
  const handlePay = async (e) => {
    e.preventDefault();
    setPaying(true);
    setError(null);
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: payModal.id,
          amount: payAmount,
          payment_method: payMethod,
          paid_by_name: payerName,
          reference_code: refCode,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Payment failed');

      setReceiptModal({
        receiptNumber: d.receipt?.receiptNumber,
        studentName: `${payModal.first_name} ${payModal.last_name}`,
        admissionNumber: payModal.admission_number,
        className: selectedClass?.name,
        amount: d.receipt?.amount,
        paymentMethod: payMethod,
        date: d.receipt?.date || new Date().toISOString(),
        balanceRemaining: d.receipt?.balanceRemaining ?? (payModal.balance - parseFloat(payAmount)),
        invoiceNumber: payModal.invoice_number,
      });
      setPayModal(null);
      setSuccessMsg(t('finance.paymentSuccess')
        .replace('{amount}', formatMoney(payAmount))
        .replace('{name}', payModal.first_name));
      setTimeout(() => setSuccessMsg(null), 4000);

      // Refresh student list
      if (selectedClass) {
        const res2 = await fetch(`/api/finance?classId=${selectedClass.id}`);
        if (!res2.ok) {
          const data = await res2.json();
          throw new Error(`Payment was recorded, but the student list could not be refreshed: ${data.error || 'Please reload the page.'}`);
        }
        const d2 = await res2.json();
        setStudents(d2.invoices || []);
      }

      const overviewRes = await fetch('/api/finance');
      if (!overviewRes.ok) {
        const data = await overviewRes.json();
        throw new Error(`Payment was recorded, but finance totals could not be refreshed: ${data.error || 'Please reload the page.'}`);
      }
      const overview = await overviewRes.json();
      setClasses(overview.classes || []);
      setPayments(overview.payments || []);
      setTotals(overview.totals || {});
      if (selectedClass) {
        const refreshedClass = overview.classes?.find(cls => cls.id === selectedClass.id);
        if (refreshedClass) setSelectedClass(refreshedClass);
      }
    } catch (e) { setError(e.message); }
    finally { setPaying(false); }
  };

  // ─── Filter students ───────────────────────────────────
  const filteredStudents = students.filter(s =>
    `${s.first_name} ${s.last_name} ${s.admission_number}`.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Chart data ────────────────────────────────────────
  const pieData = [
    { name: t('finance.fullyPaid'), value: classes.filter(c => c.paid_pct >= 100).length },
    { name: t('finance.partial'), value: classes.filter(c => c.paid_pct > 0 && c.paid_pct < 100).length },
    { name: t('finance.unpaid'), value: classes.filter(c => c.paid_pct === 0).length },
  ];
  const barData = classes.slice(0, 8).map(c => ({
    name: c.name?.replace('Senior ', 'S').replace('Primary ', 'P') || 'Class',
    paid: Math.round((c.total_collected || 0) / 1000),
    outstanding: Math.round((c.total_outstanding || 0) / 1000),
  }));

  if (loading) return <Loading />;

  return (
    <div className="dashboard-finance-page" style={{ padding: '28px', maxWidth: '1300px' }}>
      {/* ══ Header ══ */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          {view === 'students' && (
            <button onClick={() => { setView('classes'); setSelectedClass(null); setStudents([]); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#60798C', fontSize: '0.85rem', fontWeight: 600 }}>
              <ArrowLeft size={15} /> {t('finance.backClasses')}
            </button>
          )}
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {view === 'classes' ? t('finance.title') : `${selectedClass?.name} — ${t('finance.feeCollection')}`}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {view === 'classes' ? t('finance.classesPrompt') : t('finance.studentsCount').replace('{count}', filteredStudents.length)}
          </p>
        </div>
        {activeRole && !canPay && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFF8EE', border: '1px solid #F0D88A', borderRadius: '10px', padding: '10px 16px', fontSize: '0.85rem', color: '#6B4D00' }}>
            <FileText size={15} /> {t('finance.viewOnly')}
          </div>
        )}
      </div>

      {/* ══ Alerts ══ */}
      {error && <Alert type="error" msg={error} onClose={() => setError(null)} />}
      {successMsg && <Alert type="success" msg={successMsg} onClose={() => setSuccessMsg(null)} />}

      {/* ══════════════════════════════════════════════════
          VIEW: CLASSES
      ══════════════════════════════════════════════════ */}
      {view === 'classes' && (
        <>
          {/* Summary stats */}
          <div className="finance-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '16px', marginBottom: '28px' }}>
            {[
              { label: t('finance.totalInvoiced'), val: formatMoney(totals.total_invoiced), color: '#125A91', icon: FileText },
              { label: t('finance.totalCollected'), val: formatMoney(totals.total_collected), color: '#1E7E4A', icon: CheckCircle2 },
              { label: t('finance.outstanding'), val: formatMoney(totals.total_outstanding), color: '#B47214', icon: AlertCircle },
              { label: t('finance.collectionRate'), val: `${pct(totals.total_collected, totals.total_invoiced)}%`, color: '#226F8A', icon: TrendingUp },
            ].map(s => { const Icon = s.icon; return (
              <div key={s.label} style={{ background: 'var(--bg-surface)', borderRadius: '14px', padding: '20px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{s.label.toUpperCase()}</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} color={s.color} /></div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: s.color }}>{s.val}</div>
              </div>
            ); })}
          </div>

          {/* Charts row */}
          {classes.length > 0 && (
            <div className="finance-charts-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(230px,1fr) minmax(0,2fr)', gap: '20px', marginBottom: '28px' }}>
              <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', padding: '20px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '16px' }}>{t('finance.paymentStatus')}</div>
                <ResponsiveContainer width="100%" height={160}>
                  <RePieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} ${t('finance.class')}`, '']} />
                  </RePieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                  {pieData.map((p, i) => (
                    <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: PIE_COLORS[i] }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{p.name}: <strong style={{ color: 'var(--text-primary)' }}>{p.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', padding: '20px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '16px' }}>{t('finance.collectionByClassUnits').replace('{currency}', currency)}</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="paid" name={t('finance.collected')} fill="#1E7E4A" radius={[4,4,0,0]} />
                    <Bar dataKey="outstanding" name={t('finance.outstanding')} fill="#D6AD55" radius={[4,4,0,0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Class cards */}
          <div style={{ marginBottom: '12px', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
            {t('finance.selectClassRecord')}
          </div>
          {classes.length === 0 ? (
            <EmptyState icon={CreditCard} msg={t('finance.noClasses')} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {classes.map(cls => {
                const p = pct(cls.total_collected, cls.total_invoiced);
                const col = p >= 90 ? '#1E7E4A' : p >= 60 ? '#B47214' : '#C0392B';
                return (
                  <button key={cls.id} onClick={() => openClass(cls)}
                    style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '22px', border: '1.5px solid var(--border-color)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'block', width: '100%' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#125A91'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(18,90,145,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '2px' }}>{cls.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {cls.student_count ?? '—'} {t('finance.totalStudents')} · {cls.unpaid_count ?? '—'} {t('finance.pending')}
                        </div>
                      </div>
                      <div style={{ background: `${col}18`, borderRadius: '10px', padding: '6px 12px', fontWeight: 800, fontSize: '1rem', color: col }}>{p}%</div>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '5px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{t('finance.collected')}</span>
                        <span style={{ fontWeight: 700, color: '#1E7E4A' }}>{formatMoney(cls.total_collected)}</span>
                      </div>
                      <div style={{ height: '7px', borderRadius: '4px', background: 'var(--border-color)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${p}%`, background: `linear-gradient(to right, ${col}, ${col}99)`, borderRadius: '4px', transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: '#B47214', fontWeight: 700 }}>{t('finance.outstanding')}: {formatMoney(cls.total_outstanding)}</span>
                      <span style={{ color: '#125A91', fontWeight: 700 }}>{t('dashboard.viewProfile')} →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Recent receipts */}
          {payments.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '14px' }}>{t('finance.recentPayments')}</div>
              <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-primary)' }}>
                      {['Receipt #', 'Student', 'Class', 'Amount', 'Method', 'Date', ''].map(h => (
                        <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.4px' }}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 10).map(p => (
                      <tr key={p.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#125A91' }}>{p.receipt_number}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{p.first_name} {p.last_name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{p.admission_number}</div>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>{p.class_name || '—'}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#1E7E4A' }}>{formatMoney(p.amount)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: '#E8F4F8', color: '#1A5276', padding: '3px 8px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 700 }}>{p.payment_method?.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>{new Date(p.payment_date).toLocaleDateString(locale)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <button onClick={() => setReceiptModal({ ...p, studentName: `${p.first_name} ${p.last_name}`, receiptNumber: p.receipt_number, date: p.payment_date, paymentMethod: p.payment_method })}
                            style={{ fontSize: '0.78rem', color: '#125A91', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Printer size={13} /> {t('finance.receipt')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════
          VIEW: STUDENTS IN CLASS
      ══════════════════════════════════════════════════ */}
      {view === 'students' && (
        <>
          {/* Class summary banner */}
          {selectedClass && (
            <div style={{ background: 'linear-gradient(135deg, #125A91, #1687D1)', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>{t('finance.class').toUpperCase()}</div>
                <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.4rem' }}>{selectedClass.name}</div>
              </div>
              {[
                { label: t('finance.student'), val: selectedClass.student_count ?? students.length },
                { label: t('finance.collected'), val: formatMoney(selectedClass.total_collected), highlight: '#D6AD55' },
                { label: t('finance.outstanding'), val: formatMoney(selectedClass.total_outstanding), highlight: '#FF8C69' },
                { label: t('finance.collectionRate'), val: `${pct(selectedClass.total_collected, selectedClass.total_invoiced)}%` },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.74rem', fontWeight: 600 }}>{s.label.toUpperCase()}</div>
                  <div style={{ color: s.highlight || '#fff', fontWeight: 800, fontSize: '1.1rem', marginTop: '4px' }}>{s.val}</div>
                </div>
              ))}
            </div>
          )}

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#60798C' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('finance.searchStudent')}
              style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '10px', border: '1.5px solid var(--border-color)', fontSize: '0.9rem', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontFamily: 'inherit' }} />
          </div>

          {studLoading ? <Loading /> : (
            <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-primary)' }}>
                    {[t('finance.student'), t('finance.admissionNo'), t('finance.totalInvoiced'), t('finance.totalCollected'), t('finance.outstanding'), t('accounts.status'), canPay ? t('accounts.actions') : ''].filter(Boolean).map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.4px' }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>{t('finance.noStudents')}</td></tr>
                  )}
                  {filteredStudents.map((inv, i) => {
                    const bal = parseFloat(inv.balance || 0);
                    const p = pct(parseFloat(inv.amount_paid || 0), parseFloat(inv.total_amount || 0));
                    return (
                      <tr key={inv.id} style={{ borderTop: '1px solid var(--border-color)', background: i % 2 === 1 ? 'var(--bg-primary)' : 'transparent' }}>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#125A91,#1687D1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#D6AD55', flexShrink: 0 }}>
                              {inv.first_name?.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{inv.first_name} {inv.last_name}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                                <div style={{ height: '5px', width: '60px', borderRadius: '3px', background: 'var(--border-color)', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${p}%`, background: p >= 100 ? '#1E7E4A' : p >= 50 ? '#B47214' : '#C0392B' }} />
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{p}%</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '13px 16px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{inv.admission_number}</td>
                        <td style={{ padding: '13px 16px', fontWeight: 600 }}>{formatMoney(inv.total_amount)}</td>
                        <td style={{ padding: '13px 16px', color: '#1E7E4A', fontWeight: 700 }}>{formatMoney(inv.amount_paid)}</td>
                        <td style={{ padding: '13px 16px', fontWeight: 800, color: bal > 0 ? '#C0392B' : '#1E7E4A' }}>{formatMoney(bal)}</td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700,
                            background: inv.status === 'paid' ? '#E8F5EE' : inv.status === 'partially_paid' ? '#FFF6E5' : '#FDE8E8',
                            color: inv.status === 'paid' ? '#126338' : inv.status === 'partially_paid' ? '#925807' : '#A51D24' }}>
                            {inv.status?.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        {canPay && (
                          <td style={{ padding: '13px 16px' }}>
                            {bal > 0 ? (
                              <button onClick={() => openPay(inv)}
                                style={{ background: 'linear-gradient(135deg,#D6AD55,#C29A44)', color: '#0B3557', border: 'none', borderRadius: '8px', padding: '7px 14px', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <CreditCard size={13} /> {t('finance.recordPay')}
                              </button>
                            ) : (
                              <span style={{ color: '#1E7E4A', fontSize: '0.8rem', fontWeight: 700 }}>✓ {t('finance.cleared')}</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ══ Payment Modal ══ */}
      {payModal && (
        <Modal onClose={() => setPayModal(null)}>
          <div style={{ marginBottom: '4px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t('finance.recordFeePayment')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{payModal.first_name} {payModal.last_name} · {payModal.admission_number} · {selectedClass?.name}</p>
          </div>
          <div style={{ background: '#FFF8EE', border: '1px solid #F0D88A', borderRadius: '10px', padding: '14px 18px', margin: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#6B4D00' }}>{t('finance.outstandingBalance')}:</span>
            <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#C0392B' }}>{formatMoney(payModal.balance)}</span>
          </div>
          <form onSubmit={handlePay}>
            <label style={labelStyle}>{t('finance.amountPaid').replace('{currency}', currency)} *</label>
            <input type="number" required min="0.01" step="0.01" max={payModal.balance} value={payAmount} onChange={e => setPayAmount(e.target.value)} style={inputStyle} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', margin: '14px 0' }}>
              <div>
                <label style={labelStyle}>{t('finance.paymentMethod')} *</label>
                <select value={payMethod} onChange={e => setPayMethod(e.target.value)} style={inputStyle}>
                  <option value="cash">{t('finance.cash')}</option>
                  <option value="mobile_money">{t('finance.mobileMoney')}</option>
                  <option value="bank_transfer">{t('finance.bankTransfer')}</option>
                  <option value="pos">{t('finance.pos')}</option>
                  <option value="cheque">{t('finance.cheque')}</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t('finance.reference')}</label>
                <input type="text" placeholder={t('finance.referenceExample')} value={refCode} onChange={e => setRefCode(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <label style={labelStyle}>{t('finance.payerName')} *</label>
            <input type="text" required value={payerName} onChange={e => setPayerName(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }} />

            {/* Quick amount buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {[payModal.balance, Math.round(payModal.balance / 2), 50000, 100000].filter((v, i, a) => v > 0 && v <= payModal.balance && a.indexOf(v) === i).map(v => (
                <button key={v} type="button" onClick={() => setPayAmount(String(v))}
                  style={{ padding: '5px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', background: payAmount == v ? '#125A91' : 'var(--bg-surface)', color: payAmount == v ? '#fff' : 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                  {formatMoney(v)}
                </button>
              ))}
            </div>

            <button type="submit" disabled={paying} style={{ width: '100%', padding: '13px', borderRadius: '10px', background: 'linear-gradient(135deg,#D6AD55,#C29A44)', color: '#0B3557', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: paying ? 'not-allowed' : 'pointer', opacity: paying ? 0.7 : 1 }}>
              {paying ? t('finance.processing') : t('finance.confirmAmount').replace('{amount}', formatMoney(payAmount))}
            </button>
          </form>
        </Modal>
      )}

      {/* ══ Receipt Modal ══ */}
      {receiptModal && (
        <Modal onClose={() => setReceiptModal(null)}>
          <div style={{ textAlign: 'center', borderBottom: '2px dashed #DCE3DC', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#125A91' }}>SCHOOLCONNECT 360</div>
            <div style={{ fontSize: '0.78rem', color: '#60798C' }}>{t('finance.receiptTitle')}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#B47214', marginTop: '8px' }}>{t('finance.receipt').toUpperCase()} #{receiptModal.receiptNumber}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginBottom: '20px' }}>
            {[
              [t('finance.student'), receiptModal.studentName],
              [t('finance.admissionNo'), receiptModal.admissionNumber],
              [t('finance.class'), receiptModal.className || '—'],
              [t('finance.invoiceNo'), receiptModal.invoice_number || receiptModal.invoiceNumber],
              [t('finance.paymentMethod'), receiptModal.paymentMethod?.toUpperCase()],
              [t('finance.dateTime'), new Date(receiptModal.date).toLocaleString(locale)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>{t('finance.amountReceived').toUpperCase()}</span>
              <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#1E7E4A' }}>{formatMoney(receiptModal.amount)}</span>
            </div>
            {receiptModal.balanceRemaining >= 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t('finance.remainingBalance')}</span>
                <span style={{ fontWeight: 700, color: receiptModal.balanceRemaining > 0 ? '#C0392B' : '#1E7E4A' }}>{formatMoney(receiptModal.balanceRemaining)}</span>
              </div>
            )}
          </div>
          <div style={{ textAlign: 'center', background: '#F7F8F5', padding: '10px', borderRadius: '8px', fontSize: '0.76rem', color: '#60798C', marginBottom: '20px' }}>
            ✓ {t('finance.authenticated')}
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => window.print()} style={{ padding: '9px 18px', borderRadius: '8px', border: '1.5px solid var(--border-color)', background: 'var(--bg-surface)', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Printer size={14} /> {t('finance.print')}
            </button>
            <button onClick={() => setReceiptModal(null)} style={{ padding: '9px 20px', borderRadius: '8px', background: '#125A91', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' }}>{t('finance.done')}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────
function Modal({ children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: '20px', padding: '28px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
        {children}
      </div>
    </div>
  );
}

function Alert({ type, msg, onClose }) {
  const cfg = type === 'success'
    ? { bg: '#E8F5EE', border: '#BFE0CA', color: '#126338', icon: CheckCircle2 }
    : { bg: '#FDE8E8', border: '#FECACA', color: '#A51D24', icon: AlertCircle };
  const Icon = cfg.icon;
  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: cfg.color }}>
      <Icon size={16} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: cfg.color }}><X size={14} /></button>
    </div>
  );
}

function Loading() {
  const { t } = useLanguage();
  return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('finance.loading')}</div>;
}

function EmptyState({ icon: Icon, msg }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <Icon size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
      <div style={{ fontSize: '0.9rem' }}>{msg}</div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px', letterSpacing: '0.4px' };
const inputStyle = { width: '100%', padding: '10px 13px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontSize: '0.9rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none' };
