import React, { useState, useEffect, useContext, useRef } from "react";
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
import {
  LuCalendar, LuUsers, LuRefreshCw, LuCreditCard,
  LuCalendarCheck, LuClock, LuMinus, LuPlus,
  LuChevronLeft, LuChevronRight, LuStar, LuThumbsUp, LuThumbsDown, LuTrash2
} from "react-icons/lu";

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
 live: { label: "Live", color: "#16a34a", bg: "#f0fdf4", dot: "#22c55e" },
 cached: { label: "Cached", color: "#26658C", bg: "#E7F9FC", dot: "#54ACBF" },
 static: { label: "Offline",color: "#b45309", bg: "#fffbeb", dot: "#f59e0b" },
};
function CurrencySelectorGroup() {
  const { selectedCurrency, setSelectedCurrency, loadingRates, rateSource } =
  useContext(CurrencyContext);
  const badge = SOURCE_BADGE[rateSource] || SOURCE_BADGE.static;
  return (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px",
  background: "rgba(167,235,242,0.1)",
  borderRadius: 10, border: "1px solid rgba(167,235,242,0.28)" }}>
  <select
  value={selectedCurrency}
  onChange={e => setSelectedCurrency(e.target.value)}
  disabled={loadingRates}
  style={{
  flex: 1, border: "none", background: "transparent",
  fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 700,
  color: "#f7fbff", outline: "none",
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
  background: badge.bg, padding: "2px 7px", borderRadius: 9999,
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
 const [showMapModal, setShowMapModal] = useState(false);

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
 const [travelers, setTravelers] = useState(1);
 const carouselRef = useRef(null);

 const scrollCarousel = (dir) => {
 if (!carouselRef.current) return;
 const card = carouselRef.current.querySelector('.rv-card');
 const cardW = card ? card.offsetWidth + 20 : 320;
 carouselRef.current.scrollBy({ left: dir * cardW, behavior: 'smooth' });
 };

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
 setTotalPrice(diffDays * pkg.price * travelers);
 checkAvailability(startDate, endDate);
 } else {
 setDaysCount(0);
 setTotalPrice(0);
 }
 }
 }, [startDate, endDate, pkg, travelers]);

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
 const toastId = toast.loading(" Reserving your spot…");
 try {
 const bookingData = {
 packageId: id,
 customerId: user._id,
 startDate,
 endDate,
 numberOfDays: daysCount,
 travelers,
 chargePerUnit: pkg.price,
 totalCharge: totalPrice,
 };
 const res = await API.post("/bookings", bookingData);
 toast.success(" Booking confirmed! Redirecting to payment…", { id: toastId });
 navigate(`/payment/${res.data._id}`);
 } catch (err) {
 toast.error(err.response?.data?.message || " Booking failed. Please try again.", { id: toastId });
 } finally {
 setBookingLoading(false);
 }
 };

 const handleSaveToggle = async () => {
 if (!user) { toast.error(" Please log in to save packages!"); return; }
 setSaveLoading(true);
 try {
 const res = await API.post("/saved/save-package", { userId: user._id, packageId: id });
 setIsSaved(res.data.saved);
 res.data.saved
 ? toast.success(" Package saved to your wishlist!")
 : toast(" Removed from your wishlist.", { icon: "" });
 } catch {
 toast.error(" Error updating wishlist.");
 } finally {
 setSaveLoading(false);
 }
}; 

 const submitReview = async (e) => {
 e.preventDefault();
 if (!user) { toast.error(" Please log in to post a review!"); return; }
 const toastId = toast.loading(" Posting your review…");
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
 toast.success(" Review posted! Thank you.", { id: toastId });
 } catch {
 toast.error(" Error posting review. Please try again.", { id: toastId });
 }
 };

 const handleReaction = async (reviewId, type) => {
 if (!user) { toast.error(" Please log in to react to reviews!"); return; }
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

 const handleDeleteReview = (reviewId) => {
  toast(
   (t) => (
    <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
     Delete your review?
     <button
      onClick={async () => {
       toast.dismiss(t.id);
       try {
        await API.delete(`/reviews/${reviewId}?userId=${user._id}`);
        setReviews(prev => prev.filter(r => r._id !== reviewId));
        toast.success("Review deleted.");
       } catch {
        toast.error("Failed to delete review.");
       }
      }}
      style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
     >Delete</button>
     <button
      onClick={() => toast.dismiss(t.id)}
      style={{ background: "rgba(255,255,255,0.1)", color: "#E7F9FC", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
     >Cancel</button>
    </span>
   ),
   { duration: 6000 }
  );
 };

 if (loading) return <div className="loading-screen"> Loading Experience...</div>;
 if (!pkg) return <div className="error-screen">Package not found!</div>;

 const today = new Date().toISOString().split("T")[0];

 return (
 <div className="view-container">
 
 {/* ── Back Button ── */}
 <div style={{ maxWidth: 1300, margin: "0 auto", padding: "16px 20px 0" }}>
   <button
     onClick={() => navigate(-1)}
     style={{
       display: "inline-flex",
       alignItems: "center",
       gap: 6,
       background: "rgba(167,235,242,0.1)",
       border: "1px solid rgba(167,235,242,0.25)",
       borderRadius: 10,
       padding: "8px 16px",
       color: "#A7EBF2",
       fontSize: 14,
       fontWeight: 600,
       cursor: "pointer",
       fontFamily: "'Montserrat', sans-serif",
       transition: "background 0.2s, border-color 0.2s",
     }}
     onMouseEnter={e => {
       e.currentTarget.style.background = "rgba(167,235,242,0.2)";
       e.currentTarget.style.borderColor = "rgba(167,235,242,0.5)";
     }}
     onMouseLeave={e => {
       e.currentTarget.style.background = "rgba(167,235,242,0.1)";
       e.currentTarget.style.borderColor = "rgba(167,235,242,0.25)";
     }}
   >
     <LuChevronLeft size={18} />
     Back
   </button>
 </div>

 {/* ── 1. Title Section ── */}
 <div className="title-section" style={{ maxWidth: 1300, margin: "0 auto 20px", padding: "0 20px" }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
 <div>
 <h1 style={{ fontSize: "2rem", color: "#023859", margin: "0 0 8px 0" }}>{pkg.name}</h1>
 <div style={{ display: "flex", alignItems: "center", gap: 15, color: "#26658C", fontSize: "0.95rem" }}>
 <span> {pkg.location}</span>
 <span>⭐ {reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : "New"} ({reviews.length} reviews)</span>
 <span style={{ background: "#ec4899", padding: "4px 12px", borderRadius: 50, color: "white", fontSize: 12, fontWeight: 700 }}>
 {pkg.category?.name || pkg.serviceCategory || "Listing"}
 </span>
 </div>
 </div>
 <div className="details-header-actions">
 <button className={`save-btn ${isSaved ? 'saved' : ''}`} onClick={handleSaveToggle} disabled={saveLoading}>
 {isSaved ? " Saved" : " Save"}
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
 <button style={{ position: "absolute", bottom: 15, right: 15, background: "white", border: "1px solid #A7EBF2", padding: "8px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
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
 <span> {business.contact}</span>
 <span> {business.email}</span>
 <span className="full-addr">{business.address}</span>
 </div>
 {pkg.creator && (
 <button className="provider-btn provider-btn-full" onClick={() => navigate(`/provider-profile/${pkg.creator?._id || pkg.creator}`)}>
 View Full Provider Profile
 </button>
 )}
 </div>
 )}
 </div>

 {/* ── RIGHT COLUMN (Sidebar) ── */}
 <div className="right-column" style={{ display: "flex", flexDirection: "column", gap: "25px" }}>

  {/* Map Widget */}
  <div className="booking-card" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
  {(() => {
  // Package's own pinned location takes priority over business coords
  const mapLat  = pkg?.latitude  || business?.latitude;
  const mapLng  = pkg?.longitude || business?.longitude;
  const mapName = pkg?.name || business?.name || "Location";
  return mapLat && mapLng ? (
  <>
  <MapContainer center={[mapLat, mapLng]} zoom={14} style={{ height: "200px", width: "100%", zIndex: 1 }}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>' />
  <Marker position={[mapLat, mapLng]}>
  <Popup><strong>{mapName}</strong></Popup>
  </Marker>
  </MapContainer>
  {/* Bottom bar — only the Open map button, no text/coords */}
  <div style={{ padding: "10px 14px", display: "flex", justifyContent: "flex-end", alignItems: "center", background: "rgba(1,28,64,0.75)", borderTop: "1px solid rgba(167,235,242,0.2)" }}>
   <button
    onClick={() => setShowMapModal(true)}
    style={{
     display: "inline-flex", alignItems: "center", gap: 5,
     background: "rgba(84,172,191,0.18)", border: "1px solid rgba(84,172,191,0.4)",
     borderRadius: 8, padding: "6px 14px", color: "#A7EBF2",
     fontSize: 13, fontWeight: 700, cursor: "pointer",
     fontFamily: "'Montserrat', sans-serif",
     transition: "background 0.2s",
    }}
    onMouseEnter={e => e.currentTarget.style.background = "rgba(84,172,191,0.32)"}
    onMouseLeave={e => e.currentTarget.style.background = "rgba(84,172,191,0.18)"}
   >
    Open map ↗
   </button>
  </div>
  </>
  ) : (
  <div style={{ height: "160px", background: "rgba(1,28,64,0.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
  <span style={{ fontSize: 28, opacity: 0.3 }}>🗺️</span>
  <span style={{ color: "rgba(167,235,242,0.5)", fontSize: 13 }}>No map location set</span>
  </div>
  );
  })()}
  </div>

  {/* ── Full-screen Map Modal ── */}
  {showMapModal && (() => {
   const mapLat  = pkg?.latitude  || business?.latitude;
   const mapLng  = pkg?.longitude || business?.longitude;
   const mapName = pkg?.name || business?.name || "Location";
   return (
    <div
     onClick={() => setShowMapModal(false)}
     style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(1,12,30,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
     }}
    >
     <div
      onClick={e => e.stopPropagation()}
      style={{
       width: "100%", maxWidth: 860, background: "rgba(1,28,64,0.97)",
       borderRadius: 20, overflow: "hidden",
       border: "1.5px solid rgba(167,235,242,0.22)",
       boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
      }}
     >
      {/* Modal header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(167,235,242,0.15)" }}>
       <span style={{ color: "#E7F9FC", fontWeight: 700, fontSize: 15 }}>📍 {mapName} — {pkg?.location || "Sri Lanka"}</span>
       <button
        onClick={() => setShowMapModal(false)}
        style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 8, color: "#fca5a5", padding: "4px 12px", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
       >✕</button>
      </div>
      {/* Full map */}
      <MapContainer center={[mapLat, mapLng]} zoom={15} style={{ height: "480px", width: "100%", zIndex: 1 }}>
       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>' />
       <Marker position={[mapLat, mapLng]}>
        <Popup><strong>{mapName}</strong></Popup>
       </Marker>
      </MapContainer>
      {/* Coords footer */}
      <div style={{ padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(1,12,30,0.6)" }}>
       <span style={{ fontSize: 12, color: "rgba(167,235,242,0.55)", fontFamily: "monospace" }}>{mapLat?.toFixed(6)}, {mapLng?.toFixed(6)}</span>
       <a href={`https://www.google.com/maps?q=${mapLat},${mapLng}`} target="_blank" rel="noopener noreferrer"
        style={{ fontSize: 12, color: "#54ACBF", fontWeight: 600, textDecoration: "none" }}>Open in Google Maps ↗</a>
      </div>
     </div>
    </div>
   );
  })()}


  {/* ── Booking Widget ── */}
  <div
  className="booking-card animate-in"
  style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px" }}
  >

  {/* ROW 1: Price + Currency side-by-side */}
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
  <div className="vt-price-header" style={{ margin: 0 }}>
  <span className="vt-price-amount">{loadingRates ? "…" : formatPrice(pkg.price)}</span>
  <span className="vt-price-per"> per person / day</span>
  </div>
  <div style={{ flexShrink: 0, minWidth: 140 }}>
  <CurrencySelectorGroup />
  </div>
  </div>

  {/* Label */}
  <p className="vt-select-label" style={{ margin: 0 }}>Select dates &amp; travelers</p>

  {/* Date inputs */}
  <div className="vt-dates-grid">
  <div className="vt-input-wrap">
  <label className="vt-input-label"><LuCalendar size={12} /> CHECK-IN</label>
  <input type="date" className="vt-date-input" min={today} value={startDate} onChange={e => setStartDate(e.target.value)} />
  </div>
  <div className="vt-input-wrap">
  <label className="vt-input-label"><LuCalendar size={12} /> CHECK-OUT</label>
  <input type="date" className="vt-date-input" min={startDate || today} value={endDate} onChange={e => setEndDate(e.target.value)} />
  </div>
  </div>

  {/* Travelers */}
  <div className="vt-travelers-row">
  <LuUsers size={16} className="vt-row-icon" />
  <span className="vt-travelers-label">Travelers</span>
  <div className="vt-travelers-counter">
  <button className="vt-counter-btn" onClick={() => setTravelers(t => Math.max(1, t - 1))}><LuMinus size={13}/></button>
  <span className="vt-counter-val">{travelers}</span>
  <button className="vt-counter-btn" onClick={() => setTravelers(t => Math.min(20, t + 1))}><LuPlus size={13}/></button>
  </div>
  </div>

  {/* Policies */}
  <div className="vt-policies">
  <div className="vt-policy-row">
  <span className="vt-pol-icon vt-pol-green"><LuRefreshCw size={13} /></span>
  <p><span className="vt-pol-bold">Cancellation policy</span> • Cancel before check-in for a full refund.</p>
  </div>
  <div className="vt-policy-row">
  <span className="vt-pol-icon vt-pol-blue"><LuCreditCard size={13} /></span>
  <p><span className="vt-pol-bold">Reserve now &amp; pay later</span> • Secure your spot while staying flexible.</p>
  </div>
  </div>

  {/* Summary box */}
  {daysCount > 0 && (
  <div className="vt-summary-box">
  <h4 className="vt-sum-title">{pkg.name}</h4>
  <div className="vt-urgency-row">
  <LuClock size={12} style={{ color: "#fb923c", flexShrink: 0 }} />
  <span className="vt-urg-text">Limited spots available</span>
  </div>
  <p className="vt-sum-calc">
  {travelers} Traveler{travelers !== 1 ? "s" : ""} × {daysCount} Day{daysCount !== 1 ? "s" : ""} × {loadingRates ? "…" : formatPrice(pkg.price)}
  </p>
  <div className="vt-sum-total">Total <strong>{loadingRates ? "…" : formatPrice(totalPrice)}</strong></div>
  <p className="vt-tax-note">(Price includes taxes and booking fees)</p>
  {!isAvailable && <p className="vt-unavail-msg">⚠ These dates are already booked.</p>}
  </div>
  )}

  {/* Book ahead */}
  <div className="vt-book-ahead">
  <span className="vt-pol-icon vt-pol-teal"><LuCalendarCheck size={13} /></span>
  <p><span className="vt-pol-bold">Book ahead</span> • Reserve in advance to guarantee your spot.</p>
  </div>

  {/* Reserve button */}
  <button
  className="vt-reserve-btn"
  disabled={!startDate || !endDate || !isAvailable || bookingLoading}
  onClick={handleBooking}
  >
  {bookingLoading ? "Processing…" : isAvailable ? "Reserve Now" : "Unavailable"}
  </button>

  </div>

  </div>

  </div>

  {/* ══════════════════════════════════════
       FULL-WIDTH REVIEW TAB
  ══════════════════════════════════════ */}
  <div className="rv-tab-section">
  <div className="rv-tab-inner">

  {/* LEFT PANEL — Write a Review */}
  <div className="rv-write-panel">
  <div className="rv-write-heading">
  <LuStar size={18} style={{ color: '#fbbf24' }} />
  <h3 className="rv-panel-title">Write a Review</h3>
  </div>

  {user ? (
  <form onSubmit={submitReview} className="rv-form">
  <div className="rv-stars-row">
  {[1,2,3,4,5].map(n => (
  <span
  key={n}
  className={`rv-star ${rating >= n ? 'rv-star-active' : ''}`}
  onClick={() => setRating(n)}
  >★</span>
  ))}
  <span className="rv-star-label">{rating}/5</span>
  </div>
  <textarea
  className="rv-textarea"
  placeholder="Share your experience with others…"
  value={comment}
  onChange={e => setComment(e.target.value)}
  required
  />
  <button type="submit" className="rv-submit-btn">Post Review</button>
  </form>
  ) : (
  <div className="rv-login-prompt">
  <p>Please log in to share your experience.</p>
  <button className="rv-login-btn" onClick={() => navigate('/login')}>Log In</button>
  </div>
  )}
  </div>

  {/* DIVIDER */}
  <div className="rv-divider" />

  {/* RIGHT PANEL — Review Carousel */}
  <div className="rv-carousel-panel">
  <div className="rv-carousel-header">
  <div>
  <h3 className="rv-panel-title">Community Reviews</h3>
  <span className="rv-count">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
  </div>
  <div className="rv-nav-btns">
  <button className="rv-nav-btn" onClick={() => scrollCarousel(-1)} aria-label="Previous">
  <LuChevronLeft size={18} />
  </button>
  <button className="rv-nav-btn" onClick={() => scrollCarousel(1)} aria-label="Next">
  <LuChevronRight size={18} />
  </button>
  </div>
  </div>

  {reviews.length === 0 ? (
  <div className="rv-empty">
  <LuStar size={32} style={{ color: 'rgba(167,235,242,0.3)', marginBottom: 10 }} />
  <p>No reviews yet. Be the first to review!</p>
  </div>
  ) : (
  <div className="rv-track-wrap" ref={carouselRef}>
  <div className="rv-track">
  {reviews.map(rev => {
  const displayName = rev.userId?.username || rev.userId?.name || rev.userName || 'Guest';
  const avgRating = rev.rating || 0;
  return (
  <div key={rev._id} className="rv-card">
  <div className="rv-card-top">
  <div className="rv-avatar">{displayName.charAt(0).toUpperCase()}</div>
  <div className="rv-card-meta">
  <strong className="rv-card-name">{displayName}</strong>
  <div className="rv-card-stars">
  {[1,2,3,4,5].map(s => (
  <span key={s} style={{ color: s <= avgRating ? '#fbbf24' : 'rgba(167,235,242,0.25)', fontSize: 13 }}>★</span>
  ))}
  </div>
  </div>
  </div>
  <p className="rv-card-comment">{rev.comment}</p>
  <div className="rv-card-actions">
  <button className="rv-react-btn" onClick={() => handleReaction(rev._id, 'likes')}>
  <LuThumbsUp size={12} /> {rev.likes?.length || 0}
  </button>
  <button className="rv-react-btn" onClick={() => handleReaction(rev._id, 'dislikes')}>
  <LuThumbsDown size={12} /> {rev.dislikes?.length || 0}
  </button>
  {/* Delete button — only visible to the author of this review */}
  {user && (rev.userId?._id === user._id || rev.userId?.toString() === user._id || rev.userId === user._id) && (
   <button
    className="rv-react-btn"
    onClick={() => handleDeleteReview(rev._id)}
    title="Delete my review"
    style={{ marginLeft: "auto", color: "rgba(239,68,68,0.7)", borderColor: "rgba(239,68,68,0.25)" }}
    onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.55)"; e.currentTarget.style.background = "rgba(239,68,68,0.10)"; }}
    onMouseLeave={e => { e.currentTarget.style.color = "rgba(239,68,68,0.7)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"; e.currentTarget.style.background = ""; }}
   >
    <LuTrash2 size={12} />
   </button>
  )}
  </div>
  </div>
  );
  })}
  </div>
  </div>
  )}
  </div>

  </div>
  </div>

  </div>
  );
}