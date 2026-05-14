import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./styles/addpackage-ext.css";

const fmt = d => new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });

export default function BusinessBookings() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("All");
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    if (!user?._id) return;
    API.get(`/bookings/my-business-bookings/${user._id}`)
      .then(r => setBookings(r.data))
      .catch(err => console.error("Failed to load business bookings:", err))
      .finally(() => setLoading(false));
  }, [user]);

  /* ── Confirm / Cancel a booking ── */
  const updateStatus = (id, status) => {
    toast(
      (t) => (
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          Mark booking as <strong>{status}</strong>?
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const tid = toast.loading("Updating…");
              try {
                await API.patch(`/seller-bookings/update/${id}`, { status });
                setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
                toast.success(`✅ Booking marked as ${status}.`, { id: tid });
              } catch {
                toast.error("❌ Status update failed.", { id: tid });
              }
            }}
            style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
          >Confirm</button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ background: "rgba(15, 23, 42, 0.1)", color: "#0f172a", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
          >Cancel</button>
        </span>
      ),
      { duration: 6000 }
    );
  };

  /* ── Derived stats ── */
  const totalRevenue = bookings
    .filter(b => b.status === "Confirmed")
    .reduce((acc, b) => acc + (b.totalCharge || 0), 0);

  const pending   = bookings.filter(b => b.status === "Pending").length;
  const confirmed = bookings.filter(b => b.status === "Confirmed").length;

  /* ── Filter + search ── */
  const displayed = bookings.filter(b => {
    const matchStatus = filter === "All" || b.status === filter;
    const q           = search.toLowerCase();
    const matchSearch = !q
      || b.customerId?.username?.toLowerCase().includes(q)
      || b.packageId?.name?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  if (loading) return (
    <div className="ap-page">
      <div className="ap-card" style={{ textAlign: "center", maxWidth: 500 }}>
        <div style={{ fontSize:32, marginBottom:16 }}>⏳</div>
        <p className="ap-page-sub" style={{ margin: 0 }}>Loading bookings…</p>
      </div>
    </div>
  );

  return (
    <div className="ap-page" style={{ alignItems: "stretch", padding: "60px 24px" }}>
      <div className="ap-card" style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div className="ap-page-header">
          <button type="button" className="ap-back-btn" onClick={() => navigate("/businesstools")}>
            ← Back to Dashboard
          </button>
          <div className="ap-eyebrow">📬 Incoming Bookings</div>
          <h1 className="ap-page-title">Service Bookings</h1>
          <p className="ap-page-sub">Manage all incoming customer bookings for your published services.</p>
        </div>

        {/* ── Stats bar ── */}
        <div className="ap-stats-row">
          <div className="ap-stat-card">
            <span className="ap-stat-val">{bookings.length}</span>
            <span className="ap-stat-label">Total Bookings</span>
          </div>
          <div className="ap-stat-card">
            <span className="ap-stat-val" style={{ color: "#d97706" }}>{pending}</span>
            <span className="ap-stat-label">Pending</span>
          </div>
          <div className="ap-stat-card">
            <span className="ap-stat-val" style={{ color: "var(--green)" }}>{confirmed}</span>
            <span className="ap-stat-label">Confirmed</span>
          </div>
          <div className="ap-stat-card">
            <span className="ap-stat-val" style={{ color: "var(--primary)" }}>Rs {totalRevenue.toLocaleString()}</span>
            <span className="ap-stat-label">Revenue (Confirmed)</span>
          </div>
        </div>

        {/* ── Filters ── */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8, background: "var(--surface)", padding: 6, borderRadius: 12, border: "1px solid var(--border)" }}>
            {["All","Pending","Confirmed","Cancelled"].map(s => (
              <button key={s}
                style={{
                  background: filter === s ? "var(--white)" : "transparent",
                  color: filter === s ? "var(--ink)" : "var(--ink-60)",
                  boxShadow: filter === s ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                }}
                onClick={() => setFilter(s)}>
                {s}
              </button>
            ))}
          </div>
          <input
            className="ap-input"
            style={{ width: "100%", maxWidth: 300, padding: "10px 16px" }}
            placeholder="🔍 Search by customer or service…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* ── Table ── */}
        <div className="ap-table-wrapper">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service</th>
                <th>Dates</th>
                <th style={{ textAlign: "center" }}>Days</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length > 0 ? displayed.map(b => (
                <tr key={b._id}>
                  {/* Customer */}
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--primary-l)", color: "var(--primary-d)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                        {b.customerId?.username?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 14 }}>{b.customerId?.username || "—"}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-60)" }}>{b.customerId?.email || ""}</div>
                      </div>
                    </div>
                  </td>

                  {/* Service */}
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--ink)" }}>{b.packageId?.name || "—"}</div>
                    {b.packageId?.serviceCategory && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--primary)", background: "var(--primary-l)", padding: "2px 6px", borderRadius: 4, marginTop: 4, display: "inline-block" }}>
                        {b.packageId.serviceCategory}
                      </span>
                    )}
                  </td>

                  {/* Dates */}
                  <td>
                    <div style={{ fontSize: 13, color: "var(--ink)" }}>{fmt(b.startDate)}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-60)" }}>to {fmt(b.endDate)}</div>
                  </td>

                  {/* Days */}
                  <td style={{ textAlign: "center", fontWeight: 700 }}>
                    {b.numberOfDays ?? "—"}
                  </td>

                  {/* Total */}
                  <td style={{ fontWeight: 700 }}>Rs {b.totalCharge?.toLocaleString() || "—"}</td>

                  {/* Status */}
                  <td>
                    <span className={`ap-status-pill ap-status-${b.status.toLowerCase()}`}>
                      {b.status === "Pending" && "⏳"}
                      {b.status === "Confirmed" && "✅"}
                      {b.status === "Cancelled" && "❌"}
                      {" "}{b.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      {b.status === "Pending" ? (
                        <>
                          <button className="ap-table-btn" style={{ borderColor: "var(--green)", color: "var(--green)" }} title="Confirm" onClick={() => updateStatus(b._id, "Confirmed")}>✔ Confirm</button>
                          <button className="ap-table-btn danger" title="Cancel" onClick={() => updateStatus(b._id, "Cancelled")}>✖</button>
                        </>
                      ) : (
                        <span style={{ color: "var(--ink-40)", fontSize: 12, fontWeight: 600 }}>—</span>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" style={{ textAlign:"center", padding:40, color:"var(--ink-40)" }}>
                    {search || filter !== "All"
                      ? "No bookings match your filters."
                      : "No bookings yet — your services are visible to travellers!"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
