import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LuHeart, LuWifiOff, LuStar, LuMapPin, LuCreditCard } from "react-icons/lu";
import API from "../api/axios";
import { CurrencyContext } from "../context/CurrencyContext";
import { AuthContext } from "../context/AuthContext";
import { useOfflineData } from "../context/OfflineDataContext";
import toast from "react-hot-toast";
import "./styles/explore.css";
import "./styles/bookservices.css";

/* ── Group array by key ── */
function groupBy(arr, fn) {
  return arr.reduce((acc, item) => {
    const k = fn(item) || "Other";
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

/* ── High-level section definitions ── */
const SUPER_SECTIONS = [
  {
    id: "accommodation",
    label: "🏨 Accommodations",
    desc: "Hotels, Villas, Resorts & more",
    keys: ["Hotel Package"],
    badge: { bg: "rgba(167,235,242,0.12)", color: "#A7EBF2" },
  },
  {
    id: "transport",
    label: "🚗 Transport",
    desc: "Self-drive rentals & chauffeur hire",
    keys: ["Rent Vehicle", "Hire Vehicle"],
    badge: { bg: "rgba(167,235,242,0.12)", color: "#A7EBF2" },
  },
  {
    id: "guide",
    label: "🧭 Guides",
    desc: "Tour guides & chauffeur guides",
    keys: ["Guide", "Chauffeur Guide"],
    badge: { bg: "rgba(167,235,242,0.12)", color: "#A7EBF2" },
  },
];

/* ── Sub-category meta within sections ── */
const SUBCAT_META = {
  "Hotel Package":   { icon: "🏨", label: "Hotels & Accommodations" },
  "Rent Vehicle":    { icon: "🔑", label: "Rent a Vehicle" },
  "Hire Vehicle":    { icon: "🚐", label: "Hire a Vehicle" },
  "Guide":           { icon: "🧭", label: "Tour Guides" },
  "Chauffeur Guide": { icon: "🚗", label: "Chauffeur Guides" },
};

/* ── Feature chips shown on card ── */
function FeatureChips({ svc }) {
  switch (svc.serviceCategory) {
    case "Rent Vehicle":
      return (
        <div className="bs-feature-chips">
          <span className="bs-chip bs-chip-blue">Self-Drive</span>
          {svc.includedKM && <span className="bs-chip bs-chip-teal">{svc.includedKM} KM/day</span>}
        </div>
      );
    case "Hire Vehicle":
      return (
        <div className="bs-feature-chips">
          <span className="bs-chip bs-chip-blue">Chauffeur Driven</span>
          <span className="bs-chip bs-chip-teal">Per KM Rate</span>
        </div>
      );
    case "Guide":
      return (
        <div className="bs-feature-chips">
          <span className="bs-chip bs-chip-blue">Tour Guide</span>
          {svc.languages?.length > 0 && (
            <span className="bs-chip bs-chip-teal">{svc.languages.slice(0, 2).join(" & ")}</span>
          )}
        </div>
      );
    case "Chauffeur Guide":
      return (
        <div className="bs-feature-chips">
          <span className="bs-chip bs-chip-blue">Chauffeur Guide</span>
          {svc.languages?.length > 0 && (
            <span className="bs-chip bs-chip-teal">{svc.languages.slice(0, 2).join(" & ")}</span>
          )}
        </div>
      );
    case "Hotel Package": {
      const parts = svc.description?.includes("|") ? svc.description.split("|") : [];
      const accommodation = parts[2]?.trim();
      const roomSize = parts[0]?.replace("Room Size:", "").trim();
      return (
        <div className="bs-feature-chips">
          {accommodation && <span className="bs-chip bs-chip-blue">{accommodation}</span>}
          {roomSize && <span className="bs-chip bs-chip-teal">{roomSize}</span>}
        </div>
      );
    }
    default:
      return null;
  }
}

const DISTRICTS = [
  "All Locations",
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
];

const CATEGORY_FILTERS = [
  { value: "",                label: "All Services" },
  { value: "Hotel Package",   label: "🏨 Accommodation" },
  { value: "Guide",           label: "🧭 Tour Guide" },
  { value: "Chauffeur Guide", label: "🚗 Chauffeur Guide" },
  { value: "Rent Vehicle",    label: "🔑 Rent Vehicle" },
  { value: "Hire Vehicle",    label: "🚐 Hire Vehicle" },
];

export default function BookServices() {
  const navigate = useNavigate();
  const { formatPrice, loadingRates } = useContext(CurrencyContext);
  const { user } = useContext(AuthContext);

  const { services, savedItems, isOffline, loading: ctxLoading } = useOfflineData();
  const loading = ctxLoading.services;

  const [selCategory, setSelCategory]   = useState("");
  const [selLocation, setSelLocation]   = useState("All Locations");
  const [maxPrice, setMaxPrice]         = useState(50000);
  const [savedPackageIds, setSavedPackageIds] = useState(new Set());

  useEffect(() => {
    const ids = new Set(
      savedItems
        .filter(item => item.packageId?._id)
        .map(item => item.packageId._id)
    );
    setSavedPackageIds(ids);
  }, [savedItems]);

  /* Apply sidebar filters */
  const filtered = services.filter(s => {
    const matchCat   = !selCategory || s.serviceCategory === selCategory;
    const matchLoc   = selLocation === "All Locations" || s.location === selLocation;
    const matchPrice = s.price <= maxPrice;
    return matchCat && matchLoc && matchPrice;
  });

  /* Group by serviceCategory */
  const grouped = groupBy(filtered, s => s.serviceCategory);

  const openPackage = (packageId) => {
    const target = `/viewpackage/${packageId}`;
    const navAction = () => navigate(target, { state: { transition: "card-to-detail" } });
    if (typeof document !== "undefined" && document.startViewTransition) {
      document.startViewTransition(navAction);
    } else {
      navAction();
    }
  };

  /* ── Service card — same visual structure as tour-card on Packages page ── */
  const ServiceCard = ({ svc }) => {
    const isFavorite = savedPackageIds.has(svc._id);

    const handleFavoriteClick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) { toast.error("Please login to save services!"); return; }
      try {
        const res = await API.post("/saved/save-package", { userId: user._id, packageId: svc._id });
        const newSaved = new Set(savedPackageIds);
        if (res.data.saved) {
          newSaved.add(svc._id);
          toast.success(res.data.message);
        } else {
          newSaved.delete(svc._id);
          toast.success(res.data.message);
        }
        setSavedPackageIds(newSaved);
      } catch {
        toast.error("Failed to update favorite");
      }
    };

    return (
      /* Use tour-card class so it inherits ALL the same dark-glass styles */
      <div className="matte-card tour-card bs-service-card" onClick={() => openPackage(svc._id)}>

        {/* ── Card Image (same structure as tour-card) ── */}
        <div className="card-img">
          <img
            src={`http://localhost:5000${svc.image}`}
            alt={svc.name}
            loading="lazy"
            onError={e => { e.target.src = "https://via.placeholder.com/400x260?text=No+Image"; }}
          />

          {/* Service type badge where duration badge normally lives */}
          <div className="tour-duration-badge">{svc.serviceCategory}</div>

          {/* Favourite button */}
          <button className="card-save-btn" title="Favourite" onClick={handleFavoriteClick}>
            <LuHeart
              size={20}
              color={isFavorite ? "#ef4444" : "#26658C"}
              fill={isFavorite ? "#ef4444" : "none"}
              style={{ transition: "all 0.2s ease" }}
            />
          </button>
        </div>

        {/* ── Card Body ── */}
        <div className="card-info">

          {/* Title + Stars row */}
          <div className="card-title-area">
            <h4>{svc.name}</h4>
            <div className="card-stars">
              <LuStar fill="#d97706" color="#d97706" size={14} />
              <LuStar fill="#d97706" color="#d97706" size={14} />
              <LuStar fill="#d97706" color="#d97706" size={14} />
            </div>
          </div>

          {/* Location */}
          {svc.location && (
            <div className="card-location-area">
              <p className="loc-primary">
                <LuMapPin size={14} className="loc-icon" />
                <span>{svc.location} — View on map</span>
              </p>
            </div>
          )}

          {/* Feature chips — self-drive, per-km, languages, etc. */}
          <FeatureChips svc={svc} />

          {/* Posted by */}
          {svc.creator && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0 8px", fontSize: "12px", color: "rgba(231,249,252,0.65)" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(167,235,242,0.18)", color: "#d8f8ff", border: "1px solid rgba(167,235,242,0.32)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 }}>
                {svc.creator.username?.charAt(0).toUpperCase() || "P"}
              </div>
              <span>Posted by <strong style={{ color: "#f2fbff" }}>{svc.creator.username || "Partner"}</strong></span>
            </div>
          )}

          {/* Perks row */}
          <div className="card-perks-area">
            <div className="perk-row-credit">
              <LuCreditCard size={15} /> Book without a credit card
            </div>
          </div>

          <div className="card-info-divider" />

          {/* Price + Button */}
          <div className="price-box-vertical">
            <div className="price-label">From{svc.pricingType === "Per KM" ? " (per km)" : " (per day)"}</div>
            <div className="amt">
              {loadingRates ? <span style={{ fontSize: 13 }}>…</span> : formatPrice(svc.price)}
            </div>
          </div>

          <button
            className="view-btn-full"
            onClick={e => { e.stopPropagation(); openPackage(svc._id); }}
          >
            Book Now
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="explore-container">

      {/* ── Offline banner ── */}
      {isOffline && (
        <div className="offline-banner" role="alert">
          <LuWifiOff size={16} />
          <span>You're offline — showing cached services. Some data may be outdated.</span>
        </div>
      )}

      {/* ══ SIDEBAR — left column (same structure as Packages page) ══ */}
      <aside className="filter-sidebar">
        <h3>Filter Services</h3>

        <div className="filter-group">
          <label>Service Type</label>
          <select value={selCategory} onChange={e => setSelCategory(e.target.value)}>
            {CATEGORY_FILTERS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Location</label>
          <select value={selLocation} onChange={e => setSelLocation(e.target.value)}>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>
            Max Budget
            <span className="price-range-val" style={{ display: "block", fontSize: 12, marginTop: 4 }}>
              {loadingRates ? "…" : formatPrice(maxPrice)}
            </span>
          </label>
          <input
            type="range" min={0} max={50000} step={500}
            value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))}
          />
        </div>

        <div className="filter-btn-group">
          <button className="reset-btn" onClick={() => {
            setSelCategory(""); setSelLocation("All Locations"); setMaxPrice(50000);
          }}>Clear Filters</button>
        </div>
      </aside>

      {/* ══ MAIN — right column ══ */}
      <main className="packages-display">

        {/* Hero header */}
        <div className="grid-header">
          <h2>Book Services</h2>
          <span className="result-count">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="bs-loader">⏳ Loading services…</div>

        ) : isOffline && services.length === 0 ? (
          <div className="no-results" style={{ marginTop: "60px" }}>
            <div className="no-results-icon" style={{ filter: "grayscale(100%)" }}>🗺️</div>
            <div className="no-results-title">Offline data not available</div>
            <p>Please check your connection and try again.</p>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", border: "none", background: "#023859", color: "#fff", cursor: "pointer" }}
            >Retry</button>
          </div>

        ) : filtered.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <div className="no-results-title">No services found</div>
            <p>Try adjusting your filters.</p>
          </div>

        ) : (
          SUPER_SECTIONS.map(section => {
            const subKeys = section.keys.filter(k => grouped[k]?.length > 0);
            if (subKeys.length === 0) return null;
            return (
              <section key={section.id} className="bs-super-section">
                {subKeys.map(subKey => {
                  const { icon, label } = SUBCAT_META[subKey] || { icon: "", label: subKey };
                  return (
                    <div key={subKey} className="ep-category-section" style={{ marginLeft: 0 }}>
                      <div className="ep-section-heading">
                        <span className="ep-section-icon">{icon}</span>
                        <h3>{label}</h3>
                        <span
                          className="ep-section-count"
                          style={{ background: section.badge.bg, color: section.badge.color }}
                        >
                          {grouped[subKey].length}
                        </span>
                      </div>
                      <div className="explore-grid">
                        {grouped[subKey].map(svc => (
                          <ServiceCard key={svc._id} svc={svc} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            );
          })
        )}
      </main>
    </div>
  );
}
