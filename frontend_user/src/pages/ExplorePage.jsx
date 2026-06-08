import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LuHeart, LuStar, LuMapPin, LuCreditCard, LuDoorOpen, LuBedDouble, LuBath, LuWifiOff } from "react-icons/lu";
import API from "../api/axios";
import { CurrencyContext } from "../context/CurrencyContext";
import { AuthContext } from "../context/AuthContext";
import { useOfflineData } from "../context/OfflineDataContext";
import toast from "react-hot-toast";
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
 Hotel:"", Villa:"", Resort:"", Cabana:"",
 Boutique:"", Hostel:"", Guesthouse:"", Adventure:"",
};
const catIcon = name => CATEGORY_ICONS[name] || "";

export default function ExplorePage() {
 // ── Offline-aware data from context ──────────────────────────────────────
 const { packages, savedItems, isOffline } = useOfflineData();

 const [categories, setCategories] = useState([]);
 const [locations, setLocations] = useState([]);
 const navigate = useNavigate();

 const { formatPrice, loadingRates } = useContext(CurrencyContext);
 const { user } = useContext(AuthContext);

 const [selectedCategory, setSelectedCategory] = useState("");
 const [selectedLocation, setSelectedLocation] = useState("");
 const [maxPrice, setMaxPrice] = useState(200000);
 const [savedPackageIds, setSavedPackageIds] = useState(new Set());

 // Fetch auxiliary data (categories + locations) — small payloads, still useful offline via SW cache
 useEffect(() => {
 const fetchAuxData = async () => {
 try {
 const [catRes, locRes] = await Promise.all([
 API.get("/packages/categories"),
 API.get("/locations"),
 ]);
 setCategories(catRes.data);
 setLocations(locRes.data);
 } catch (err) {
 console.warn("[ExplorePage] Aux data unavailable (offline?):", err.message);
 }
 };
 fetchAuxData();
 }, []);

 // Derive savedPackageIds from the shared saved-items cache
 useEffect(() => {
 const ids = new Set(
 savedItems
 .filter(item => item.packageId?._id)
 .map(item => item.packageId._id)
 );
 setSavedPackageIds(ids);
 }, [savedItems]);

 const filtered = packages.filter(pkg => {
 const matchCat = selectedCategory === "" || pkg.category?._id === selectedCategory;
 const matchLoc = selectedLocation === "" || pkg.location === selectedLocation;
 const matchPrix = pkg.price <= maxPrice;
 return matchCat && matchLoc && matchPrix;
 });

 const grouped = groupBy(filtered, pkg => pkg.category?.name);
 const groupKeys = Object.keys(grouped).sort();

 const openPackage = (packageId) => {
 const target = `/viewpackage/${packageId}`;
 const navAction = () => navigate(target, { state: { transition: "card-to-detail" } });

 if (typeof document !== "undefined" && document.startViewTransition) {
 document.startViewTransition(navAction);
 } else {
 navAction();
 }
 };

 /* ── Package card — styled as an exciting tour ── */
 const PackageCard = ({ pkg }) => {
    const isFavorite = savedPackageIds.has(pkg._id);

    const handleFavoriteClick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) {
        toast.error("Please login to save packages!");
        return;
      }
      try {
        const res = await API.post("/saved/save-package", { userId: user._id, packageId: pkg._id });
        const newSaved = new Set(savedPackageIds);
        if (res.data.saved) {
          newSaved.add(pkg._id);
          toast.success(res.data.message);
        } else {
          newSaved.delete(pkg._id);
          toast.success(res.data.message);
        }
        setSavedPackageIds(newSaved);
      } catch(err) {
        toast.error("Failed to update favorite");
      }
    };

 return (
 <div className="matte-card tour-card" onClick={() => openPackage(pkg._id)}>
 <div className="card-img">
 <img
 src={`http://localhost:5000${pkg.image}`}
 alt={pkg.name}
 loading="lazy"
 onError={e => { e.target.src = "https://via.placeholder.com/400x260?text=Tour"; }}
 />
 {pkg.duration && <div className="tour-duration-badge"> {pkg.duration}</div>}
 
 <button 
 className="card-save-btn" 
 title="Favorite" 
 onClick={handleFavoriteClick}
 >
 <LuHeart 
 size={20} 
 color={isFavorite ? "#ef4444" : "#26658C"} 
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
 </div>

 {pkg.creator && (
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 12px', fontSize: '12px', color: '#26658C' }}>
 <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ffedd5', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
 {pkg.creator.username?.charAt(0).toUpperCase() || "P"}
 </div>
 <span>Hosted by <strong>{pkg.creator.username || "Partner"}</strong> in {pkg.location}</span>
 </div>
 )}

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
 
 <button className="view-btn-full" onClick={e => { e.preventDefault(); e.stopPropagation(); openPackage(pkg._id); }}>
 View Tour
 </button>
 </div>
 </div>
 );
 };

 return (
 <div className="explore-container">

    {/* ── Offline indicator banner ── */}
    {isOffline && (
      <div className="offline-banner" role="alert">
        <LuWifiOff size={16} />
        <span>You're offline — showing cached packages. Some data may be outdated.</span>
      </div>
    )}

 {/* ══ SIDEBAR ══ */}
 <aside className="filter-sidebar">
 <h3> Filter Tours</h3>
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
 <div className="no-results-icon"></div>
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
