import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import LocationPickerMap from "../components/LocationPickerMap";
import "./styles/addpackage-ext.css";

const FACILITIES = [
 "Air Conditioning", "Free WiFi", "Flat-screen TV", "Private Bathroom",
 "Minibar", "Balcony", "Room Service", "Coffee Maker", "Safe"
];

export default function AddHotelRoom() {
 const { user } = useContext(AuthContext);
 const navigate = useNavigate();
 const [submitting, setSubmitting] = useState(false);
 const [images, setImages] = useState([]); // Multiple images array

 const [form, setForm] = useState({
 roomName: "",
 roomSize: "",
 availableRooms: 1,
 bedType: "Queen Bed",
 maxAdults: 2,
 maxChildren: 0,
 viewType: "City View",
 price: "",
 mealOption: "Room Only",
 cancellation: "Free Cancellation",
 paymentTerms: "Pay at property",
 facilities: []
 });

 const [pinLat, setPinLat] = useState(null);
 const [pinLng, setPinLng] = useState(null);
 const handleMapPick = (lat, lng) => { setPinLat(lat); setPinLng(lng); };

 const handleChange = (e) => {
 setForm({ ...form, [e.target.name]: e.target.value });
 };

 const handleFacilityToggle = (facility) => {
 setForm(prev => ({
 ...prev,
 facilities: prev.facilities.includes(facility)
 ? prev.facilities.filter(f => f !== facility)
 : [...prev.facilities, facility]
 }));
 };

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
 if (images.length === 0) {
 toast.error("Please upload at least one image.");
 return;
 }
 setSubmitting(true);
 const toastId = toast.loading(" Publishing room details...");

 // Normally you would append everything to FormData
 // Since the backend Package model might need updates to support these exact fields, 
 // we're structuring it to be ready for the API.
 const fd = new FormData();
 fd.append("name", form.roomName);
 fd.append("price", form.price);
 fd.append("description", `Room Size: ${form.roomSize} sqft | View: ${form.viewType} | Bed: ${form.bedType}`);
 fd.append("location", "Hotel Location"); // Needs to be integrated with their hotel profile location
 fd.append("listingType", "Service");
 fd.append("serviceCategory", "Hotel Package");
 fd.append("creator", user?._id);
 
 // Append multiple images
 images.forEach(img => fd.append("images", img)); 
 
 // Append custom room data as JSON string (or update backend to parse these)
 fd.append("roomData", JSON.stringify(form));
 if (pinLat !== null) fd.append("latitude",  pinLat);
 if (pinLng !== null) fd.append("longitude", pinLng);

 try {
 await API.post("/packages", fd, { headers: { "Content-Type": "multipart/form-data" } });
 toast.success(" Hotel Room Published!", { id: toastId });
 navigate("/manage-packages");
 } catch {
 toast.error(" Failed to publish room. Please try again.", { id: toastId });
 } finally {
 setSubmitting(false);
 }
 };

 return (
 <div className="ap-page" style={{ padding: "60px 24px" }}>
 <div className="ap-card" style={{ maxWidth: 800 }}>
 
 <div className="ap-page-header">
 <button type="button" className="ap-back-btn" onClick={() => navigate(-1)}>
 ← Back
 </button>
 <div className="ap-eyebrow"> Hotel Extranet</div>
 <h1 className="ap-page-title">List a New Room</h1>
 <p className="ap-page-sub">Provide detailed information about your room to attract more bookings.</p>
 </div>

 <form onSubmit={handleSubmit} className="ap-form">
 
 {/* ════ 1. Basic Information ════ */}
 <div className="ap-section-divider">1. Basic Information</div>
 <div className="ap-field-group">
 <label className="ap-label">Room Name / Type *</label>
 <input className="ap-input" name="roomName" placeholder="e.g. Deluxe Ocean View Suite" value={form.roomName} onChange={handleChange} required />
 </div>
 <div className="ap-two-col">
 <div className="ap-field-group">
 <label className="ap-label">Room Size (m² or sqft) *</label>
 <input className="ap-input" name="roomSize" placeholder="e.g. 45 m²" value={form.roomSize} onChange={handleChange} required />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Number of Available Rooms *</label>
 <input className="ap-input" type="number" name="availableRooms" min="1" value={form.availableRooms} onChange={handleChange} required />
 </div>
 </div>

 {/* ════ 2. Bedding & Occupancy ════ */}
 <div className="ap-section-divider">2. Bedding & Occupancy</div>
 <div className="ap-two-col">
 <div className="ap-field-group">
 <label className="ap-label">Bed Type *</label>
 <select className="ap-input" name="bedType" value={form.bedType} onChange={handleChange}>
 <option value="Single Bed">Single Bed</option>
 <option value="Twin Beds">Twin Beds</option>
 <option value="Queen Bed">Queen Bed</option>
 <option value="King Bed">King Bed</option>
 <option value="Multiple Beds">Multiple Beds</option>
 </select>
 </div>
 <div className="ap-two-col">
 <div className="ap-field-group">
 <label className="ap-label">Max Adults</label>
 <input className="ap-input" type="number" name="maxAdults" min="1" value={form.maxAdults} onChange={handleChange} required />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Max Children</label>
 <input className="ap-input" type="number" name="maxChildren" min="0" value={form.maxChildren} onChange={handleChange} required />
 </div>
 </div>
 </div>

 {/* ════ 3. Amenities & Features ════ */}
 <div className="ap-section-divider">3. Amenities & Features</div>
 <div className="ap-field-group">
 <label className="ap-label">View Type</label>
 <select className="ap-input" name="viewType" value={form.viewType} onChange={handleChange}>
 <option value="City View">City View</option>
 <option value="Sea / Ocean View">Sea / Ocean View</option>
 <option value="Garden View">Garden View</option>
 <option value="Mountain View">Mountain View</option>
 <option value="Pool View">Pool View</option>
 <option value="No Special View">No Special View</option>
 </select>
 </div>
 
 <div className="ap-field-group">
 <label className="ap-label">Room Facilities</label>
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "rgba(167,235,242,0.06)", padding: 16, borderRadius: 16, border: "1px solid rgba(167,235,242,0.20)" }}>
 {FACILITIES.map(fac => (
  <label key={fac} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#A7EBF2", cursor: "pointer" }}>
  <input type="checkbox" checked={form.facilities.includes(fac)} onChange={() => handleFacilityToggle(fac)}
  style={{ width: 18, height: 18, accentColor: "#54ACBF", cursor: "pointer" }} />
  {fac}
  </label>
 ))}
 </div>
 </div>

 {/* ════ Pin Location on Map ════ */}
 <div className="ap-field-group">
  <label className="ap-label">📍 Pin Exact Location on Map <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
  <p className="ap-hint" style={{ marginBottom: 8 }}>Click anywhere on the map to drop a pin — helps guests find your property precisely.</p>
  <LocationPickerMap lat={pinLat} lng={pinLng} onChange={handleMapPick} height="300px" />
  {pinLat && (
   <p className="ap-hint" style={{ marginTop: 6, color: "#54ACBF" }}>
    ✅ Pin set at {pinLat.toFixed(5)}, {pinLng.toFixed(5)}
   </p>
  )}
 </div>

 {/* ════ 4. Pricing & Meals ════ */}
 <div className="ap-section-divider">4. Pricing & Meals</div>
 <div className="ap-two-col">
 <div className="ap-field-group">
 <label className="ap-label">Base Price Per Night (LKR) *</label>
 <input className="ap-input" type="number" name="price" placeholder="e.g. 15000" value={form.price} onChange={handleChange} required />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Meal Options</label>
 <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
  {["Room Only", "Breakfast Included", "Half Board", "Full Board"].map(meal => (
  <label key={meal} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#A7EBF2", cursor: "pointer" }}>
  <input type="radio" name="mealOption" value={meal} checked={form.mealOption === meal} onChange={handleChange} 
  style={{ width: 16, height: 16, accentColor: "#54ACBF", cursor: "pointer" }} />
  {meal}
  </label>
  ))}
 </div>
 </div>
 </div>

 {/* ════ 5. Policies ════ */}
 <div className="ap-section-divider">5. Policies</div>
 <div className="ap-two-col">
 <div className="ap-field-group">
 <label className="ap-label">Cancellation Policy</label>
 <select className="ap-input" name="cancellation" value={form.cancellation} onChange={handleChange}>
 <option value="Free Cancellation">Free Cancellation</option>
 <option value="Non-refundable">Non-refundable</option>
 <option value="Free cancellation up to 7 days">Free cancellation up to 7 days before</option>
 </select>
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Payment Terms</label>
 <select className="ap-input" name="paymentTerms" value={form.paymentTerms} onChange={handleChange}>
 <option value="Pay at property">Pay at property</option>
 <option value="Prepayment required">Prepayment required</option>
 </select>
 </div>
 </div>

 {/* ════ 6. Media (Multiple Upload) ════ */}
 <div className="ap-section-divider">6. Room Images (Up to 5)</div>
 <div className="ap-field-group">
 <div className="ap-file-zone" style={{ padding: "40px 20px" }}>
 <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="ap-file-input" />
 <div className="ap-file-zone-icon"></div>
 <div className="ap-file-zone-label">Drag & Drop or Click to Upload Photos</div>
 <div className="ap-file-zone-hint">Upload 4-5 high quality photos showing the bed, bathroom, and view.</div>
 </div>
 
 {images.length > 0 && (
 <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
 {images.map((file, i) => (
  <div key={i} style={{ position: "relative", width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(167,235,242,0.25)" }}>
 <img src={URL.createObjectURL(file)} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
 <button type="button" onClick={() => removeImage(i)}
 style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
 
 </button>
 </div>
 ))}
 </div>
 )}
 </div>

 <button type="submit" className="ap-submit-btn" disabled={submitting} style={{ marginTop: 32 }}>
 {submitting ? <><span className="ap-spinner"/> Publishing Room…</> : ` Publish Room Listing`}
 </button>
 </form>

 </div>
 </div>
 );
}
