import React, { useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
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
  const { user }    = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [image,      setImage]      = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name:        "",
    description: "",
    itinerary:   "",
    inclusions:  "",
    duration:    "",
    price:       "",
    location:    "",
    category:    "",
  });

  /* ── Fetch categories — untouched ── */
  useEffect(() => {
    API.get("/packages/categories")
      .then(r => setCategories(r.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = e =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  /* ── Submit — untouched ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const fd = new FormData();
    fd.append("name",        form.name);
    fd.append("description", form.description);
    fd.append("itinerary",   form.itinerary);
    fd.append("inclusions",  form.inclusions);   // comma-separated → parsed server-side
    fd.append("duration",    form.duration);
    fd.append("price",       form.price);
    fd.append("location",    form.location);
    fd.append("category",    form.category);
    fd.append("creator",     user?._id);
    fd.append("listingType", "Package");         // ← KEY differentiator
    if (image) fd.append("image", image);

    const toastId = toast.loading("🚀 Publishing your package…");
    try {
      await API.post("/packages", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("✅ Package / Tour Published!", { id: toastId });
      setForm({ name:"", description:"", itinerary:"", inclusions:"", duration:"", price:"", location:"", category:"" });
      setImage(null);
      e.target.reset();
    } catch {
      toast.error("❌ Failed to publish package. Please try again.", { id: toastId });
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
          <div className="ap-eyebrow">🗺️ Partner Portal</div>
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
                <span key={i} className="ap-inclusion-pill">✔ {inc}</span>
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

          <div className="ap-section-divider">Cover Image</div>

          {/* File upload zone */}
          <div className="ap-field-group">
            <label className="ap-label">Hero / Cover Image *</label>
            <div className="ap-file-zone">
              <input
                type="file"
                accept="image/*"
                required
                className="ap-file-input"
                onChange={e => setImage(e.target.files[0])}
              />
              <div className="ap-file-zone-icon">🖼️</div>
              <div className="ap-file-zone-label">
                {image ? image.name : "Click or drag an image here"}
              </div>
              <div className="ap-file-zone-hint">
                {image ? "Click to change" : "JPG, PNG, WebP — max 10 MB"}
              </div>
            </div>
            {image && (
              <span className="ap-file-name">📎 {image.name}</span>
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
              : "🚀 Publish Tour Package"}
          </button>

        </form>
      </div>
    </div>
  );
}