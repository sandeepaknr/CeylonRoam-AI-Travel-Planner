import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import LocationPickerMap from "../components/LocationPickerMap";
import "./styles/addpackage-ext.css"; // The unified premium styling

/* ── Business category → allowed service sub-categories ───── */
const BIZ_CATEGORY_MAP = {
 Hotel: ["Hotel Package"],
 Guide: ["Guide", "Chauffeur Guide"],
 Transport: ["Rent Vehicle", "Hire Vehicle"],
};

const ALL_SERVICE_CATEGORIES = [
 { value: "Hotel Package", label: " Hotel / Accommodation" },
 { value: "Guide", label: " Tour Guide" },
 { value: "Chauffeur Guide", label: " Chauffeur Guide" },
 { value: "Rent Vehicle", label: " Rent Vehicle" },
 { value: "Hire Vehicle", label: " Hire Vehicle" },
];

const SRI_LANKA_DISTRICTS = [
 "Ampara","Anuradhapura","Badulla","Batticaloa","Colombo",
 "Galle","Gampaha","Hambantota","Jaffna","Kalutara",
 "Kandy","Kegalle","Kilinochchi","Kurunegala","Mannar",
 "Matale","Matara","Moneragala","Mullaitivu","Nuwara Eliya",
 "Polonnaruwa","Puttalam","Ratnapura","Trincomalee","Vavuniya",
];

export default function AddService() {
 const { user } = useContext(AuthContext);
 const navigate = useNavigate();
 const [images, setImages] = useState([]);
 const [submitting, setSubmitting] = useState(false);
 const [bizCategory, setBizCategory] = useState(null);
 const [guideType, setGuideType] = useState(null); // raw registered guideType
 const [allowedCats, setAllowedCats] = useState([]);
 const [bizLoading, setBizLoading] = useState(true);

 const [form, setForm] = useState({
 name:"", description:"", price:"", location:"",
 serviceCategory:"",
 // Guide fields
 languages:"", specialization:"",
 // Vehicle fields
 pricingType:"", includedKM:"", extraKMCharge:"",
 });
 const [pinLat, setPinLat] = useState(null);
 const [pinLng, setPinLng] = useState(null);

 const handleMapPick = (lat, lng) => {
 setPinLat(lat);
 setPinLng(lng);
 };

 /* Resolve business category + guide type */
 useEffect(() => {
 if (!user?._id) { setBizLoading(false); return; }
 API.get(`/partner-request/by-user/${user._id}`)
 .then(r => {
 const cat = r.data?.category || null;
 const rawGuideType = r.data?.guideDetails?.guideType || null;
 setBizCategory(cat);
 setGuideType(rawGuideType);

 if (cat === "Guide" && rawGuideType) {
 // Map registered guideType → serviceCategory, bypassing selection entirely
 const mappedSC = rawGuideType === "Chauffeur Guide" ? "Chauffeur Guide" : "Guide";
 setAllowedCats([]); // no selector needed
 setForm(p => ({ ...p, serviceCategory: mappedSC }));
 } else {
 const allowed = cat
 ? ALL_SERVICE_CATEGORIES.filter(sc =>
 (BIZ_CATEGORY_MAP[cat] || []).includes(sc.value)
 )
 : ALL_SERVICE_CATEGORIES;
 setAllowedCats(allowed);
 if (allowed.length === 1)
 setForm(p => ({ ...p, serviceCategory: allowed[0].value }));
 }
 })
 .catch(() => setAllowedCats(ALL_SERVICE_CATEGORIES))
 .finally(() => setBizLoading(false));
 }, [user]);

 const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

 const handleImageUpload = (e) => {
 const files = Array.from(e.target.files);
 if (images.length + files.length > 5) {
 toast.error("You can only upload up to 5 images.");
 return;
 }
 setImages(prev => [...prev, ...files]);
 };

 const removeImage = (index) => {
 setImages(prev => prev.filter((_, i) => i !== index));
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!form.serviceCategory) { toast.error(" Please select a service type first."); return; }
 setSubmitting(true);

 const fd = new FormData();
 fd.append("name", form.name);
 fd.append("description", form.description);
 fd.append("price", form.price);
 fd.append("location", form.location);
 fd.append("creator", user?._id);
 fd.append("listingType", "Service");
 fd.append("serviceCategory", form.serviceCategory);
 if (pinLat !== null) fd.append("latitude", pinLat);
 if (pinLng !== null) fd.append("longitude", pinLng);

 const sc = form.serviceCategory;
 if (sc === "Guide" || sc === "Chauffeur Guide") {
 fd.append("languages", form.languages);
 fd.append("specialization", form.specialization);
 fd.append("pricingType", "Per Day");
 }
 if (sc === "Rent Vehicle") {
 fd.append("pricingType", "Per Day");
 fd.append("includedKM", form.includedKM);
 fd.append("extraKMCharge", form.extraKMCharge);
 }
 if (sc === "Hire Vehicle") {
 fd.append("pricingType", "Per KM");
 }
 if (images.length > 0) {
 images.forEach(img => fd.append("images", img));
 }

 const toastId = toast.loading(" Publishing your service…");
 try {
 await API.post("/packages", fd, { headers: { "Content-Type": "multipart/form-data" } });
 toast.success(" Service Published!", { id: toastId });
 setForm({
 name:"", description:"", price:"", location:"",
 serviceCategory: allowedCats.length === 1 ? allowedCats[0].value : "",
 languages:"", specialization:"", pricingType:"", includedKM:"", extraKMCharge:"",
 });
 setImages([]);
 e.target.reset();
 } catch {
 toast.error(" Failed to publish service. Please try again.", { id: toastId });
 } finally {
 setSubmitting(false);
 }
 };

 const sc = form.serviceCategory;
 const isGuide = sc === "Guide" || sc === "Chauffeur Guide";
 const isRent = sc === "Rent Vehicle";
 const isHire = sc === "Hire Vehicle";

 if (bizLoading) return (
 <div className="ap-page">
 <div className="ap-card" style={{ textAlign: "center", maxWidth: 500 }}>
 <div style={{ fontSize:32, marginBottom:16 }}>⏳</div>
 <p className="ap-page-sub" style={{ margin: 0 }}>Loading your business profile…</p>
 </div>
 </div>
 );

 return (
 <div className="ap-page">
 <div className="ap-card">
 
 {/* ── Header ── */}
 <div className="ap-page-header">
 <button type="button" className="ap-back-btn" onClick={() => navigate("/businesstools")}>
 ← Back to Dashboard
 </button>
 <div className="ap-eyebrow"> Partner Portal</div>
 <h1 className="ap-page-title">Post a Service</h1>
 <p className="ap-page-sub">
 Publish a bookable resource that travellers can reserve directly.
 {bizCategory && <> Locked to <strong style={{ color:"var(--primary)" }}>{bizCategory}</strong> account.</>}
 </p>
 </div>

 <form onSubmit={handleSubmit} className="ap-form">

 {/* ── Service type selector — hidden for Guides (auto-resolved from guideType) ── */}
 {bizCategory !== "Guide" && (
 <div className="ap-field-group">
 <label className="ap-label">Service Type *</label>
 {allowedCats.length === 1 ? (
 <div style={{ padding: "12px 16px", background: "var(--surface-b)", border: "1px solid #54ACBF", borderRadius: 12, display: "flex", flexDirection: "column", gap: 4 }}>
 <span style={{ fontSize: 15, fontWeight: 600, color: "var(--primary)" }}>{allowedCats[0].label}</span>
 <span style={{ fontSize: 13, color: "var(--ink-40)" }}>Auto-selected for your account</span>
 </div>
 ) : (
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
 {allowedCats.map(c => (
 <button key={c.value} type="button"
 style={{
 padding: 16,
 background: form.serviceCategory === c.value ? "var(--primary-l)" : "var(--surface)",
 border: `1.5px solid ${form.serviceCategory === c.value ? "var(--primary)" : "var(--border)"}`,
 borderRadius: 14,
 textAlign: "left",
 cursor: "pointer",
 color: form.serviceCategory === c.value ? "var(--primary-d)" : "var(--ink)",
 fontWeight: form.serviceCategory === c.value ? 700 : 500,
 transition: "all 0.2s ease"
 }}
 onClick={() => setForm(p => ({ ...p, serviceCategory: c.value }))}>
 {c.label}
 </button>
 ))}
 </div>
 )}
 </div>
 )}

 {/* ── Guide account: show locked type pill ── */}
 {bizCategory === "Guide" && form.serviceCategory && (
 <div className="ap-field-group">
 <label className="ap-label">Service Type</label>
 <div style={{ padding: "12px 16px", background: "var(--surface-b)", border: "1px solid #54ACBF", borderRadius: 12, display: "flex", flexDirection: "column", gap: 4 }}>
 <span style={{ fontSize: 15, fontWeight: 600, color: "var(--primary)" }}>
 {form.serviceCategory === "Chauffeur Guide" ? " Chauffeur Guide" : " Tour Guide"}
 </span>
 <span style={{ fontSize: 13, color: "var(--ink-40)" }}>
 Locked to your registered guide type: <strong>{guideType}</strong>
 </span>
 </div>
 </div>
 )}

 {sc && (<>
 <div className="ap-section-divider">Basic Information</div>

 <div className="ap-field-group">
 <label className="ap-label">
 {isGuide ? "Guide Name / Profile Title *" : isRent || isHire ? "Vehicle Name *" : "Listing Name *"}
 </label>
 <input className="ap-input" name="name" required
 placeholder={isGuide ? "e.g. Supun — Professional Tour Guide" : "e.g. Toyota Prius Hybrid"}
 value={form.name} onChange={handleChange} />
 </div>

 <div className="ap-field-group">
 <label className="ap-label">Description *</label>
 <textarea className="ap-input" name="description" rows={4} required
 placeholder="Give travellers a compelling overview of this service…" value={form.description} onChange={handleChange} />
 </div>

 <div className="ap-section-divider">Pricing & Location</div>

 <div className="ap-two-col">
 <div className="ap-field-group">
 <label className="ap-label">
 {isHire ? "Price per KM (LKR) *" : "Price per Day (LKR) *"}
 </label>
 <input className="ap-input" type="number" name="price"
 placeholder="e.g. 5000" value={form.price} onChange={handleChange} required />
 {isHire && <p className="ap-hint"> Hire pricing is strictly per KM</p>}
 </div>
 <div className="ap-field-group">
 <label className="ap-label">District / Location *</label>
 <select className="ap-input" name="location" value={form.location} onChange={handleChange} required>
 <option value="">Select District</option>
 {SRI_LANKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
 </select>
 </div>
 </div>

 {/* Map Location Picker */}
 <div className="ap-field-group">
 <label className="ap-label">📍 Pin Exact Location on Map <span style={{ fontWeight: 400, opacity: 0.6 }}>(Optional)</span></label>
 <p className="ap-hint" style={{ marginBottom: 8 }}>Click anywhere on the map to drop a pin — this powers the map shown to travellers on your listing page.</p>
 <LocationPickerMap lat={pinLat} lng={pinLng} onChange={handleMapPick} height="280px" />
 {(pinLat && pinLng) && (
 <button type="button" onClick={() => { setPinLat(null); setPinLng(null); }}
 style={{ marginTop: 8, fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
 ✕ Remove pin
 </button>
 )}
 </div>

 {/* Guide fields */}
 {isGuide && (
 <>
 <div className="ap-section-divider">Guide Details</div>
 <div className="ap-two-col">
 <div className="ap-field-group">
 <label className="ap-label">Languages Spoken *</label>
 <input className="ap-input" name="languages" required
 placeholder="e.g. English, German" value={form.languages} onChange={handleChange} />
 <p className="ap-hint">Comma-separated</p>
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Specialization *</label>
 <input className="ap-input" name="specialization"
 placeholder="e.g. Wildlife & Nature" value={form.specialization} onChange={handleChange} required />
 </div>
 </div>
 </>
 )}

 {/* Rent fields */}
 {isRent && (
 <>
 <div className="ap-section-divider">Vehicle Rental Details</div>
 <div className="ap-two-col">
 <div className="ap-field-group">
 <label className="ap-label">Included KM per Day *</label>
 <input className="ap-input" type="number" name="includedKM"
 placeholder="e.g. 150" value={form.includedKM} onChange={handleChange} required />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Extra KM Charge (LKR) *</label>
 <input className="ap-input" type="number" name="extraKMCharge"
 placeholder="e.g. 80" value={form.extraKMCharge} onChange={handleChange} required />
 </div>
 </div>
 </>
 )}

 <div className="ap-section-divider">Service Images (Up to 5)</div>

 <div className="ap-field-group">
 <div className="ap-file-zone" style={{ padding: "40px 20px" }}>
 <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="ap-file-input" />
 <div className="ap-file-zone-icon"></div>
 <div className="ap-file-zone-label">Drag & Drop or Click to Upload Photos</div>
 <div className="ap-file-zone-hint">Upload 1-5 high quality photos of your service.</div>
 </div>
 
 {images.length > 0 && (
 <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
 {images.map((file, i) => (
 <div key={i} style={{ position: "relative", width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
 <img src={URL.createObjectURL(file)} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
 <button type="button" onClick={() => removeImage(i)}
 style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
 
 </button>
 </div>
 ))}
 </div>
 )}
 </div>

 <button type="submit" className="ap-submit-btn" disabled={submitting}>
 {submitting ? <><span className="ap-spinner"/> Publishing…</> : ` Publish Service`}
 </button>
 </>)}

 {!sc && (
 <p style={{ textAlign:"center", color:"var(--ink-40)", padding:"32px 0", fontSize: 14 }}>
 Select a service type above to continue.
 </p>
 )}
 </form>
 </div>
 </div>
 );
}
