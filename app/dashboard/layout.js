'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/brand-logo';
import { usePathname, useRouter } from 'next/navigation';
import {
  GraduationCap,
  LayoutDashboard,
  Building,
  Users,
  CreditCard,
  ShieldCheck,
  Settings,
  BookOpen,
  CalendarCheck,
  Award,
  Library,
  HeartPulse,
  FileHeart,
  ShieldAlert,
  Gavel,
  Truck,
  CheckSquare,
  BarChart3,
  LogOut,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  RefreshCw,
  MessageSquare,
  UserCircle,
  UserCheck,
  Layers,
  Briefcase,
  Baby,
  Languages,
} from 'lucide-react';
import { ROLE_DEFINITIONS, getRoleNavLinks } from '@/lib/permissions';
import { LanguageProvider, roleTranslationKey, useLanguage } from '@/lib/i18n';

const ICON_MAP = {
  LayoutDashboard,
  Building,
  GraduationCap,
  Users,
  CreditCard,
  ShieldCheck,
  Settings,
  BookOpen,
  CalendarCheck,
  Award,
  Library,
  HeartPulse,
  FileHeart,
  ShieldAlert,
  Gavel,
  Truck,
  CheckSquare,
  BarChart3,
  MessageSquare,
  UserCircle,
  UserCheck,
  Layers,
  Briefcase,
  Baby,
};

export default function DashboardLayout({ children }) {
  return (
    <LanguageProvider>
      <DashboardWorkspace>{children}</DashboardWorkspace>
    </LanguageProvider>
  );
}

function DashboardWorkspace({ children }) {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitchModalOpen, setRoleSwitchModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Fetch current user session
  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSwitchRole = async (schoolId, roleKey) => {
    setSwitching(true);
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId, role: roleKey }),
      });
      if (res.ok) {
        setRoleSwitchModalOpen(false);
        await fetchSession();
        router.push('/dashboard');
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSwitching(false);
    }
  };

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-forest)',
              color: 'var(--color-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              animation: 'spin 2s linear infinite',
            }}
          >
            <GraduationCap size={28} />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-forest)' }}>
            {t('workspace.loading')}
          </div>
        </div>
      </div>
    );
  }

  const activeRole = user?.activeRole || 'viewer';
  const roleDef = ROLE_DEFINITIONS[activeRole] || ROLE_DEFINITIONS.custom_role;
  const navLinks = getRoleNavLinks(activeRole);
  const translatedRole = t(roleTranslationKey(activeRole, 'title'));
  const roleTitle = translatedRole.startsWith('role.') ? roleDef.title : translatedRole;
  const categoryIds = {
    'Platform Administration': 'platform',
    'School Leadership': 'leadership',
    'Academic Department': 'academics',
    Finance: 'finance',
    'Health and Welfare': 'health',
    'School Operations': 'operations',
  };
  const roleCategory = categoryIds[roleDef.category]
    ? t(`category.${categoryIds[roleDef.category]}`)
    : roleDef.category;

  return (
    <div className="dashboard-shell" style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-primary)' }}>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside
        className={`dashboard-sidebar${mobileMenuOpen ? ' is-open' : ''}`}
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: '#F4FAFF',
          color: 'var(--text-primary)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 40,
          borderRight: '1px solid #DCECF8',
        }}
      >
        {/* Brand & School Logo */}
        <div style={{ padding: '22px 20px', borderBottom: '1px solid #E1EFF8' }}>
          <Link href="/dashboard" aria-label="SchoolConnect 360 dashboard">
            <BrandLogo tagline={t('workspace.enterprise')} />
          </Link>
        </div>

        {/* Current Context Card */}
        <div
          style={{
            margin: '14px 16px',
            padding: '12px 14px',
            backgroundColor: '#EAF6FF',
            borderRadius: '10px',
            border: '1px solid #D7ECFA',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: 'var(--color-forest)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
            {activeRole === 'super_admin' ? t('workspace.platform') : (user?.activeSchool?.name || t('workspace.activeSchool'))}
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-deep-forest)', marginTop: '2px' }}>
            {roleTitle}
          </div>

          {/* Role Switcher Pill */}
          <button
            onClick={() => setRoleSwitchModalOpen(true)}
            style={{
              marginTop: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #B9DFF3',
              color: 'var(--color-forest)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              width: '100%',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={12} /> {t('workspace.switchRole')}
          </button>
        </div>

        {/* Navigation items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '0.68rem', color: '#7A9AAF', fontWeight: 700, textTransform: 'uppercase', padding: '6px 10px', letterSpacing: '0.5px' }}>
            {roleCategory}
          </div>

          {navLinks.map((item, idx) => {
            const IconComponent = ICON_MAP[item.icon] || LayoutDashboard;
            const isActive = pathname === item.path;

            return (
              <Link
                key={idx}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? '#DDF1FF' : 'transparent',
                  color: isActive ? 'var(--color-forest)' : '#536F83',
                  transition: 'all 0.15s ease',
                  border: isActive ? '1px solid #BFE5FB' : '1px solid transparent',
                }}
              >
                <IconComponent size={18} />
                <span>{t(`nav.${item.name}`)}</span>
              </Link>
            );
          })}
        </div>

        {/* User profile & Logout */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #E1EFF8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #39B6E9, #147FC6)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                flexShrink: 0,
              }}
            >
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--color-deep-forest)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.fullName}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#7894A8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.email}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title={t('workspace.signOut')}
            style={{
              background: 'none',
              color: '#64869D',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div className="dashboard-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Navbar */}
        <header
          className="dashboard-topbar"
          style={{
            height: 'var(--navbar-height)',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              className="dashboard-mobile-menu"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? t('workspace.closeMenu') : t('workspace.openMenu')}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
              {activeRole === 'super_admin' ? 'SchoolConnect 360 Platform Control' : (user?.activeSchool?.name || t('workspace.activeSchool'))}
            </div>
            <span className="badge badge-info">
              {t('workspace.term')} 1 • 2026-2027
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              title={darkMode ? t('workspace.lightMode') : t('workspace.darkMode')}
              style={{
                background: 'none',
                color: 'var(--text-secondary)',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-color)',
              }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="dashboard-language-switcher" title={t('workspace.language')}>
              <Languages size={16} color="var(--color-forest)" />
              <select
                aria-label={t('workspace.language')}
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                <option value="en">{t('language.en')}</option>
                <option value="rw">{t('language.rw')}</option>
                <option value="fr">{t('language.fr')}</option>
              </select>
            </div>

            {/* Notification bell */}
            <Link
              href="/dashboard/messages"
              aria-label="Open messages and school updates"
              title="Messages and school updates"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
              }}
            >
              <Bell size={18} />
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#C0392B',
                }}
              />
            </Link>

            {/* Role chip */}
            <div
              className="dashboard-role-chip"
              onClick={() => setRoleSwitchModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                backgroundColor: '#EAF6FF',
                borderRadius: '20px',
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
              }}
            >
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-forest)' }}>
                {roleTitle}
              </span>
              <ChevronDown size={14} color="var(--color-forest)" />
            </div>
          </div>
        </header>

        {/* Page body */}
        <main className="dashboard-main-content" style={{ flex: 1, padding: '28px' }}>
          {children}
        </main>
      </div>

      {mobileMenuOpen && (
        <button
          className="dashboard-mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-label={t('workspace.closeMenu')}
        />
      )}

      {/* ================= ROLE SWITCHER MODAL ================= */}
      {roleSwitchModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div className="card" style={{ maxWidth: '520px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
                  {t('workspace.switchRole')}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Select one of your authorized roles or school memberships.
                </p>
              </div>
              <button
                onClick={() => setRoleSwitchModalOpen(false)}
                style={{ background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Platform Admin Option */}
              {user?.is_platform_admin && (
                <div
                  onClick={() => handleSwitchRole(null, 'super_admin')}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    border: activeRole === 'super_admin' ? '2px solid var(--color-gold)' : '1px solid var(--border-color)',
                    backgroundColor: activeRole === 'super_admin' ? 'rgba(214, 173, 85, 0.1)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#8A6818' }}>👑 Super Administrator</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SchoolConnect 360 Platform Control</div>
                  </div>
                  {activeRole === 'super_admin' && <span className="badge badge-gold">Active</span>}
                </div>
              )}

              {/* School Memberships */}
              {user?.memberships?.map((m) => {
                const isSelected = user?.activeSchool?.id === m.school_id && activeRole === m.role;
                const def = ROLE_DEFINITIONS[m.role] || { title: m.role };
                const translatedMembershipRole = t(roleTranslationKey(m.role, 'title'));

                return (
                  <div
                    key={m.membership_id}
                    onClick={() => handleSwitchRole(m.school_id, m.role)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid var(--color-forest)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'rgba(18, 90, 145, 0.05)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--color-forest)' }}>
                        {translatedMembershipRole.startsWith('role.') ? def.title : translatedMembershipRole}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{m.school_name}</div>
                    </div>
                    {isSelected && <span className="badge badge-success">Active</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
