import React, { useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./styles/managepackages.css";
import "./styles/addpackage-ext.css";

/* ── Business category → allowed service sub-categories ───── */
const BIZ_CATEGORY_MAP = {
  Hotel:     ["Hotel Package"],
  Guide:     ["Guide", "Chauffeur Guide"],
  Transport: ["Rent Vehicle", "Hire Vehicle"],
};

const ALL_SERVICE_CATEGORIES = [
  { value: "Hotel Package",   label: "🏨 Hotel / Accommodation" },
  { value: "Guide",           label: "🧭 Tour Guide"             },
  { value: "Chauffeur Guide", label: "🚗 Chauffeur Guide"        },
  { value: "Rent Vehicle",    label: "🔑 Rent Vehicle"           },
  { value: "Hire Vehicle",    label: "🚕 Hire Vehicle"           },
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
  const [image,            setImage]            = useState(null);
  const [submitting,       setSubmitting]       = useState(false);
  const [bizCategory,      setBizCategory]      = useState(null);
  const [guideType,        setGuideType]        = useState(null); // raw registered guideType
  const [allowedCats,      setAllowedCats]      = useState([]);
  const [bizLoading,       setBizLoading]       = useState(true);

  const [form, setForm] = useState({
    name:"", description:"", price:"", location:"",
    serviceCategory:"",
    // Guide fields
    languages:"", specialization:"",
    // Vehicle fields
    pricingType:"", includedKM:"", extraKMCharge:"",
  });

  /* Resolve business category + guide type */
  useEffect(() => {
    if (!user?._id) { setBizLoading(false); return; }
    API.get(`/partner-request/by-user/${user._id}`)
      .then(r => {
        const cat      = r.data?.category || null;
        const rawGuideType = r.data?.guideDetails?.guideType || null;
        setBizCategory(cat);
        setGuideType(rawGuideType);

        if (cat === "Guide" && rawGuideType) {
          // Map registered guideType → serviceCategory, bypassing selection entirely
          // 'Chauffeur Guide' → 'Chauffeur Guide'; everything else → 'Guide'
          const mappedSC = rawGuideType === "Chauffeur Guide" ? "Chauffeur Guide" : "Guide";
          setAllowedCats([]);                              // no selector needed
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.serviceCategory) { toast.error("🏷️ Please select a service type first."); return; }
    setSubmitting(true);

    const fd = new FormData();
    fd.append("name",            form.name);
    fd.append("description",     form.description);
    fd.append("price",           form.price);
    fd.append("location",        form.location);
    fd.append("creator",         user?._id);
    fd.append("listingType",     "Service");
    fd.append("serviceCategory", form.serviceCategory);

    const sc = form.serviceCategory;
    if (sc === "Guide" || sc === "Chauffeur Guide") {
      fd.append("languages",      form.languages);
      fd.append("specialization", form.specialization);
      fd.append("pricingType",    "Per Day");
    }
    if (sc === "Rent Vehicle") {
      fd.append("pricingType",   "Per Day");
      fd.append("includedKM",    form.includedKM);
      fd.append("extraKMCharge", form.extraKMCharge);
    }
    if (sc === "Hire Vehicle") {
      fd.append("pricingType", "Per KM");
    }
    if (image) fd.append("image", image);

    const toastId = toast.loading("🚀 Publishing your service…");
    try {
      await API.post("/packages", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("✅ Service Published!", { id: toastId });
      setForm({
        name:"", description:"", price:"", location:"",
        serviceCategory: allowedCats.length === 1 ? allowedCats[0].value : "",
        languages:"", specialization:"", pricingType:"", includedKM:"", extraKMCharge:"",
      });
      setImage(null);
      e.target.reset();
    } catch {
      toast.error("❌ Failed to publish service. Please try again.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const sc      = form.serviceCategory;
  const isGuide = sc === "Guide" || sc === "Chauffeur Guide";
  const isRent  = sc === "Rent Vehicle";
  const isHire  = sc === "Hire Vehicle";

  if (bizLoading) return (
    <div className="business-wrapper">
      <div className="glass-container animate-slide-up" style={{ maxWidth:560, textAlign:"center", padding:60 }}>
        <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
        <p style={{ color:"#94a3b8" }}>Loading your business profile…</p>
      </div>
    </div>
  );

  return (
    <div className="business-wrapper">
      <div className="glass-container animate-slide-up" style={{ maxWidth:660 }}>
        <h2 className="page-title">⚙️ Post a Service</h2>
        <p style={{ color:"#94a3b8", marginBottom:24, fontSize:"0.9rem" }}>
          Publish a bookable resource that travellers can reserve directly.
          {bizCategory && <> · Locked to <strong style={{ color:"#38bdf8" }}>{bizCategory}</strong> account.</>}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">

          {/* ── Service type selector — hidden for Guides (auto-resolved from guideType) ── */}
          {bizCategory !== "Guide" && (
            <div className="ap-field-group">
              <label className="ap-label">Service Type *</label>
              {allowedCats.length === 1 ? (
                <div className="ap-single-cat">
                  <span className="ap-single-cat-pill">{allowedCats[0].label}</span>
                  <span className="ap-single-cat-hint">Auto-selected for your account</span>
                </div>
              ) : (
                <div className="ap-cat-grid">
                  {allowedCats.map(c => (
                    <button key={c.value} type="button"
                      className={`ap-cat-btn ${form.serviceCategory === c.value ? "active" : ""}`}
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
              <div className="ap-single-cat">
                <span className="ap-single-cat-pill">
                  {form.serviceCategory === "Chauffeur Guide" ? "🚗 Chauffeur Guide" : "🧭 Tour Guide"}
                </span>
                <span className="ap-single-cat-hint">
                  Locked to your registered guide type: <strong>{guideType}</strong>
                </span>
              </div>
            </div>
          )}

          {sc && (<>
            <input className="input-field" name="name" required
              placeholder={isGuide ? "Guide Name / Profile Title *" : isRent || isHire ? "Vehicle Name *" : "Listing Name *"}
              value={form.name} onChange={handleChange} />

            <textarea className="input-field" name="description" rows={3} required
              placeholder="Description *" value={form.description} onChange={handleChange} />

            <div className="ap-two-col">
              <div>
                <label className="ap-label">
                  {isHire ? "Price per KM (LKR) *" : "Price per Day (LKR) *"}
                </label>
                <input className="input-field" type="number" name="price"
                  placeholder="e.g. 5000" value={form.price} onChange={handleChange} required />
              </div>
              <div>
                <label className="ap-label">District / Location *</label>
                <select className="input-field" name="location" value={form.location} onChange={handleChange} required>
                  <option value="">Select District</option>
                  {SRI_LANKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Guide fields */}
            {isGuide && (
              <div className="ap-ext-section">
                <div className="ap-ext-label">🧭 Guide Details</div>
                <div className="ap-two-col">
                  <div>
                    <label className="ap-label">Languages Spoken *</label>
                    <input className="input-field" name="languages" required
                      placeholder="e.g. English, German" value={form.languages} onChange={handleChange} />
                    <p className="ap-hint">Comma-separated</p>
                  </div>
                  <div>
                    <label className="ap-label">Specialization *</label>
                    <input className="input-field" name="specialization"
                      placeholder="e.g. Wildlife & Nature" value={form.specialization} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            )}

            {/* Rent fields */}
            {isRent && (
              <div className="ap-ext-section">
                <div className="ap-ext-label">🔑 Rent Vehicle Details</div>
                <div className="ap-two-col">
                  <div>
                    <label className="ap-label">Included KM per Day *</label>
                    <input className="input-field" type="number" name="includedKM"
                      placeholder="e.g. 150" value={form.includedKM} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="ap-label">Extra KM Charge (LKR) *</label>
                    <input className="input-field" type="number" name="extraKMCharge"
                      placeholder="e.g. 80" value={form.extraKMCharge} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            )}

            {isHire && (
              <div className="ap-info-banner">
                🚕 <strong>Hire pricing is per KM</strong> — the price above is charged per kilometre.
              </div>
            )}

            <div className="file-input-wrapper">
              <label className="ap-label" style={{ color:"#fff", marginBottom:5, display:"block" }}>
                Cover Image *
              </label>
              <input type="file" accept="image/*" className="input-field" required
                onChange={e => setImage(e.target.files[0])} />
            </div>

            <button type="submit" className="btn-explore" style={{ width:"100%", marginTop:10 }}
              disabled={submitting}>
              {submitting ? "Publishing…" : `🚀 Publish Service`}
            </button>
          </>)}

          {!sc && (
            <p style={{ textAlign:"center", color:"#94a3b8", padding:"20px 0" }}>
              👆 Select a service type above to continue.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
