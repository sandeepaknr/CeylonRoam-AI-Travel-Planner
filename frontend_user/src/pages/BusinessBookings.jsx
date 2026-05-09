import React, { useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./styles/sellerBookings.css";
import "./styles/businessBookings.css";

const STATUS_STYLE = {
  Pending:   { bg:"#fffaf0", color:"#7b341e", emoji:"⏳" },
  Confirmed: { bg:"#e6fffa", color:"#234e52", emoji:"✅" },
  Cancelled: { bg:"#fff5f5", color:"#742a2a", emoji:"❌" },
};

const fmt = d => new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });

export default function BusinessBookings() {
  const { user } = useContext(AuthContext);
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
            style={{ background: "rgba(255,255,255,0.1)", color: "#f1f5f9", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
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
    <div className="loader-container">
      <div className="custom-loader" />
      <p>Loading bookings…</p>
    </div>
  );

  return (
    <div className="seller-dashboard">

      {/* ── Hero ── */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1>Incoming Bookings 📬</h1>
          <p>All customer bookings for your published services.</p>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="stats-bar bb-stats-bar">
        <div className="stat-item">
          <span className="stat-val">{bookings.length}</span>
          <span className="stat-label">Total Bookings</span>
        </div>
        <div className="stat-item">
          <span className="stat-val" style={{ color:"#f59e0b" }}>{pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-item">
          <span className="stat-val" style={{ color:"#10b981" }}>{confirmed}</span>
          <span className="stat-label">Confirmed</span>
        </div>
        <div className="stat-item">
          <span className="stat-val text-blue">Rs {totalRevenue.toLocaleString()}</span>
          <span className="stat-label">Revenue (Confirmed)</span>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bb-controls">
        <div className="bb-filter-pills">
          {["All","Pending","Confirmed","Cancelled"].map(s => (
            <button key={s}
              className={`bb-pill ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}>
              {s}
            </button>
          ))}
        </div>
        <input
          className="bb-search"
          placeholder="🔍  Search by customer or service…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── Table ── */}
      <div className="glass-table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Service</th>
              <th>Dates</th>
              <th>Days</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length > 0 ? displayed.map(b => {
              const style = STATUS_STYLE[b.status] || STATUS_STYLE.Pending;
              return (
                <tr key={b._id} className="hover-row">

                  {/* Customer */}
                  <td className="user-info-cell">
                    <div className="avatar-sm">
                      {b.customerId?.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <span className="name-txt">{b.customerId?.username || "—"}</span>
                      <span className="email-txt">{b.customerId?.email || ""}</span>
                    </div>
                  </td>

                  {/* Service */}
                  <td>
                    <span className="pkg-badge">{b.packageId?.name || "—"}</span>
                    {b.packageId?.serviceCategory && (
                      <span className="bb-svc-tag">{b.packageId.serviceCategory}</span>
                    )}
                  </td>

                  {/* Dates */}
                  <td>
                    <div className="date-stack">
                      <span>{fmt(b.startDate)}</span>
                      <small>to {fmt(b.endDate)}</small>
                    </div>
                  </td>

                  {/* Days */}
                  <td style={{ textAlign:"center", fontWeight:700 }}>
                    {b.numberOfDays ?? "—"}
                  </td>

                  {/* Total */}
                  <td className="price-bold">Rs {b.totalCharge?.toLocaleString() || "—"}</td>

                  {/* Status */}
                  <td>
                    <span className="bb-status-pill"
                      style={{ background: style.bg, color: style.color }}>
                      {style.emoji} {b.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="action-group">
                      {b.status === "Pending" ? (
                        <>
                          <button className="icon-btn check" title="Confirm"
                            onClick={() => updateStatus(b._id, "Confirmed")}>✔</button>
                          <button className="icon-btn cross" title="Cancel"
                            onClick={() => updateStatus(b._id, "Cancelled")}>✖</button>
                        </>
                      ) : (
                        <span className="disabled-txt">—</span>
                      )}
                    </div>
                  </td>

                </tr>
              );
            }) : (
              <tr>
                <td colSpan="7" style={{ textAlign:"center", padding:40, color:"#94a3b8" }}>
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
  );
}
