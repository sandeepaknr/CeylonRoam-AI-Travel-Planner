import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./styles/viewpackage.css";
import "./styles/explore.css";

/* ── Helpers ──────────────────────────────────────────────── */
const fmt = d =>
  d
    ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";

/* Group an array by a key-getter function */
function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item) || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

/* Emoji icon per service category */
const GROUP_META = {
  "Hotel Package":   { icon: "🏨", label: "Hotel Packages"    },
  "Guide":           { icon: "🧭", label: "Tour Guides"        },
  "Chauffeur Guide": { icon: "🚗", label: "Chauffeur Guides"   },
  "Rent Vehicle":    { icon: "🔑", label: "Rent Vehicles"      },
  "Hire Vehicle":    { icon: "🚕", label: "Hire Vehicles"      },
};
const GROUP_ORDER = ["Hotel Package","Guide","Chauffeur Guide","Rent Vehicle","Hire Vehicle"];

const meta = key => GROUP_META[key] || { icon: "📦", label: key };

export default function ProviderProfile() {
  const { userId } = useParams();
  const navigate   = useNavigate();

  const [provider, setProvider] = useState(null);
  const [packages, setPackages] = useState([]);
  const [request,  setRequest]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      try {
        const userRes = await API.get(`/user/${userId}`);
        setProvider(userRes.data);

        try {
          const bizRes = await API.get(`/partner-request/by-user/${userId}`);
          setRequest(bizRes.data);
        } catch { /* no partner request — fine */ }

        const pkgRes = await API.get(`/packages?creator=${userId}`);
        setPackages(Array.isArray(pkgRes.data) ? pkgRes.data : []);
      } catch {
        setError("Provider not found.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  /* ── Loading / Error ── */
  if (loading) return (
    <div className="view-container" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"70vh" }}>
      <div style={{ textAlign:"center", color:"#64748b" }}>
        <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
        <p>Loading provider profile…</p>
      </div>
    </div>
  );

  if (error || !provider) return (
    <div className="view-container" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"70vh" }}>
      <div style={{ textAlign:"center", color:"#ef4444" }}>
        <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
        <p>{error || "Provider not found."}</p>
        <button onClick={() => navigate(-1)} style={{ marginTop:16, padding:"10px 24px", borderRadius:12, border:"none", background:"#1e293b", color:"#fff", cursor:"pointer" }}>
          ← Go Back
        </button>
      </div>
    </div>
  );

  /* ── Group packages by serviceCategory ── */
  const grouped   = groupBy(packages, p => p.serviceCategory || p.category?.name || "Other");
  const groupKeys = GROUP_ORDER.filter(k => grouped[k]?.length > 0);
  // append any unrecognised keys not in GROUP_ORDER
  Object.keys(grouped).forEach(k => { if (!GROUP_ORDER.includes(k)) groupKeys.push(k); });

  const initials = provider.username?.charAt(0).toUpperCase() || "?";
  const bizCat   = request?.category || provider.accountType;

  /* ── Shared mini-card ── */
  const MiniCard = ({ pkg }) => (
    <div className="matte-card" style={{ cursor:"pointer" }}
      onClick={() => navigate(`/viewpackage/${pkg._id}`)}>
      <div className="card-img">
        <img
          src={`http://localhost:5000${pkg.image}`}
          alt={pkg.name}
          loading="lazy"
          onError={e => { e.target.src = "https://via.placeholder.com/400x260?text=No+Image"; }}
        />
        {(pkg.serviceCategory || pkg.category?.name) && (
          <div className="card-category-badge">
            {pkg.serviceCategory || pkg.category?.name}
          </div>
        )}
      </div>
      <div className="card-info">
        <h4>{pkg.name}</h4>
        <p className="loc">📍 {pkg.location}</p>
        <div className="card-info-divider" />
        <div className="price-box">
          <div>
            <div className="price-label">From</div>
            <div className="amt">Rs {pkg.price?.toLocaleString()}</div>
          </div>
          <button className="view-btn"
            onClick={e => { e.stopPropagation(); navigate(`/viewpackage/${pkg._id}`); }}>
            View
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Render ── */
  return (
    <div className="view-container" style={{ padding:"0 0 80px" }}>

      {/* Cover Banner */}
      <div style={{
        height: 60,
        background: "linear-gradient(135deg, #0a3d62 0%, #1a6fa8 45%, #2d6a4f 100%)",
        position: "relative", marginBottom:40,
      }} />

      <div style={{ maxWidth: 1000, margin: "-70px auto 0", padding: "0 20px" }}>

        {/* ── Identity Card ── */}
        <div className="details-card" style={{ display:"flex", alignItems:"flex-end", gap:24, marginBottom:24 }}>
          <div style={{
            width:100, height:100, borderRadius:"50%",
            background:"linear-gradient(135deg,#0a3d62,#1a6fa8)",
            border:"5px solid white",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:38, fontWeight:800, color:"#fff",
            boxShadow:"0 6px 24px rgba(10,61,98,0.3)",
            flexShrink:0, marginBottom:-20,
          }}>
            {initials}
          </div>

          <div style={{ flex:1, paddingBottom:8 }}>
            <h1 style={{ fontSize:"1.9rem", fontWeight:800, color:"#1e293b", margin:"0 0 4px" }}>
              {provider.username}
            </h1>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
              {bizCat && (
                <span style={{ background:"#f0fdf4", color:"#16a34a", padding:"4px 14px", borderRadius:50, fontWeight:700, fontSize:"0.78rem" }}>
                  {bizCat}
                </span>
              )}
              <span style={{ color:"#94a3b8", fontSize:"0.85rem" }}>📍 {provider.country || "Sri Lanka"}</span>
              <span style={{ color:"#94a3b8", fontSize:"0.85rem" }}>🗓 Member since {fmt(provider.createdAt)}</span>
              <span style={{ color:"#94a3b8", fontSize:"0.85rem" }}>📦 {packages.length} listing{packages.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          <button onClick={() => navigate(-1)}
            style={{ padding:"10px 22px", borderRadius:12, border:"1.5px solid #e2e8f0",
              background:"#f8fafc", cursor:"pointer", fontWeight:600, color:"#475569",
              fontSize:"0.88rem", flexShrink:0, alignSelf:"flex-start" }}>
            ← Back
          </button>
        </div>

        {/* ── Business Details ── */}
        {request && (
          <div className="business-info-card" style={{ marginBottom:24 }}>
            <div className="biz-header">
              <h3>Business Profile</h3>
              <span className="biz-badge">{request.category}</span>
            </div>

            {request.hotelDetails && (
              <div style={{ color:"#475569", lineHeight:1.7 }}>
                <p><strong>{request.hotelDetails.hotelName}</strong> · {request.hotelDetails.propertyType}</p>
                <p>📍 {request.hotelDetails.address}, {request.hotelDetails.city}</p>
                <p>📞 {request.hotelDetails.phone}</p>
                <p className="description-text">{request.hotelDetails.description}</p>
              </div>
            )}
            {request.guideDetails && (() => {
              const gd            = request.guideDetails;
              const isChauffeur   = gd.guideType === "Chauffeur Guide";
              const photos        = gd.vehiclePhotos || [];
              const GUIDE_TYPE_ICON = {
                "National Guide":           "🧭",
                "Chauffeur Guide":          "🚗",
                "Adventure/Trekking Guide": "🧗",
              };
              const gtIcon = GUIDE_TYPE_ICON[gd.guideType] || "🧭";

              return (
                <div style={{ color:"#475569" }}>

                  {/* ── Guide type badge ── */}
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                    <span style={{
                      background: isChauffeur ? "#fef3c7" : "#e0f2fe",
                      color:      isChauffeur ? "#92400e" : "#0369a1",
                      padding:"5px 14px", borderRadius:9999, fontWeight:700, fontSize:"0.8rem"
                    }}>
                      {gtIcon} {gd.guideType}
                    </span>
                    {gd.experience && (
                      <span style={{ fontSize:"0.82rem", color:"#64748b" }}>
                        🏅 {gd.experience} yr{gd.experience !== 1 ? "s" : ""} experience
                      </span>
                    )}
                  </div>

                  {/* ── Info grid ── */}
                  <div style={{
                    display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 24px",
                    background:"#f8fafc", borderRadius:12, padding:"16px 20px", marginBottom:16
                  }}>
                    <div><span style={{ fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase",
                      letterSpacing:"0.8px", color:"#94a3b8" }}>Full Name</span>
                      <p style={{ margin:"3px 0 0", fontWeight:600, color:"#0f172a" }}>{gd.fullName || "—"}</p></div>

                    <div><span style={{ fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase",
                      letterSpacing:"0.8px", color:"#94a3b8" }}>Base City</span>
                      <p style={{ margin:"3px 0 0", fontWeight:600, color:"#0f172a" }}>📍 {gd.baseCity || "—"}</p></div>

                    <div><span style={{ fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase",
                      letterSpacing:"0.8px", color:"#94a3b8" }}>Languages</span>
                      <p style={{ margin:"3px 0 0", fontWeight:600, color:"#0f172a" }}>🗣 {gd.languages || "—"}</p></div>

                    <div><span style={{ fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase",
                      letterSpacing:"0.8px", color:"#94a3b8" }}>Operating Regions</span>
                      <p style={{ margin:"3px 0 0", fontWeight:600, color:"#0f172a" }}>🗺 {gd.operatingRegions || "All Sri Lanka"}</p></div>
                  </div>

                  {/* ── Bio ── */}
                  {gd.bio && (
                    <div style={{ background:"#f8fafc", borderLeft:"4px solid #38bdf8",
                      borderRadius:"0 10px 10px 0", padding:"12px 16px", marginBottom:16 }}>
                      <p style={{ margin:0, lineHeight:1.7, fontSize:"0.9rem", color:"#334155" }}>{gd.bio}</p>
                    </div>
                  )}

                  {/* ── Chauffeur-only: Vehicle Details ── */}
                  {isChauffeur && (
                    <>
                      <div style={{ fontWeight:700, color:"#0f172a", fontSize:"0.95rem",
                        marginBottom:12, paddingTop:4, borderTop:"1px solid #e2e8f0", paddingTop:14 }}>
                        🚗 Vehicle Details
                      </div>

                      <div style={{
                        display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px 16px",
                        background:"#f8fafc", borderRadius:12, padding:"16px 20px", marginBottom:16
                      }}>
                        {[{label:"Vehicle Type", val:gd.vehicleType},
                          {label:"Model",        val:gd.vehicleModel},
                          {label:"Year",         val:gd.vehicleYear},
                          {label:"Air-Con",      val:gd.vehicleAC},
                        ].map(row => (
                          <div key={row.label}>
                            <span style={{ fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase",
                              letterSpacing:"0.8px", color:"#94a3b8" }}>{row.label}</span>
                            <p style={{ margin:"3px 0 0", fontWeight:600, color:"#0f172a",
                              fontSize:"0.88rem" }}>{row.val || "—"}</p>
                          </div>
                        ))}
                      </div>

                      {/* ── Vehicle Photo Gallery ── */}
                      {photos.length > 0 && (
                        <>
                          <div style={{ fontWeight:700, color:"#0f172a", fontSize:"0.88rem",
                            marginBottom:10 }}>📷 Vehicle Photos</div>
                          <div style={{
                            display:"grid",
                            gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))",
                            gap:10, marginBottom:4
                          }}>
                            {photos.map((src, i) => (
                              <a key={i} href={`http://localhost:5000${src}`}
                                target="_blank" rel="noreferrer"
                                style={{ display:"block", borderRadius:10, overflow:"hidden",
                                  boxShadow:"0 2px 8px rgba(0,0,0,0.10)",
                                  border:"2px solid #e2e8f0", lineHeight:0 }}>
                                <img
                                  src={`http://localhost:5000${src}`}
                                  alt={`Vehicle photo ${i+1}`}
                                  style={{ width:"100%", height:90, objectFit:"cover",
                                    transition:"transform 0.25s", display:"block" }}
                                  onMouseOver={e => e.target.style.transform="scale(1.06)"}
                                  onMouseOut={e  => e.target.style.transform="scale(1)"}
                                  onError={e => { e.target.style.display="none"; }}
                                />
                              </a>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })()}
            {request.transportDetails && (
              <div style={{ color:"#475569", lineHeight:1.7 }}>
                <p><strong>{request.transportDetails.driverName}</strong> · {request.transportDetails.vehicleType}</p>
                <p>📍 Base: {request.transportDetails.baseCity}</p>
                <p>🚗 {request.transportDetails.vehicleMake} {request.transportDetails.vehicleModel} ({request.transportDetails.yearOfManufacture})</p>
              </div>
            )}
          </div>
        )}

        {/* ── Published Listings — grouped by category ── */}
        <div className="details-card">
          <h3 style={{ marginBottom: 8, color:"#1e293b" }}>
            Published Listings
            <span style={{ marginLeft:10, fontSize:"0.85rem", fontWeight:500, color:"#94a3b8" }}>
              ({packages.length} total)
            </span>
          </h3>

          {packages.length === 0 ? (
            <p style={{ color:"#94a3b8", textAlign:"center", padding:"30px 0" }}>
              No listings published yet.
            </p>
          ) : (
            groupKeys.map(key => {
              const { icon, label } = meta(key);
              return (
                <section key={key} className="ep-category-section">
                  <div className="ep-section-heading">
                    <span className="ep-section-icon">{icon}</span>
                    <h3>{label}</h3>
                    <span className="ep-section-count">{grouped[key].length}</span>
                  </div>
                  <div className="explore-grid"
                    style={{ gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))" }}>
                    {grouped[key].map(pkg => (
                      <MiniCard key={pkg._id} pkg={pkg} />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
