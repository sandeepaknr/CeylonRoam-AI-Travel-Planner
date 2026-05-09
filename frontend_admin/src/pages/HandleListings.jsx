import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import "./styles/HandleListings.css";

const API = "http://localhost:5000/api";

/* ── Badge colours per serviceCategory ── */
const BADGE = {
  "Hotel Package":   { bg:"#e0f2fe", color:"#0369a1" },
  "Guide":           { bg:"#d1fae5", color:"#065f46" },
  "Chauffeur Guide": { bg:"#fef3c7", color:"#92400e" },
  "Rent Vehicle":    { bg:"#ede9fe", color:"#5b21b6" },
  "Hire Vehicle":    { bg:"#fce7f3", color:"#9d174d" },
};

const fmt = n => n ? `Rs ${Number(n).toLocaleString()}` : "—";
const imgSrc = path =>
  path ? `http://localhost:5000${path}` : "https://via.placeholder.com/64x48?text=No+Img";

/* ── Shared Confirm Delete button ── */
function ConfirmDelete({ onConfirm }) {
  const [step, setStep] = useState(0);
  if (step === 0)
    return <button className="hl-btn hl-del" onClick={() => setStep(1)}>🗑 Remove</button>;
  return (
    <span className="hl-confirm-del">
      <span>Sure?</span>
      <button className="hl-btn hl-yes" onClick={onConfirm}>Yes</button>
      <button className="hl-btn hl-no"  onClick={() => setStep(0)}>No</button>
    </span>
  );
}

export default function HandleListings() {
  const [activeTab, setActiveTab] = useState("packages");   // "packages" | "services"
  const [packages,  setPackages]  = useState([]);
  const [services,  setServices]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [catFilter, setCatFilter] = useState("");           // for services tab only

  /* ── Fetch both lists simultaneously on mount ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pkgRes, svcRes] = await Promise.all([
        axios.get(`${API}/packages?listingType=Package`),
        axios.get(`${API}/packages?listingType=Service`),
      ]);
      setPackages(Array.isArray(pkgRes.data) ? pkgRes.data : []);
      setServices(Array.isArray(svcRes.data) ? svcRes.data : []);
    } catch (err) {
      console.error("Failed to fetch listings", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Delete a listing ── */
  const handleDelete = async (id, type) => {
    const tid = toast.loading("🗑️ Removing listing…");
    try {
      await axios.delete(`${API}/packages/${id}`);
      if (type === "Package")
        setPackages(p => p.filter(x => x._id !== id));
      else
        setServices(p => p.filter(x => x._id !== id));
      toast.success("✅ Listing removed.", { id: tid });
    } catch {
      toast.error("❌ Delete failed. Please try again.", { id: tid });
    }
  };

  /* ── Toggle featured ── */
  const handleFeatured = async (id, type) => {
    try {
      const res = await axios.patch(`${API}/packages/${id}/featured`);
      const updater = list =>
        list.map(x => x._id === id ? { ...x, isFeatured: res.data.isFeatured } : x);
      if (type === "Package") setPackages(updater);
      else                    setServices(updater);
      toast.success(res.data.isFeatured ? "⭐ Listing featured!" : "🔴 Listing unfeatured.");
    } catch {
      toast.error("❌ Featured toggle failed. Please try again.");
    }
  };

  /* ── Filter helpers ── */
  const q = search.toLowerCase();
  const filteredPkg = packages.filter(p =>
    !q ||
    p.name?.toLowerCase().includes(q) ||
    p.creator?.username?.toLowerCase().includes(q)
  );
  const filteredSvc = services.filter(s => {
    const matchQ   = !q || s.name?.toLowerCase().includes(q) || s.creator?.username?.toLowerCase().includes(q);
    const matchCat = !catFilter || s.serviceCategory === catFilter;
    return matchQ && matchCat;
  });

  /* ── Stats bar ── */
  const featuredPkg = packages.filter(p => p.isFeatured).length;
  const featuredSvc = services.filter(s => s.isFeatured).length;

  return (
    <div className="hl-wrapper">

      {/* ── Page Header ── */}
      <div className="hl-page-header">
        <div>
          <h1 className="hl-title">📋 Manage Listings</h1>
          <p className="hl-subtitle">Review, feature, and remove user-submitted packages & services</p>
        </div>
        <button className="hl-refresh-btn" onClick={fetchAll} disabled={loading}>
          {loading ? "⏳ Loading…" : "🔄 Refresh"}
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="hl-stats-row">
        <div className="hl-stat">
          <span className="hl-stat-n">{packages.length}</span>
          <span className="hl-stat-l">Total Packages</span>
        </div>
        <div className="hl-stat">
          <span className="hl-stat-n hl-gold">{featuredPkg}</span>
          <span className="hl-stat-l">Featured Packages</span>
        </div>
        <div className="hl-stat">
          <span className="hl-stat-n">{services.length}</span>
          <span className="hl-stat-l">Total Services</span>
        </div>
        <div className="hl-stat">
          <span className="hl-stat-n hl-gold">{featuredSvc}</span>
          <span className="hl-stat-l">Featured Services</span>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="hl-tab-bar">
        <button
          className={`hl-tab ${activeTab === "packages" ? "hl-tab-active" : ""}`}
          onClick={() => { setActiveTab("packages"); setSearch(""); setCatFilter(""); }}
        >
          🗺️ Manage Packages
          <span className="hl-tab-count">{packages.length}</span>
        </button>
        <button
          className={`hl-tab ${activeTab === "services" ? "hl-tab-active" : ""}`}
          onClick={() => { setActiveTab("services"); setSearch(""); setCatFilter(""); }}
        >
          ⚙️ Manage Services
          <span className="hl-tab-count">{services.length}</span>
        </button>
      </div>

      {/* ── Toolbar: search + optional category filter ── */}
      <div className="hl-toolbar">
        <input
          className="hl-search"
          placeholder="🔍  Search by title or provider…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {activeTab === "services" && (
          <select className="hl-cat-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">All Service Types</option>
            <option value="Hotel Package">🏨 Hotel / Accommodation</option>
            <option value="Guide">🧭 Tour Guide</option>
            <option value="Chauffeur Guide">🚗 Chauffeur Guide</option>
            <option value="Rent Vehicle">🔑 Rent Vehicle</option>
            <option value="Hire Vehicle">🚕 Hire Vehicle</option>
          </select>
        )}
        <span className="hl-result-count">
          {activeTab === "packages"
            ? `${filteredPkg.length} result${filteredPkg.length !== 1 ? "s" : ""}`
            : `${filteredSvc.length} result${filteredSvc.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* ── Table Panel ── */}
      {loading ? (
        <div className="hl-loading"><div className="loader" /><p>Loading listings…</p></div>
      ) : (
        <div className="hl-table-card">

          {/* ════ PACKAGES TAB ════ */}
          {activeTab === "packages" && (
            <table className="hl-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Tour / Package Title</th>
                  <th>Duration</th>
                  <th>Provider</th>
                  <th>Price</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPkg.length === 0 ? (
                  <tr><td colSpan={7} className="hl-empty">No packages found.</td></tr>
                ) : filteredPkg.map(pkg => (
                  <tr key={pkg._id} className={pkg.isFeatured ? "hl-row hl-row-featured" : "hl-row"}>
                    <td>
                      <img className="hl-thumb" src={imgSrc(pkg.image)} alt={pkg.name}
                        onError={e => { e.target.src = "https://via.placeholder.com/64x48?text=No+Img"; }} />
                    </td>
                    <td>
                      <div className="hl-title-cell">
                        <strong>{pkg.name}</strong>
                        {pkg.inclusions?.length > 0 && (
                          <span className="hl-inc-hint">✔ {pkg.inclusions.slice(0,2).join(" · ")}{pkg.inclusions.length > 2 ? " …" : ""}</span>
                        )}
                      </div>
                    </td>
                    <td className="hl-muted">{pkg.duration || "—"}</td>
                    <td>{pkg.creator?.username || <em className="hl-muted">Unknown</em>}</td>
                    <td className="hl-price">{fmt(pkg.price)}</td>
                    <td>
                      <button
                        className={`hl-btn hl-feat ${pkg.isFeatured ? "hl-feat-on" : ""}`}
                        onClick={() => handleFeatured(pkg._id, "Package")}
                        title={pkg.isFeatured ? "Remove from featured" : "Mark as featured"}
                      >
                        {pkg.isFeatured ? "⭐ Featured" : "☆ Feature"}
                      </button>
                    </td>
                    <td>
                      <ConfirmDelete onConfirm={() => handleDelete(pkg._id, "Package")} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ════ SERVICES TAB ════ */}
          {activeTab === "services" && (
            <table className="hl-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Service Title</th>
                  <th>Type</th>
                  <th>Provider</th>
                  <th>Price</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSvc.length === 0 ? (
                  <tr><td colSpan={7} className="hl-empty">No services found.</td></tr>
                ) : filteredSvc.map(svc => {
                  const badge = BADGE[svc.serviceCategory] || { bg:"#f1f5f9", color:"#475569" };
                  return (
                    <tr key={svc._id} className={svc.isFeatured ? "hl-row hl-row-featured" : "hl-row"}>
                      <td>
                        <img className="hl-thumb" src={imgSrc(svc.image)} alt={svc.name}
                          onError={e => { e.target.src = "https://via.placeholder.com/64x48?text=No+Img"; }} />
                      </td>
                      <td>
                        <div className="hl-title-cell">
                          <strong>{svc.name}</strong>
                          <span className="hl-muted">📍 {svc.location}</span>
                        </div>
                      </td>
                      <td>
                        <span className="hl-cat-badge"
                          style={{ background: badge.bg, color: badge.color }}>
                          {svc.serviceCategory}
                        </span>
                      </td>
                      <td>{svc.creator?.username || <em className="hl-muted">Unknown</em>}</td>
                      <td className="hl-price">
                        {fmt(svc.price)}
                        <span className="hl-per">{svc.pricingType === "Per KM" ? "/km" : "/day"}</span>
                      </td>
                      <td>
                        <button
                          className={`hl-btn hl-feat ${svc.isFeatured ? "hl-feat-on" : ""}`}
                          onClick={() => handleFeatured(svc._id, "Service")}
                          title={svc.isFeatured ? "Remove from featured" : "Mark as featured"}
                        >
                          {svc.isFeatured ? "⭐ Featured" : "☆ Feature"}
                        </button>
                      </td>
                      <td>
                        <ConfirmDelete onConfirm={() => handleDelete(svc._id, "Service")} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

        </div>
      )}
    </div>
  );
}
