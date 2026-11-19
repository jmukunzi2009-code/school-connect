import { Building, ShieldCheck, Users, ArrowUpRight } from 'lucide-react';

export const instant = false;

const schools = [
  {
    id: '1',
    name: 'Kigali Heights International Academy',
    slug: 'kigali-heights',
    email: 'info@kigaliheights.edu',
    country: 'Rwanda',
    district: 'Gasabo',
    school_type: 'Combined Secondary',
    status: 'active',
    plan: 'Enterprise',
    students_count: 5,
  },
];

export default function SuperAdminSchoolsPage() {

  const summaryStats = [
    { label: 'Active schools', value: '128', icon: Building, tone: '#125A91' },
    { label: 'Students onboarded', value: '12,840', icon: Users, tone: '#1E7E4A' },
    { label: 'Secure tenants', value: '99.9%', icon: ShieldCheck, tone: '#D6AD55' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
            Registered School Workspaces
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Active institutional tenants running on the SchoolConnect 360 multi-tenant cloud.
          </p>
        </div>
        <button className="btn-primary" style={{ padding: '10px 18px', borderRadius: '12px', fontWeight: 800 }}>
          Add new school <ArrowUpRight size={16} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{stat.label}</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-deep-forest)', marginTop: '6px' }}>{stat.value}</div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${stat.tone}14`, color: stat.tone, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table-custom">
            <thead>
              <tr>
                <th>School Name</th>
                <th>Tenant Slug</th>
                <th>Official Email</th>
                <th>Location</th>
                <th>Subscription Plan</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700, color: 'var(--color-forest)' }}>{s.name}</td>
                  <td>
                    <span className="badge badge-info">{s.slug}</span>
                  </td>
                  <td>{s.email}</td>
                  <td>{s.district}, {s.country}</td>
                  <td>
                    <span className="badge badge-gold">{s.plan} Plan</span>
                  </td>
                  <td>
                    <span className="badge badge-success">ACTIVE & SECURED</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      Inspect Workspace
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
