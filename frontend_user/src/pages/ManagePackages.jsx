import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import LocationPickerMap from "../components/LocationPickerMap";
import "./styles/addpackage-ext.css";

const SRI_LANKA_DISTRICTS = [
  "Ampara","Anuradhapura","Badulla","Batticaloa","Colombo",
  "Galle","Gampaha","Hambantota","Jaffna","Kalutara",
  "Kandy","Kegalle","Kilinochchi","Kurunegala","Mannar",
  "Matale","Matara","Moneragala","Mullaitivu","Nuwara Eliya",
  "Polonnaruwa","Puttalam","Ratnapura","Trincomalee","Vavuniya",
];

const ALL_SERVICE_CATEGORIES = [
  { value: "Hotel Package",   label: "🏨 Hotel / Accommodation" },
  { value: "Guide",           label: "🧭 Tour Guide" },
  { value: "Chauffeur Guide", label: "🚗 Chauffeur Guide" },
  { value: "Rent Vehicle",    label: "🔑 Rent Vehicle" },
  { value: "Hire Vehicle",    label: "🚐 Hire Vehicle" },
];

export default function ManagePackages() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [packages,   setPackages]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const [isEditing,   setIsEditing]   = useState(false);
  const [editImages,  setEditImages]   = useState([]);
  const [editForm,    setEditForm]     = useState({});
  const [editPinLat,  setEditPinLat]   = useState(null);
  const [editPinLng,  setEditPinLng]   = useState(null);

  /* ── fetch listings + categories ── */
  const fetchMyPackages = async () => {
    if (!user?._id) return;
    try {
      const res = await API.get("/packages", { params: { creator: user._id } });
      setPackages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading packages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchMyPackages();
    API.get("/packages/categories").then(r => setCategories(r.data)).catch(() => {});
  }, [user]);

  /* ── open edit modal — pre-fill ALL fields from the package ── */
  const handleEditClick = (pkg) => {
    setEditForm({
      id:              pkg._id,
      listingType:     pkg.listingType || "Service",
      name:            pkg.name || "",
      description:     pkg.description || "",
      price:           pkg.price || "",
      location:        pkg.location || "",
      // Package-only
      category:        pkg.category?._id || pkg.category || "",
      itinerary:       pkg.itinerary || "",
      inclusions:      Array.isArray(pkg.inclusions) ? pkg.inclusions.join(", ") : (pkg.inclusions || ""),
      duration:        pkg.duration || "",
      // Service-only
      serviceCategory: pkg.serviceCategory || "",
      languages:       Array.isArray(pkg.languages) ? pkg.languages.join(", ") : (pkg.languages || ""),
      specialization:  pkg.specialization || "",
      pricingType:     pkg.pricingType || "",
      includedKM:      pkg.includedKM ?? "",
      extraKMCharge:   pkg.extraKMCharge ?? "",
    });
    setEditImages([]);
    // Pre-fill existing pin coordinates if the package already has them
    setEditPinLat(pkg.latitude  ?? null);
    setEditPinLng(pkg.longitude ?? null);
    setIsEditing(true);
  };

  const setF = (key, val) => setEditForm(p => ({ ...p, [key]: val }));

  /* ── save changes ── */
  const handleUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name",        editForm.name);
    fd.append("description", editForm.description);
    fd.append("price",       editForm.price);
    fd.append("location",    editForm.location);
    // Always send lat/lng — send empty string to clear if pin was removed
    if (editPinLat !== null) fd.append("latitude",  editPinLat);
    if (editPinLng !== null) fd.append("longitude", editPinLng);

    if (editForm.listingType === "Package") {
      fd.append("category",   editForm.category);
      fd.append("itinerary",  editForm.itinerary);
      fd.append("inclusions", editForm.inclusions);
      fd.append("duration",   editForm.duration);
    } else {
      fd.append("serviceCategory", editForm.serviceCategory);
      const sc = editForm.serviceCategory;
      if (sc === "Guide" || sc === "Chauffeur Guide") {
        fd.append("languages",     editForm.languages);
        fd.append("specialization",editForm.specialization);
        fd.append("pricingType",   "Per Day");
      }
      if (sc === "Rent Vehicle") {
        fd.append("pricingType",   "Per Day");
        fd.append("includedKM",    editForm.includedKM);
        fd.append("extraKMCharge", editForm.extraKMCharge);
      }
      if (sc === "Hire Vehicle") {
        fd.append("pricingType", "Per KM");
      }
    }

    if (editImages.length > 0) {
      editImages.forEach(img => fd.append("images", img));
    }

    const toastId = toast.loading("✏️ Updating listing…");
    try {
      await API.put(`/packages/${editForm.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("✅ Listing updated!", { id: toastId });
      setIsEditing(false);
      fetchMyPackages();
    } catch {
      toast.error("❌ Update failed. Please try again.", { id: toastId });
    }
  };

  /* ── delete ── */
  const handleDelete = (id) => {
    toast((t) => (
      <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
        Delete this listing?
        <button onClick={async () => {
          toast.dismiss(t.id);
          const tid = toast.loading("Deleting…");
          try {
            await API.delete(`/packages/${id}`);
            toast.success("🗑️ Listing deleted.", { id: tid });
            fetchMyPackages();
          } catch { toast.error("❌ Delete failed.", { id: tid }); }
        }} style={{ background:"#ef4444",color:"#fff",border:"none",borderRadius:8,padding:"4px 12px",cursor:"pointer",fontSize:13 }}>Delete</button>
        <button onClick={() => toast.dismiss(t.id)}
          style={{ background:"rgba(15,23,42,0.1)",color:"#011C40",border:"none",borderRadius:8,padding:"4px 12px",cursor:"pointer",fontSize:13 }}>Cancel</button>
      </span>
    ), { duration: 6000 });
  };

  /* ── helpers ── */
  const isGuide = ["Guide","Chauffeur Guide"].includes(editForm.serviceCategory);
  const isRent  = editForm.serviceCategory === "Rent Vehicle";
  const isHire  = editForm.serviceCategory === "Hire Vehicle";

  if (loading) return (
    <div className="ap-page">
      <div className="ap-card" style={{ textAlign:"center", maxWidth:500 }}>
        <div style={{ fontSize:32, marginBottom:16 }}>⏳</div>
        <p className="ap-page-sub" style={{ margin:0 }}>Loading your listings…</p>
      </div>
    </div>
  );

  return (
    <div className="ap-page" style={{ alignItems:"stretch", padding:"60px 24px" }}>
      <div className="ap-card" style={{ maxWidth:1100, margin:"0 auto" }}>

        <div className="ap-page-header">
          <button type="button" className="ap-back-btn" onClick={() => navigate("/businesstools")}>
            ← Back to Dashboard
          </button>
          <div className="ap-eyebrow">🏢 Partner Portal</div>
          <h1 className="ap-page-title">Manage Listings</h1>
          <p className="ap-page-sub">Update details, pricing, and information for your active services and packages.</p>
        </div>

        <div className="ap-table-wrapper">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Name</th>
                <th>Location</th>
                <th>Price</th>
                <th style={{ textAlign:"right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.length > 0 ? packages.map(pkg => (
                <tr key={pkg._id}>
                  <td style={{ width:80 }}>
                    <img src={`http://localhost:5000${pkg.image}`} alt="pkg"
                      style={{ width:"64px", height:"44px", borderRadius:"8px", objectFit:"cover", display:"block" }} />
                  </td>
                  <td>
                    <div style={{ fontWeight:600, color:"var(--ink)", marginBottom:4 }}>{pkg.name}</div>
                    {pkg.listingType && (
                      <span style={{
                        fontSize:"11px", padding:"4px 8px", borderRadius:"6px",
                        backgroundColor: pkg.listingType === "Package" ? "var(--primary-l)" : "var(--amber-l)",
                        color: pkg.listingType === "Package" ? "var(--primary-d)" : "#92400e",
                        fontWeight:700
                      }}>{pkg.listingType.toUpperCase()}</span>
                    )}
                    {pkg.serviceCategory && (
                      <span style={{ marginLeft:6, fontSize:"11px", color:"var(--ink-40)" }}>· {pkg.serviceCategory}</span>
                    )}
                  </td>
                  <td style={{ color:"var(--ink-60)" }}>{pkg.location}</td>
                  <td style={{ fontWeight:700, color:"var(--primary)" }}>Rs. {pkg.price?.toLocaleString()}</td>
                  <td style={{ textAlign:"right" }}>
                    <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                      <button className="ap-table-btn" onClick={() => handleEditClick(pkg)}>Edit</button>
                      <button className="ap-table-btn danger" onClick={() => handleDelete(pkg._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign:"center", padding:"40px", color:"var(--ink-40)" }}>
                    No listings posted yet. Head over to "Post a Service" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════ EDIT MODAL ════════════════ */}
      {isEditing && (
        <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setIsEditing(false); }}>
        <div className="ap-modal-content">
          <button type="button" className="ap-modal-close" onClick={() => setIsEditing(false)} aria-label="Close">✕</button>

            <h3 className="ap-page-title" style={{ fontSize:22, marginBottom:4 }}>
              Edit {editForm.listingType === "Package" ? "Tour Package" : "Service"}
            </h3>
            <p className="ap-page-sub" style={{ marginBottom:24, marginTop:0 }}>
              Type: <strong>{editForm.listingType === "Package" ? "Package" : editForm.serviceCategory || "Service"}</strong>
            </p>

            <form onSubmit={handleUpdate} className="ap-form">

              {/* ── COMMON FIELDS ── */}
              <div className="ap-section-divider">Basic Information</div>

              <div className="ap-field-group">
                <label className="ap-label">
                  {editForm.listingType === "Package" ? "Tour / Package Title *" : "Listing Name *"}
                </label>
                <input className="ap-input" value={editForm.name} required
                  onChange={e => setF("name", e.target.value)} />
              </div>

              <div className="ap-field-group">
                <label className="ap-label">Description *</label>
                <textarea className="ap-input" value={editForm.description} rows={4} required
                  onChange={e => setF("description", e.target.value)} />
              </div>

              <div className="ap-section-divider">Pricing & Location</div>

              <div className="ap-two-col">
                <div className="ap-field-group">
                  <label className="ap-label">Price (LKR) *</label>
                  <input className="ap-input" type="number" value={editForm.price} required
                    onChange={e => setF("price", e.target.value)} />
                </div>
                <div className="ap-field-group">
                  <label className="ap-label">Location / District *</label>
                  <select className="ap-input" value={editForm.location} required
                    onChange={e => setF("location", e.target.value)}>
                    <option value="">Select District</option>
                    {SRI_LANKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* ── Map Pin Picker ── */}
              <div className="ap-field-group">
                <label className="ap-label">📍 Pin Exact Location on Map <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
                <p className="ap-hint" style={{ marginBottom: 8 }}>Click anywhere on the map to update the pin — powers the map shown to travellers on your listing page.</p>
                <LocationPickerMap
                  lat={editPinLat}
                  lng={editPinLng}
                  onChange={(lat, lng) => { setEditPinLat(lat); setEditPinLng(lng); }}
                  height="280px"
                />
                {editPinLat && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                    <p className="ap-hint" style={{ margin: 0, color: "#54ACBF" }}>
                      ✅ Pin at {editPinLat.toFixed(5)}, {editPinLng.toFixed(5)}
                    </p>
                    <button type="button"
                      onClick={() => { setEditPinLat(null); setEditPinLng(null); }}
                      style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      ✕ Remove pin
                    </button>
                  </div>
                )}
              </div>

              {/* ══ PACKAGE-ONLY FIELDS ══════════════════════ */}
              {editForm.listingType === "Package" && (<>
                <div className="ap-section-divider">Package Details</div>

                <div className="ap-two-col">
                  <div className="ap-field-group">
                    <label className="ap-label">Duration</label>
                    <input className="ap-input" value={editForm.duration}
                      placeholder='e.g. "3 Days / 2 Nights"'
                      onChange={e => setF("duration", e.target.value)} />
                  </div>
                  <div className="ap-field-group">
                    <label className="ap-label">Category *</label>
                    <select className="ap-input" value={editForm.category} required
                      onChange={e => setF("category", e.target.value)}>
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="ap-field-group">
                  <label className="ap-label">Day-by-Day Itinerary</label>
                  <textarea className="ap-input" value={editForm.itinerary} rows={6}
                    placeholder={"Day 1: Arrive Colombo…\nDay 2: Kandy…"}
                    onChange={e => setF("itinerary", e.target.value)} />
                </div>

                <div className="ap-field-group">
                  <label className="ap-label">What's Included</label>
                  <input className="ap-input" value={editForm.inclusions}
                    placeholder="e.g. Entry fees, Lunch, Guide, Hotel (2 nights)"
                    onChange={e => setF("inclusions", e.target.value)} />
                  <p className="ap-hint">Comma-separated list</p>
                  {editForm.inclusions && (
                    <div className="ap-inclusions-preview" style={{ marginTop:8 }}>
                      {editForm.inclusions.split(",").map(s => s.trim()).filter(Boolean).map((inc, i) => (
                        <span key={i} className="ap-inclusion-pill">✓ {inc}</span>
                      ))}
                    </div>
                  )}
                </div>
              </>)}

              {/* ══ SERVICE-ONLY FIELDS ══════════════════════ */}
              {editForm.listingType === "Service" && (<>
                <div className="ap-section-divider">Service Details</div>

                <div className="ap-field-group">
                  <label className="ap-label">Service Type *</label>
                  <select className="ap-input" value={editForm.serviceCategory} required
                    onChange={e => setF("serviceCategory", e.target.value)}>
                    <option value="">Select Service Type</option>
                    {ALL_SERVICE_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Guide fields */}
                {isGuide && (<>
                  <div className="ap-two-col">
                    <div className="ap-field-group">
                      <label className="ap-label">Languages Spoken</label>
                      <input className="ap-input" value={editForm.languages}
                        placeholder="e.g. English, German"
                        onChange={e => setF("languages", e.target.value)} />
                      <p className="ap-hint">Comma-separated</p>
                    </div>
                    <div className="ap-field-group">
                      <label className="ap-label">Specialization</label>
                      <input className="ap-input" value={editForm.specialization}
                        placeholder="e.g. Wildlife & Nature"
                        onChange={e => setF("specialization", e.target.value)} />
                    </div>
                  </div>
                </>)}

                {/* Rent Vehicle fields */}
                {isRent && (<>
                  <div className="ap-two-col">
                    <div className="ap-field-group">
                      <label className="ap-label">Included KM per Day</label>
                      <input className="ap-input" type="number" value={editForm.includedKM}
                        placeholder="e.g. 150"
                        onChange={e => setF("includedKM", e.target.value)} />
                    </div>
                    <div className="ap-field-group">
                      <label className="ap-label">Extra KM Charge (LKR)</label>
                      <input className="ap-input" type="number" value={editForm.extraKMCharge}
                        placeholder="e.g. 80"
                        onChange={e => setF("extraKMCharge", e.target.value)} />
                    </div>
                  </div>
                </>)}

                {isHire && (
                  <p className="ap-hint" style={{ marginTop:0 }}>
                    💡 Hire Vehicle pricing is per KM — set the rate in the Price field above.
                  </p>
                )}
              </>)}

              {/* ── IMAGES ── */}
              <div className="ap-section-divider">Update Images (Optional)</div>

              <div className="ap-field-group">
                <input type="file" accept="image/*" multiple className="ap-input"
                  style={{ padding:10 }}
                  onChange={e => setEditImages(Array.from(e.target.files))} />
                <p className="ap-hint">Selecting new images will replace existing ones (up to 5)</p>
                {editImages.length > 0 && (
                  <div style={{ display:"flex", gap:8, marginTop:8 }}>
                    {editImages.map((img, i) => (
                      <div key={i} style={{ width:50, height:50, borderRadius:8, overflow:"hidden", border:"1px solid #ddd" }}>
                        <img src={URL.createObjectURL(img)} alt="preview"
                          style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── ACTIONS ── */}
              <div style={{ display:"flex", gap:"12px", marginTop:"20px" }}>
                <button type="button" className="ap-table-btn"
                  style={{ flex:1, padding:14, fontSize:14 }}
                  onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="ap-submit-btn"
                  style={{ flex:2, marginTop:0 }}>💾 Save Changes</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}