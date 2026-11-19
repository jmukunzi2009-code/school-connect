'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Users,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';

const ATTENDANCE_TREND = [
  { day: 'Mon', attendance: 96, target: 95 },
  { day: 'Tue', attendance: 98, target: 95 },
  { day: 'Wed', attendance: 94, target: 95 },
  { day: 'Thu', attendance: 97, target: 95 },
  { day: 'Fri', attendance: 93, target: 95 },
];

const REVENUE_DATA = [
  { term: 'Term 1', collected: 24500, outstanding: 6500 },
  { term: 'Term 2', collected: 28000, outstanding: 4200 },
  { term: 'Term 3', collected: 31200, outstanding: 3100 },
];

const GENDER_DATA = [
  { name: 'Female Students', value: 54, color: '#D6AD55' },
  { name: 'Male Students', value: 46, color: '#125A91' },
];

const GRADE_DISTRIBUTION = [
  { grade: 'Grade A (80-100%)', count: 42 },
  { grade: 'Grade B (70-79%)', count: 35 },
  { grade: 'Grade C (60-69%)', count: 28 },
  { grade: 'Grade D (50-59%)', count: 14 },
  { grade: 'Grade F (<50%)', count: 6 },
];

export default function ReportsAnalyticsPage() {
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportCSV = () => {
    // Generate CSV data string
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Category,Value,Status\n' +
      'Total Enrollment,Senior 1,45,Active\n' +
      'Average Attendance,Weekly,95.6%,Optimal\n' +
      'Tuition Collected,Term 1,$24500,Verified\n' +
      'Tuition Outstanding,Term 1,$6500,Pending\n' +
      'Library Books Circulated,Term 1,180,Active\n' +
      'Clinic Consultations,Term 1,32,Logged\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SchoolConnect360_${selectedTerm}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
            Analytical Reports & Institutional Metrics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Real-time visual intelligence spanning admissions, attendance fidelity, revenue collection, and academic bell curves.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="form-select"
            style={{ width: '150px' }}
          >
            <option value="Term 1">Term 1 (2026)</option>
            <option value="Term 2">Term 2 (2026)</option>
            <option value="Term 3">Term 3 (2026)</option>
          </select>

          <button onClick={handleExportCSV} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Export CSV Report
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div style={{ backgroundColor: '#E6F5EC', color: '#126338', padding: '12px 18px', borderRadius: '8px', border: '1px solid #B7E4C7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> Official CSV report downloaded to your device successfully!
        </div>
      )}

      {/* Top Summary Stat Cards */}
      <div className="grid-4">
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Weekly Attendance Rate</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-forest)', marginTop: '4px' }}>95.6%</div>
            <div style={{ fontSize: '0.78rem', color: '#1E7E4A', fontWeight: 600, marginTop: '2px' }}>+1.8% vs last month</div>
          </div>
          <div className="stat-icon-wrap" style={{ backgroundColor: 'rgba(18, 90, 145, 0.1)', color: 'var(--color-forest)' }}>
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Fee Recovery Efficiency</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1E7E4A', marginTop: '4px' }}>79.0%</div>
            <div style={{ fontSize: '0.78rem', color: '#1E7E4A', fontWeight: 600, marginTop: '2px' }}>On track for target</div>
          </div>
          <div className="stat-icon-wrap" style={{ backgroundColor: 'rgba(30, 126, 74, 0.15)', color: '#1E7E4A' }}>
            <CreditCard size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Academic Pass Rate</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8A6818', marginTop: '4px' }}>84.2%</div>
            <div style={{ fontSize: '0.78rem', color: '#8A6818', fontWeight: 600, marginTop: '2px' }}>Mid-term exams</div>
          </div>
          <div className="stat-icon-wrap" style={{ backgroundColor: 'rgba(214, 173, 85, 0.2)', color: '#8A6818' }}>
            <BarChart3 size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Student Base</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-deep-forest)', marginTop: '4px' }}>125</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Zero dropouts</div>
          </div>
          <div className="stat-icon-wrap" style={{ backgroundColor: 'rgba(18, 90, 145, 0.08)', color: 'var(--color-forest)' }}>
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid-2">
        {/* Attendance Trend Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-deep-forest)', marginBottom: '18px' }}>
            Daily Student Attendance (%) vs Target
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ATTENDANCE_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8ECE8" />
                <XAxis dataKey="day" stroke="#60798C" />
                <YAxis domain={[85, 100]} stroke="#60798C" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attendance" stroke="#125A91" strokeWidth={3} name="Actual Attendance %" />
                <Line type="monotone" dataKey="target" stroke="#D6AD55" strokeDasharray="5 5" name="School Target (95%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tuition Fee Collection Bar Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-deep-forest)', marginBottom: '18px' }}>
            Tuition Collections vs Outstanding Balances ($)
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8ECE8" />
                <XAxis dataKey="term" stroke="#60798C" />
                <YAxis stroke="#60798C" />
                <Tooltip />
                <Legend />
                <Bar dataKey="collected" fill="#1E7E4A" name="Collected Revenue ($)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outstanding" fill="#D6AD55" name="Outstanding Balance ($)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution Bar Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-deep-forest)', marginBottom: '18px' }}>
            Mid-Term Grade Distribution (Academic Quality)
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GRADE_DISTRIBUTION} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E8ECE8" />
                <XAxis type="number" stroke="#60798C" />
                <YAxis dataKey="grade" type="category" stroke="#60798C" width={140} />
                <Tooltip />
                <Bar dataKey="count" fill="#125A91" name="Number of Students" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Demographics Ratio */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-deep-forest)', marginBottom: '18px' }}>
            Student Gender Demographics
          </h3>
          <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={GENDER_DATA}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {GENDER_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
