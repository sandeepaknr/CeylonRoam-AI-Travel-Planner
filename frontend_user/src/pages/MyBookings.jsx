import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { useOfflineData } from "../context/OfflineDataContext";
import { LuWifiOff } from "react-icons/lu";
import "./styles/mybookings.css";

export default function MyBookings() {
  // ── Offline-aware data from context ──────────────────────────────────────
  const { bookings, isOffline, loading: ctxLoading } = useOfflineData();
  const loading = ctxLoading.bookings;

  const [selectedSlip, setSelectedSlip] = useState(null);
  const navigate = useNavigate();


  const viewSlip = async (bookingId) => {
    try {
      const res = await API.get(`/seller-bookings/slip/${bookingId}`);
      setSelectedSlip(res.data);
    } catch {
      toast.error("Receipt is still being processed. Please check back later.");
    }
  };

  if (loading) return <div className="loader-container"><div className="loader"></div><p>Fetching your adventures...</p></div>;

  return (
    <div className="my-bookings-container">
      <div className="bookings-header">
        <h1>My Bookings</h1>
        <p>Manage your upcoming journeys and payment history.</p>
      </div>

      {/* ── Offline indicator banner ── */}
      {isOffline && (
        <div className="offline-banner" role="alert">
          <LuWifiOff size={16} />
          <span>You're offline — showing cached bookings. Some data may be outdated.</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>You haven't booked any experiences yet.</p>
          <button onClick={() => navigate("/packages")}>Explore Packages</button>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((b) => (
            <div key={b._id} className="booking-card animate-in">
              <div className="card-top">
                <span className={`status-badge ${b.status?.toLowerCase()}`}>
                  {b.status}
                </span>
                <span className="price-tag">Rs. {b.totalCharge?.toLocaleString()}</span>
              </div>
              
              <div className="card-info">
                <h3>{b.packageId?.name || "Tour Experience"}</h3>
                <div className="info-row">
                  <span>Start:</span>
                  <span className="info-value">{new Date(b.startDate).toLocaleDateString()}</span>
                </div>
                <div className="info-row">
                  <span>Duration:</span>
                  <span className="info-value">{b.numberOfDays} Days</span>
                </div>
              </div>

              <div className="card-footer">
                {b.paymentStatus === "Pending" ? (
                  <button 
                    className="pay-now-btn" 
                    onClick={() => navigate(`/payment/${b._id}`)}
                  >
                    Complete Payment
                  </button>
                ) : (
                  <div className="payment-success-actions">
                    <div className="paid-badge"> Paid</div>
                    {b.status === "Confirmed" && (
                      <button className="view-slip-mini" onClick={() => viewSlip(b._id)}>
                        View Receipt
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSlip && (
        <div className="modal-overlay blur" onClick={() => setSelectedSlip(null)}>
          <div className="invoice-card" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-header">
              <div className="brand">TRAVEL<span>SYSTEM</span></div>
              <div className="invoice-title">BOOKING RECEIPT</div>
            </div>
            
            <div className="invoice-body">
              <div className="invoice-section">
                <label>Customer Name</label>
                <p>{selectedSlip.customerName}</p>
              </div>
              <div className="invoice-grid">
                <div><label>Package</label><p>{selectedSlip.packageName}</p></div>
                <div><label>Amount Paid</label><p className="amt">Rs. {selectedSlip.amount?.toLocaleString()}</p></div>
                <div><label>Start Date</label><p>{new Date(selectedSlip.startDate).toLocaleDateString()}</p></div>
                <div><label>End Date</label><p>{new Date(selectedSlip.endDate).toLocaleDateString()}</p></div>
                <div><label>Booking ID</label><p>#{selectedSlip._id.slice(-6).toUpperCase()}</p></div>
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
