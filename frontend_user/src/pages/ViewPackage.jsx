import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useProtectedNavigation from "../hooks/useProtectedNavigation";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { CurrencyContext, SUPPORTED_CURRENCIES } from "../context/CurrencyContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles/viewpackage.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/* ══ Currency Selector — compact inline widget for the booking card ══ */
const SOURCE_BADGE = {
  live:   { label: "Live",   color: "#16a34a", bg: "#f0fdf4", dot: "#22c55e" },
  cached: { label: "Cached", color: "#0369a1", bg: "#eff6ff", dot: "#60a5fa" },
  static: { label: "Offline",color: "#b45309", bg: "#fffbeb", dot: "#f59e0b" },
};
function CurrencySelectorGroup() {
  const { selectedCurrency, setSelectedCurrency, loadingRates, rateSource } =
    useContext(CurrencyContext);
  const badge = SOURCE_BADGE[rateSource] || SOURCE_BADGE.static;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
      background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)",
      borderRadius: 14, marginBottom: 16, border: "2px solid #e0f2fe" }}>
      <span style={{ fontSize: 15 }}>🌐</span>
      <select
        value={selectedCurrency}
        onChange={e => setSelectedCurrency(e.target.value)}
        disabled={loadingRates}
        style={{
          flex: 1, border: "none", background: "transparent",
          fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 700,
          color: "#0369a1", outline: "none",
          cursor: loadingRates ? "wait" : "pointer",
          appearance: "none",
        }}
      >
        {SUPPORTED_CURRENCIES.map(c => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.code} — {c.label}
          </option>
        ))}
      </select>
      {!loadingRates && (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          fontSize: 10, fontWeight: 600, color: badge.color,
          background: badge.bg, padding: "2px 8px", borderRadius: 9999,
          whiteSpace: "nowrap",
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: badge.dot, display: "inline-block" }} />
          {badge.label}
        </span>
      )}
    </div>
  );
}

export default function ViewPackage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const handleProtectedNavigation = useProtectedNavigation();

  // Currency Context
  const { formatPrice, loadingRates } = useContext(CurrencyContext);

  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Data States
  const [pkg, setPkg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review States
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  // Booking States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalPrice, setTotalPrice] = useState(0); // LKR
  const [daysCount, setDaysCount] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchFullDetails = async () => {
      try {
        setLoading(true);
        const pkgRes = await API.get(`/packages/${id}`);
        setPkg(pkgRes.data);

        try {
          const bizRes = await API.get(`/business/package-info/${id}`);
          if (bizRes.data) setBusiness(bizRes.data);
        } catch (err) {
          console.warn("No business found.");
        }

        const revRes = await API.get(`/reviews/${id}`);
        setReviews(revRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullDetails();
  }, [id]);

  // Booking Calculation & Availability Check
  useEffect(() => {
    if (startDate && endDate && pkg) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setDaysCount(diffDays);
        setTotalPrice(diffDays * pkg.price); 
        checkAvailability(startDate, endDate);
      } else {
        setDaysCount(0);
        setTotalPrice(0);
      }
    }
  }, [startDate, endDate, pkg]);

  useEffect(() => {
  const checkSavedStatus = async () => {
    if (user && id) {
      try {
        const res = await API.get(`/saved/check-saved?userId=${user._id}&packageId=${id}`);
        setIsSaved(res.data.isSaved);
      } catch (err) { console.error(err); }
    }
  };
  checkSavedStatus();
}, [id, user]);

  const checkAvailability = async (start, end) => {
    try {
      const res = await API.get(`/bookings/check?packageId=${id}&startDate=${start}&endDate=${end}`);
      setIsAvailable(res.data.available);
    } catch (err) {
      console.error("Availability check failed");
    }
  };

  const handleBooking = async () => {
    if (!handleProtectedNavigation(null)) return;
    setBookingLoading(true);
    const toastId = toast.loading("💳 Reserving your spot…");
    try {
      const bookingData = {
        packageId: id,
        customerId: user._id,
        startDate,
        endDate,
        numberOfDays: daysCount,
        chargePerUnit: pkg.price,
        totalCharge: totalPrice,
      };
      const res = await API.post("/bookings", bookingData);
      toast.success("🎉 Booking confirmed! Redirecting to payment…", { id: toastId });
      navigate(`/payment/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Booking failed. Please try again.", { id: toastId });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSaveToggle = async () => {
  if (!user) { toast.error("🔑 Please log in to save packages!"); return; }
  setSaveLoading(true);
  try {
    const res = await API.post("/saved/save-package", { userId: user._id, packageId: id });
    setIsSaved(res.data.saved);
    res.data.saved
      ? toast.success("❤️ Package saved to your wishlist!")
      : toast(" Removed from your wishlist.", { icon: "👍" });
  } catch {
    toast.error("❌ Error updating wishlist.");
  } finally {
    setSaveLoading(false);
  }
}; 

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("🔑 Please log in to post a review!"); return; }
    const toastId = toast.loading("✍️ Posting your review…");
    try {
      const res = await API.post("/reviews", {
        packageId: id,
        userId: user._id || user.id,
        userName: user.username || user.name || "Guest",
        rating,
        comment,
      });
      setReviews([res.data, ...reviews]);
      setComment("");
      toast.success("🎉 Review posted! Thank you.", { id: toastId });
    } catch {
      toast.error("❌ Error posting review. Please try again.", { id: toastId });
    }
  };

  const handleReaction = async (reviewId, type) => {
    if (!user) { toast.error("🔑 Please log in to react to reviews!"); return; }
    try {
      const res = await API.post("/reviews/reaction", { reviewId, userId: user._id, type });
      // Safely merge ONLY the likes and dislikes to preserve the populated user data
      setReviews(reviews.map((r) => 
        (r._id === reviewId ? { ...r, likes: res.data.likes, dislikes: res.data.dislikes } : r)
      ));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading-screen">✨ Loading Experience...</div>;
  if (!pkg) return <div className="error-screen">Package not found!</div>;

  return (
    <div className="view-container">
      
      {/* ── 1. Title Section ── */}
      <div className="title-section" style={{ maxWidth: 1300, margin: "0 auto 20px", padding: "0 20px" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: "2rem", color: "#1e293b", margin: "0 0 8px 0" }}>{pkg.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 15, color: "#475569", fontSize: "0.95rem" }}>
              <span>📍 {pkg.location}</span>
              <span>⭐ {reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : "New"} ({reviews.length} reviews)</span>
              <span style={{ background: "#ec4899", padding: "4px 12px", borderRadius: 50, color: "white", fontSize: 12, fontWeight: 700 }}>
                {pkg.category?.name || pkg.serviceCategory || "Listing"}
              </span>
            </div>
          </div>
          <div className="details-header-actions">
            <button className={`save-btn ${isSaved ? 'saved' : ''}`} onClick={handleSaveToggle} disabled={saveLoading}>
              {isSaved ? "❤️ Saved" : "🤍 Save"}
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Photo Gallery Grid (Booking.com style) ── */}
      <div style={{ maxWidth: 1300, margin: "0 auto 30px", padding: "0 20px" }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "2fr 1fr 1fr", 
          gridTemplateRows: "250px 250px", 
          gap: "10px", 
          borderRadius: "16px", 
          overflow: "hidden" 
        }}>
          {/* Main Image */}
          <div style={{ gridRow: "span 2" }}>
            <img src={pkg.images?.[0] ? `http://localhost:5000${pkg.images[0]}` : `http://localhost:5000${pkg.image}`} alt="Main" style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} />
          </div>
          
          {/* Sub Images (1-4) */}
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} style={{ position: "relative" }}>
              <img 
                src={pkg.images?.[idx] ? `http://localhost:5000${pkg.images[idx]}` : `https://images.unsplash.com/photo-${idx === 1 ? '1582719478250-c89cae4dc85b' : idx === 2 ? '1540541338287-41700207dee6' : idx === 3 ? '1566665797739-1674de7a421a' : '1578683010236-d716f9a3f461'}?auto=format&fit=crop&w=800&q=80`} 
                alt={`Sub ${idx}`} 
                style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} 
              />
              {idx === 4 && pkg.images?.length > 5 && (
                <button style={{ position: "absolute", bottom: 15, right: 15, background: "white", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                  + {pkg.images.length - 4} more photos
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="view-content-grid" style={{ margin: "0 auto", marginTop: 0 }}>
        
        {/* ── LEFT COLUMN ── */}
        <div className="left-column">
          
          {/* About Section */}
          <div className="details-card">
            <h2>About this property</h2>
            <p className="description-text">{pkg.description}</p>
          </div>

          {/* Business Info */}
          {business && (
            <div className="business-info-card">
              <div className="biz-header">
                <h3>Provided by {business.name}</h3>
                <span className="biz-badge">{business.category}</span>
              </div>
              <p className="biz-desc">{business.description}</p>
              <div className="biz-contact-grid">
                <span>📞 {business.contact}</span>
                <span>📧 {business.email}</span>
                <span className="full-addr">🏠 {business.address}</span>
              </div>
              {pkg.creator && (
                <button className="provider-btn provider-btn-full" onClick={() => navigate(`/provider-profile/${pkg.creator?._id || pkg.creator}`)}>
                  👤 View Full Provider Profile
                </button>
              )}
            </div>
          )}

          {/* Reviews Section */}
          <div className="reviews-card">
            <h3>Community Reviews ({reviews.length})</h3>
            {user ? (
              <form onSubmit={submitReview} className="modern-rev-form">
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} onClick={() => setRating(n)} className={rating >= n ? "star active" : "star"}>★</span>
                  ))}
                </div>
                <textarea placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} required />
                <button type="submit" className="submit-rev-btn">Post Review</button>
              </form>
            ) : (
              <p className="login-hint">Please login to write a review.</p>
            )}

            <div className="reviews-list">
              {reviews.map((rev) => {
                const displayName = rev.userId?.username || rev.userId?.name || rev.userName || "Guest";
                return (
                  <div key={rev._id} className="single-review animate-in">
                    <div className="rev-user">
                      <div className="avatar">{displayName.charAt(0).toUpperCase()}</div>
                      <strong>{displayName}</strong>
                      <div className="rev-stars">{"⭐".repeat(rev.rating)}</div>
                    </div>
                    <p>{rev.comment}</p>
                    <div className="rev-actions">
                      <button onClick={() => handleReaction(rev._id, "likes")}>👍 {rev.likes?.length || 0}</button>
                      <button onClick={() => handleReaction(rev._id, "dislikes")}>👎 {rev.dislikes?.length || 0}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN (Sidebar) ── */}
        <div className="right-column" style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          
          {/* Map Widget */}
          <div className="booking-card" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
            {business && business.latitude && business.longitude ? (
              <>
                <MapContainer center={[business.latitude, business.longitude]} zoom={15} style={{ height: "200px", width: "100%", zIndex: 1 }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[business.latitude, business.longitude]}>
                    <Popup><strong>{business.name}</strong></Popup>
                  </Marker>
                </MapContainer>
                <div style={{ padding: "15px", textAlign: "center", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                  <h4 style={{ margin: "0 0 5px 0", color: "#1e293b", fontSize: "14px" }}>Excellent location</h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#0071c2", cursor: "pointer", fontWeight: 600 }}>Show on map</p>
                </div>
              </>
            ) : (
              <div style={{ height: "200px", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#64748b" }}>🗺️ Map not available</span>
              </div>
            )}
          </div>

          {/* Booking Widget */}
          <div className="booking-card animate-in">
            <h3>📅 Reserve Your Spot</h3>
            <CurrencySelectorGroup />
            <div className="booking-form-grid" style={{ gridTemplateColumns: "1fr", gap: 10 }}>
              <div className="date-input-group">
                <label>Check-in</label>
                <input type="date" min={new Date().toISOString().split("T")[0]} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="date-input-group">
                <label>Check-out</label>
                <input type="date" min={startDate || new Date().toISOString().split("T")[0]} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            {daysCount > 0 && (
              <div className="price-summary animate-pop">
                <div className="price-row">
                  <span>Price per day</span>
                  <span>{loadingRates ? "…" : formatPrice(pkg.price)}</span>
                </div>
                <div className="price-row">
                  <span>Total Duration</span>
                  <span>{daysCount} Days</span>
                </div>
                <div className="total-row">
                  <span>Total</span>
                  <span>{loadingRates ? "…" : formatPrice(totalPrice)}</span>
                </div>
                {!isAvailable && <p className="error-msg">❌ These dates are already booked.</p>}
              </div>
            )}

            <button className="book-now-btn" disabled={!startDate || !endDate || !isAvailable || bookingLoading} onClick={handleBooking}>
              {bookingLoading ? "Processing..." : isAvailable ? "Reserve" : "Unavailable"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}