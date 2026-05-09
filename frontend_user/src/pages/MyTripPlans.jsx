import React, { useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";
import useProtectedNavigation from "../hooks/useProtectedNavigation";
import { AuthContext } from "../context/AuthContext";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import "./styles/mytripplans.css";

/* ── Static palette for card visuals (cycles through cards) ─── */
const CARD_GRADIENTS = [
  "linear-gradient(140deg, #0a3d62 0%, #1e5f4a 100%)",
  "linear-gradient(140deg, #2d6a4f 0%, #1a6fa8 100%)",
  "linear-gradient(140deg, #1e3a5f 0%, #2d6a4f 100%)",
  "linear-gradient(140deg, #6b3a2a 0%, #0a3d62 100%)",
  "linear-gradient(140deg, #1a3a4f 0%, #2d4a6f 100%)",
];
const CARD_ICONS = ["🌴", "🏔️", "🌊", "🐘", "🌿", "🏰", "🌺", "⛵"];

export default function MyTripPlans() {
  /* ── All original state & logic UNCHANGED ────────────────── */
  const { user } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const handleProtectedNavigation = useProtectedNavigation();

  useEffect(() => {
    let isMounted = true;
    
    // Failsafe: if the request or SW hangs indefinitely, turn off loading after 8 seconds
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
        if (trips.length === 0) setError(true);
      }
    }, 8000);

    const fetchTrips = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/ai/user/${user._id || user.id}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (isMounted) {
          const tripsData = Array.isArray(data) ? data : [];
          // Save the fetched trip data to localStorage
          localStorage.setItem('ceylonroam_offline_trips', JSON.stringify(tripsData));
          
          // Gracefully accept the cached Workbox response
          setTrips(tripsData);
          setError(false);
        }
      } catch (err) {
        console.error("Failed to fetch trips", err);
        if (isMounted) {
          // Attempt to retrieve cached data
          const cachedTrips = localStorage.getItem('ceylonroam_offline_trips');
          
          if (cachedTrips) {
            try {
              // Parse and use the cached data
              const parsedTrips = JSON.parse(cachedTrips);
              setTrips(parsedTrips);
              setError(false); // Do not show error since we have offline data
            } catch (parseError) {
              console.error("Failed to parse cached trips", parseError);
              setError(true);
            }
          } else {
            // Only set error if no cached data exists
            setError(true);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          clearTimeout(fallbackTimer);
        }
      }
    };
    
    if (user) {
      fetchTrips();
    } else {
      // If there's no user, we might be offline and AuthContext failed to load it quickly.
      // The failsafe timer will turn off the loading spinner eventually.
    }

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
    };
  }, [user, trips.length]);

  const handleDelete = (id) => {
    toast(
      (t) => (
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          🗑️ Delete this trip plan?
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const tid = toast.loading("Deleting plan…");
              try {
                await API.delete(`/ai/${id}`);
                setTrips(trips.filter(trip => trip._id !== id));
                toast.success("✅ Trip plan deleted.", { id: tid });
              } catch {
                toast.error("❌ Delete failed. Please try again.", { id: tid });
              }
            }}
            style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
          >Delete</button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ background: "rgba(255,255,255,0.1)", color: "#f1f5f9", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
          >Cancel</button>
        </span>
      ),
      { duration: 6000 }
    );
  };

  /* ── PDF Export Direct Render Logic ─────────────────────── */
  const downloadPDF = async () => {
    const input = document.getElementById("pdf-content");
    if (!input) return;

    // Temporarily hide buttons for the screenshot
    const closeBtn = document.querySelector(".close-modal");
    const downloadBtn = document.querySelector(".primary-btn");
    if(closeBtn) closeBtn.style.display = "none";
    if(downloadBtn) downloadBtn.style.display = "none";

    try {
      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Center the image properly on A4 canvas
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Route_${selectedTrip.tripTitle.replace(/\s+/g, '_')}.pdf`);
    } finally {
      // Bring them back seamlessly
      if(closeBtn) closeBtn.style.display = "flex";
      if(downloadBtn) downloadBtn.style.display = "block";
    }
  };

  /* ── Loading & Error Fallbacks ─────────────────────────────── */
  if (loading) return (
    <div className="loader">
      <div className="loader-spinner" />
      Loading your adventures…
    </div>
  );

  if (error && trips.length === 0) return (
    <div className="no-trips" style={{ marginTop: '100px' }}>
      <div className="no-trips-icon" style={{ filter: 'grayscale(100%)' }}>⚠️</div>
      <h2 style={{ margin: '16px 0 8px 0', color: '#0f172a' }}>Offline data not available</h2>
      <p style={{ color: '#64748b' }}>
        We couldn't load your trips.<br />
        Please check your connection and try again.
      </p>
      <button 
        onClick={() => window.location.reload()} 
        style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0a3d62', color: '#fff', cursor: 'pointer' }}
      >
        Retry
      </button>
    </div>
  );

  return (
    <>
      <div className={`saved-trips-container ${selectedTrip ? "blur-bg" : ""}`}>
        {/* ── Page Header ─────────────────────────────────────── */}
        <div className="trips-header">
          <div className="trips-header-eyebrow">🗺️ My Adventures</div>
          <h1>Your Saved<br />Sri Lanka Plans</h1>
          <p>
            Every itinerary your AI crafted, saved and ready to rediscover.
            Tap any card for the full day-by-day breakdown.
          </p>
        </div>

        {/* ── Trip Cards Grid ──────────────────────────────────── */}
        <div className="trips-grid">
          {trips.length > 0 ? (
            trips.map((trip, idx) => (
              <div
                key={trip._id}
                className="trip-card animate-in"
                style={{ animationDelay: `${idx * 0.07}s` }}
              >
                {/* Visual Header — gradient + decorative pattern */}
                <div
                  className="trip-card-visual"
                  style={{ background: CARD_GRADIENTS[idx % CARD_GRADIENTS.length] }}
                >
                  <div className="trip-card-number">{idx + 1}</div>
                  <div className="trip-card-icon">
                    {CARD_ICONS[idx % CARD_ICONS.length]}
                  </div>

                  {/* Date chip */}
                  <div className="trip-visual-date">
                    📅 {new Date(trip.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </div>

                  {/* Cost chip */}
                  {trip.budget && (
                    <div className="trip-visual-cost">💰 {trip.budget}</div>
                  )}
                </div>

                {/* Trip Title */}
                <div className="trip-card-top">
                  <h3>{trip.tripTitle}</h3>
                </div>

                {/* Metadata pills */}
                <div className="trip-details-row">
                  {trip.days && <span>📅 {trip.days} Days</span>}
                  {trip.transport && <span>🚗 {trip.transport}</span>}
                </div>

                {/* Truncated description */}
                <div className="plan-description-box">
                  <p>
                    {trip.fullPlanDescription
                      ? trip.fullPlanDescription.substring(0, 160) + "…"
                      : "Your personalised Sri Lanka adventure awaits inside."}
                  </p>
                </div>

                {/* Actions */}
                <div className="card-actions">
                  <button
                    className="view-btn"
                    onClick={() => setSelectedTrip(trip)}
                  >
                    View Full Itinerary
                  </button>
                  <button
                    className="del-btn"
                    onClick={() => handleDelete(trip._id)}
                    title="Delete this plan"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            /* ── Empty State ────────────────────────────────── */
            <div className="no-trips">
              <div className="no-trips-icon">🗺️</div>
              <p>
                You haven't saved any AI trip plans yet.<br />
                Start planning your perfect Sri Lanka adventure!
              </p>
              <button onClick={() => handleProtectedNavigation("/tripplan")}>
                ✨ Create My First Plan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════ MODAL (Outside the main container) */}
      {selectedTrip && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedTrip(null)}
        >
          <div
            id="pdf-content"
            className="modal-content animate-pop"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <button
                className="close-modal"
                onClick={() => setSelectedTrip(null)}
                style={{ position: "absolute", top: 18, right: 22 }}
              >
                &times;
              </button>
              <h2>{selectedTrip.tripTitle}</h2>
              <div className="modal-badges">
                {selectedTrip.budget     && <span>💰 {selectedTrip.budget}</span>}
                {selectedTrip.days       && <span>📅 {selectedTrip.days} Days</span>}
                {selectedTrip.transport  && <span>🚗 {selectedTrip.transport}</span>}
              </div>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              <div className="full-desc markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedTrip.fullPlanDescription}
                </ReactMarkdown>
              </div>

              {selectedTrip.itinerary && selectedTrip.itinerary.length > 0 && (
                <div className="timeline-container" style={{ marginTop: "24px" }}>
                  {selectedTrip.itinerary.map((day, i) => (
                    <DayCard key={i} day={day} />
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer" style={{ padding: "20px 40px", borderTop: "1px solid #f1f5f9" }}>
              <button
                className="primary-btn"
                onClick={downloadPDF} 
                style={{ background: "#0a3d62", color: "#fff", padding: "12px 24px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600 }}
              >
                📄 Download as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   DAY CARD – collapsible sub-component (Directly mirrors TripPlanner)
   ════════════════════════════════════════════════════════════════ */
function DayCard({ day }) {
  const [expanded, setExpanded] = useState(true);

  const holidayWarn = day.warnings?.includes("Holiday")
    ? day.warnings.split("⛈️")[0].trim() : "";
  const weatherWarn = day.warnings?.includes("⛈️")
    ? "⛈️" + day.warnings.split("⛈️")[1] : "";

  const activities = Array.isArray(day.activities)
    ? day.activities.map(act => {
        if (typeof act === "string") {
          const m = act.match(/^(.+?)\s*\(Distance:\s*([\d.]+)km,\s*Time:\s*([\d.]+)hrs\)(.*)$/);
          if (m) return { name: m[1], dist: m[2], time: m[3], accessWarn: m[4].trim() };
          return { name: act };
        }
        return {
          name:       act.Name || act.name,
          dist:       act.Distance_to_Hotel,
          time:       act.Visit_Time,
          accessWarn: act.Access_Warning || act.access_warning,
        };
      })
    : [];

  return (
    <div className="day-card" style={{ marginBottom: "16px", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
      <div className="day-header" onClick={() => setExpanded(e => !e)} style={{ cursor: "pointer", background: "#f8fafc", padding: "16px", display: "flex", alignItems: "center" }}>
        <div>
          <div className="day-num" style={{ fontWeight: 700, color: "#0f172a" }}>Day {day.day}</div>
          <div className="day-date" style={{ fontSize: "14px", color: "#64748b" }}>{day.date}</div>
        </div>
        <div className="day-region" style={{ marginLeft: "16px", fontWeight: 500 }}>📍 {day.destination}</div>
      </div>

      {expanded && (
        <div className="day-body" style={{ padding: "16px", background: "#ffffff" }}>
          {holidayWarn && <div className="warn-banner holiday" style={{ padding: "10px", background: "#fef3c7", borderRadius: "8px", marginBottom: "10px" }}>🎉 {holidayWarn}</div>}
          {weatherWarn && <div className="warn-banner weather" style={{ padding: "10px", background: "#e0f2fe", borderRadius: "8px", marginBottom: "10px" }}>{weatherWarn}</div>}

          {activities.length > 0 && (
            <>
              <div className="places-section-title" style={{ fontWeight: 600, marginBottom: "8px", color: "#334155" }}>Today's Stops</div>
              {activities.map((act, idx) => (
                <div className="place-item" key={idx} style={{ display: "flex", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div className="place-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6", marginTop: "6px", marginRight: "12px" }} />
                  <div>
                    <div className="place-name" style={{ fontWeight: 500 }}>{act.name}</div>
                    {(act.dist || act.time) && (
                      <div className="place-meta" style={{ fontSize: "12px", color: "#64748b" }}>
                        {act.dist && `📏 ${act.dist} km`}
                        {act.dist && act.time && " · "}
                        {act.time && `⏱ ${act.time} hrs`}
                      </div>
                    )}
                    {act.accessWarn && <div className="place-access-warn" style={{ fontSize: "12px", color: "#ef4444", marginTop: "2px" }}>{act.accessWarn}</div>}
                  </div>
                </div>
              ))}
            </>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", marginTop: "12px", gap: "8px" }}>
            {day.accommodation && <div className="hotel-chip" style={{ padding: "6px 12px", background: "#f1f5f9", borderRadius: "20px", fontSize: "13px" }}>🏨 {day.accommodation}</div>}
          </div>
        </div>
      )}
    </div>
  );
}