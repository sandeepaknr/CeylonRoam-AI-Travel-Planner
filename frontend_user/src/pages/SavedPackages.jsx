import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useOfflineData } from "../context/OfflineDataContext";
import { LuWifiOff } from "react-icons/lu";
import "./styles/savedPackages.css";

export default function SavedPackages() {
  const { user } = useContext(AuthContext);

  // ── Offline-aware data from context ──────────────────────────────────────
  const { savedItems: ctxSavedItems, isOffline, loading: ctxLoading, invalidateAndRefresh } = useOfflineData();
  const loading = ctxLoading.saved;

  // Local copy so unsave mutations update UI immediately without re-fetching
  const [savedItems, setSavedItems] = useState([]);

  // Sync local copy whenever context data changes.
  // Filter out orphaned entries where packageId is null (the package was deleted
  // from the DB but the SavedPackage document still references it).
  useEffect(() => {
    const valid = Array.isArray(ctxSavedItems)
      ? ctxSavedItems.filter(item => item?.packageId != null)
      : [];
    setSavedItems(valid);
  }, [ctxSavedItems]);

  const handleUnsave = (pkgId) => {
    if (!pkgId) return; // guard: should never be null at this point
    toast(
      (t) => (
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          Remove from favorites?
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await API.post("/saved/save-package", { userId: user._id, packageId: pkgId });
                setSavedItems(prev => prev.filter(item => item.packageId?._id !== pkgId));
                // Invalidate context cache so other pages reflect the removal
                invalidateAndRefresh("saved");
                toast.success(" Removed from your wishlist.");
              } catch {
                toast.error(" Failed to remove. Please try again.");
              }
            }}
            style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
          >Remove</button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ background: "rgba(255,255,255,0.1)", color: "#E7F9FC", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
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

      {/* ── Offline indicator banner ── */}
      {isOffline && (
        <div className="offline-banner" role="alert">
          <LuWifiOff size={16} />
          <span>You're offline — showing cached saved packages. Remove actions will sync when reconnected.</span>
        </div>
      )}

      {savedItems.length === 0 ? (
        <div className="empty-state">
          <p>You haven't saved any packages yet.</p>
          <Link to="/packages" className="explore-btn">Explore Packages</Link>
        </div>
      ) : (
        <div className="saved-grid">
          {savedItems.map((item) => {
            // Skip any item whose package reference resolved to null
            // (happens when the package was deleted after being saved)
            if (!item?.packageId) return null;
            const pkg = item.packageId;
            return (
              <div key={item._id} className="saved-item-card">
                <div className="img-wrapper">
                  <img
                    src={`http://localhost:5000${pkg.image}`}
                    alt={pkg.name}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <button className="unsave-badge" onClick={() => handleUnsave(pkg._id)}></button>
                </div>
                <div className="saved-item-info">
                  <h3>{pkg.name}</h3>
                  <p className="loc"> {pkg.location}</p>
                  <div className="price-row">
                    <span className="price">Rs. {pkg.price}</span>
                    <Link to={`/package/${pkg._id}`} className="view-btn">View Details</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}