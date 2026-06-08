import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles/RequestBusiness.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
L.Marker.prototype.options.icon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });

/* ════════════════════════════════════════════════════════════
 CONSTANTS
 ════════════════════════════════════════════════════════════ */
const AMENITIES = ["Free WiFi", "A/C", "Swimming Pool", "Free Parking", "Restaurant/Bar", "Pet Friendly"];
const BIKE_TYPES = ["Bike", "Tuk Tuk"]; // types that hide capacity / AC

/* ════════════════════════════════════════════════════════════
 MAP COMPONENT
 ════════════════════════════════════════════════════════════ */
function LocationPicker({ lat, lng, onChange }) {
 useMapEvents({ click(e) { onChange(e.latlng.lat, e.latlng.lng); } });
 return <Marker position={[lat, lng]} />;
}

/* ════════════════════════════════════════════════════════════
 MAIN COMPONENT
 ════════════════════════════════════════════════════════════ */
export default function RequestBusiness() {
 const { user, setUser } = useContext(AuthContext);
 const navigate = useNavigate();

 /* ── Category selection ── */
 const [category, setCategory] = useState("");

 /* ── All text/select/checkbox state (flat, shared) ── */
 const [form, setForm] = useState({
 // Hotel
 hotelName: "", ownerName: "", managerName: "", propertyType: "Hotel",
 description: "", address: "", city: "", district: "", phone: "",
 latitude: 7.8731, longitude: 80.7718,
 amenities: [],
 brn: "",
 bankAccountName: "", bankName: "", bankBranch: "", bankAccountNumber: "",
 // Guide
 fullName: "", dateOfBirth: "", baseCity: "", operatingRegions: "",
 languages: "", guideType: "National Guide", experience: "",
 bio: "", nicNumber: "", tourismBoardReg: "",
 vehicleType: "", vehicleModel: "", vehicleYear: "", vehicleAC: "No",
 // Transport
 serviceType: "Hire", driverName: "",
 vehicleMake: "", yearOfManufacture: "",
 transmission: "Auto", passengerCapacity: "", luggageCapacity: "",
 airConditioned: "No", airportTransfer: "No", driverNIC: "",
 });

 /* ── File state ── */
 const [files, setFiles] = useState({
 coverImage: null, gallery: [],
 profilePicture: null, licenseScan: null, vehiclePhotos: [],
 driverProfilePicture: null, licensePlatePhoto: null,
 drivingLicense: null, revenueLicense: null,
 driverNICFront: null, driverNICBack: null,
 exteriorPhotos: [], interiorPhotos: [],
 });

 const [submitting, setSubmitting] = useState(false);

 /* ════════════════════════════════════════════════════════════
 HANDLERS
 ════════════════════════════════════════════════════════════ */
 const handleChange = (e) => {
 const { name, value } = e.target;
 setForm(prev => ({ ...prev, [name]: value }));
 };

 const handleAmenity = (label) => {
 setForm(prev => ({
 ...prev,
 amenities: prev.amenities.includes(label)
 ? prev.amenities.filter(a => a !== label)
 : [...prev.amenities, label],
 }));
 };

 const handleFile = (name, fileOrList) => {
 setFiles(prev => ({ ...prev, [name]: fileOrList }));
 };

 const handleMapClick = (lat, lng) => {
 setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
 };

 /* ── Build FormData and POST ── */
 const handleSubmit = async (e) => {
 e.preventDefault();
 setSubmitting(true);

 try {
 const fd = new FormData();
 fd.append("owner", user._id || user.id);
 fd.append("category", category);

 // Append all text fields
 Object.entries(form).forEach(([k, v]) => {
 if (k === "amenities") {
 fd.append("amenities", JSON.stringify(v));
 } else if (k === "bankAccountName" || k === "bankName" || k === "bankBranch" || k === "bankAccountNumber") {
 // Will handle bank as JSON below
 } else {
 fd.append(k, v);
 }
 });

 // Bank details as JSON
 fd.append("bankDetails", JSON.stringify({
 accountName: form.bankAccountName,
 bank: form.bankName,
 branch: form.bankBranch,
 accountNumber: form.bankAccountNumber,
 }));

 // Append single-file fields
 const singleFiles = [
 "coverImage", "profilePicture", "licenseScan",
 "driverProfilePicture", "licensePlatePhoto",
 "drivingLicense", "revenueLicense", "driverNICFront", "driverNICBack",
 ];
 singleFiles.forEach(f => { if (files[f]) fd.append(f, files[f]); });

 // Append multi-file fields
 const multiFiles = ["gallery", "vehiclePhotos", "exteriorPhotos", "interiorPhotos"];
 multiFiles.forEach(field => {
 (files[field] || []).forEach(file => fd.append(field, file));
 });

 const toastId = toast.loading(" Submitting your partner request…");
 await API.post("/partner-request", fd, {
 headers: { "Content-Type": "multipart/form-data" },
 });

 // Update local user context to "pending"
 const updatedUser = { ...user, accountType: "pending" };
 localStorage.setItem("user", JSON.stringify(updatedUser));
 if (setUser) setUser(updatedUser);

 toast.success(" Partner request submitted! Our team will review it shortly.", { id: toastId, duration: 6000 });
 navigate("/");
 } catch (err) {
 console.error(err);
 toast.error("Submission failed: " + (err.response?.data?.message || err.message));
 } finally {
 setSubmitting(false);
 }
 };

 /* ════════════════════════════════════════════════════════════
 ELIGIBILITY GATES
 ════════════════════════════════════════════════════════════ */
 if (!user) {
 return (
 <div className="request-biz-container">
 <div className="status-card-pending">
 <div className="status-icon"></div>
 <h2>Login Required</h2>
 <p>Please log in to access the Partner Programme.</p>
 <button className="back-home-btn" onClick={() => navigate("/login")}>Go to Login</button>
 </div>
 </div>
 );
 }

 if (user.country !== "Sri Lanka") {
 return (
 <div className="request-biz-container">
 <div className="status-card-pending">
 <div className="status-icon"></div>
 <h2>Sri Lanka Partners Only</h2>
 <p>
 The CeylonRoam Partner Programme is currently open exclusively to
 businesses and individuals based in <strong>Sri Lanka</strong>.
 </p>
 <p style={{ marginTop: 8, color: "#54ACBF", fontSize: "0.9rem" }}>Your registered country: <strong>{user.country || "Not set"}</strong></p>
 <button className="back-home-btn" onClick={() => navigate("/")}>Return to Home</button>
 </div>
 </div>
 );
 }

 if (user.accountType === "pending") {
 return (
 <div className="request-biz-container">
 <div className="status-card-pending">
 <div className="status-icon">⏳</div>
 <h2>Request Under Review</h2>
 <p>Hi <strong>{user.username}</strong>, your partner application is being verified by our team.</p>
 <div className="status-steps">
 <div className="step-item done"> Request Submitted</div>
 <div className="step-item active">● Verification in Progress</div>
 <div className="step-item">○ Activation</div>
 </div>
 <button className="back-home-btn" onClick={() => navigate("/")}>Return to Dashboard</button>
 </div>
 </div>
 );
 }

 /* ════════════════════════════════════════════════════════════
 HOTEL FORM
 ════════════════════════════════════════════════════════════ */
 const renderHotelForm = () => (
 <>
 {/* ── Basic Info ─── */}
 <div className="partner-section">
 <h3 className="section-title"> Basic Information</h3>
 <div className="two-col">
 <Field label="Hotel Name *">
 <input name="hotelName" value={form.hotelName} onChange={handleChange} placeholder="e.g. Sunset Villa" required />
 </Field>
 <Field label="Owner Name *">
 <input name="ownerName" value={form.ownerName} onChange={handleChange} required />
 </Field>
 <Field label="Manager Name">
 <input name="managerName" value={form.managerName} onChange={handleChange} />
 </Field>
 <Field label="Property Type *">
 <select name="propertyType" value={form.propertyType} onChange={handleChange}>
 {["Hotel", "Villa", "Resort", "Cabana"].map(v => <option key={v}>{v}</option>)}
 </select>
 </Field>
 </div>
 <Field label="Description *">
 <textarea name="description" value={form.description} onChange={handleChange} rows={3} required />
 </Field>
 </div>

 {/* ── Location ─── */}
 <div className="partner-section">
 <h3 className="section-title"> Location & Contact</h3>
 <div className="two-col">
 <Field label="Full Address *">
 <input name="address" value={form.address} onChange={handleChange} required />
 </Field>
 <Field label="City *">
 <input name="city" value={form.city} onChange={handleChange} required />
 </Field>
 <Field label="District *">
 <input name="district" value={form.district} onChange={handleChange} required />
 </Field>
 <Field label="Phone *">
 <input name="phone" value={form.phone} onChange={handleChange} required />
 </Field>
 </div>
 <Field label="Pick Location on Map">
 <MapContainer center={[form.latitude, form.longitude]} zoom={7} className="leaflet-map-request">
 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
 <LocationPicker lat={form.latitude} lng={form.longitude} onChange={handleMapClick} />
 </MapContainer>
 <div className="coords-info">
 <span>LAT: {form.latitude.toFixed(4)}</span>
 <span>LNG: {form.longitude.toFixed(4)}</span>
 </div>
 </Field>
 </div>

 {/* ── Amenities ─── */}
 <div className="partner-section">
 <h3 className="section-title"> Amenities</h3>
 <div className="checkbox-grid">
 {AMENITIES.map(a => (
 <label key={a} className="checkbox-pill">
 <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => handleAmenity(a)} />
 {a}
 </label>
 ))}
 </div>
 </div>

 {/* ── Media ─── */}
 <div className="partner-section">
 <h3 className="section-title"> Media Uploads</h3>
 <div className="two-col">
 <Field label="Cover Image *">
 <input type="file" accept="image/*" onChange={e => handleFile("coverImage", e.target.files[0])} required />
 </Field>
 <Field label="Image Gallery (max 5)">
 <input type="file" accept="image/*" multiple onChange={e => handleFile("gallery", Array.from(e.target.files).slice(0, 5))} />
 </Field>
 </div>
 </div>

 {/* ── Legal ─── */}
 <div className="partner-section">
 <h3 className="section-title"> Legal & Payouts</h3>
 <div className="two-col">
 <Field label="Business Registration Number (BRN) *">
 <input name="brn" value={form.brn} onChange={handleChange} required />
 </Field>
 <Field label="Account Holder Name *">
 <input name="bankAccountName" value={form.bankAccountName} onChange={handleChange} required />
 </Field>
 <Field label="Bank *">
 <input name="bankName" value={form.bankName} onChange={handleChange} required />
 </Field>
 <Field label="Branch *">
 <input name="bankBranch" value={form.bankBranch} onChange={handleChange} required />
 </Field>
 <Field label="Account Number *">
 <input name="bankAccountNumber" value={form.bankAccountNumber} onChange={handleChange} required />
 </Field>
 </div>
 </div>
 </>
 );

 /* ════════════════════════════════════════════════════════════
 GUIDE FORM
 ════════════════════════════════════════════════════════════ */
 const renderGuideForm = () => (
 <>
 <div className="partner-section">
 <h3 className="section-title"> Basic Information</h3>
 <div className="two-col">
 <Field label="Full Name *">
 <input name="fullName" value={form.fullName} onChange={handleChange} required />
 </Field>
 <Field label="Date of Birth *">
 <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required />
 </Field>
 <Field label="Profile Picture *">
 <input type="file" accept="image/*" onChange={e => handleFile("profilePicture", e.target.files[0])} required />
 </Field>
 </div>
 </div>

 <div className="partner-section">
 <h3 className="section-title"> Location & Coverage</h3>
 <div className="two-col">
 <Field label="Base City *">
 <input name="baseCity" value={form.baseCity} onChange={handleChange} required />
 </Field>
 <Field label="Operating Regions">
 <input name="operatingRegions" value={form.operatingRegions} onChange={handleChange} placeholder="e.g. Cultural Triangle, South Coast" />
 </Field>
 </div>
 </div>

 <div className="partner-section">
 <h3 className="section-title"> Skills & Experience</h3>
 <div className="two-col">
 <Field label="Languages Spoken *">
 <input name="languages" value={form.languages} onChange={handleChange} placeholder="e.g. English, Sinhala, Tamil" required />
 </Field>
 <Field label="Guide Type *">
 <select name="guideType" value={form.guideType} onChange={handleChange}>
 {["National Guide", "Chauffeur Guide", "Adventure/Trekking Guide"].map(v => <option key={v}>{v}</option>)}
 </select>
 </Field>
 <Field label="Years of Experience *">
 <input type="number" name="experience" value={form.experience} onChange={handleChange} min={0} required />
 </Field>
 </div>
 <Field label="Bio / About Me *">
 <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} required />
 </Field>
 </div>

 {/* Conditional: Chauffeur Guide extra fields */}
 {form.guideType === "Chauffeur Guide" && (
 <div className="partner-section conditional-section">
 <h3 className="section-title"> Vehicle Details (Chauffeur Only)</h3>
 <div className="two-col">
 <Field label="Vehicle Type *">
 <input name="vehicleType" value={form.vehicleType} onChange={handleChange} placeholder="e.g. Sedan, SUV" required />
 </Field>
 <Field label="Vehicle Model & Year *">
 <input name="vehicleModel" value={form.vehicleModel} onChange={handleChange} placeholder="e.g. Toyota Corolla 2020" required />
 </Field>
 <Field label="Air Conditioned?">
 <select name="vehicleAC" value={form.vehicleAC} onChange={handleChange}>
 <option>Yes</option><option>No</option>
 </select>
 </Field>
 <Field label="Vehicle Photos (max 5)">
 <input type="file" accept="image/*" multiple onChange={e => handleFile("vehiclePhotos", Array.from(e.target.files).slice(0, 5))} />
 </Field>
 </div>
 </div>
 )}

 <div className="partner-section">
 <h3 className="section-title"> Legal Documents</h3>
 <div className="two-col">
 <Field label="NIC Number *">
 <input name="nicNumber" value={form.nicNumber} onChange={handleChange} required />
 </Field>
 <Field label="Tourist Board Reg. No. *">
 <input name="tourismBoardReg" value={form.tourismBoardReg} onChange={handleChange} required />
 </Field>
 <Field label="License Scan (PDF/Image) *">
 <input type="file" accept="image/*,.pdf" onChange={e => handleFile("licenseScan", e.target.files[0])} required />
 </Field>
 </div>
 </div>
 </>
 );

 /* ════════════════════════════════════════════════════════════
 TRANSPORT FORM
 ════════════════════════════════════════════════════════════ */
 const isBikeType = BIKE_TYPES.includes(form.vehicleType);

 const renderTransportForm = () => (
 <>
 <div className="partner-section">
 <h3 className="section-title"> Service Type</h3>
 <div className="radio-group">
 {["Hire", "Rent"].map(v => (
 <label key={v} className={`radio-pill ${form.serviceType === v ? "active" : ""}`}>
 <input type="radio" name="serviceType" value={v}
 checked={form.serviceType === v} onChange={handleChange} />
 {v === "Hire" ? " Hire (Driver Included)" : " Rent (Self-Drive)"}
 </label>
 ))}
 </div>
 </div>

 <div className="partner-section">
 <h3 className="section-title"> Owner & Driver Info</h3>
 <div className="two-col">
 <Field label="Owner Name *">
 <input name="ownerName" value={form.ownerName} onChange={handleChange} required />
 </Field>
 <Field label="Driver Name *">
 <input name="driverName" value={form.driverName} onChange={handleChange} required />
 </Field>
 <Field label="Phone Number *">
 <input name="phone" value={form.phone} onChange={handleChange} required />
 </Field>
 <Field label="Driver Profile Picture *">
 <input type="file" accept="image/*" onChange={e => handleFile("driverProfilePicture", e.target.files[0])} required />
 </Field>
 </div>
 </div>

 <div className="partner-section">
 <h3 className="section-title"> Vehicle Specifications</h3>
 <div className="two-col">
 <Field label="Vehicle Type *">
 <select name="vehicleType" value={form.vehicleType} onChange={handleChange} required>
 <option value="">Select type</option>
 {["Bike", "Tuk Tuk", "Mini Car", "Sedan/Cab", "Passenger Van", "SUV", "Bus"].map(v => <option key={v}>{v}</option>)}
 </select>
 </Field>
 <Field label="Vehicle Make *">
 <input name="vehicleMake" value={form.vehicleMake} onChange={handleChange} placeholder="e.g. Toyota" required />
 </Field>
 <Field label="Vehicle Model *">
 <input name="vehicleModel" value={form.vehicleModel} onChange={handleChange} placeholder="e.g. HiAce" required />
 </Field>
 <Field label="Year of Manufacture *">
 <input type="number" name="yearOfManufacture" value={form.yearOfManufacture} onChange={handleChange} placeholder="e.g. 2018" required />
 </Field>

 {/* Conditionally hidden for Bike / Tuk Tuk */}
 {!isBikeType && (
 <>
 <Field label="Passenger Capacity">
 <input type="number" name="passengerCapacity" value={form.passengerCapacity} onChange={handleChange} min={1} />
 </Field>
 <Field label="Luggage Capacity">
 <input name="luggageCapacity" value={form.luggageCapacity} onChange={handleChange} placeholder="e.g. 3 large bags" />
 </Field>
 <Field label="Air Conditioned?">
 <select name="airConditioned" value={form.airConditioned} onChange={handleChange}>
 <option>Yes</option><option>No</option>
 </select>
 </Field>
 </>
 )}

 {/* Only shown for Rent */}
 {form.serviceType === "Rent" && (
 <Field label="Transmission *">
 <select name="transmission" value={form.transmission} onChange={handleChange}>
 <option>Auto</option><option>Manual</option>
 </select>
 </Field>
 )}
 </div>
 </div>

 <div className="partner-section">
 <h3 className="section-title"> Service Area</h3>
 <div className="two-col">
 <Field label="Base City / Location *">
 <input name="baseCity" value={form.baseCity} onChange={handleChange} required />
 </Field>
 <Field label="Airport Drops / Pickups?">
 <select name="airportTransfer" value={form.airportTransfer} onChange={handleChange}>
 <option>Yes</option><option>No</option>
 </select>
 </Field>
 </div>
 </div>

 <div className="partner-section">
 <h3 className="section-title"> Legal Documents</h3>
 <div className="two-col">
 <Field label="Driver NIC Number *">
 <input name="driverNIC" value={form.driverNIC} onChange={handleChange} required />
 </Field>
 <Field label="License Plate Photo *">
 <input type="file" accept="image/*" onChange={e => handleFile("licensePlatePhoto", e.target.files[0])} required />
 </Field>
 <Field label="Driving License *">
 <input type="file" accept="image/*,.pdf" onChange={e => handleFile("drivingLicense", e.target.files[0])} required />
 </Field>
 <Field label="Revenue License / Insurance *">
 <input type="file" accept="image/*,.pdf" onChange={e => handleFile("revenueLicense", e.target.files[0])} required />
 </Field>
 <Field label="NIC Photo — Front *">
 <input type="file" accept="image/*" onChange={e => handleFile("driverNICFront", e.target.files[0])} required />
 </Field>
 <Field label="NIC Photo — Back *">
 <input type="file" accept="image/*" onChange={e => handleFile("driverNICBack", e.target.files[0])} required />
 </Field>
 </div>
 </div>

 <div className="partner-section">
 <h3 className="section-title"> Vehicle Photos</h3>
 <div className="two-col">
 <Field label="Exterior Photos (max 5) *">
 <input type="file" accept="image/*" multiple onChange={e => handleFile("exteriorPhotos", Array.from(e.target.files).slice(0, 5))} required />
 </Field>
 <Field label="Interior Photos (max 5)">
 <input type="file" accept="image/*" multiple onChange={e => handleFile("interiorPhotos", Array.from(e.target.files).slice(0, 5))} />
 </Field>
 </div>
 </div>
 </>
 );

 /* ════════════════════════════════════════════════════════════
 MAIN RENDER
 ════════════════════════════════════════════════════════════ */
 return (
 <div className="request-biz-container">
 <div className="request-card">

 {/* Header */}
 <header className="request-header">
 <div className="partner-badge"> Partner Programme</div>
 <h1>Partner With Us</h1>
 <p>Join CeylonRoam and reach thousands of travellers across Sri Lanka.</p>
 </header>

 {/* Category Selector */}
 <div className="category-selector">
 {[
 { id: "Hotel", icon: "", label: "Hotel / Accommodation" },
 { id: "Guide", icon: "", label: "Tour Guide" },
 { id: "Transport", icon: "", label: "Transport Service" },
 ].map(c => (
 <button
 key={c.id}
 type="button"
 className={`cat-btn ${category === c.id ? "active" : ""}`}
 onClick={() => setCategory(c.id)}
 >
 <span className="cat-icon">{c.icon}</span>
 <span>{c.label}</span>
 </button>
 ))}
 </div>

 {/* Form — only renders when a category is chosen */}
 {category && (
 <form onSubmit={handleSubmit} className="partner-form">

 {category === "Hotel" && renderHotelForm()}
 {category === "Guide" && renderGuideForm()}
 {category === "Transport" && renderTransportForm()}

 <button type="submit" className="submit-request-btn" disabled={submitting}>
 {submitting
 ? <><span className="btn-spinner" /> Submitting…</>
 : ` Submit ${category} Partner Request`}
 </button>
 </form>
 )}

 {!category && (
 <p className="select-hint"> Select a category above to begin your application.</p>
 )}

 </div>
 </div>
 );
}

/* ── Tiny layout helper ── */
function Field({ label, children }) {
 return (
 <div className="input-field">
 <label>{label}</label>
 {children}
 </div>
 );
}