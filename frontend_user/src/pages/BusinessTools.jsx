import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import "./styles/BusinessTools.css";

export default function BusinessTools() {
  const { user }   = useContext(AuthContext);
  const navigate   = useNavigate();

  const [bizCategory, setBizCategory] = useState(null);   // 'Hotel' | 'Guide' | 'Transport'
  const [loadingBiz,  setLoadingBiz]  = useState(true);

  // Dynamic Dashboard Stats
  const [stats, setStats] = useState({
    activeListings: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  /* ── Fetch approved partner-request and dynamic stats ── */
  useEffect(() => {
    if (!user || user.accountType !== "business") {
      navigate("/");
      return;
    }

    // Fetch Business category mapping
    API.get(`/partner-request/by-user/${user._id}`)
      .then(r => setBizCategory(r.data?.category || null))
      .catch(() => setBizCategory(null))
      .finally(() => setLoadingBiz(false));

    // Fetch Business Dynamic Statistics
    API.get(`/business/stats/${user._id}`)
      .then(r => setStats(r.data))
      .catch(err => console.error("Could not fetch metrics", err));

  }, [user, navigate]);

  /* Guides (Tour / Chauffeur) may NOT post Packages */
  const isGuide       = bizCategory === "Guide";
  const canPostPackage = !isGuide;

  return (
    <div className="business-wrapper">
      <div className="dashboard-container animate-fade-in">

        <header className="dashboard-header">
          <h1>Business Dashboard <span className="badge">Pro</span></h1>
          <p>
            Welcome back, <strong>{user?.username || "Partner"}</strong>!
            {bizCategory && <span className="biz-cat-tag">📂 {bizCategory}</span>}
          </p>
        </header>

        {/* ── Analytics Stat Cards ── */}
        <div className="analytics-grid">
          <div className="stat-card">
            <h3>Total Bookings</h3>
            <p className="stat-number">{stats.totalBookings}</p>
            <span className="stat-label">All-time</span>
          </div>
          <div className="stat-card">
            <h3>Revenue</h3>
            <p className="stat-number">Rs {stats.totalRevenue.toLocaleString()}</p>
            <span className="stat-label">LKR collected</span>
          </div>
          <div className="stat-card">
            <h3>Active Listings</h3>
            <p className="stat-number">{stats.activeListings < 10 && stats.activeListings > 0 ? `0${stats.activeListings}` : stats.activeListings}</p>
            <span className="stat-label">Running now</span>
          </div>
        </div>

        {/* ── Post Actions: two distinct buttons ── */}
        {!loadingBiz && (
          <div className="bt-post-actions">
            <div className="bt-post-label">➕ Create New Listing</div>
            <div className="bt-post-row">

              {/* Post a Service — always available */}
              <button
                className="bt-post-card bt-service"
                onClick={() => navigate("/addservice")}
              >
                <span className="bt-post-icon">⚙️</span>
                <span className="bt-post-title">Post a Service</span>
                <span className="bt-post-desc">
                  {bizCategory === "Hotel"
                    ? "Add a hotel room, villa, resort or cabana"
                    : bizCategory === "Guide"
                    ? "Publish your guide or chauffeur profile"
                    : "List a vehicle for rent or hire"}
                </span>
              </button>

              {/* Post a Package — hidden for Guides */}
              {canPostPackage ? (
                <button
                  className="bt-post-card bt-package"
                  onClick={() => navigate("/addpackage")}
                >
                  <span className="bt-post-icon">🗺️</span>
                  <span className="bt-post-title">Post a Package</span>
                  <span className="bt-post-desc">
                    Create a curated tour or multi-day itinerary
                  </span>
                </button>
              ) : (
                <div className="bt-post-card bt-package bt-disabled" title="Guides can only post services">
                  <span className="bt-post-icon">🗺️</span>
                  <span className="bt-post-title">Post a Package</span>
                  <span className="bt-post-desc bt-disabled-msg">
                    🔒 Not available for Guide accounts
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tool Cards Grid ── */}
        <div className="tools-grid">
          <div className="tool-card" onClick={() => navigate("/managepackages")}>
            <div className="icon">📋</div>
            <h3>Manage Listings</h3>
            <p>Update details and information for your services & packages.</p>
            <button className="tool-btn">View All</button>
          </div>

          <div className="tool-card" onClick={() => navigate("/businessplace")}>
            <div className="icon">🏢</div>
            <h3>Business Place</h3>
            <p>View and manage your business profile.</p>
            <button className="tool-btn">View</button>
          </div>

          <div className="tool-card" onClick={() => navigate("/seller-bookings")}>
            <div className="icon">📦</div>
            <h3>All Bookings</h3>
            <p>View and manage all bookings for your listings.</p>
            <button className="tool-btn">View</button>
          </div>

          <div className="tool-card" onClick={() => navigate("/business-bookings")}>
            <div className="icon">📬</div>
            <h3>Incoming Bookings</h3>
            <p>See customer bookings for your published services.</p>
            <button className="tool-btn">View</button>
          </div>
        </div>

      </div>
    </div>
  );
}