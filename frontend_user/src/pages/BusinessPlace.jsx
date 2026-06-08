import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./styles/addpackage-ext.css";

export default function BusinessPlace() {
 const { user } = useContext(AuthContext);
 const navigate = useNavigate();
 const [profile, setProfile] = useState(null);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);

 // Editable fields state
 const [editData, setEditData] = useState({});

 useEffect(() => {
 const fetchProfile = async () => {
 try {
 const res = await API.get(`/partner-request/by-user/${user._id}`);
 setProfile(res.data);
 
 // Pre-fill editable state based on category
 if (res.data.category === "Hotel" && res.data.hotelDetails) {
 setEditData({
 phone: res.data.hotelDetails.phone || "",
 description: res.data.hotelDetails.description || "",
 address: res.data.hotelDetails.address || "",
 city: res.data.hotelDetails.city || "",
 district: res.data.hotelDetails.district || "",
 amenities: res.data.hotelDetails.amenities?.join(", ") || "",
 });
 } else if (res.data.category === "Guide" && res.data.guideDetails) {
 setEditData({
 bio: res.data.guideDetails.bio || "",
 languages: res.data.guideDetails.languages || "",
 baseCity: res.data.guideDetails.baseCity || "",
 operatingRegions: res.data.guideDetails.operatingRegions || "",
 vehicleAC: res.data.guideDetails.vehicleAC || "",
 });
 } else if (res.data.category === "Transport" && res.data.transportDetails) {
 setEditData({
 phone: res.data.transportDetails.phone || "",
 baseCity: res.data.transportDetails.baseCity || "",
 airportTransfer: res.data.transportDetails.airportTransfer || "",
 });
 }
 } catch (err) {
 console.error("Profile not found or error loading.");
 } finally {
 setLoading(false);
 }
 };
 if (user?._id) fetchProfile();
 }, [user]);

 const handleChange = (e) => {
 setEditData({ ...editData, [e.target.name]: e.target.value });
 };

 const handleUpdate = async (e) => {
 e.preventDefault();
 setSaving(true);
 let payload = {};
 if (profile.category === "Hotel") {
 payload = { hotelDetails: { ...editData, amenities: editData.amenities.split(",").map(s => s.trim()).filter(Boolean) } };
 } else if (profile.category === "Guide") {
 payload = { guideDetails: editData };
 } else if (profile.category === "Transport") {
 payload = { transportDetails: editData };
 }

 const toastId = toast.loading(" Saving profile changes…");
 try {
 await API.put(`/partner-request/${profile._id}`, payload);
 toast.success(" Profile updated successfully!", { id: toastId });
 } catch {
 toast.error(" Update failed. Please try again.", { id: toastId });
 } finally {
 setSaving(false);
 }
 };

 if (loading) return (
 <div className="ap-page">
 <div className="ap-card" style={{ textAlign: "center", maxWidth: 500 }}>
 <div style={{ fontSize:32, marginBottom:16 }}>⏳</div>
 <p className="ap-page-sub" style={{ margin: 0 }}>Loading your business profile…</p>
 </div>
 </div>
 );

 if (!profile) return (
 <div className="ap-page">
 <div className="ap-card" style={{ textAlign: "center", maxWidth: 500 }}>
 <h2 className="ap-page-title">No Profile Found</h2>
 <p className="ap-page-sub">We couldn't locate your business data.</p>
 <button className="ap-submit-btn" style={{ marginTop: 24 }} onClick={() => navigate("/businesstools")}>Back to Dashboard</button>
 </div>
 </div>
 );

 const lockedStyle = { backgroundColor: "var(--surface-b)", color: "var(--ink-60)", cursor: "not-allowed", border: "1px solid var(--border)", fontWeight: "500", opacity: 0.8 };

 return (
 <div className="ap-page">
 <div className="ap-card">
 
 <div className="ap-page-header">
 <button type="button" className="ap-back-btn" onClick={() => navigate("/businesstools")}>
 ← Back to Dashboard
 </button>
 <div className="ap-eyebrow"> Business Place</div>
 <h1 className="ap-page-title">Manage {profile.category} Profile</h1>
 <p className="ap-page-sub">View and update your public-facing business details.</p>
 </div>

 <form onSubmit={handleUpdate} className="ap-form">
 
 {/* ════════════ HOTEL DETAILS ════════════ */}
 {profile.category === "Hotel" && profile.hotelDetails && (
 <>
 <div className="ap-section-divider">Locked Information</div>
 <div className="ap-two-col">
 <div className="ap-field-group">
 <label className="ap-label">Hotel / Property Name</label>
 <input className="ap-input" value={profile.hotelDetails.hotelName || "—"} disabled style={lockedStyle} />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Property Type</label>
 <input className="ap-input" value={profile.hotelDetails.propertyType || "—"} disabled style={lockedStyle} />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Owner Name</label>
 <input className="ap-input" value={profile.hotelDetails.ownerName || "—"} disabled style={lockedStyle} />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">BRN Number</label>
 <input className="ap-input" value={profile.hotelDetails.brn || "—"} disabled style={lockedStyle} />
 </div>
 </div>

 <div className="ap-section-divider">Editable Profile</div>
 
 <div className="ap-field-group">
 <label className="ap-label">Public Description</label>
 <textarea className="ap-input" name="description" value={editData.description} onChange={handleChange} required rows={3} />
 </div>
 
 <div className="ap-field-group">
 <label className="ap-label">Full Physical Address</label>
 <input className="ap-input" name="address" value={editData.address} onChange={handleChange} required />
 </div>
 
 <div className="ap-two-col">
 <div className="ap-field-group">
 <label className="ap-label">City</label>
 <input className="ap-input" name="city" value={editData.city} onChange={handleChange} required />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">District</label>
 <input className="ap-input" name="district" value={editData.district} onChange={handleChange} required />
 </div>
 </div>
 
 <div className="ap-field-group">
 <label className="ap-label">Contact Phone</label>
 <input className="ap-input" name="phone" value={editData.phone} onChange={handleChange} required />
 </div>
 
 <div className="ap-field-group">
 <label className="ap-label">Amenities (Comma separated)</label>
 <input className="ap-input" name="amenities" value={editData.amenities} onChange={handleChange} placeholder="e.g. Free WiFi, Swimming Pool, Spa" />
 </div>
 </>
 )}

 {/* ════════════ GUIDE DETAILS ════════════ */}
 {profile.category === "Guide" && profile.guideDetails && (
 <>
 <div className="ap-section-divider">Locked Information</div>
 <div className="ap-two-col">
 <div className="ap-field-group">
 <label className="ap-label">Full Name</label>
 <input className="ap-input" value={profile.guideDetails.fullName || "—"} disabled style={lockedStyle} />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Guide Type</label>
 <input className="ap-input" value={profile.guideDetails.guideType || "—"} disabled style={lockedStyle} />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">NIC Number</label>
 <input className="ap-input" value={profile.guideDetails.nicNumber || "—"} disabled style={lockedStyle} />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Tourism Board Reg.</label>
 <input className="ap-input" value={profile.guideDetails.tourismBoardReg || "—"} disabled style={lockedStyle} />
 </div>
 
 {profile.guideDetails.guideType === "Chauffeur Guide" && (
 <>
 <div className="ap-field-group">
 <label className="ap-label">Vehicle Type</label>
 <input className="ap-input" value={profile.guideDetails.vehicleType || "—"} disabled style={lockedStyle} />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Vehicle Model</label>
 <input className="ap-input" value={profile.guideDetails.vehicleModel || "—"} disabled style={lockedStyle} />
 </div>
 </>
 )}
 </div>

 <div className="ap-section-divider">Editable Profile</div>
 
 <div className="ap-field-group">
 <label className="ap-label">Professional Bio</label>
 <textarea className="ap-input" name="bio" value={editData.bio} onChange={handleChange} required rows={3} />
 </div>
 
 <div className="ap-two-col">
 <div className="ap-field-group">
 <label className="ap-label">Base City</label>
 <input className="ap-input" name="baseCity" value={editData.baseCity} onChange={handleChange} required />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Operating Regions</label>
 <input className="ap-input" name="operatingRegions" value={editData.operatingRegions} onChange={handleChange} required />
 </div>
 </div>
 
 <div className="ap-field-group">
 <label className="ap-label">Languages Spoken</label>
 <input className="ap-input" name="languages" value={editData.languages} onChange={handleChange} required />
 </div>
 
 {profile.guideDetails.guideType === "Chauffeur Guide" && (
 <div className="ap-field-group">
 <label className="ap-label">Vehicle A/C Status</label>
 <select className="ap-input" name="vehicleAC" value={editData.vehicleAC} onChange={handleChange}>
 <option value="Yes">Yes, Air Conditioned</option>
 <option value="No">No A/C</option>
 </select>
 </div>
 )}
 </>
 )}

 {/* ════════════ TRANSPORT DETAILS ════════════ */}
 {profile.category === "Transport" && profile.transportDetails && (
 <>
 <div className="ap-section-divider">Locked Information</div>
 <div className="ap-two-col">
 <div className="ap-field-group">
 <label className="ap-label">Service Type</label>
 <input className="ap-input" value={profile.transportDetails.serviceType || "—"} disabled style={lockedStyle} />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Owner Name</label>
 <input className="ap-input" value={profile.transportDetails.ownerName || "—"} disabled style={lockedStyle} />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Driver Name</label>
 <input className="ap-input" value={profile.transportDetails.driverName || "—"} disabled style={lockedStyle} />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Driver NIC</label>
 <input className="ap-input" value={profile.transportDetails.driverNIC || "—"} disabled style={lockedStyle} />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Vehicle Type</label>
 <input className="ap-input" value={profile.transportDetails.vehicleType || "—"} disabled style={lockedStyle} />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Vehicle Make & Model</label>
 <input className="ap-input" value={`${profile.transportDetails.vehicleMake || ""} ${profile.transportDetails.vehicleModel || ""}`.trim()} disabled style={lockedStyle} />
 </div>
 </div>

 <div className="ap-section-divider">Editable Profile</div>
 
 <div className="ap-field-group">
 <label className="ap-label">Contact Phone</label>
 <input className="ap-input" name="phone" value={editData.phone} onChange={handleChange} required />
 </div>
 
 <div className="ap-two-col">
 <div className="ap-field-group">
 <label className="ap-label">Base City</label>
 <input className="ap-input" name="baseCity" value={editData.baseCity} onChange={handleChange} required />
 </div>
 <div className="ap-field-group">
 <label className="ap-label">Airport Transfer Available?</label>
 <select className="ap-input" name="airportTransfer" value={editData.airportTransfer} onChange={handleChange}>
 <option value="Yes">Yes</option>
 <option value="No">No</option>
 </select>
 </div>
 </div>
 </>
 )}

 <button type="submit" className="ap-submit-btn" disabled={saving} style={{ marginTop: 24 }}>
 {saving ? <><span className="ap-spinner" /> Saving Changes...</> : " Save Changes"}
 </button>
 </form>
 </div>
 </div>
 );
}