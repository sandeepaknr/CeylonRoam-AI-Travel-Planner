import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import "./style/AdminDashboard.css";

const API_BASE = "http://localhost:5000/api";

const PIE_COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e", "#a78bfa"];

/* ── Reusable Stat Card ─────────────────────────────────────── */
const StatCard = ({ icon, label, value, sub, accent }) => (
  <div className="an-stat-card" style={{ borderTop: `3px solid ${accent}` }}>
    <div className="an-stat-icon" style={{ background: accent + "22", color: accent }}>{icon}</div>
    <div className="an-stat-body">
      <div className="an-stat-value">{value}</div>
      <div className="an-stat-label">{label}</div>
      {sub && <div className="an-stat-sub">{sub}</div>}
    </div>
  </div>
);

/* ── Main Component ─────────────────────────────────────────── */
export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [legacy,    setLegacy]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE}/admin/analytics`),
      axios.get(`${API_BASE}/admin/dynamic-stats`),
    ])
      .then(([aRes, lRes]) => {
        setAnalytics(aRes.data);
        setLegacy(lRes.data);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load analytics data. Check your backend terminal.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="an-loader">
      <div className="an-spinner" />
      <p>Loading Analytics…</p>
    </div>
  );

  if (error) return <div className="an-error">⚠️ {error}</div>;

  const { systemStats, monthlyRevenue, revenueByCategory, topPackages, bookingsByCountry, tripsByCountry } = analytics;

  // Merge country data for a combined chart
  const combinedCountryData = Array.from(new Set([
    ...(bookingsByCountry?.map(b => b.country) || []),
    ...(tripsByCountry?.map(t => t.country) || [])
  ])).map(country => ({
    name: country || "Unknown",
    bookings: bookingsByCountry?.find(b => b.country === country)?.bookings || 0,
    trips: tripsByCountry?.find(t => t.country === country)?.trips || 0
  })).sort((a, b) => (b.bookings + b.trips) - (a.bookings + a.trips)).slice(0, 8);

  return (
    <div className="an-dashboard">

      {/* ── Page Header ── */}
      <header className="an-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p>Live platform performance · CeylonRoam Admin</p>
        </div>
        <div className="an-header-badge">📊 Real-time</div>
      </header>

      {/* ── Summary Stat Cards ── */}
      <section className="an-stats-grid">
        <StatCard icon="👥" label="Total Travelers"    value={systemStats.totalUsers.toLocaleString()}           sub="Registered accounts"       accent="#6366f1" />
        <StatCard icon="💼" label="Business Providers" value={systemStats.totalProviders.toLocaleString()}        sub="Active service providers"  accent="#22d3ee" />
        <StatCard icon="🌍" label="Active Listings"    value={systemStats.totalActivePackages.toLocaleString()}   sub="Packages & Services"       accent="#f59e0b" />
        <StatCard icon="📦" label="Total Bookings"     value={systemStats.totalBookings.toLocaleString()}         sub="All-time"                  accent="#10b981" />
        <StatCard icon="💰" label="Total Revenue"      value={`LKR ${systemStats.totalRevenue.toLocaleString()}`} sub="Confirmed + Completed"    accent="#f43f5e" />
        <StatCard icon="⏳" label="Pending Requests"   value={legacy?.stats?.pendingRequests ?? "—"}              sub="Awaiting approval"         accent="#a78bfa" />
      </section>

      {/* ── Charts Row: Line + Pie ── */}
      <section className="an-charts-row">

        {/* Monthly Revenue Line Chart */}
        <div className="an-chart-card an-chart-wide">
          <h3>📈 Monthly Revenue (LKR)</h3>
          {monthlyRevenue.length === 0 ? (
            <div className="an-empty">No confirmed booking data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyRevenue} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [`LKR ${v.toLocaleString()}`, "Revenue"]} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: "#6366f1", r: 4 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue by Category Donut Pie */}
        <div className="an-chart-card">
          <h3>🥧 Revenue by Category</h3>
          {revenueByCategory.length === 0 ? (
            <div className="an-empty">No category revenue data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name?.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {revenueByCategory.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={v => `LKR ${v.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </section>

      {/* ── Monthly Booking Volume Bar Chart ── */}
      {monthlyRevenue.length > 0 && (
        <section className="an-bar-section">
          <div className="an-chart-card an-chart-full">
            <h3>📦 Monthly Booking Volume</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyRevenue} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* ── Geographic Distribution: Bookings vs Trips ── */}
      {combinedCountryData.length > 0 && (
        <section className="an-bar-section">
          <div className="an-chart-card an-chart-full">
            <h3>🌍 Geographic Distribution (Bookings vs Planned Trips)</h3>
            <p className="an-chart-subtitle">Top countries by platform engagement</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={combinedCountryData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="top" height={36}/>
                <Bar name="Bookings" dataKey="bookings" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar name="Planned Trips" dataKey="trips" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* ── Top 5 Most Viewed Listings Table ── */}
      <section className="an-table-section">
        <h3>🔥 Top 5 Most Viewed Listings</h3>
        {topPackages.length === 0 ? (
          <div className="an-empty">
            No view data yet. Views are tracked each time a user opens a listing detail page.
          </div>
        ) : (
          <div className="an-table-wrapper">
            <table className="an-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Listing Name</th>
                  <th>Provider</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Price (LKR)</th>
                  <th>👁 Views</th>
                </tr>
              </thead>
              <tbody>
                {topPackages.map((pkg, idx) => (
                  <tr key={pkg._id}>
                    <td><span className="an-rank">{idx + 1}</span></td>
                    <td><strong>{pkg.name}</strong></td>
                    <td>{pkg.creator?.username || "—"}</td>
                    <td><span className="an-badge">{pkg.serviceCategory || pkg.listingType}</span></td>
                    <td>
                      <span className={`an-type ${pkg.listingType === "Package" ? "pkg" : "svc"}`}>
                        {pkg.listingType}
                      </span>
                    </td>
                    <td>{pkg.price?.toLocaleString()}</td>
                    <td><span className="an-views">{pkg.views?.toLocaleString() ?? 0}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Recent Business Registrations Table ── */}
      {legacy?.recentBusinesses?.length > 0 && (
        <section className="an-table-section">
          <h3>🏢 Recent Business Registrations</h3>
          <div className="an-table-wrapper">
            <table className="an-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {legacy.recentBusinesses.map(biz => (
                  <tr key={biz._id}>
                    <td><strong>{biz.username}</strong></td>
                    <td>{biz.email}</td>
                    <td>{new Date(biz.createdAt).toLocaleDateString("en-GB")}</td>
                    <td>
                      <span className={`status-badge ${biz.accountType}`}>{biz.accountType}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

    </div>
  );
}