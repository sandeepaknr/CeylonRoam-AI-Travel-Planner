import React, { useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./styles/business.css";

export default function BusinessPlace() {
  const { user } = useContext(AuthContext);
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

    const toastId = toast.loading("💾 Saving profile changes…");
    try {
      await API.put(`/partner-request/${profile._id}`, payload);
      toast.success("✅ Profile updated successfully!", { id: toastId });
    } catch {
      toast.error("❌ Update failed. Please try again.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="biz-container"><div className="biz-card"><h2>Loading profile...</h2></div></div>;
  if (!profile) return <div className="biz-container"><div className="biz-card"><h2>No Business Profile Found</h2></div></div>;

  const lockedStyle = { backgroundColor: "#f1f5f9", color: "#64748b", cursor: "not-allowed", border: "1px solid #e2e8f0", fontWeight: "500" };

  return (
    <div className="biz-container">
      <div className="biz-card">
        <div className="biz-header">
          <h2>Manage {profile.category} Profile</h2>
          <p>View and update your public-facing business details</p>
        </div>

        <form onSubmit={handleUpdate} className="biz-form">
          <div className="form-grid">
            
            {/* ════════════ HOTEL DETAILS ════════════ */}
            {profile.category === "Hotel" && profile.hotelDetails && (
              <>
                {/* LOCKED */}
                <div className="input-group">
                  <label>Hotel / Property Name</label>
                  <input value={profile.hotelDetails.hotelName || "—"} disabled style={lockedStyle} />
                </div>
                <div className="input-group">
                  <label>Property Type</label>
                  <input value={profile.hotelDetails.propertyType || "—"} disabled style={lockedStyle} />
                </div>
                <div className="input-group">
                  <label>Owner Name</label>
                  <input value={profile.hotelDetails.ownerName || "—"} disabled style={lockedStyle} />
                </div>
                <div className="input-group">
                  <label>BRN Number</label>
                  <input value={profile.hotelDetails.brn || "—"} disabled style={lockedStyle} />
                </div>
                
                {/* EDITABLE */}
                <div className="input-group full-width">
                  <label>Public Description</label>
                  <textarea name="description" value={editData.description} onChange={handleChange} required rows={3} />
                </div>
                <div className="input-group full-width">
                  <label>Full Physical Address</label>
                  <input name="address" value={editData.address} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>City</label>
                  <input name="city" value={editData.city} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>District</label>
                  <input name="district" value={editData.district} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Contact Phone</label>
                  <input name="phone" value={editData.phone} onChange={handleChange} required />
                </div>
                <div className="input-group full-width">
                  <label>Amenities (Comma separated)</label>
                  <input name="amenities" value={editData.amenities} onChange={handleChange} placeholder="e.g. Free WiFi, Swimming Pool, Spa" />
                </div>
              </>
            )}

            {/* ════════════ GUIDE DETAILS ════════════ */}
            {profile.category === "Guide" && profile.guideDetails && (
              <>
                {/* LOCKED */}
                <div className="input-group">
                  <label>Full Name</label>
                  <input value={profile.guideDetails.fullName || "—"} disabled style={lockedStyle} />
                </div>
                <div className="input-group">
                  <label>Guide Type</label>
                  <input value={profile.guideDetails.guideType || "—"} disabled style={lockedStyle} />
                </div>
                <div className="input-group">
                  <label>NIC Number</label>
                  <input value={profile.guideDetails.nicNumber || "—"} disabled style={lockedStyle} />
                </div>
                <div className="input-group">
                  <label>Tourism Board Reg.</label>
                  <input value={profile.guideDetails.tourismBoardReg || "—"} disabled style={lockedStyle} />
                </div>

                {profile.guideDetails.guideType === "Chauffeur Guide" && (
                  <>
                    <div className="input-group">
                      <label>Vehicle Type</label>
                      <input value={profile.guideDetails.vehicleType || "—"} disabled style={lockedStyle} />
                    </div>
                    <div className="input-group">
                      <label>Vehicle Model</label>
                      <input value={profile.guideDetails.vehicleModel || "—"} disabled style={lockedStyle} />
                    </div>
                  </>
                )}

                {/* EDITABLE */}
                <div className="input-group full-width">
                  <label>Professional Bio</label>
                  <textarea name="bio" value={editData.bio} onChange={handleChange} required rows={3} />
                </div>
                <div className="input-group">
                  <label>Base City</label>
                  <input name="baseCity" value={editData.baseCity} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Operating Regions</label>
                  <input name="operatingRegions" value={editData.operatingRegions} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Languages Spoken</label>
                  <input name="languages" value={editData.languages} onChange={handleChange} required />
                </div>
                {profile.guideDetails.guideType === "Chauffeur Guide" && (
                  <div className="input-group">
                    <label>Vehicle A/C Status</label>
                    <select name="vehicleAC" value={editData.vehicleAC} onChange={handleChange}>
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
                {/* LOCKED */}
                <div className="input-group">
                  <label>Service Type</label>
                  <input value={profile.transportDetails.serviceType || "—"} disabled style={lockedStyle} />
                </div>
                <div className="input-group">
                  <label>Owner Name</label>
                  <input value={profile.transportDetails.ownerName || "—"} disabled style={lockedStyle} />
                </div>
                <div className="input-group">
                  <label>Driver Name</label>
                  <input value={profile.transportDetails.driverName || "—"} disabled style={lockedStyle} />
                </div>
                <div className="input-group">
                  <label>Vehicle Type</label>
                  <input value={profile.transportDetails.vehicleType || "—"} disabled style={lockedStyle} />
                </div>
                <div className="input-group">
                  <label>Vehicle Make & Model</label>
                  <input value={`${profile.transportDetails.vehicleMake || ""} ${profile.transportDetails.vehicleModel || ""}`.trim()} disabled style={lockedStyle} />
                </div>
                <div className="input-group">
                  <label>Driver NIC</label>
                  <input value={profile.transportDetails.driverNIC || "—"} disabled style={lockedStyle} />
                </div>

                {/* EDITABLE */}
                <div className="input-group">
                  <label>Contact Phone</label>
                  <input name="phone" value={editData.phone} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Base City</label>
                  <input name="baseCity" value={editData.baseCity} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Airport Transfer Available?</label>
                  <select name="airportTransfer" value={editData.airportTransfer} onChange={handleChange}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </>
            )}
            
          </div>

          <button type="submit" className="biz-submit-btn" disabled={saving}>
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}