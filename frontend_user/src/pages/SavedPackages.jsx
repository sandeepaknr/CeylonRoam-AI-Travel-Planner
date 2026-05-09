import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./styles/savedPackages.css";

export default function SavedPackages() {
  const { user } = useContext(AuthContext);
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedItems();
  }, [user]);

  const fetchSavedItems = async () => {
    if (!user) return;
    try {
      const res = await API.get(`/saved/user/${user._id}`);
      setSavedItems(res.data);
    } catch (err) {
      console.error("Error loading saved items");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = (pkgId) => {
    toast(
      (t) => (
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          💔 Remove from favorites?
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await API.post("/saved/save-package", { userId: user._id, packageId: pkgId });
                setSavedItems(savedItems.filter(item => item.packageId._id !== pkgId));
                toast.success("👍 Removed from your wishlist.");
              } catch {
                toast.error("❌ Failed to remove. Please try again.");
              }
            }}
            style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
          >Remove</button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ background: "rgba(255,255,255,0.1)", color: "#f1f5f9", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
          >Cancel</button>
        </span>
      ),
      { duration: 6000 }
    );
  };

  if (loading) return <div className="loader">Loading your favorites...</div>;

  return (
    <div className="saved-page-container">
      <header className="saved-header">
        <h1>My Favorite Packages</h1>
        <p>You have {savedItems.length} items saved for later</p>
      </header>

      {savedItems.length === 0 ? (
        <div className="empty-state">
          <p>You haven't saved any packages yet.</p>
          <Link to="/packages" className="explore-btn">Explore Packages</Link>
        </div>
      ) : (
        <div className="saved-grid">
          {savedItems.map((item) => (
            <div key={item._id} className="saved-item-card">
              <div className="img-wrapper">
                <img src={`http://localhost:5000${item.packageId.image}`} alt={item.packageId.name} />
                <button className="unsave-badge" onClick={() => handleUnsave(item.packageId._id)}>✕</button>
              </div>
              <div className="saved-item-info">
                <h3>{item.packageId.name}</h3>
                <p className="loc">📍 {item.packageId.location}</p>
                <div className="price-row">
                  <span className="price">Rs. {item.packageId.price}</span>
                  <Link to={`/package/${item.packageId._id}`} className="view-btn">View Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}