import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Link } from "react-router-dom";
import "./style/BusinessManagement.css";

const API       = "http://localhost:5000/api";
const FILE_BASE = "http://localhost:5000";

/* ════════════════════════════════════════════════════════════
   FILE PREVIEW  (image thumbnail or doc link)
   ════════════════════════════════════════════════════════════ */
const fileUrl = (p) =>
  p ? `${FILE_BASE}/${p.replace(/\\/g, "/").replace(/^.*uploads\//, "uploads/")}` : null;

function FilePreview({ path, label }) {
  const url = fileUrl(path);
  if (!url) return null;
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(path);
  return (
    <div className="bm-file-item">
      <span className="bm-file-label">{label}</span>
      {isImage ? (
        <a href={url} target="_blank" rel="noreferrer">
          <img src={url} alt={label} className="bm-doc-thumb" />
        </a>
      ) : (
        <a href={url} target="_blank" rel="noreferrer" className="bm-doc-link">
          📄 View Document
        </a>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   BUSINESS REQUEST DETAIL  (category-aware rich display)
   ════════════════════════════════════════════════════════════ */
function BusinessRequestDetail({ req }) {
  if (!req) return <p className="bm-no-data">No business profile data available.</p>;

  const { category, hotelDetails: h, guideDetails: g, transportDetails: t } = req;

  return (
    <div className="bm-detail">

      {/* ══ HOTEL ══════════════════════════════════════════════ */}
      {category === "Hotel" && h && (
        <>
          <BmSection title="🏨 Hotel Info">
            <BmRow label="Hotel Name"    value={h.hotelName} />
            <BmRow label="Owner"         value={h.ownerName} />
            <BmRow label="Manager"       value={h.managerName} />
            <BmRow label="Property Type" value={h.propertyType} />
            <BmRow label="City"          value={h.city} />
            <BmRow label="District"      value={h.district} />
            <BmRow label="Phone"         value={h.phone} />
            <BmRow label="Address"       value={h.address} fullWidth />
            <BmRow label="Description"   value={h.description} fullWidth />
          </BmSection>

          {h.amenities?.length > 0 && (
            <BmSection title="✨ Amenities">
              <div className="bm-chips">
                {h.amenities.map(a => <span key={a} className="bm-chip">{a}</span>)}
              </div>
            </BmSection>
          )}

          <BmSection title="📋 Legal & Payouts">
            <BmRow label="BRN"            value={h.brn} />
            <BmRow label="Account Holder" value={h.bankDetails?.accountName} />
            <BmRow label="Bank"           value={h.bankDetails?.bank} />
            <BmRow label="Branch"         value={h.bankDetails?.branch} />
            <BmRow label="Account No."    value={h.bankDetails?.accountNumber} />
          </BmSection>

          <BmSection title="📸 Media">
            <div className="bm-file-grid">
              <FilePreview path={h.coverImage} label="Cover Image" />
              {h.gallery?.map((p, i) => <FilePreview key={i} path={p} label={`Gallery ${i + 1}`} />)}
            </div>
          </BmSection>
        </>
      )}

      {/* ══ GUIDE ══════════════════════════════════════════════ */}
      {category === "Guide" && g && (
        <>
          <BmSection title="🧭 Guide Info">
            <BmRow label="Full Name"      value={g.fullName} />
            <BmRow label="Date of Birth"  value={g.dateOfBirth} />
            <BmRow label="Base City"      value={g.baseCity} />
            <BmRow label="Regions"        value={g.operatingRegions} />
            <BmRow label="Languages"      value={g.languages} />
            <BmRow label="Guide Type"     value={g.guideType} />
            <BmRow label="Experience"     value={g.experience ? `${g.experience} yrs` : "—"} />
            <BmRow label="NIC Number"     value={g.nicNumber} />
            <BmRow label="Tourism Reg."   value={g.tourismBoardReg} />
            <BmRow label="Bio"            value={g.bio} fullWidth />
          </BmSection>

          {g.guideType === "Chauffeur Guide" && (
            <BmSection title="🚗 Vehicle (Chauffeur)">
              <BmRow label="Vehicle Type"  value={g.vehicleType} />
              <BmRow label="Model & Year"  value={`${g.vehicleModel || ""} ${g.vehicleYear || ""}`.trim() || "—"} />
              <BmRow label="A/C"           value={g.vehicleAC} />
            </BmSection>
          )}

          <BmSection title="📸 Documents">
            <div className="bm-file-grid">
              <FilePreview path={g.profilePicture} label="Profile Photo" />
              <FilePreview path={g.licenseScan}    label="License / Cert" />
              {g.vehiclePhotos?.map((p, i) => <FilePreview key={i} path={p} label={`Vehicle ${i + 1}`} />)}
            </div>
          </BmSection>
        </>
      )}

      {/* ══ TRANSPORT ══════════════════════════════════════════ */}
      {category === "Transport" && t && (
        <>
          <BmSection title="🚗 Service Info">
            <BmRow label="Service Type"    value={t.serviceType} />
            <BmRow label="Owner Name"      value={t.ownerName} />
            <BmRow label="Driver Name"     value={t.driverName} />
            <BmRow label="Phone"           value={t.phone} />
            <BmRow label="Base City"       value={t.baseCity} />
            <BmRow label="Airport Drops?"  value={t.airportTransfer} />
          </BmSection>

          <BmSection title="🔧 Vehicle Specs">
            <BmRow label="Vehicle Type"    value={t.vehicleType} />
            <BmRow label="Make"            value={t.vehicleMake} />
            <BmRow label="Model"           value={t.vehicleModel} />
            <BmRow label="Year"            value={t.yearOfManufacture} />
            <BmRow label="Transmission"    value={t.transmission} />
            <BmRow label="Passengers"      value={t.passengerCapacity} />
            <BmRow label="Luggage"         value={t.luggageCapacity} />
            <BmRow label="A/C"             value={t.airConditioned} />
          </BmSection>

          <BmSection title="📋 Legal">
            <BmRow label="Driver NIC"      value={t.driverNIC} />
          </BmSection>

          <BmSection title="📸 Documents & Photos">
            <div className="bm-file-grid">
              <FilePreview path={t.driverProfilePicture} label="Driver Photo" />
              <FilePreview path={t.licensePlatePhoto}    label="License Plate" />
              <FilePreview path={t.drivingLicense}       label="Driving License" />
              <FilePreview path={t.revenueLicense}       label="Revenue License" />
              <FilePreview path={t.driverNICFront}       label="NIC Front" />
              <FilePreview path={t.driverNICBack}        label="NIC Back" />
              {t.exteriorPhotos?.map((p, i) => <FilePreview key={i} path={p} label={`Exterior ${i + 1}`} />)}
              {t.interiorPhotos?.map((p, i) => <FilePreview key={i} path={p} label={`Interior ${i + 1}`} />)}
            </div>
          </BmSection>
        </>
      )}
    </div>
  );
}

/* ── Layout helpers ─────────────────────────────────────── */
function BmSection({ title, children }) {
  return (
    <div className="bm-section">
      <h4 className="bm-section-title">{title}</h4>
      {children}
    </div>
  );
}
function BmRow({ label, value, fullWidth }) {
  return (
    <div className={`bm-row ${fullWidth ? "full" : ""}`}>
      <span className="bm-label">{label}</span>
      <span className="bm-value">{value || "—"}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function BusinessManagement() {
  const [users,       setUsers]       = useState([]);
  const [selectedBiz, setSelectedBiz] = useState(null);   // the BusinessRequest doc
  const [modalUser,   setModalUser]   = useState(null);   // the User row for the modal title
  const [loadingModal, setLoadingModal] = useState(false);
  const [loading,     setLoading]     = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/business/businesses`);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load business users", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* ── View Profile — now hits the new partner-request endpoint ── */
  const handleViewBusiness = async (user) => {
    setModalUser(user);
    setSelectedBiz(null);
    setLoadingModal(true);
    try {
      const res = await axios.get(`${API}/partner-request/by-user/${user._id}`);
      setSelectedBiz(res.data);
    } catch (err) {
      // Gracefully handle users approved via the old flow (no BusinessRequest doc)
      setSelectedBiz(null);
      console.warn("No BusinessRequest found for user:", user._id);
    } finally {
      setLoadingModal(false);
    }
  };

  const closeModal = () => {
    setSelectedBiz(null);
    setModalUser(null);
  };

  /* ── Suspend ── */
  const handleSuspendBusiness = () => {
    if (!modalUser) return;
    toast(
      (t) => (
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          🚨 Suspend <strong>{modalUser.username}</strong>'s account?
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const tid = toast.loading("Suspending account…");
              try {
                await axios.delete(`${API}/business/business/suspend/${modalUser._id}`);
                toast.success(`✅ ${modalUser.username}'s account has been suspended.`, { id: tid });
                closeModal();
                fetchUsers();
              } catch {
                toast.error("❌ Suspend operation failed.", { id: tid });
              }
            }}
            style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
          >Suspend</button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ background: "rgba(255,255,255,0.1)", color: "#f1f5f9", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
          >Cancel</button>
        </span>
      ),
      { duration: 6000 }
    );
  };

  if (loading) return (
    <div className="mgmt-wrapper">
      <div className="bm-loader"><span /></div>
    </div>
  );

  return (
    <div className="mgmt-wrapper">

      {/* Header */}
      <div className="mgmt-header-section">
        <div>
          <h2>Business Directory</h2>
          <p>View and manage all approved business partners on the platform.</p>
        </div>
        <div className="header-right">
          <div className="stats-mini">
            <span>Active Partners: <strong>{users.length}</strong></span>
          </div>
          <button className="linkbutton">
            <Link to="/businessrequests">Pending Requests</Link>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Business User</th>
              <th>Account Status</th>
              <th>Member Since</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  No approved business partners yet.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  <div className="user-info-cell">
                    <div className="avatar">{u.username.charAt(0)}</div>
                    <div>
                      <div className="username">{u.username}</div>
                      <div className="email">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-pill ${u.accountType}`}>{u.accountType}</span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="text-right">
                  {u.accountType === "business" ? (
                    <button className="btn-primary-sm" onClick={() => handleViewBusiness(u)}>
                      🏢 View Profile
                    </button>
                  ) : (
                    <span className="no-action">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ══ Modal ══════════════════════════════════════════════ */}
      {modalUser && (
        <div className="glass-modal-overlay" onClick={closeModal}>
          <div className="modern-modal bm-modal-wide" onClick={(e) => e.stopPropagation()}>

            {/* Banner */}
            <div className="modal-banner">
              <div className="banner-content">
                <div className="bm-modal-avatar">{modalUser.username.charAt(0)}</div>
                <div>
                  <h3>{modalUser.username}</h3>
                  <p className="bm-modal-email">{modalUser.email}</p>
                  {selectedBiz && (
                    <span className={`bm-cat-badge cat-${selectedBiz.category?.toLowerCase()}`}>
                      {selectedBiz.category}
                    </span>
                  )}
                </div>
              </div>
              <button className="close-icon-btn" onClick={closeModal}>&#x2715;</button>
            </div>

            {/* Scrollable body */}
            <div className="bm-modal-body">
              {loadingModal && (
                <div className="bm-loading-state">⏳ Loading business profile…</div>
              )}

              {!loadingModal && !selectedBiz && (
                <div className="bm-no-data">
                  <p>⚠️ No detailed partner application found for this user.</p>
                  <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: 4 }}>
                    This user may have been approved via the legacy workflow.
                  </p>
                </div>
              )}

              {!loadingModal && selectedBiz && (
                <BusinessRequestDetail req={selectedBiz} />
              )}
            </div>

            {/* Footer Actions */}
            <div className="modal-actions-bar">
              <button className="btn-danger" onClick={handleSuspendBusiness}>
                🚫 Suspend Business
              </button>
              <button className="btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}