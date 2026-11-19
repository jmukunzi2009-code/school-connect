'use client';
/**
 * SCHOOL OPERATIONS — Stock, Cafeteria, Transport, Procurement
 * Roles:
 *   - storekeeper: inventory items, stock in/out, low stock alerts
 *   - feeding_manager: meal menus, cafeteria inventory, consumption records
 *   - procurement_officer: purchase requests, orders, suppliers
 *   - transport_manager: vehicles, routes, student allocations
 *   - boarding_manager: dormitories, room allocations
 *   - school_admin / headteacher: view all summary
 */

import React, { useState, useEffect } from 'react';
import {
  Truck, Package, Coffee, Building, ShoppingCart, Plus, X,
  CheckCircle2, AlertCircle, TrendingDown, TrendingUp, Archive,
  BarChart3, ChevronRight, Clock, Users, Layers,
} from 'lucide-react';

const TABS = [
  { id: 'inventory', label: 'Inventory & Stock', icon: Package, roles: ['storekeeper', 'school_admin', 'headteacher', 'procurement_officer'] },
  { id: 'cafeteria', label: 'Cafeteria', icon: Coffee, roles: ['feeding_manager', 'school_admin', 'headteacher'] },
  { id: 'procurement', label: 'Procurement', icon: ShoppingCart, roles: ['procurement_officer', 'school_admin', 'headteacher', 'bursar'] },
  { id: 'transport', label: 'Transport & Boarding', icon: Truck, roles: ['transport_manager', 'boarding_manager', 'school_admin', 'headteacher'] },
];

// Demo data
const INVENTORY = [
  { id: 1, name: 'Exercise Books (A4)', category: 'Stationery', unit: 'Reams', qty: 48, min_qty: 20, unit_cost: 2500, last_updated: '2026-11-15' },
  { id: 2, name: 'Whiteboard Markers (Blue)', category: 'Stationery', unit: 'Boxes', qty: 8, min_qty: 10, unit_cost: 3500, last_updated: '2026-11-14' },
  { id: 3, name: 'Hand Sanitizer (500ml)', category: 'Health Supplies', unit: 'Bottles', qty: 25, min_qty: 15, unit_cost: 1800, last_updated: '2026-11-13' },
  { id: 4, name: 'Dustless Chalk (White)', category: 'Stationery', unit: 'Boxes', qty: 6, min_qty: 12, unit_cost: 1200, last_updated: '2026-11-12' },
  { id: 5, name: 'Printer Paper (A4)', category: 'Stationery', unit: 'Reams', qty: 15, min_qty: 10, unit_cost: 5500, last_updated: '2026-11-10' },
  { id: 6, name: 'Liquid Soap (5L)', category: 'Health Supplies', unit: 'Containers', qty: 4, min_qty: 5, unit_cost: 8000, last_updated: '2026-11-09' },
];

const CAFETERIA_MENU = [
  { day: 'Monday', breakfast: 'Porridge + Bread', lunch: 'Rice + Beans + Salad', dinner: 'Posho + Groundnut Sauce', students_fed: 342 },
  { day: 'Tuesday', breakfast: 'Milk + Mandazi', lunch: 'Ugali + Cabbage Stew', dinner: 'Rice + Beef Stew', students_fed: 338 },
  { day: 'Wednesday', breakfast: 'Porridge + Cassava', lunch: 'Rice + Lentils', dinner: 'Posho + Beans', students_fed: 345 },
  { day: 'Thursday', breakfast: 'Milk + Bread', lunch: 'Matoke + Groundnut Sauce', dinner: 'Rice + Fish', students_fed: 340 },
  { day: 'Friday', breakfast: 'Porridge + Egg', lunch: 'Rice + Chicken Stew', dinner: 'Posho + Mixed Veg', students_fed: 335 },
];

const FOOD_STOCK = [
  { item: 'Rice (25kg bags)', opening: 50, in: 20, consumed: 35, closing: 35, alert: false },
  { item: 'Beans (10kg bags)', opening: 30, in: 15, consumed: 28, closing: 17, alert: true },
  { item: 'Maize Flour (25kg)', opening: 40, in: 0, consumed: 38, closing: 2, alert: true },
  { item: 'Cooking Oil (20L)', opening: 10, in: 5, consumed: 8, closing: 7, alert: false },
  { item: 'Sugar (10kg)', opening: 15, in: 10, consumed: 14, closing: 11, alert: false },
  { item: 'Salt (5kg)', opening: 8, in: 2, consumed: 6, closing: 4, alert: true },
];

const PURCHASE_REQUESTS = [
  { id: 'PR-001', item: 'Whiteboard Markers (Blue) — 20 boxes', dept: 'Stationery', requested_by: 'Mr. Kamanzi', amount: 70000, status: 'approved', date: '2026-11-14' },
  { id: 'PR-002', item: 'Maize Flour (25kg) — 50 bags', dept: 'Cafeteria', requested_by: 'Mrs. Nkusi', amount: 1375000, status: 'pending', date: '2026-11-16' },
  { id: 'PR-003', item: 'Science Lab Chemicals — Q4 Supply', dept: 'Sciences', requested_by: 'Dr. Habimana', amount: 450000, status: 'pending', date: '2026-11-15' },
  { id: 'PR-004', item: 'Printer Toner Cartridges (x6)', dept: 'Admin', requested_by: 'Admin Office', amount: 180000, status: 'rejected', date: '2026-11-10' },
];

const BUSES = [
  { id: 1, plate: 'RAD 123A', capacity: 60, driver: 'Mr. Bizimana', route: 'Kigali City Center ↔ School', students: 54, status: 'active' },
  { id: 2, plate: 'RAD 456B', capacity: 45, driver: 'Mr. Mugisha', route: 'Remera ↔ School', students: 38, status: 'active' },
  { id: 3, plate: 'RAD 789C', capacity: 60, driver: '—', route: 'Nyamirambo ↔ School', students: 0, status: 'maintenance' },
];

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [userRole, setUserRole]   = useState(null);
  const [stockModal, setStockModal] = useState(null); // { item, action: 'in'|'out' }
  const [stockQty, setStockQty]   = useState('');
  const [stockNote, setStockNote] = useState('');
  const [success, setSuccess]     = useState(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      setUserRole(d.user?.activeRole);
      // Auto-select the right tab based on role
      const role = d.user?.activeRole;
      if (role === 'feeding_manager') setActiveTab('cafeteria');
      else if (role === 'procurement_officer') setActiveTab('procurement');
      else if (role === 'transport_manager' || role === 'boarding_manager') setActiveTab('transport');
    });
  }, []);

  const canSeeTab = (tab) => !userRole || tab.roles.includes(userRole) || userRole === 'school_admin';
  const FMT = (v) => Number(v || 0).toLocaleString();

  const handleStockMovement = (e) => {
    e.preventDefault();
    setStockModal(null);
    setSuccess(`Stock ${stockModal?.action === 'in' ? 'received' : 'issued'} for ${stockModal?.name}: ${stockQty} ${stockModal?.unit}.`);
    setTimeout(() => setSuccess(null), 4000);
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '4px' }}>School Operations</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage inventory, cafeteria, procurement, transport and boarding.</p>
      </div>

      {success && <div style={{ background: '#E8F5EE', border: '1px solid #BFE0CA', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#126338', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} /> {success}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid var(--border-color)', marginBottom: '28px', flexWrap: 'wrap' }}>
        {TABS.filter(canSeeTab).map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 700, fontSize: '0.88rem', color: activeTab === tab.id ? '#123B2A' : 'var(--text-secondary)', borderBottom: activeTab === tab.id ? '2px solid #123B2A' : '2px solid transparent', marginBottom: '-2px', transition: 'all 0.2s' }}>
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ══ INVENTORY ══ */}
      {activeTab === 'inventory' && (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
            {[
              { label: 'Total Items', val: INVENTORY.length, color: '#123B2A', icon: Package },
              { label: 'Low Stock Alerts', val: INVENTORY.filter(i => i.qty <= i.min_qty).length, color: '#C0392B', icon: AlertCircle },
              { label: 'Total Value', val: `RWF ${FMT(INVENTORY.reduce((a, i) => a + i.qty * i.unit_cost, 0))}`, color: '#226F8A', icon: BarChart3 },
              { label: 'Categories', val: new Set(INVENTORY.map(i => i.category)).size, color: '#1E7E4A', icon: Layers },
            ].map(s => { const Icon = s.icon; return (
              <div key={s.label} style={{ background: 'var(--bg-surface)', borderRadius: '12px', padding: '18px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{s.label.toUpperCase()}</span>
                  <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={13} color={s.color} /></div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: s.color }}>{s.val}</div>
              </div>
            ); })}
          </div>

          <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Stock Register</span>
              {['storekeeper','school_admin'].includes(userRole) && (
                <button style={{ padding: '8px 14px', borderRadius: '8px', background: '#123B2A', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Plus size={14} /> Add Item
                </button>
              )}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  {['Item', 'Category', 'In Stock', 'Min Stock', 'Unit Cost', 'Total Value', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.4px' }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INVENTORY.map((item, i) => {
                  const low = item.qty <= item.min_qty;
                  return (
                    <tr key={item.id} style={{ borderTop: '1px solid var(--border-color)', background: i % 2 === 1 ? 'var(--bg-primary)' : 'transparent' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{item.category}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: low ? '#C0392B' : '#1E7E4A', fontSize: '1rem' }}>{item.qty} <span style={{ fontSize: '0.74rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{item.unit}</span></td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>{item.min_qty}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>RWF {FMT(item.unit_cost)}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>RWF {FMT(item.qty * item.unit_cost)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, background: low ? '#FDE8E8' : '#E8F5EE', color: low ? '#A51D24' : '#126338' }}>
                          {low ? '⚠ Low Stock' : '✓ OK'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {['storekeeper','school_admin'].includes(userRole) && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => { setStockModal({ ...item, action: 'in' }); setStockQty(''); setStockNote(''); }}
                              style={{ padding: '4px 10px', borderRadius: '6px', background: '#E8F5EE', color: '#126338', border: '1px solid #BFE0CA', fontSize: '0.76px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.76rem' }}>
                              <TrendingUp size={11} /> In
                            </button>
                            <button onClick={() => { setStockModal({ ...item, action: 'out' }); setStockQty(''); setStockNote(''); }}
                              style={{ padding: '4px 10px', borderRadius: '6px', background: '#FEF8EE', color: '#925807', border: '1px solid #F0D88A', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.76rem' }}>
                              <TrendingDown size={11} /> Out
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ══ CAFETERIA ══ */}
      {activeTab === 'cafeteria' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {/* Weekly menu */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Coffee size={16} color="#B47214" /> This Week's Menu
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {CAFETERIA_MENU.map((day, i) => (
                  <div key={day.day} style={{ padding: '14px 20px', borderBottom: i < CAFETERIA_MENU.length - 1 ? '1px solid var(--border-color)' : 'none', background: i % 2 === 1 ? 'var(--bg-primary)' : 'transparent' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 800, color: '#123B2A', fontSize: '0.88rem' }}>{day.day}</span>
                      <span style={{ fontSize: '0.76rem', color: '#1E7E4A', fontWeight: 700, background: '#E8F5EE', padding: '2px 8px', borderRadius: '8px' }}>
                        {day.students_fed} fed
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      🌅 {day.breakfast}<br />☀ {day.lunch}<br />🌙 {day.dinner}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Food stock */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={16} color="#226F8A" /> Food Stock Register
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-primary)' }}>
                    {['Item', 'Opening', 'In', 'Used', 'Closing', ''].map(h => (
                      <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FOOD_STOCK.map((f, i) => (
                    <tr key={f.item} style={{ borderTop: '1px solid var(--border-color)', background: i % 2 === 1 ? 'var(--bg-primary)' : 'transparent' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem' }}>{f.item}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{f.opening}</td>
                      <td style={{ padding: '10px 14px', color: '#1E7E4A', fontWeight: 700 }}>+{f.in}</td>
                      <td style={{ padding: '10px 14px', color: '#C0392B', fontWeight: 700 }}>-{f.consumed}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: f.alert ? '#C0392B' : '#1E7E4A' }}>{f.closing}</td>
                      <td style={{ padding: '10px 14px' }}>
                        {f.alert && <span style={{ background: '#FDE8E8', color: '#A51D24', padding: '2px 7px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>LOW</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ══ PROCUREMENT ══ */}
      {activeTab === 'procurement' && (
        <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Purchase Requests ({PURCHASE_REQUESTS.length})</div>
            {['procurement_officer','school_admin'].includes(userRole) && (
              <button style={{ padding: '8px 14px', borderRadius: '8px', background: '#123B2A', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Plus size={14} /> New Request
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {PURCHASE_REQUESTS.map((pr, i) => {
              const statusConfig = {
                approved: { bg: '#E8F5EE', color: '#126338' },
                pending: { bg: '#FFF6E5', color: '#925807' },
                rejected: { bg: '#FDE8E8', color: '#A51D24' },
              }[pr.status] || { bg: '#F0F2F0', color: '#5E6D62' };
              return (
                <div key={pr.id} style={{ padding: '18px 20px', borderBottom: i < PURCHASE_REQUESTS.length - 1 ? '1px solid var(--border-color)' : 'none', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: '16px', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, color: '#123B2A', fontSize: '0.84rem', fontFamily: 'monospace' }}>{pr.id}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '3px' }}>{pr.item}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      Dept: {pr.dept} · By: {pr.requested_by} · {pr.date}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#226F8A', fontSize: '0.95rem', textAlign: 'right' }}>RWF {FMT(pr.amount)}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 700, background: statusConfig.bg, color: statusConfig.color }}>{pr.status.toUpperCase()}</span>
                    {pr.status === 'pending' && ['procurement_officer','school_admin','headteacher','bursar'].includes(userRole) && (
                      <>
                        <button style={{ padding: '5px 10px', borderRadius: '6px', background: '#E8F5EE', color: '#126338', border: '1px solid #BFE0CA', fontWeight: 700, fontSize: '0.76rem', cursor: 'pointer' }}>Approve</button>
                        <button style={{ padding: '5px 10px', borderRadius: '6px', background: '#FDE8E8', color: '#A51D24', border: '1px solid #FECACA', fontWeight: 700, fontSize: '0.76rem', cursor: 'pointer' }}>Reject</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ TRANSPORT ══ */}
      {activeTab === 'transport' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {BUSES.map(bus => (
            <div key={bus.id} style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: `1.5px solid ${bus.status === 'maintenance' ? '#FECACA' : 'var(--border-color)'}`, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{bus.plate}</div>
                <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, background: bus.status === 'active' ? '#E8F5EE' : '#FDE8E8', color: bus.status === 'active' ? '#126338' : '#A51D24' }}>
                  {bus.status.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                <div><strong style={{ color: 'var(--text-primary)' }}>Route:</strong> {bus.route}</div>
                <div><strong style={{ color: 'var(--text-primary)' }}>Driver:</strong> {bus.driver}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '2px' }}>STUDENTS</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#123B2A' }}>{bus.students}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '2px' }}>CAPACITY</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#5E6D62' }}>{bus.capacity}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '2px' }}>LOAD</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: (bus.students / bus.capacity) > 0.9 ? '#C0392B' : '#1E7E4A' }}>
                      {Math.round((bus.students / bus.capacity) * 100)}%
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '6px', background: 'var(--border-color)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(bus.students / bus.capacity) * 100}%`, background: (bus.students / bus.capacity) > 0.9 ? '#C0392B' : '#1E7E4A', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stock movement modal */}
      {stockModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '20px', padding: '28px', maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  Stock {stockModal.action === 'in' ? 'Received' : 'Issued'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>{stockModal.name}</p>
              </div>
              <button onClick={() => setStockModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleStockMovement}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Quantity ({stockModal.unit}) *
              </label>
              <input type="number" required min="1" value={stockQty} onChange={e => setStockQty(e.target.value)}
                style={{ width: '100%', padding: '10px 13px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontSize: '0.9rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none', marginBottom: '14px' }} />
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>Note / Reference</label>
              <input type="text" value={stockNote} onChange={e => setStockNote(e.target.value)} placeholder={stockModal.action === 'in' ? 'e.g. PO-234, Supplier: ABC Ltd' : 'e.g. Issued to Sciences Dept'}
                style={{ width: '100%', padding: '10px 13px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontSize: '0.9rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none', marginBottom: '20px' }} />
              <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: stockModal.action === 'in' ? '#1E7E4A' : '#B47214', color: '#fff', fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer' }}>
                Confirm Stock {stockModal.action === 'in' ? 'Receipt' : 'Issue'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
