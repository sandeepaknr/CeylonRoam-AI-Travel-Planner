import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./styles/addpackage-ext.css";

export default function ManagePackages() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", name: "", location: "", price: "", description: "" });
  const [editImages, setEditImages] = useState([]);

  const fetchMyPackages = async () => {
    if (!user?._id) return;

    try {
      const res = await API.get("/packages", {
        params: { creator: user._id }
      });
      setPackages(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (err) {
      console.error("Error loading packages", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchMyPackages();
  }, [user]);

  const handleEditClick = (pkg) => {
    setEditForm({
      id: pkg._id,
      name: pkg.name,
      location: pkg.location,
      price: pkg.price,
      description: pkg.description
    });
    setIsEditing(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", editForm.name);
    formData.append("location", editForm.location);
    formData.append("price", editForm.price);
    formData.append("description", editForm.description);
    if (editImages.length > 0) {
      editImages.forEach(img => formData.append("images", img));
    }
    const toastId = toast.loading("💾 Updating listing…");
    try {
      await API.put(`/packages/${editForm.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("✅ Listing updated successfully!", { id: toastId });
      setIsEditing(false);
      fetchMyPackages();
    } catch {
      toast.error("❌ Update failed. Please try again.", { id: toastId });
    }
  };

  const handleDelete = (id) => {
    toast(
      (t) => (
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          🗑️ Delete this listing?
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const tid = toast.loading("Deleting…");
              try {
                await API.delete(`/packages/${id}`);
                toast.success("✅ Listing deleted.", { id: tid });
                fetchMyPackages();
              } catch {
                toast.error("❌ Delete failed.", { id: tid });
              }
            }}
            style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
          >Delete</button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ background: "rgba(15, 23, 42, 0.1)", color: "#0f172a", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
          >Cancel</button>
        </span>
      ),
      { duration: 6000 }
    );
  };

  if (loading) return (
    <div className="ap-page">
      <div className="ap-card" style={{ textAlign: "center", maxWidth: 500 }}>
        <div style={{ fontSize:32, marginBottom:16 }}>⏳</div>
        <p className="ap-page-sub" style={{ margin: 0 }}>Loading your listings…</p>
      </div>
    </div>
  );

  return (
    <div className="ap-page" style={{ alignItems: "stretch", padding: "60px 24px" }}>
      <div className="ap-card" style={{ maxWidth: 1100, margin: "0 auto" }}>
        
        <div className="ap-page-header">
          <button type="button" className="ap-back-btn" onClick={() => navigate("/businesstools")}>
            ← Back to Dashboard
          </button>
          <div className="ap-eyebrow">⚙️ Partner Portal</div>
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
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.length > 0 ? (
                packages.map(pkg => (
                  <tr key={pkg._id}>
                    <td style={{ width: 80 }}>
                      <img src={`http://localhost:5000${pkg.image}`} alt="pkg" 
                        style={{ width: "64px", height: "44px", borderRadius: "8px", objectFit: "cover", display: "block" }} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{pkg.name}</div>
                      {pkg.listingType && (
                        <span style={{
                          fontSize: "11px", padding: "4px 8px", borderRadius: "6px",
                          backgroundColor: pkg.listingType === "Package" ? "var(--primary-l)" : "var(--amber-l)",
                          color: pkg.listingType === "Package" ? "var(--primary-d)" : "#92400e",
                          fontWeight: 700
                        }}>
                          {pkg.listingType.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td style={{ color: "var(--ink-60)" }}>{pkg.location}</td>
                    <td style={{ fontWeight: 700, color: "var(--primary)" }}>Rs. {pkg.price?.toLocaleString()}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="ap-table-btn" onClick={() => handleEditClick(pkg)}>Edit</button>
                        <button className="ap-table-btn danger" onClick={() => handleDelete(pkg._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-40)' }}>
                    No listings posted yet. Head over to "Post a Service" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isEditing && (
        <div className="ap-modal-overlay">
          <div className="ap-modal-content">
            <h3 className="ap-page-title" style={{ fontSize: 24, marginBottom: 24 }}>Edit Listing</h3>
            <form onSubmit={handleUpdate} className="ap-form">
              
              <div className="ap-field-group">
                <label className="ap-label">Listing Name</label>
                <input className="ap-input" value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} required />
              </div>
              
              <div className="ap-two-col">
                <div className="ap-field-group">
                  <label className="ap-label">Location</label>
                  <input className="ap-input" value={editForm.location} 
                    onChange={e => setEditForm({...editForm, location: e.target.value})} required />
                </div>
                <div className="ap-field-group">
                  <label className="ap-label">Price (LKR)</label>
                  <input className="ap-input" type="number" value={editForm.price} 
                    onChange={e => setEditForm({...editForm, price: e.target.value})} required />
                </div>
              </div>
              
              <div className="ap-field-group">
                <label className="ap-label">Description</label>
                <textarea className="ap-input" value={editForm.description} rows="3"
                  onChange={e => setEditForm({...editForm, description: e.target.value})} required />
              </div>
              
              <div className="ap-field-group">
                <label className="ap-label">Update Images (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  style={{ padding: 10 }}
                  onChange={(e) => setEditImages(Array.from(e.target.files))} 
                  className="ap-input"
                />
                <p className="ap-hint">Selecting new images will replace existing ones (Up to 5)</p>
                {editImages.length > 0 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    {editImages.map((img, i) => (
                      <div key={i} style={{ width: 50, height: 50, borderRadius: 8, overflow: 'hidden', border: '1px solid #ddd' }}>
                        <img src={URL.createObjectURL(img)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="ap-table-btn" style={{ flex: 1, padding: 14, fontSize: 14 }} onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="ap-submit-btn" style={{ flex: 1, marginTop: 0 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}