import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import { 
  LuLayoutDashboard, 
  LuTrendingUp, 
  LuListOrdered, 
  LuWallet,
  LuPlus,
  LuMap,
  LuLayoutList,
  LuStore,
  LuPackageOpen,
  LuInbox,
  LuLock
} from "react-icons/lu";
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

    API.get(`/partner-request/by-user/${user._id}`)
      .then(r => setBizCategory(r.data?.category || null))
      .catch(() => setBizCategory(null))
      .finally(() => setLoadingBiz(false));

    API.get(`/business/stats/${user._id}`)
      .then(r => setStats(r.data))
      .catch(err => console.error("Could not fetch metrics", err));

  }, [user, navigate]);

  const isGuide       = bizCategory === "Guide";
  const canPostPackage = !isGuide;

  if (loadingBiz) {
    return (
      <div className="biz-dashboard-container biz-loading">
        <div className="biz-spinner"></div>
      </div>
    );
  }

  return (
    <div className="biz-dashboard-container">
      <div className="biz-dashboard-inner">

        {/* ── HEADER ── */}
        <header className="biz-header">
          <div className="biz-eyebrow">
            <LuLayoutDashboard /> Partner Portal
          </div>
          <div className="biz-title-row">
            <h1>Business Dashboard</h1>
            <span className="biz-badge-pro">PRO</span>
          </div>
          <p className="biz-subtitle">
            Welcome back, <strong>{user?.username || "Partner"}</strong>. 
            {bizCategory && <span className="biz-cat-tag">{bizCategory}</span>}
          </p>
        </header>

        {/* ── METRICS BENTO ── */}
        <div className="biz-metrics-grid">
          <div className="biz-metric-card">
            <div className="biz-metric-icon"><LuListOrdered /></div>
            <div className="biz-metric-content">
              <h3>Total Bookings</h3>
              <div className="biz-metric-value">{stats.totalBookings}</div>
              <p className="biz-metric-label">All-time bookings</p>
            </div>
          </div>
          <div className="biz-metric-card biz-metric-highlight">
            <div className="biz-metric-icon"><LuWallet /></div>
            <div className="biz-metric-content">
              <h3>Revenue</h3>
              <div className="biz-metric-value">
                <span className="biz-currency">Rs</span> {stats.totalRevenue.toLocaleString()}
              </div>
              <p className="biz-metric-label">LKR collected</p>
            </div>
          </div>
          <div className="biz-metric-card">
            <div className="biz-metric-icon"><LuTrendingUp /></div>
            <div className="biz-metric-content">
              <h3>Active Listings</h3>
              <div className="biz-metric-value">
                {stats.activeListings < 10 && stats.activeListings > 0 ? `0${stats.activeListings}` : stats.activeListings}
              </div>
              <p className="biz-metric-label">Currently running</p>
            </div>
          </div>
        </div>

        {/* ── CREATION ACTIONS ── */}
        <div className="biz-section">
          <div className="biz-section-header">
            <h2>Create New Listing</h2>
            <p>Publish new offerings to the CeylonRoam marketplace.</p>
          </div>
          <div className="biz-actions-grid">
            <button className="biz-action-card" onClick={() => navigate(bizCategory === "Hotel" ? "/add-hotel-room" : "/addservice")}>
              <div className="biz-action-icon"><LuPlus /></div>
              <div className="biz-action-text">
                <h3>Post a Service</h3>
                <p>
                  {bizCategory === "Hotel"
                    ? "Add a hotel room, villa, resort or cabana."
                    : bizCategory === "Guide"
                    ? "Publish your guide or chauffeur profile."
                    : "List a vehicle for rent or hire."}
                </p>
              </div>
            </button>

            {canPostPackage ? (
              <button className="biz-action-card biz-action-primary" onClick={() => navigate("/addpackage")}>
                <div className="biz-action-icon"><LuMap /></div>
                <div className="biz-action-text">
                  <h3>Post a Package</h3>
                  <p>Create a curated tour or multi-day itinerary.</p>
                </div>
              </button>
            ) : (
              <div className="biz-action-card biz-action-disabled">
                <div className="biz-action-icon"><LuLock /></div>
                <div className="biz-action-text">
                  <h3>Post a Package</h3>
                  <p className="biz-disabled-text">Not available for Guide accounts.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MANAGEMENT TOOLS ── */}
        <div className="biz-section">
          <div className="biz-section-header">
            <h2>Management Tools</h2>
            <p>Control your business profile, listings, and customer bookings.</p>
          </div>
          <div className="biz-tools-grid">
            <div className="biz-tool-card" onClick={() => navigate("/managepackages")}>
              <div className="biz-tool-icon"><LuLayoutList /></div>
              <h3>Manage Listings</h3>
              <p>Update details and information for your services & packages.</p>
            </div>

            <div className="biz-tool-card" onClick={() => navigate("/businessplace")}>
              <div className="biz-tool-icon"><LuStore /></div>
              <h3>Business Place</h3>
              <p>View and manage your public business profile.</p>
            </div>

            <div className="biz-tool-card" onClick={() => navigate("/seller-bookings")}>
              <div className="biz-tool-icon"><LuPackageOpen /></div>
              <h3>All Bookings</h3>
              <p>View and manage all historical bookings for your listings.</p>
            </div>

            <div className="biz-tool-card" onClick={() => navigate("/business-bookings")}>
              <div className="biz-tool-icon"><LuInbox /></div>
              <h3>Incoming Bookings</h3>
              <p>See new customer bookings for your published services.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}