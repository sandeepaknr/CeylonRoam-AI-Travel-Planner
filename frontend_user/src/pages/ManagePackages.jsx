import React, { useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./styles/managepackages.css";

export default function ManagePackages() {
  const { user } = useContext(AuthContext);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", name: "", location: "", price: "", description: "" });
  const [editImage, setEditImage] = useState(null);

  const fetchMyPackages = async () => {
    if (!user?._id) return; // safeguard

    try {
      const res = await API.get("/packages", {
        params: { creator: user._id }
      });
      setPackages(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (err) {
      console.error("Error loading packages", err);
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
    if (editImage) formData.append("image", editImage);
    const toastId = toast.loading("💾 Updating package…");
    try {
      await API.put(`/packages/${editForm.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("✅ Package updated successfully!", { id: toastId });
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
          🗑️ Delete this package?
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const tid = toast.loading("Deleting…");
              try {
                await API.delete(`/packages/${id}`);
                toast.success("✅ Package deleted.", { id: tid });
                fetchMyPackages();
              } catch {
                toast.error("❌ Delete failed.", { id: tid });
              }
            }}
            style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
          >Delete</button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ background: "rgba(255,255,255,0.1)", color: "#f1f5f9", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
          >Cancel</button>
        </span>
      ),
      { duration: 6000 }
    );
  };

  return (
    <div className="business-wrapper">
      <div className="glass-container animate-slide-up" style={{maxWidth: '1100px', width: '95%'}}>
        <h2 className="page-title">My Travel Services</h2>
        
        {loading ? <p>Loading packages...</p> : (
          <div className="table-responsive">
            <table className="package-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map(pkg => (
                  <tr key={pkg._id}>
                    <td>
                      <img src={`http://localhost:5000${pkg.image}`} alt="pkg" 
                        style={{width: '60px', height: '40px', borderRadius: '5px', objectFit: 'cover'}} />
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {pkg.name}
                        {pkg.listingType && (
                          <span style={{
                            fontSize: "0.7rem", padding: "2px 6px", borderRadius: "12px",
                            backgroundColor: pkg.listingType === "Package" ? "#e0f2fe" : "#fef3c7",
                            color: pkg.listingType === "Package" ? "#0369a1" : "#92400e",
                            fontWeight: "bold", whiteSpace: "nowrap"
                          }}>
                            {pkg.listingType}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{pkg.location}</td>
                    <td><span className="price-tag">${pkg.price}</span></td>
                    <td>
                      <button className="tool-btn edit-btn" style={{marginRight: '8px'}} 
                        onClick={() => handleEditClick(pkg)}>Edit</button>
                      <button className="tool-btn delete-btn" style={{padding: '5px 12px'}} 
                        onClick={() => handleDelete(pkg._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {packages.length === 0 && <p style={{textAlign: 'center', marginTop: '20px'}}>No packages posted yet.</p>}
          </div>
        )}
      </div>

      {isEditing && (
        <div className="edit-modal-overlay">
          <div className="glass-container edit-modal-content">
            <h3 className="page-title" style={{fontSize: '1.5rem'}}>Edit Package</h3>
            <form onSubmit={handleUpdate}>
              <input className="input-field" value={editForm.name} placeholder="Name" 
                onChange={e => setEditForm({...editForm, name: e.target.value})} required />
              
              <input className="input-field" value={editForm.location} placeholder="Location" 
                onChange={e => setEditForm({...editForm, location: e.target.value})} required />
              
              <input className="input-field" type="number" value={editForm.price} placeholder="Price" 
                onChange={e => setEditForm({...editForm, price: e.target.value})} required />
              
              <textarea className="input-field" value={editForm.description} placeholder="Description" rows="4"
                onChange={e => setEditForm({...editForm, description: e.target.value})} required />
              
              <label style={{fontSize: '0.8rem', color: '#00f2fe'}}>Change Image (Optional):</label>
              <input type="file" className="input-field" onChange={e => setEditImage(e.target.files[0])} />
              
              <div style={{display: 'flex', gap: '10px'}}>
                <button type="submit" className="btn-explore" style={{flex: 1}}>Update</button>
                <button type="button" className="logout" style={{flex: 1}} onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}