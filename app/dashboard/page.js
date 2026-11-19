'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  GraduationCap,
  Building,
  CreditCard,
  Library,
  HeartPulse,
  BookOpen,
  CalendarCheck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  Clock,
  ChevronRight,
  FileText,
  Activity,
  PlusCircle,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { ROLE_DEFINITIONS } from '@/lib/permissions';
import { roleTranslationKey, useLanguage } from '@/lib/i18n';

export default function DashboardOverviewPage() {
  const { language, t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/dashboard/overview');
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `Failed to load dashboard metrics (${res.status}).`);
      }
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message || 'Could not connect to the dashboard. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchOverview(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleApproveApplication = async (applicationId) => {
    setActionLoading(true);
    setActionSuccess(null);
    try {
      const res = await fetch('/api/superadmin/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, action: 'approve' }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to approve');
      setActionSuccess(resData.message);
      await fetchOverview();
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectApplication = async (applicationId) => {
    setActionLoading(true);
    setActionSuccess(null);
    try {
      const res = await fetch('/api/superadmin/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, action: 'reject' }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to reject');
      setActionSuccess(resData.message);
      await fetchOverview();
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          {t('dashboard.loadingMetrics')}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: 'var(--bg-surface)', padding: '28px', borderRadius: '16px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', maxWidth: '680px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <AlertCircle size={22} color="#C0392B" />
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '6px' }}>{t('dashboard.loadErrorTitle')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{error}</p>
            <button type="button" className="btn-primary" onClick={fetchOverview}>
              {t('dashboard.retry')} <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================================
  // A. SUPER ADMINISTRATOR PLATFORM VIEW
  // =====================================================================
  if (data?.type === 'super_admin') {
    const s = data.stats;
    return (
      <div className="dashboard-page">
        {/* Banner */}
        <div className="dashboard-hero">
          <div className="dashboard-hero-copy">
            <span className="badge badge-gold" style={{ marginBottom: '8px' }}>
              PLATFORM LEVEL 1
            </span>
            <h1>Platform Super Administration</h1>
            <p>
              Overseeing multi-school tenant workspaces, application vetting, active subscriptions, and system audits.
            </p>
          </div>
          <div className="dashboard-hero-art">
            <Image
              src="/images/classroom-learning.svg"
              alt="Students learning together with their teacher"
              width={420}
              height={300}
              loading="eager"
              priority
            />
          </div>
          <div className="dashboard-hero-action">
            <Link href="/dashboard/superadmin/applications" className="btn-gold">
              Review Pending Applications
            </Link>
          </div>
        </div>

        {actionSuccess && (
          <div style={{ backgroundColor: '#E6F5EC', color: '#126338', padding: '14px 18px', borderRadius: '8px', border: '1px solid #B7E4C7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} /> {actionSuccess}
          </div>
        )}

        {/* Real Stats Grid */}
        <div className="grid-4">
          <div className="stat-card">
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Schools</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-forest)', marginTop: '4px' }}>
                {s.totalSchools}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#1E7E4A', fontWeight: 600, marginTop: '2px' }}>
                {s.activeSchools} Active Workspaces
              </div>
            </div>
            <div className="stat-icon-wrap" style={{ backgroundColor: 'rgba(18, 59, 42, 0.1)', color: 'var(--color-forest)' }}>
              <Building size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pending Applications</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#B47214', marginTop: '4px' }}>
                {s.pendingApplications}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Awaiting Vetting
              </div>
            </div>
            <div className="stat-icon-wrap" style={{ backgroundColor: 'rgba(214, 173, 85, 0.2)', color: '#8A6818' }}>
              <Clock size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Platform Users</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-forest)', marginTop: '4px' }}>
                {s.totalUsers}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#1E7E4A', fontWeight: 600, marginTop: '2px' }}>
                Staff, Admins & Faculty
              </div>
            </div>
            <div className="stat-icon-wrap" style={{ backgroundColor: 'rgba(30, 126, 74, 0.15)', color: '#1E7E4A' }}>
              <Users size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Subscriptions</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-deep-forest)', marginTop: '4px' }}>
                {s.activeSubscriptions}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#1E7E4A', fontWeight: 600, marginTop: '2px' }}>
                Enterprise Tier
              </div>
            </div>
            <div className="stat-icon-wrap" style={{ backgroundColor: 'rgba(34, 111, 138, 0.15)', color: '#226F8A' }}>
              <CreditCard size={24} />
            </div>
          </div>
        </div>

        {/* Applications Vetting & Approvals Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
                School Onboarding Applications
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Applications submitted by schools via the public portal awaiting your approval.
              </p>
            </div>
            <span className="badge badge-gold">Direct Neon Action</span>
          </div>

          <div className="table-container">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Application Ref</th>
                  <th>School Name</th>
                  <th>Contact Email</th>
                  <th>Country</th>
                  <th>Status</th>
                  <th>Submitted At</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recentApplications?.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      No pending applications right now.
                    </td>
                  </tr>
                ) : (
                  data.recentApplications?.map((app) => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 700, color: 'var(--color-forest)' }}>
                        {app.application_reference}
                      </td>
                      <td style={{ fontWeight: 600 }}>{app.school_name}</td>
                      <td>{app.school_email}</td>
                      <td>{app.country}</td>
                      <td>
                        <span
                          className={`badge ${
                            app.status === 'approved'
                              ? 'badge-success'
                              : app.status === 'rejected'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {app.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {app.status === 'pending' ? (
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleApproveApplication(app.id)}
                              className="btn-primary"
                              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                            >
                              Approve & Provision
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleRejectApplication(app.id)}
                              className="btn-secondary"
                              style={{ padding: '6px 14px', fontSize: '0.8rem', color: '#C0392B' }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Decided</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
              Recent Platform Security & Audit Trail
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Database Verified</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.recentLogs?.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(18, 59, 42, 0.03)',
                  borderRadius: '6px',
                  fontSize: '0.88rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={16} color="var(--color-forest)" />
                  <span style={{ fontWeight: 600 }}>{log.action}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    Module: {log.module}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================================
  // B. SCHOOL LEVEL DASHBOARD (HEADTEACHER, TEACHER, BURSAR, NURSE, ETC.)
  // =====================================================================
  const roleKey = data?.role;
  const roleDef = ROLE_DEFINITIONS[roleKey] || ROLE_DEFINITIONS.custom_role;
  const translatedRole = t(roleTranslationKey(roleKey, 'title'));
  const roleTitle = translatedRole.startsWith('role.') ? roleDef.title : translatedRole;
  const translatedDescription = t(roleTranslationKey(roleKey, 'description'));
  const roleDescription = translatedDescription.startsWith('role.') ? roleDef.description : translatedDescription;
  const categoryIds = {
    'School Leadership': 'leadership',
    'Academic Department': 'academics',
    Finance: 'finance',
    'Health and Welfare': 'health',
    'School Operations': 'operations',
  };
  const roleCategory = categoryIds[roleDef.category]
    ? t(`category.${categoryIds[roleDef.category]}`)
    : roleDef.category;
  const s = data?.stats || {};
  const schoolCurrency = data?.school?.country === 'Rwanda'
    ? 'RWF'
    : data?.school?.settings?.currency || 'USD';
  const permissions = data?.permissions || {};
  const attendanceToday = s.attendanceToday || {};
  const locale = { en: 'en-RW', rw: 'rw-RW', fr: 'fr-FR' }[language] || 'en-RW';
  const formatSchoolMoney = (value) => new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: schoolCurrency,
    currencyDisplay: 'code',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
  const overviewCards = [
    { label: t('dashboard.students'), value: s.totalStudents ?? 0, detail: t('dashboard.activeSchool'), icon: Users, color: '#1687D1' },
    { label: t('dashboard.classes'), value: s.totalClasses ?? 0, detail: t('dashboard.teachingGroups'), icon: BookOpen, color: '#7C5CE7' },
    ...(permissions.canViewRoster ? [
      { label: t('dashboard.staff'), value: s.totalStaff ?? 0, detail: t('dashboard.teamMembers'), icon: GraduationCap, color: '#16865D' },
    ] : []),
    ...(permissions.canViewFinance ? [
      { label: t('dashboard.feesCollected'), value: formatSchoolMoney(s.feesCollected), detail: `${formatSchoolMoney(s.feesOutstanding)} ${t('dashboard.outstanding')}`, icon: CreditCard, color: '#16865D' },
    ] : []),
    ...(permissions.canViewLibrary ? [
      { label: t('dashboard.library'), value: s.totalBooks ?? 0, detail: `${s.availableBooks ?? 0} ${t('dashboard.availableBooks')}`, icon: Library, color: '#B47214' },
    ] : []),
    ...(permissions.canViewClinicSummary ? [
      { label: t('dashboard.clinic'), value: s.clinicVisits ?? 0, detail: t('dashboard.recordedVisits'), icon: HeartPulse, color: '#C0392B' },
    ] : []),
    ...(permissions.canViewSchoolPulse ? [
      {
    label: t('dashboard.attendance'),
        value: `${attendanceToday.enrolled ? Math.round((attendanceToday.marked / attendanceToday.enrolled) * 100) : 0}%`,
    detail: `${attendanceToday.present ?? 0} ${t('dashboard.present')} · ${attendanceToday.absent ?? 0} ${t('dashboard.absent')} · ${Math.max(0, (attendanceToday.enrolled || 0) - (attendanceToday.marked || 0))} ${t('dashboard.notMarked')}`,
        icon: CalendarCheck,
        color: '#1687D1',
      },
    ] : []),
  ];

  return (
    <div className="dashboard-page">
      {/* School Header Banner */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="badge badge-gold">{roleTitle}</span>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.82)' }}>{roleCategory}</span>
          </div>
          <h1>
            {data?.school?.name || t('workspace.activeSchool')}
          </h1>
          <p>
            {roleDescription}
          </p>
        </div>

        {/* Quick context action */}
        <div className="dashboard-hero-action">
          {['registrar', 'school_admin'].includes(roleKey) && (
            <Link href="/dashboard/students" className="btn-gold">
              <PlusCircle size={18} /> {t('dashboard.registerStudent')}
            </Link>
          )}
          {['headteacher', 'class_teacher', 'teacher'].includes(roleKey) && (
            <Link href="/dashboard/attendance" className="btn-gold">
              <CalendarCheck size={18} /> {t('dashboard.dailyRollCall')}
            </Link>
          )}
          {['bursar', 'cashier'].includes(roleKey) && (
            <Link href="/dashboard/finance" className="btn-gold">
              <CreditCard size={18} /> {t('dashboard.recordPayment')}
            </Link>
          )}
          {roleKey === 'librarian' && (
            <Link href="/dashboard/library" className="btn-gold">
              <Library size={18} /> Issue Book to Student
            </Link>
          )}
          {roleKey === 'nurse' && (
            <Link href="/dashboard/clinic" className="btn-gold">
              <HeartPulse size={18} /> {t('dashboard.newClinicVisit')}
            </Link>
          )}
        </div>
        <div className="dashboard-hero-art">
          <Image
            src="/images/classroom-learning.svg"
            alt="Students learning together with their teacher"
            width={420}
            height={300}
            loading="eager"
            priority
          />
        </div>
      </div>

      {/* THE CONNECTED LOOP VISUAL BANNER */}
      <div
        style={{
          backgroundColor: 'rgba(214, 173, 85, 0.12)',
          border: '1px solid rgba(214, 173, 85, 0.4)',
          borderRadius: '12px',
          padding: '16px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: '#8A6818' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--color-deep-forest)', fontSize: '0.95rem' }}>
              {t('dashboard.loopActive')}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('dashboard.loopDescription')}
            </div>
          </div>
        </div>
        <Link href="/dashboard/students" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-forest)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {t('dashboard.openStudentLoop')} <ArrowRight size={14} />
        </Link>
      </div>

      {(['headteacher', 'school_admin', 'teacher', 'class_teacher', 'deputy_headteacher_academics', 'director_of_studies'].includes(roleKey)
        || ['librarian', 'headteacher', 'school_admin'].includes(roleKey)) && (
        <div className="dashboard-feature-grid">
          {['headteacher', 'school_admin', 'teacher', 'class_teacher', 'deputy_headteacher_academics', 'director_of_studies'].includes(roleKey) && (
            <Link href="/dashboard/attendance" className="dashboard-feature-card">
              <div className="dashboard-feature-image">
                <Image
                  src="/images/classroom-learning.svg"
                  alt=""
                  width={420}
                  height={300}
                />
              </div>
              <div className="dashboard-feature-content">
                <span className="badge badge-info"><CalendarCheck size={14} /> {t('dashboard.teachingWorkspace')}</span>
                <h2>{t('dashboard.lessonCount')}</h2>
                <p>Move from your class list to attendance and keep the school day organised.</p>
                <span className="dashboard-feature-link">{t('dashboard.openTeachingTools')} <ArrowRight size={16} /></span>
              </div>
            </Link>
          )}
          {['librarian', 'headteacher', 'school_admin'].includes(roleKey) && (
            <Link href="/dashboard/library" className="dashboard-feature-card">
              <div className="dashboard-feature-image">
                <Image
                  src="/images/library-reading.svg"
                  alt=""
                  width={420}
                  height={300}
                />
              </div>
              <div className="dashboard-feature-content">
                <span className="badge badge-success"><Library size={14} /> {t('dashboard.libraryMotion')}</span>
                <h2>{t('dashboard.libraryAtGlance')}</h2>
                <p>{s.totalBooks ?? 0} books in the catalogue · {s.availableBooks ?? 0} available to borrow.</p>
                <span className="dashboard-feature-link">{t('dashboard.manageLibrary')} <ArrowRight size={16} /></span>
              </div>
            </Link>
          )}
        </div>
      )}

      <div className="dashboard-stat-grid">
        {overviewCards.map(({ label, value, detail, icon: Icon, color }) => (
          <div className="dashboard-stat-card" key={label}>
            <div className="dashboard-stat-icon" style={{ color, backgroundColor: `${color}18` }}>
              <Icon size={20} />
            </div>
            <div className="dashboard-stat-label">{label}</div>
            <div className="dashboard-stat-value">{value}</div>
            <div className="dashboard-stat-detail">{detail}</div>
          </div>
        ))}
      </div>

      <section className="dashboard-collaboration">
        <div className="dashboard-collaboration-copy">
          <span className="dashboard-collaboration-icon"><MessageSquare size={20} /></span>
          <div>
            <h2>{roleKey === 'headteacher' ? t('dashboard.headteacherCollaboration') : t('dashboard.staffCollaboration')}</h2>
            <p>{t('dashboard.collaborationDescription')}</p>
          </div>
        </div>
        <Link href="/dashboard/messages" className="btn-primary">
          {t('dashboard.openMessages')} <ArrowRight size={16} />
        </Link>
      </section>

      <div className="dashboard-quick-links">
        {permissions.canViewFinance && (
          <Link href="/dashboard/finance" className="dashboard-quick-link">
            <CreditCard size={19} />
            <span><strong>{['bursar', 'cashier'].includes(roleKey) ? t('dashboard.financeDesk') : t('dashboard.schoolFinance')}</strong><small>{t('dashboard.financeDescription')}</small></span>
            <ArrowRight size={16} />
          </Link>
        )}
        {['school_admin', 'headteacher', 'school_owner', 'hr_manager'].includes(roleKey) && (
          <Link href="/dashboard/accounts" className="dashboard-quick-link">
            <Users size={19} />
            <span><strong>{t('dashboard.peopleAccounts')}</strong><small>{t('dashboard.accountsDescription')}</small></span>
            <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {permissions.canViewSchoolPulse && (
        <section className="dashboard-activity card">
          <div className="dashboard-activity-header">
            <div>
              <span className="dashboard-activity-kicker">{t('dashboard.schoolPulse')}</span>
              <h2>{t('dashboard.recentActivity')}</h2>
              <p>{t('dashboard.activityDescription')}</p>
            </div>
            <Activity size={21} color="var(--color-forest)" />
          </div>
          {data.recentActivity?.length ? (
            <div className="dashboard-activity-list">
              {data.recentActivity.map((item, index) => (
                <div className="dashboard-activity-item" key={`${item.action}-${item.created_at}-${index}`}>
                  <span className="dashboard-activity-dot" />
                  <div>
                    <strong>{item.action.replace(/_/g, ' ')}</strong>
                    <span>{item.module} · {new Date(item.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="dashboard-activity-empty">{t('dashboard.noActivity')}</p>
          )}
        </section>
      )}

      {/* Connected Loop Student Roster */}
      {permissions.canViewRoster && <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
              {t('dashboard.studentEnrollments')}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              {t('dashboard.studentListDescription')}
            </p>
          </div>
          <Link href="/dashboard/students" className="btn-secondary" style={{ fontSize: '0.82rem' }}>
            {t('dashboard.viewFullDirectory')} →
          </Link>
        </div>

        <div className="table-container">
          <table className="table-custom">
            <thead>
              <tr>
                <th>{t('dashboard.admissionNumber')}</th>
                <th>{t('dashboard.studentName')}</th>
                <th>{t('dashboard.gender')}</th>
                <th>{t('dashboard.class')}</th>
                <th>{t('dashboard.stream')}</th>
                <th>{t('dashboard.dateAdded')}</th>
                <th style={{ textAlign: 'right' }}>{t('dashboard.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {data.recentStudents?.map((st) => (
                <tr key={st.id}>
                  <td style={{ fontWeight: 700, color: 'var(--color-forest)' }}>{st.admission_number}</td>
                  <td style={{ fontWeight: 600 }}>{st.first_name} {st.last_name}</td>
                  <td>{st.gender}</td>
                  <td>{st.class_name || 'Senior 1'}</td>
                  <td>
                    <span className="badge badge-gold">{st.stream_name || 'Stream A'}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {new Date(st.created_at).toLocaleDateString(locale)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      href={`/dashboard/students`}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(18, 59, 42, 0.08)',
                        color: 'var(--color-forest)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {t('dashboard.viewProfile')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>}

      {/* School Announcements */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
            {t('dashboard.institutionalAnnouncements')}
          </h3>
          <span className="badge badge-success">{t('dashboard.officialNotices')}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.announcements?.map((a) => (
            <div
              key={a.id}
              style={{
                padding: '16px 20px',
                borderRadius: '8px',
                backgroundColor: 'rgba(18, 59, 42, 0.03)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontWeight: 700, fontSize: '1.02rem', color: 'var(--color-deep-forest)' }}>
                  {a.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {new Date(a.created_at).toLocaleDateString(locale)}
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                {a.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
