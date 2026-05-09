import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LuHeart, LuStar, LuMapPin, LuCreditCard, LuDoorOpen, LuBedDouble, LuBath } from "react-icons/lu";
import API from "../api/axios";
import { CurrencyContext, SUPPORTED_CURRENCIES } from "../context/CurrencyContext";
import "./styles/explore.css";

/* ── Group array by key ── */
function groupBy(arr, fn) {
  return arr.reduce((acc, item) => {
    const k = fn(item) || "Other";
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

const CATEGORY_ICONS = {
  Hotel:"🏨", Villa:"🏡", Resort:"🌴", Cabana:"🛖",
  Boutique:"✨", Hostel:"🛏", Guesthouse:"🏠", Adventure:"🧗",
};
const catIcon = name => CATEGORY_ICONS[name] || "🗺️";

/* ══════════════════════════════════════════════════════════
   CURRENCY SELECTOR — sidebar widget (shared pattern)
   Offline-first: shows rate-source badge.
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
    <div
      className="filter-group"
      style={{ borderBottom: "1.5px solid #f1f5f9", paddingBottom: "20px", marginBottom: "20px" }}
    >
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
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: badge.dot, display: "inline-block",
            }} />
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
          /* solid colour fill — no gradient conflict */
          backgroundColor: "#f0f9ff",
          fontFamily: "'Poppins', sans-serif",
          fontSize: "14px",
          fontWeight: 700,
          color: "#0369a1",
          outline: "none",
          cursor: loadingRates ? "wait" : "pointer",
          /* native arrow OFF, custom SVG chevron ON */
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
            {c.symbol} {c.code} — {c.label}
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

export default function ExplorePage() {
  const [packages,   setPackages]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations,  setLocations]  = useState([]);
  const navigate = useNavigate();

  const { selectedCurrency, formatPrice, loadingRates } = useContext(CurrencyContext);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [maxPrice,         setMaxPrice]         = useState(200000);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgRes, catRes, locRes] = await Promise.all([
          API.get("/packages?listingType=Package"),  // ← ONLY curated packages
          API.get("/packages/categories"),
          API.get("/locations"),
        ]);
        setPackages(Array.isArray(pkgRes.data) ? pkgRes.data : []);
        setCategories(catRes.data);
        setLocations(locRes.data);
      } catch (err) {
        console.error("Data loading error:", err);
      }
    };
    fetchData();
  }, []);

  const filtered = packages.filter(pkg => {
    const matchCat  = selectedCategory === "" || pkg.category?._id === selectedCategory;
    const matchLoc  = selectedLocation  === "" || pkg.location === selectedLocation;
    const matchPrix = pkg.price <= maxPrice;
    return matchCat && matchLoc && matchPrix;
  });

  const grouped   = groupBy(filtered, pkg => pkg.category?.name);
  const groupKeys = Object.keys(grouped).sort();

  /* ── Package card — styled as an exciting tour ── */
  const PackageCard = ({ pkg }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    return (
      <div className="matte-card tour-card" onClick={() => navigate(`/viewpackage/${pkg._id}`)}>
        <div className="card-img">
          <img
            src={`http://localhost:5000${pkg.image}`}
            alt={pkg.name}
            loading="lazy"
            onError={e => { e.target.src = "https://via.placeholder.com/400x260?text=Tour"; }}
          />
          {pkg.duration && <div className="tour-duration-badge">🕐 {pkg.duration}</div>}
          
          <button 
            className="card-save-btn" 
            title="Favorite" 
            onClick={e => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              setIsFavorite(!isFavorite); 
            }}
          >
            <LuHeart 
              size={20} 
              color={isFavorite ? "#ef4444" : "#475569"} 
              fill={isFavorite ? "#ef4444" : "none"} 
              style={{ transition: "all 0.2s ease" }}
            />
          </button>
        </div>

        <div className="card-info">
          {/* 1. Title & Rating */}
          <div className="card-title-area">
            <h4>{pkg.name}</h4>
            <div className="card-stars">
              <LuStar fill="#d97706" color="#d97706" size={14} />
              <LuStar fill="#d97706" color="#d97706" size={14} />
              <LuStar fill="#d97706" color="#d97706" size={14} />
            </div>
          </div>

          {/* 2. Location & Landmark Distances */}
          <div className="card-location-area">
            <p className="loc-primary">
              <LuMapPin size={14} className="loc-icon" />
              <span>{pkg.location} - View on map</span>
            </p>
            <p className="loc-distance">
              781 m from Galle Central Bus Station • 74 m from Galle Lighthouse
            </p>
          </div>

          {/* 3. Badges & Perks */}
          <div className="card-perks-area">
            <span className="perk-badge-clean">Sparkling clean</span>
            <div className="perk-row-credit">
              <LuCreditCard size={15} /> Book without a credit card
            </div>
          </div>

          {/* 4. Highlights Footer */}
          <div className="card-highlights-footer">
            <span className="highlights-label">Highlights</span>
            <div className="highlights-icons">
              <span className="h-icon-group"><LuDoorOpen size={16} /> x 1</span>
              <span className="h-icon-group"><LuBedDouble size={16} /> x 2</span>
              <span className="h-icon-group"><LuBath size={16} /> x 1</span>
            </div>
          </div>

          <div className="card-info-divider" />

          {/* Vertical Stacking Footer (Price & Button) */}
          <div className="price-box-vertical">
            <div className="price-label">From (per person)</div>
            <div className="amt">
              {loadingRates ? <span style={{fontSize:13,color:"#999"}}>…</span> : formatPrice(pkg.price)}
            </div>
          </div>
          
          <button className="view-btn-full" onClick={e => { e.preventDefault(); e.stopPropagation(); navigate(`/viewpackage/${pkg._id}`); }}>
            View Tour
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="explore-container">

      {/* ══ SIDEBAR ══ */}
      <aside className="filter-sidebar">
        <h3> Filter Tours</h3>

        {/* ── Currency Selector (offline-first, live rates) ── */}
        <CurrencySelectorGroup />

        <div className="filter-group">
          <label>Category</label>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Starting Location</label>
          <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)}>
            <option value="">All Locations</option>
            {locations.map(loc => <option key={loc._id} value={loc.name}>{loc.name}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>
            Max Budget
            <span className="price-range-val" style={{ display:"block", fontSize:12, marginTop:4 }}>
              {loadingRates ? "…" : formatPrice(maxPrice)}
            </span>
          </label>
          <input type="range" min="0" max="200000" step="5000"
            value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} />
        </div>

        <div className="filter-btn-group">
          <button className="reset-btn" onClick={() => {
            setSelectedCategory(""); setSelectedLocation(""); setMaxPrice(200000);
          }}>Clear Filters</button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="packages-display">
        <div className="grid-header">
          <h2>Curated Packages and Tours</h2>
          <span className="result-count">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <div className="no-results-title">No packages found</div>
            <p>Try adjusting your filters — adventures await!</p>
          </div>
        ) : (
          groupKeys.map(groupName => (
            <section key={groupName} className="ep-category-section">
              <div className="ep-section-heading">
                <span className="ep-section-icon">{catIcon(groupName)}</span>
                <h3>{groupName} Tours</h3>
                <span className="ep-section-count">{grouped[groupName].length}</span>
              </div>
              <div className="explore-grid">
                {grouped[groupName].map(pkg => <PackageCard key={pkg._id} pkg={pkg} />)}
              </div>
            </section>
          ))
        )}
      </main>

    </div>
  );
}