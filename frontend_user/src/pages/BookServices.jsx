import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { CurrencyContext, SUPPORTED_CURRENCIES } from "../context/CurrencyContext";
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
    id:       "accommodation",
    label:    "🏨 Accommodations",
    desc:     "Hotels, Villas, Resorts & more",
    keys:     ["Hotel Package"],
    badge:    { bg:"#e8f4fd", color:"#1e40af" },
  },
  {
    id:       "transport",
    label:    "🚗 Transport",
    desc:     "Self-drive rentals & chauffeur hire",
    keys:     ["Rent Vehicle", "Hire Vehicle"],
    badge:    { bg:"#f3e8ff", color:"#6b21a8" },
  },
  {
    id:       "guide",
    label:    "🧭 Guides",
    desc:     "Tour guides & chauffeur guides",
    keys:     ["Guide", "Chauffeur Guide"],
    badge:    { bg:"#d1fae5", color:"#065f46" },
  },
];

/* ── Sub-category meta within sections ── */
const SUBCAT_META = {
  "Hotel Package":   { icon:"🏨", label:"Hotels & Accommodations" },
  "Rent Vehicle":    { icon:"🔑", label:"Rent a Vehicle"          },
  "Hire Vehicle":    { icon:"🚕", label:"Hire a Vehicle"          },
  "Guide":           { icon:"🧭", label:"Tour Guides"              },
  "Chauffeur Guide": { icon:"🚗", label:"Chauffeur Guides"         },
};

/* ── Pricing meta per card ── */
function PricingDetail({ svc }) {
  const { formatPrice } = useContext(CurrencyContext);
  switch (svc.serviceCategory) {
    case "Rent Vehicle":
      return (
        <div className="bs-meta-row">
          <span>📏 {svc.includedKM ?? "—"} KM included/day</span>
          {svc.extraKMCharge && (
            <span className="bs-extra-km">
              + {formatPrice(svc.extraKMCharge)} / extra KM
            </span>
          )}
        </div>
      );
    case "Hire Vehicle":
      return <div className="bs-meta-row"><span>📏 Priced per KM</span></div>;
    case "Guide":
    case "Chauffeur Guide":
      return (
        <div className="bs-meta-row">
          {svc.languages?.length > 0 && <span>🗣 {svc.languages.join(", ")}</span>}
          {svc.specialization && <span>🎯 {svc.specialization}</span>}
        </div>
      );
    default:
      return null;
  }
}

const DISTRICTS = [
  "All Locations",
  "Ampara","Anuradhapura","Badulla","Batticaloa","Colombo",
  "Galle","Gampaha","Hambantota","Jaffna","Kalutara",
  "Kandy","Kegalle","Kilinochchi","Kurunegala","Mannar",
  "Matale","Matara","Moneragala","Mullaitivu","Nuwara Eliya",
  "Polonnaruwa","Puttalam","Ratnapura","Trincomalee","Vavuniya",
];

const CATEGORY_FILTERS = [
  { value:"",               label:"All Services"       },
  { value:"Hotel Package",  label:"🏨 Accommodation"   },
  { value:"Guide",          label:"🧭 Tour Guide"      },
  { value:"Chauffeur Guide",label:"🚗 Chauffeur Guide" },
  { value:"Rent Vehicle",   label:"🔑 Rent Vehicle"    },
  { value:"Hire Vehicle",   label:"🚕 Hire Vehicle"    },
];

/* ══════════════════════════════════════════════════════════
   CURRENCY SELECTOR — sidebar widget
   Self-contained: reads from / writes to CurrencyContext.
   Offline-first: shows rate-source badge (live / cached / offline).
══════════════════════════════════════════════════════════ */
const SOURCE_BADGE = {
  live:   { label: "Live rates",   color: "#16a34a", bg: "#f0fdf4", dot: "#22c55e" },
  cached: { label: "Cached rates", color: "#0369a1", bg: "#eff6ff", dot: "#60a5fa" },
  static: { label: "Offline rates",color: "#b45309", bg: "#fffbeb", dot: "#f59e0b" },
};

function CurrencySelectorGroup() {
  const { selectedCurrency, setSelectedCurrency, loadingRates, rateSource } =
    useContext(CurrencyContext);

  const badge = SOURCE_BADGE[rateSource] || SOURCE_BADGE.static;

  return (
    <div className="filter-group" style={{ borderBottom: "1.5px solid #f1f5f9", paddingBottom: "20px", marginBottom: "20px" }}>
      {/* Label + source badge row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
        <label style={{ margin: 0 }}>🌐 Display Currency</label>
        {!loadingRates && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            fontSize: "10px", fontWeight: 600, letterSpacing: "0.3px",
            color: badge.color, background: badge.bg,
            padding: "2px 8px", borderRadius: "9999px",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: badge.dot, display: "inline-block" }} />
            {badge.label}
          </span>
        )}
      </div>

      {/* Currency <select> */}
      <select
        value={selectedCurrency}
        onChange={e => setSelectedCurrency(e.target.value)}
        disabled={loadingRates}
        style={{
          width: "100%",
          padding: "12px 36px 12px 14px",
          border: "2px solid #bae6fd",
          borderRadius: "14px",
          /* solid fill — avoids background/backgroundImage conflict */
          backgroundColor: "#f0f9ff",
          fontFamily: "'Poppins', sans-serif",
          fontSize: "14px",
          fontWeight: 700,
          color: "#0369a1",
          outline: "none",
          cursor: loadingRates ? "wait" : "pointer",
          /* suppress native arrow, inject custom SVG chevron */
          WebkitAppearance: "none",
          MozAppearance: "none",
          appearance: "none",
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%230369a1' stroke-width='1.8' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
          backgroundSize: "12px 8px",
          boxShadow: "0 2px 8px rgba(3,105,161,0.10)",
          transition: "border-color 0.2s, box-shadow 0.2s",
          opacity: loadingRates ? 0.65 : 1,
        }}
      >
        {SUPPORTED_CURRENCIES.map(c => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.code} — {c.label}
          </option>
        ))}
      </select>

      {loadingRates && (
        <p style={{ fontSize: 11, color: "#94a3b8", margin: "6px 0 0", textAlign: "center" }}>
          ↻ Fetching live rates…
        </p>
      )}
    </div>
  );
}

export default function BookServices() {
  const navigate = useNavigate();
  const { selectedCurrency, formatPrice, loadingRates } = useContext(CurrencyContext);

  const [services,    setServices]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(false);
  const [selCategory, setSelCategory] = useState("");
  const [selLocation, setSelLocation] = useState("All Locations");
  const [maxPrice,    setMaxPrice]    = useState(50000);

  useEffect(() => {
    let isMounted = true;
    
    // Failsafe timer: force loading false after 8s if something hangs
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
        if (services.length === 0) setError(true);
      }
    }, 8000);

    fetch("http://localhost:5000/api/packages?listingType=Service")
      .then(async r => {
        if (!r.ok) throw new Error("Network response was not ok");
        const data = await r.json();
        if (isMounted) {
          setServices(Array.isArray(data) ? data : []);
          setError(false);
        }
      })
      .catch(err => {
        console.error("Failed to fetch services", err);
        if (isMounted) setError(true);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
          clearTimeout(fallbackTimer);
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
    };
  }, [services.length]);

  /* Apply sidebar filters */
  const filtered = services.filter(s => {
    const matchCat   = !selCategory || s.serviceCategory === selCategory;
    const matchLoc   = selLocation === "All Locations" || s.location === selLocation;
    const matchPrice = s.price <= maxPrice;
    return matchCat && matchLoc && matchPrice;
  });

  /* Group by serviceCategory */
  const grouped = groupBy(filtered, s => s.serviceCategory);

  /* Shared service card */
  const ServiceCard = ({ svc, badge }) => (
    <div className="matte-card" onClick={() => navigate(`/viewpackage/${svc._id}`)}>
      <div className="card-img">
        <img
          src={`http://localhost:5000${svc.image}`}
          alt={svc.name}
          loading="lazy"
          onError={e => { e.target.src = "https://via.placeholder.com/400x260?text=No+Image"; }}
        />
        <div className="card-category-badge" style={{ background: badge.bg, color: badge.color }}>
          {svc.serviceCategory}
        </div>
      </div>

      <div className="card-info">
        <h4>{svc.name}</h4>
        <p className="loc">📍 {svc.location}</p>
        <PricingDetail svc={svc} />
        <div className="card-info-divider" />
        <div className="price-box" style={{ alignItems:"flex-end" }}>
          <div>
            <div className="price-label">From</div>
            <div className="amt" style={{ lineHeight:1.2 }}>
              {loadingRates ? <span style={{fontSize:13,color:"#999"}}>…</span> : formatPrice(svc.price)}
              <span className="amt-per" style={{ fontSize:12 }}>
                {svc.pricingType === "Per KM" ? " /km" : " /day"}
              </span>
            </div>
          </div>
          <button className="view-btn" onClick={e => { e.stopPropagation(); navigate(`/viewpackage/${svc._id}`); }}>
            Book
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="explore-container">

      {/* ══ SIDEBAR ══ */}
      <aside className="filter-sidebar">
        <h3>🔍 Filter Services</h3>

        {/* ── Currency Selector (offline-first, live rates) ── */}
        <CurrencySelectorGroup />

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
            <span className="price-range-val" style={{ display:"block", fontSize:12, marginTop:4 }}>
              {loadingRates ? "…" : formatPrice(maxPrice)}
            </span>
          </label>
          <input type="range" min={0} max={50000} step={500}
            value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} />
        </div>

        <div className="filter-btn-group">
          <button className="reset-btn" onClick={() => {
            setSelCategory(""); setSelLocation("All Locations"); setMaxPrice(50000);
          }}>Clear Filters</button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="packages-display">
        <div className="grid-header">
          <h2>Book Services</h2>
          <span className="result-count">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="bs-loader">⏳ Loading services…</div>
        ) : error && filtered.length === 0 ? (
          <div className="no-results" style={{ marginTop: '60px' }}>
            <div className="no-results-icon" style={{ filter: 'grayscale(100%)' }}>⚠️</div>
            <div className="no-results-title">Offline data not available</div>
            <p>Please check your connection and try again.</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0a3d62', color: '#fff', cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <div className="no-results-title">No services found</div>
            <p>Try adjusting your filters.</p>
          </div>
        ) : (
          /* ── Three super-sections: Accommodations, Transport, Guides ── */
          SUPER_SECTIONS.map(section => {
            // collect all sub-keys for this super-section that have results
            const subKeys = section.keys.filter(k => grouped[k]?.length > 0);
            if (subKeys.length === 0) return null;

            return (
              <section key={section.id} className="bs-super-section">

                {/* Sub-category groups within this super-section */}
                {subKeys.map(subKey => {
                  const { icon, label } = SUBCAT_META[subKey] || { icon:"📦", label: subKey };
                  return (
                    <div key={subKey} className="ep-category-section" style={{ marginLeft:0 }}>
                      <div className="ep-section-heading">
                        <span className="ep-section-icon">{icon}</span>
                        <h3>{label}</h3>
                        <span className="ep-section-count"
                          style={{ background: section.badge.bg, color: section.badge.color }}>
                          {grouped[subKey].length}
                        </span>
                      </div>
                      <div className="explore-grid">
                        {grouped[subKey].map(svc => (
                          <ServiceCard key={svc._id} svc={svc} badge={section.badge} />
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