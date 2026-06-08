import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import LocationPickerMap from "../components/LocationPickerMap";
import "./styles/addpackage-ext.css";

/* ── Static data ──────────────────────────────────────────── */
const SRI_LANKA_DISTRICTS = [
 "Ampara","Anuradhapura","Badulla","Batticaloa","Colombo",
 "Galle","Gampaha","Hambantota","Jaffna","Kalutara",
 "Kandy","Kegalle","Kilinochchi","Kurunegala","Mannar",
 "Matale","Matara","Moneragala","Mullaitivu","Nuwara Eliya",
 "Polonnaruwa","Puttalam","Ratnapura","Trincomalee","Vavuniya",
];

/* ──────────────────────────────────────────────────────────
 COMPONENT
────────────────────────────────────────────────────────── */
export default function AddPackage() {
 const { user } = useContext(AuthContext);
 const navigate = useNavigate();
 const [categories, setCategories] = useState([]);
 const [images, setImages] = useState([]);
 const [submitting, setSubmitting] = useState(false);

 const [form, setForm] = useState({
 name: "",
 description: "",
 itinerary: "",
 inclusions: "",
 duration: "",
 price: "",
 location: "",
 category: "",
 });
 const [pinLat, setPinLat] = useState(null);
 const [pinLng, setPinLng] = useState(null);

 const handleMapPick = (lat, lng) => {
 setPinLat(lat);
 setPinLng(lng);
 };

 /* ── Fetch categories — untouched ── */
 useEffect(() => {
 API.get("/packages/categories")
 .then(r => setCategories(r.data))
 .catch(err => console.error(err));
 }, []);

 const handleChange = e =>
 setForm(p => ({ ...p, [e.target.name]: e.target.value }));

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

 /* ── Submit — untouched ── */
 const handleSubmit = async (e) => {
 e.preventDefault();
 setSubmitting(true);

 const fd = new FormData();
 fd.append("name", form.name);
 fd.append("description", form.description);
 fd.append("itinerary", form.itinerary);
 fd.append("inclusions", form.inclusions);
 fd.append("duration", form.duration);
 fd.append("price", form.price);
 fd.append("location", form.location);
 fd.append("category", form.category);
 fd.append("creator", user?._id);
 fd.append("listingType", "Package");
 if (pinLat !== null) fd.append("latitude", pinLat);
 if (pinLng !== null) fd.append("longitude", pinLng);
 if (images.length > 0) {
 images.forEach(img => fd.append("images", img));
 }

 const toastId = toast.loading(" Publishing your package…");
 try {
 await API.post("/packages", fd, { headers: { "Content-Type": "multipart/form-data" } });
 toast.success(" Package / Tour Published!", { id: toastId });
 setForm({ name:"", description:"", itinerary:"", inclusions:"", duration:"", price:"", location:"", category:"" });
 setImages([]);
 e.target.reset();
 } catch {
 toast.error(" Failed to publish package. Please try again.", { id: toastId });
 } finally {
 setSubmitting(false);
 }
 };

 /* ── Derived ── */
 const inclusions = form.inclusions.split(",").map(s => s.trim()).filter(Boolean);

 /* ══════════════════════════════════════════════════════════
 RENDER
 ══════════════════════════════════════════════════════════ */
 return (
 <div className="ap-page">
 <div className="ap-card">

 {/* ── Header ── */}
 <div className="ap-page-header">
 <button type="button" className="ap-back-btn" onClick={() => navigate("/businesstools")}>
 ← Back to Dashboard
 </button>
 <div className="ap-eyebrow"> Partner Portal</div>
 <h1 className="ap-page-title">Post a Tour Package</h1>
 <p className="ap-page-sub">
 Create a curated tour, day-trip, or multi-day itinerary that
 travellers can discover and book end-to-end.
 </p>
 </div>

 {/* ── Form ── */}
 <form className="ap-form" onSubmit={handleSubmit}>

 {/* Tour Title */}
 <div className="ap-field-group">
 <label className="ap-label">Tour / Package Title *</label>
 <input
 className="ap-input"
 name="name"
 required
 placeholder='e.g. "2-Day Sigiriya & Dambulla Heritage Tour"'
 value={form.name}
 onChange={handleChange}
 />
 </div>

 {/* Description */}
 <div className="ap-field-group">
 <label className="ap-label">Overview / Description *</label>
 <textarea
 className="ap-input"
 name="description"
 rows={4}
 required
 placeholder="Give travellers a compelling overview of this experience…"
 value={form.description}
 onChange={handleChange}
 />
 </div>

 <div className="ap-section-divider">Itinerary & Inclusions</div>

 {/* Itinerary */}
 <div className="ap-field-group">
 <label className="ap-label">Day-by-Day Itinerary</label>
 <textarea
 className="ap-input"
 name="itinerary"
 rows={6}
 placeholder={"Day 1: Arrive Colombo, city tour\nDay 2: Kandy – Temple of the Tooth, cultural show\n…"}
 value={form.itinerary}
 onChange={handleChange}
 />
 <p className="ap-hint">Each line = one day or one activity block</p>
 </div>

 {/* Inclusions */}
 <div className="ap-field-group">
 <label className="ap-label">What's Included</label>
 <input
 className="ap-input"
 name="inclusions"
 placeholder="e.g. Entry fees, Lunch, Guide, Hotel (2 nights)"
 value={form.inclusions}
 onChange={handleChange}
 />
 <p className="ap-hint">Comma-separated — each item becomes a badge below</p>
 </div>

 {/* Inclusions preview */}
 {inclusions.length > 0 && (
 <div className="ap-inclusions-preview">
 {inclusions.map((inc, i) => (
 <span key={i} className="ap-inclusion-pill"> {inc}</span>
 ))}
 </div>
 )}

 <div className="ap-section-divider">Pricing & Location</div>

 {/* Duration + Price */}
 <div className="ap-two-col">
 <div className="ap-field-group">
 <label className="ap-label">Duration</label>
 <input
 className="ap-input"
 name="duration"
 placeholder='e.g. "3 Days / 2 Nights"'
 value={form.duration}
 onChange={handleChange}
 />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Total Price (LKR) *</label>
 <input
 className="ap-input"
 type="number"
 name="price"
 required
 placeholder="e.g. 35000"
 value={form.price}
 onChange={handleChange}
 />
 <p className="ap-hint">Per person / per booking</p>
 </div>
 </div>

 {/* Location + Category */}
 <div className="ap-two-col">
 <div className="ap-field-group">
 <label className="ap-label">Starting Location *</label>
 <select
 className="ap-input"
 name="location"
 value={form.location}
 onChange={handleChange}
 required
 >
 <option value="">Select District</option>
 {SRI_LANKA_DISTRICTS.map(d => (
 <option key={d} value={d}>{d}</option>
 ))}
 </select>
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Category *</label>
 <select
 className="ap-input"
 name="category"
 value={form.category}
 onChange={handleChange}
 required
 >
 <option value="">Select Category</option>
 {categories.map(cat => (
 <option key={cat._id} value={cat._id}>{cat.name}</option>
 ))}
 </select>
 </div>
 </div>

 {/* Map Location Picker */}
 <div className="ap-field-group">
 <label className="ap-label">📍 Pin Exact Location on Map <span style={{ fontWeight: 400, opacity: 0.6 }}>(Optional)</span></label>
 <p className="ap-hint" style={{ marginBottom: 8 }}>Click anywhere on the map to drop a pin — this powers the map shown to travellers on your listing page.</p>
 <LocationPickerMap lat={pinLat} lng={pinLng} onChange={handleMapPick} height="300px" />
 {(pinLat && pinLng) && (
 <button type="button" onClick={() => { setPinLat(null); setPinLng(null); }}
 style={{ marginTop: 8, fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
 ✕ Remove pin
 </button>
 )}
 </div>

 <div className="ap-section-divider">Tour Images (Up to 5)</div>

 <div className="ap-field-group">
 <div className="ap-file-zone" style={{ padding: "40px 20px" }}>
 <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="ap-file-input" />
 <div className="ap-file-zone-icon"></div>
 <div className="ap-file-zone-label">Drag & Drop or Click to Upload Photos</div>
 <div className="ap-file-zone-hint">Upload 1-5 high quality photos of this tour.</div>
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

 {/* Submit */}
 <button
 type="submit"
 className="ap-submit-btn"
 disabled={submitting}
 >
 {submitting
 ? <><span className="ap-spinner" /> Publishing…</>
 : " Publish Tour Package"}
 </button>

 </form>
 </div>
 </div>
 );
}