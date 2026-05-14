import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./styles/addpackage-ext.css";
import "./styles/sellerBookings.css"; // Kept for the invoice receipt styling

export default function SellerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user?._id) return;
    try {
      const res = await API.get(`/seller-bookings/all?sellerId=${user._id}`);
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (id, newStatus) => {
    toast(
      (t) => (
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          Mark as <strong>{newStatus}</strong>?
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const tid = toast.loading("Updating status…");
              try {
                await API.patch(`/seller-bookings/update/${id}`, { status: newStatus });
                toast.success(`✅ Booking marked as ${newStatus}.`, { id: tid });
                fetchBookings();
              } catch {
                toast.error("❌ Status update failed!", { id: tid });
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

  const viewSlip = async (bookingId) => {
    try {
      const res = await API.get(`/seller-bookings/slip/${bookingId}`);
      setSelectedSlip(res.data);
    } catch {
      toast.error("❌ Slip details are not available for this booking.");
    }
  };

  if (loading) return (
    <div className="ap-page">
      <div className="ap-card" style={{ textAlign: "center", maxWidth: 500 }}>
        <div style={{ fontSize:32, marginBottom:16 }}>⏳</div>
        <p className="ap-page-sub" style={{ margin: 0 }}>Syncing your business data...</p>
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
          <div className="ap-eyebrow">📦 All Bookings</div>
          <h1 className="ap-page-title">Welcome, {user?.username || "Business Partner"}! 👋</h1>
          <p className="ap-page-sub">
            You have <strong>{bookings.filter(b => b.status === "Pending").length}</strong> pending requests to handle.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="ap-stats-row">
          <div className="ap-stat-card">
            <span className="ap-stat-val">{bookings.length}</span>
            <span className="ap-stat-label">Total Orders</span>
          </div>
          <div className="ap-stat-card">
            <span className="ap-stat-val" style={{ color: "var(--green)" }}>
              {bookings.filter(b => b.status === "Confirmed").length}
            </span>
            <span className="ap-stat-label">Confirmed</span>
          </div>
          <div className="ap-stat-card">
            <span className="ap-stat-val" style={{ color: "var(--primary)" }}>
              Rs. {(bookings.filter(b => b.paymentStatus === "Completed").reduce((acc, curr) => acc + curr.totalCharge, 0)).toLocaleString()}
            </span>
            <span className="ap-stat-label">Total Revenue</span>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="ap-table-wrapper">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Package</th>
                <th>Date Range</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Booking Status</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--primary-l)", color: "var(--primary-d)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                          {b.customerId?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 14 }}>{b.customerId?.username}</div>
                          <div style={{ fontSize: 12, color: "var(--ink-60)" }}>{b.customerId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontWeight: 600 }}>{b.packageId?.name}</span></td>
                    <td>
                      <div style={{ fontSize: 13, color: "var(--ink)" }}>{new Date(b.startDate).toLocaleDateString()}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-60)" }}>to {new Date(b.endDate).toLocaleDateString()}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>Rs. {b.totalCharge.toLocaleString()}</td>
                    
                    <td>
                      <span style={{ 
                        fontSize: 12, fontWeight: 700, padding: "4px 8px", borderRadius: 6,
                        background: b.paymentStatus === "Completed" ? "var(--green-l)" : "#fffaf0",
                        color: b.paymentStatus === "Completed" ? "var(--green)" : "#9a3412"
                      }}>
                        {b.paymentStatus === "Completed" ? "Paid ✅" : "Pending ⏳"}
                      </span>
                    </td>

                    <td>
                      <span className={`ap-status-pill ap-status-${b.status.toLowerCase()}`}>
                        {b.status === "Pending" && "⏳"}
                        {b.status === "Confirmed" && "✅"}
                        {b.status === "Cancelled" && "❌"}
                        {" "}{b.status}
                      </span>
                    </td>
                    
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        {b.status === "Pending" ? (
                          <>
                            <button className="ap-table-btn" style={{ borderColor: "var(--green)", color: "var(--green)" }} onClick={() => handleStatusUpdate(b._id, "Confirmed")}>✔</button>
                            <button className="ap-table-btn danger" onClick={() => handleStatusUpdate(b._id, "Cancelled")}>✖</button>
                          </>
                        ) : b.status === "Confirmed" ? (
                          <button className="ap-table-btn" onClick={() => viewSlip(b._id)}>View Invoice</button>
                        ) : (
                          <span style={{ color: "var(--ink-40)", fontSize: 12, fontWeight: 600 }}>N/A</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--ink-40)" }}>No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSlip && (
        <div className="ap-modal-overlay" onClick={() => setSelectedSlip(null)}>
          {/* Using the legacy invoice-card for the receipt style */}
          <div className="invoice-card" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-header">
              <div className="brand">TRAVEL<span>SYSTEM</span></div>
              <div className="invoice-title">OFFICIAL INVOICE</div>
            </div>
            
            <div className="invoice-body">
              <div className="invoice-section">
                <label>Customer Details</label>
                <p>{selectedSlip.customerName}</p>
              </div>
              <div className="invoice-grid">
                <div><label>Travel Package</label><p>{selectedSlip.packageName}</p></div>
                <div><label>Total Amount</label><p className="amt">Rs. {selectedSlip.amount?.toLocaleString()}</p></div>
                <div><label>Duration</label><p>{new Date(selectedSlip.startDate).toLocaleDateString()} - {new Date(selectedSlip.endDate).toLocaleDateString()}</p></div>
                <div><label>Receipt No</label><p>#{selectedSlip._id.slice(-6).toUpperCase()}</p></div>
              </div>
            </div>
            <div className="invoice-footer">
              <button className="print-action" onClick={() => window.print()}>Print Receipt</button>
              <button className="close-action" onClick={() => setSelectedSlip(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}