'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, UserPlus, Search, Edit2, KeyRound, Power, Trash2,
  X, Eye, EyeOff, CheckCircle, AlertTriangle, Shield, ChevronDown,
} from 'lucide-react';
import { roleTranslationKey, useLanguage } from '@/lib/i18n';

const ALL_ROLES = [
  { key: 'school_owner', label: 'School Owner / Proprietor' },
  { key: 'headteacher', label: 'Headteacher / Principal' },
  { key: 'deputy_headteacher_academics', label: 'Deputy Headteacher — Academics' },
  { key: 'deputy_headteacher_discipline', label: 'Deputy Headteacher — Discipline' },
  { key: 'school_admin', label: 'School Administrator' },
  { key: 'director_of_studies', label: 'Director of Studies' },
  { key: 'teacher', label: 'Subject Teacher' },
  { key: 'class_teacher', label: 'Class Teacher' },
  { key: 'examination_officer', label: 'Examination Officer' },
  { key: 'academic_records_officer', label: 'Academic Records Officer' },
  { key: 'registrar', label: 'Registrar / Admissions Officer' },
  { key: 'bursar', label: 'Bursar / Finance Officer' },
  { key: 'cashier', label: 'Cashier' },
  { key: 'procurement_officer', label: 'Procurement Officer' },
  { key: 'storekeeper', label: 'Storekeeper' },
  { key: 'feeding_manager', label: 'Feeding/Cafeteria Manager' },
  { key: 'transport_manager', label: 'Transport Manager' },
  { key: 'boarding_manager', label: 'Boarding Manager' },
  { key: 'hr_manager', label: 'HR Manager' },
  { key: 'librarian', label: 'Librarian' },
  { key: 'nurse', label: 'School Nurse / Matron' },
  { key: 'counsellor', label: 'School Counsellor' },
  { key: 'safeguarding_officer', label: 'Safeguarding Officer' },
  { key: 'discipline_officer', label: 'Discipline Officer' },
  { key: 'sports_coordinator', label: 'Sports Coordinator' },
  { key: 'clubs_coordinator', label: 'Clubs & Activities Coordinator' },
  { key: 'ict_officer', label: 'ICT Officer' },
  { key: 'communication_officer', label: 'Communication Officer' },
  { key: 'receptionist', label: 'Receptionist / Front Desk' },
  { key: 'parent', label: 'Parent / Guardian' },
  { key: 'student', label: 'Student' },
  { key: 'alumni', label: 'Alumni' },
  { key: 'supplier', label: 'Supplier' },
];

const ROLE_CATEGORIES = {
  'School Leadership': ['school_owner', 'headteacher', 'deputy_headteacher_academics', 'deputy_headteacher_discipline', 'school_admin'],
  'Academics': ['director_of_studies', 'teacher', 'class_teacher', 'examination_officer', 'academic_records_officer', 'registrar'],
  'Finance & Operations': ['bursar', 'cashier', 'procurement_officer', 'storekeeper', 'feeding_manager', 'transport_manager', 'boarding_manager'],
  'Support Services': ['hr_manager', 'librarian', 'nurse', 'counsellor', 'safeguarding_officer', 'discipline_officer'],
  'Activities & Comms': ['sports_coordinator', 'clubs_coordinator', 'ict_officer', 'communication_officer', 'receptionist'],
  'School Community': ['parent', 'student', 'alumni', 'supplier'],
};

function getRoleBadgeColor(role) {
  if (['school_owner', 'headteacher'].includes(role)) return { bg: '#FFF3CD', color: '#8A6818', border: '#F0C040' };
  if (['school_admin', 'director_of_studies'].includes(role)) return { bg: '#D4EDDA', color: '#1A6B35', border: '#7AC99A' };
  if (['teacher', 'class_teacher'].includes(role)) return { bg: '#D1ECF1', color: '#0C5460', border: '#7EC8D5' };
  if (['bursar', 'cashier'].includes(role)) return { bg: '#E8D5F5', color: '#6B2D8A', border: '#B88FD0' };
  if (['parent', 'student'].includes(role)) return { bg: '#E2E6EA', color: '#495057', border: '#ADB5BD' };
  return { bg: '#F0F4F8', color: '#546E7A', border: '#90A4AE' };
}

export default function AccountsPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [toast, setToast] = useState(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null); // { user, membership }
  const [showAddRoleModal, setShowAddRoleModal] = useState(null); // user
  const [showPasswordModal, setShowPasswordModal] = useState(null); // { userId, name }
  const [showDeleteModal, setShowDeleteModal] = useState(null); // { membershipId, name }
  const translateRole = role => {
    const translated = t(roleTranslationKey(role, 'title'));
    return translated.startsWith('role.') ? ALL_ROLES.find(item => item.key === role)?.label || role : translated;
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load accounts.');
      setUsers(data.users || []);
    } catch (e) {
      showToast(e.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchUsers(); }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchUsers]);

  const performAction = async (payload, successMessage) => {
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'The account action failed.');
      await fetchUsers();
      showToast(data.message || successMessage);
      return true;
    } catch (e) {
      showToast(e.message || 'The account action failed.', 'error');
      return false;
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q);
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  // Helper: is membership active
  const isActive = u => u.membership_status === 'active' || u.membership_active === true;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 999,
          backgroundColor: toast.type === 'success' ? '#123B2A' : '#8B2D2D',
          color: '#fff', padding: '14px 20px', borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: '10px',
          animation: 'slideIn 0.3s ease',
        }}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-deep-forest)', margin: 0 }}>{t('accounts.title')}</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.9rem' }}>
            {t('accounts.description')}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            backgroundColor: 'var(--color-forest)', color: '#fff', border: 'none',
            borderRadius: '10px', padding: '12px 20px', fontWeight: 700, fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
          }}
        >
          <UserPlus size={18} /> {t('accounts.addUser')}
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: t('accounts.total'), value: users.length, color: '#1687D1' },
          { label: t('accounts.active'), value: users.filter(u => isActive(u)).length, color: '#16865D' },
          { label: t('accounts.suspended'), value: users.filter(u => !isActive(u)).length, color: '#C0392B' },
          { label: t('accounts.rolesInUse'), value: new Set(users.map(u => u.role)).size, color: '#7C5CE7' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text" placeholder={t('accounts.search')} value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <select
          value={filterRole} onChange={e => setFilterRole(e.target.value)}
          style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', minWidth: '200px', cursor: 'pointer' }}
        >
          <option value="">{t('accounts.filterRole')}</option>
          {ALL_ROLES.map(r => <option key={r.key} value={r.key}>{translateRole(r.key)}</option>)}
        </select>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4FAFF', borderBottom: '2px solid #E1EFF8' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#546E7A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('accounts.name')}</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#546E7A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('accounts.email')}</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#546E7A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('accounts.role')}</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#546E7A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('accounts.status')}</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#546E7A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('accounts.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>{t('common.loading')}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  {search || filterRole ? t('accounts.noSearchResults') : t('accounts.noUsers')}
                </td></tr>
              ) : filtered.map((u, i) => {
                const badge = getRoleBadgeColor(u.role);
                const roleLabel = translateRole(u.role);
                return (
                  <tr key={u.membership_id || i} style={{ borderBottom: '1px solid #F0F4F8', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAFCFF'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #123B2A, #1A6B35)',
                          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.9rem',
                        }}>
                          {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--color-deep-forest)', fontSize: '0.9rem' }}>{u.full_name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>                          {u.phone || t('accounts.noPhone')}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 700,
                      }}>
                        {roleLabel}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        backgroundColor: isActive(u) ? '#D4EDDA' : '#F8D7DA',
                        color: isActive(u) ? '#155724' : '#721C24',
                        border: `1px solid ${isActive(u) ? '#7AC99A' : '#F5C6CB'}`,
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 700,
                      }}>
                        {isActive(u) ? `● ${t('accounts.active')}` : `○ ${t('accounts.suspended')}`}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setShowAddRoleModal(u)}
                          title={t('accounts.addRole')}
                          style={{ background: '#F1EDFF', color: '#6246B5', border: '1px solid #D6CBFF', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600 }}
                        >
                          <UserPlus size={13} /> {t('accounts.addRole')}
                        </button>
                        <button
                          onClick={() => setShowEditModal({ user: u })}
                          title={t('accounts.edit')}
                          style={{ background: '#E8F4FD', color: '#1565C0', border: '1px solid #90CAF9', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600 }}
                        >
                          <Edit2 size={13} /> {t('accounts.edit')}
                        </button>
                        <button
                          onClick={() => setShowPasswordModal({ userId: u.id, name: u.full_name })}
                          title={t('accounts.reset')}
                          style={{ background: '#FFF3CD', color: '#8A6818', border: '1px solid #F0C040', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600 }}
                        >
                          <KeyRound size={13} /> {t('accounts.reset')}
                        </button>
                        <button
                          onClick={() => performAction(
                            { action: 'toggle_status', membershipId: u.membership_id, currentStatus: u.membership_status },
                            `User ${isActive(u) ? 'suspended' : 'activated'}`
                          )}
                          title={isActive(u) ? t('accounts.suspend') : t('accounts.activate')}
                          style={{ background: isActive(u) ? '#FFF5F5' : '#F0FFF4', color: isActive(u) ? '#8B2D2D' : '#1A6B35', border: `1px solid ${isActive(u) ? '#FEB2B2' : '#7AC99A'}`, padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600 }}
                        >
                          <Power size={13} /> {isActive(u) ? t('accounts.suspend') : t('accounts.activate')}
                        </button>
                        <button
                          onClick={() => setShowDeleteModal({ membershipId: u.membership_id, name: u.full_name })}
                          title={t('accounts.remove')}
                          style={{ background: '#FFF5F5', color: '#8B2D2D', border: '1px solid #FEB2B2', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600 }}
                        >
                          <Trash2 size={13} /> {t('accounts.remove')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #F0F4F8', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {t('accounts.showing').replace('{shown}', filtered.length).replace('{total}', users.length)}
          </div>
        )}
      </div>

      {/* ADD USER MODAL */}
      {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} onSuccess={() => { fetchUsers(); showToast('User created successfully!'); }} />}

      {/* EDIT ROLE MODAL */}
      {showEditModal && <EditRoleModal user={showEditModal.user} onClose={() => setShowEditModal(null)} onSuccess={() => { fetchUsers(); showToast('Account updated successfully!'); }} />}

      {showAddRoleModal && <AddRoleModal user={showAddRoleModal} onClose={() => setShowAddRoleModal(null)} onSuccess={() => { fetchUsers(); showToast('Role added successfully!'); }} />}

      {/* RESET PASSWORD MODAL */}
      {showPasswordModal && <ResetPasswordModal userId={showPasswordModal.userId} name={showPasswordModal.name} onClose={() => setShowPasswordModal(null)} onSuccess={() => { showToast('Password reset successfully!'); }} />}

      {/* DELETE CONFIRM MODAL */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '28px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FFF5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <AlertTriangle size={28} color="#8B2D2D" />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-deep-forest)' }}>{t('accounts.removeUser')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
                {t('accounts.removeUserConfirm').replace('{name}', showDeleteModal.name)}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowDeleteModal(null)} style={{ flex: 1, padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{t('common.cancel')}</button>
              <button
                onClick={async () => {
                  const removed = await performAction(
                    { action: 'remove_membership', membershipId: showDeleteModal.membershipId },
                    'User removed from school'
                  );
                  if (removed) setShowDeleteModal(null);
                }}
                style={{ flex: 1, padding: '12px', background: '#8B2D2D', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
              >
                {t('accounts.confirmRemove')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ ADD USER MODAL ============
function AddUserModal({ onClose, onSuccess }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', role: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', t('accounts.passwordStrength.weak'), t('accounts.passwordStrength.fair'), t('accounts.passwordStrength.good'), t('accounts.passwordStrength.strong')][strength];
  const strengthColor = ['', '#8B2D2D', '#E67E22', '#2980B9', '#1A6B35'][strength];

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.role) return setError(t('accounts.selectRole'));
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_user', ...form }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Failed to create user');
      onSuccess(); onClose();
    } catch (e) { setError('Network error'); }
    finally { setLoading(false); }
  };

  const filteredRoles = selectedCategory
    ? ALL_ROLES.filter(r => ROLE_CATEGORIES[selectedCategory]?.includes(r.key))
    : ALL_ROLES;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-deep-forest)', margin: 0 }}>{t('accounts.addUserTitle')}</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>{t('accounts.addUserDescription')}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
        </div>

        {error && <div style={{ backgroundColor: '#FFF5F5', color: '#8B2D2D', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid #FEB2B2' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('accounts.fullName')} *</label>
              <input required value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="e.g. John Kamara" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('accounts.emailAddress')} *</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="user@school.com" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('accounts.phone')}</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+256 700 000 000" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('accounts.password')} *</label>
              <input required type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Create a secure password" minLength={6}
                style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: '12px', top: '34px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {form.password && (
                <div style={{ marginTop: '6px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: i <= strength ? strengthColor : '#E8ECE8', transition: 'background 0.3s' }} />
                  ))}
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: strengthColor, marginLeft: '6px' }}>{strengthLabel}</span>
                </div>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('accounts.assignRole')} *</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <button type="button" onClick={() => setSelectedCategory('')}
                style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: !selectedCategory ? '2px solid var(--color-forest)' : '1px solid var(--border-color)', backgroundColor: !selectedCategory ? 'var(--color-forest)' : '#fff', color: !selectedCategory ? '#fff' : 'var(--text-secondary)' }}>
                {t('accounts.allRoles')}
              </button>
              {Object.keys(ROLE_CATEGORIES).map(cat => (
                <button key={cat} type="button" onClick={() => setSelectedCategory(cat)}
                  style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: selectedCategory === cat ? '2px solid var(--color-forest)' : '1px solid var(--border-color)', backgroundColor: selectedCategory === cat ? 'var(--color-forest)' : '#fff', color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)' }}>
                  {t(`accounts.roleCategory.${{
                    'School Leadership': 'leadership',
                    Academics: 'academics',
                    'Finance & Operations': 'finance',
                    'Support Services': 'support',
                    'Activities & Comms': 'activities',
                    'School Community': 'community',
                  }[cat]}`)}
                </button>
              ))}
            </div>
            <select required value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}>
              <option value="">{t('accounts.selectRole')}</option>
              {filteredRoles.map(r => {
                const translated = t(roleTranslationKey(r.key, 'title'));
                return <option key={r.key} value={r.key}>{translated.startsWith('role.') ? r.label : translated}</option>;
              })}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>{t('common.cancel')}</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '12px', background: 'var(--color-forest)', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'wait' : 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading ? t('accounts.creating') : <><UserPlus size={16} /> {t('accounts.createUser')}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddRoleModal({ user, onClose, onSuccess }) {
  const { t } = useLanguage();
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async event => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign_role', userId: user.id, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add role.');
      onSuccess();
      onClose();
    } catch (requestError) {
      setError(requestError.message || 'Failed to add role.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-deep-forest)', margin: 0 }}>{t('accounts.roleTitle')}</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '3px' }}>{t('accounts.roleDescription')}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
        </div>
        {error && <div role="alert" style={{ color: '#8B2D2D', padding: '10px', marginBottom: '12px', backgroundColor: '#FFF5F5', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="additional-role" style={{ display: 'block', marginBottom: '7px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{t('accounts.role')}</label>
          <select id="additional-role" value={role} onChange={event => setRole(event.target.value)} required style={{ width: '100%', padding: '11px 12px', marginBottom: '18px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            <option value="">{t('accounts.selectRole')}</option>
            {ALL_ROLES.map(option => {
              const translated = t(roleTranslationKey(option.key, 'title'));
              return <option key={option.key} value={option.key}>{translated.startsWith('role.') ? option.label : translated}</option>;
            })}
          </select>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>{t('common.cancel')}</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>{loading ? t('accounts.creating') : t('accounts.addRole')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ EDIT ROLE MODAL ============
function EditRoleModal({ user, onClose, onSuccess }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    full_name: user.full_name || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_user',
          userId: user.id,
          membershipId: user.membership_id,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Failed');
      onSuccess(); onClose();
    } catch (e) { setError('Network error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-deep-forest)', margin: 0 }}>{t('accounts.editTitle')}</h3>
            <p style={{ marginTop: '3px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{t('accounts.editDescription')}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        {error && <div style={{ color: '#8B2D2D', padding: '10px', marginBottom: '12px', backgroundColor: '#FFF5F5', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
            <label style={{ display: 'grid', gap: '5px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {t('accounts.fullName')}
              <input className="account-form-input" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required maxLength={200} />
            </label>
            <label style={{ display: 'grid', gap: '5px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {t('accounts.emailAddress')}
              <input className="account-form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required maxLength={255} />
            </label>
            <label style={{ display: 'grid', gap: '5px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {t('accounts.phone')}
              <input className="account-form-input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} maxLength={50} />
            </label>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('accounts.editRole')}</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}>
              <option value="">{t('accounts.selectRole')}</option>
              {ALL_ROLES.map(r => {
                const translated = t(roleTranslationKey(r.key, 'title'));
                return <option key={r.key} value={r.key}>{translated.startsWith('role.') ? r.label : translated}</option>;
              })}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{t('common.cancel')}</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: 'var(--color-forest)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
              {loading ? t('accounts.saving') : t('accounts.updateRole')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ RESET PASSWORD MODAL ============
function ResetPasswordModal({ userId, name, onClose, onSuccess }) {
  const { t } = useLanguage();
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (newPassword.length < 6) return setError(t('accounts.passwordMinLength'));
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', userId, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Failed');
      onSuccess(); onClose();
    } catch (e) { setError('Network error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-deep-forest)', margin: 0 }}>{t('accounts.resetTitle').replace('{name}', name)}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        {error && <div style={{ color: '#8B2D2D', padding: '10px', marginBottom: '12px', backgroundColor: '#FFF5F5', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('accounts.newPassword')}</label>
            <input type={showPass ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder={t('accounts.newPasswordHint')} minLength={6}
              style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
            <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: '12px', top: '34px', background: 'none', border: 'none', cursor: 'pointer' }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{t('common.cancel')}</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: '#8A6818', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
              {loading ? t('accounts.saving') : <><KeyRound size={14} /> {t('accounts.resetPassword')}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
