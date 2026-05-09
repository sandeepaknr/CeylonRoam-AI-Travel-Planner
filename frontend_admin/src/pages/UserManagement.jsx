import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import "./style/UserManagement.css";

const API = "http://localhost:5000/api";
const FILE_BASE = "http://localhost:5000"; // Static file server base

/* ── tiny helper: make an uploaded path a clickable URL ── */
const fileUrl = (p) => p ? `${FILE_BASE}/${p.replace(/\\/g, "/").replace(/^.*uploads\//, "uploads/")}` : null;

/* ── Render a single file as either thumbnail or doc link ── */
function FilePreview({ path, label }) {
  const url = fileUrl(path);
  if (!url) return null;
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(path);
  return (
    <div className="file-preview-item">
      <span className="file-preview-label">{label}</span>
      {isImage
        ? <a href={url} target="_blank" rel="noreferrer">
            <img src={url} alt={label} className="doc-thumb" />
          </a>
        : <a href={url} target="_blank" rel="noreferrer" className="doc-link">📄 View Document</a>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   BUSINESS REQUEST DETAIL — renders inside modal
   ════════════════════════════════════════════════════════════ */
function BusinessRequestDetail({ req }) {
  if (!req) return <p className="br-loading">No request data found.</p>;

  const { category, status, hotelDetails: h, guideDetails: g, transportDetails: t } = req;

  return (
    <div className="br-detail">
      <div className="br-detail-header">
        <span className={`br-category-badge cat-${category?.toLowerCase()}`}>{category}</span>
        <span className={`br-status-badge st-${status}`}>{status?.toUpperCase()}</span>
      </div>

      {/* ══ HOTEL ══════════════════════════════════════════════ */}
      {category === "Hotel" && h && (
        <>
          <Section title="🏨 Hotel Basic Info">
            <Row label="Hotel Name"    value={h.hotelName} />
            <Row label="Owner Name"    value={h.ownerName} />
            <Row label="Manager Name"  value={h.managerName} />
            <Row label="Property Type" value={h.propertyType} />
            <Row label="Description"   value={h.description} fullWidth />
          </Section>
          <Section title="📍 Location & Contact">
            <Row label="Address"  value={h.address} />
            <Row label="City"     value={h.city} />
            <Row label="District" value={h.district} />
            <Row label="Phone"    value={h.phone} />
            <Row label="GPS"      value={h.latitude && h.longitude ? `${h.latitude?.toFixed(4)}, ${h.longitude?.toFixed(4)}` : "—"} />
          </Section>
          {h.amenities?.length > 0 && (
            <Section title="✨ Amenities">
              <div className="amenity-list">
                {h.amenities.map(a => <span key={a} className="amenity-chip">{a}</span>)}
              </div>
            </Section>
          )}
          <Section title="📋 Legal & Payouts">
            <Row label="BRN"            value={h.brn} />
            <Row label="Account Holder" value={h.bankDetails?.accountName} />
            <Row label="Bank"           value={h.bankDetails?.bank} />
            <Row label="Branch"         value={h.bankDetails?.branch} />
            <Row label="Account No."    value={h.bankDetails?.accountNumber} />
          </Section>
          <Section title="📸 Media">
            <div className="file-preview-grid">
              <FilePreview path={h.coverImage} label="Cover Image" />
              {h.gallery?.map((p, i) => <FilePreview key={i} path={p} label={`Gallery ${i + 1}`} />)}
            </div>
          </Section>
        </>
      )}

      {/* ══ GUIDE ══════════════════════════════════════════════ */}
      {category === "Guide" && g && (
        <>
          <Section title="👤 Guide Info">
            <Row label="Full Name"   value={g.fullName} />
            <Row label="DOB"         value={g.dateOfBirth} />
            <Row label="Base City"   value={g.baseCity} />
            <Row label="Regions"     value={g.operatingRegions} />
            <Row label="Languages"   value={g.languages} />
            <Row label="Guide Type"  value={g.guideType} />
            <Row label="Experience"  value={g.experience ? `${g.experience} years` : "—"} />
            <Row label="Bio"         value={g.bio} fullWidth />
          </Section>
          <Section title="📋 Legal">
            <Row label="NIC Number"       value={g.nicNumber} />
            <Row label="Tourism Board Reg." value={g.tourismBoardReg} />
          </Section>
          {g.guideType === "Chauffeur Guide" && (
            <Section title="🚗 Vehicle (Chauffeur)">
              <Row label="Vehicle Type"  value={g.vehicleType} />
              <Row label="Model & Year"  value={`${g.vehicleModel || ""} ${g.vehicleYear || ""}`.trim() || "—"} />
              <Row label="A/C"           value={g.vehicleAC} />
            </Section>
          )}
          <Section title="📸 Documents">
            <div className="file-preview-grid">
              <FilePreview path={g.profilePicture} label="Profile Photo" />
              <FilePreview path={g.licenseScan}    label="License / Cert" />
              {g.vehiclePhotos?.map((p, i) => <FilePreview key={i} path={p} label={`Vehicle Photo ${i + 1}`} />)}
            </div>
          </Section>
        </>
      )}

      {/* ══ TRANSPORT ══════════════════════════════════════════ */}
      {category === "Transport" && t && (
        <>
          <Section title="🚗 Service Info">
            <Row label="Service Type"  value={t.serviceType} />
            <Row label="Owner Name"    value={t.ownerName} />
            <Row label="Driver Name"   value={t.driverName} />
            <Row label="Phone"         value={t.phone} />
          </Section>
          <Section title="🔧 Vehicle Specs">
            <Row label="Vehicle Type"      value={t.vehicleType} />
            <Row label="Make"              value={t.vehicleMake} />
            <Row label="Model"             value={t.vehicleModel} />
            <Row label="Year"              value={t.yearOfManufacture} />
            <Row label="Transmission"      value={t.transmission} />
            <Row label="Passenger Cap."    value={t.passengerCapacity} />
            <Row label="Luggage Cap."      value={t.luggageCapacity} />
            <Row label="A/C"               value={t.airConditioned} />
          </Section>
          <Section title="🗺️ Service Area">
            <Row label="Base City"        value={t.baseCity} />
            <Row label="Airport Transfer" value={t.airportTransfer} />
          </Section>
          <Section title="📋 Legal">
            <Row label="Driver NIC"       value={t.driverNIC} />
          </Section>
          <Section title="📸 Documents & Photos">
            <div className="file-preview-grid">
              <FilePreview path={t.driverProfilePicture} label="Driver Photo" />
              <FilePreview path={t.licensePlatePhoto}    label="License Plate" />
              <FilePreview path={t.drivingLicense}       label="Driving License" />
              <FilePreview path={t.revenueLicense}       label="Revenue License" />
              <FilePreview path={t.driverNICFront}       label="NIC Front" />
              <FilePreview path={t.driverNICBack}        label="NIC Back" />
              {t.exteriorPhotos?.map((p, i) => <FilePreview key={i} path={p} label={`Exterior ${i + 1}`} />)}
              {t.interiorPhotos?.map((p, i) => <FilePreview key={i} path={p} label={`Interior ${i + 1}`} />)}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}

/* ── Layout helpers ─────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="br-section">
      <h4 className="br-section-title">{title}</h4>
      {children}
    </div>
  );
}
function Row({ label, value, fullWidth }) {
  return (
    <div className={`br-row ${fullWidth ? "full" : ""}`}>
      <span className="br-label">{label}</span>
      <span className="br-value">{value || "—"}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   TOAST
   ════════════════════════════════════════════════════════════ */
function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className={`admin-toast toast-${type}`}>{message}</div>;
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function UserManagement() {
  const [users, setUsers]               = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [bizRequest, setBizRequest]     = useState(null);
  const [loadingReq, setLoadingReq]     = useState(false);
  const [loading, setLoading]           = useState(true);
  const [toastMsg, setToastMsg]           = useState(null);   // { message, type }
  const [reviewing, setReviewing]       = useState(false);
  const [deleting, setDeleting]         = useState(false);  // cascade delete in-flight

  const showToast = (message, type = "success") => setToastMsg({ message, type });

  /* ── Fetch all users ── */
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/accountmanagement/users`);
      setUsers(res.data);
    } catch {
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* ── On Inspect click ── */
  const handleInspect = async (user) => {
    setSelectedUser(user);
    setBizRequest(null);

    if (user.accountType === "pending") {
      setLoadingReq(true);
      try {
        const res = await axios.get(`${API}/partner-request/by-user/${user._id}`);
        setBizRequest(res.data);
      } catch {
        setBizRequest(null);
      } finally {
        setLoadingReq(false);
      }
    }
  };

  /* ── Close modal ── */
  const closeModal = () => {
    setSelectedUser(null);
    setBizRequest(null);
  };

  /* ── Approve / Reject ── */
  const handleReview = (action) => {
    if (!bizRequest) return;
    const label = action === "approved" ? "Approve" : "Reject";
    toast(
      (t) => (
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {label} this partner request?
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setReviewing(true);
              try {
                await axios.put(`${API}/partner-request/review/${bizRequest._id}`, { status: action });
                showToast(
                  action === "approved"
                    ? "✅ Partner request approved! User upgraded to Business."
                    : "❌ Partner request rejected. User reverted to regular account.",
                  action === "approved" ? "success" : "error"
                );
                closeModal();
                fetchUsers();
              } catch (err) {
                showToast("Action failed: " + (err.response?.data?.message || err.message), "error");
              } finally {
                setReviewing(false);
              }
            }}
            style={{ background: action === "approved" ? "#10b981" : "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
          >{label}</button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ background: "rgba(255,255,255,0.1)", color: "#f1f5f9", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
          >Cancel</button>
        </span>
      ),
      { duration: 6000 }
    );
  };

  /* ── Suspend (non-pending users) ── */
  const handleSuspend = (id) => {
    toast(
      (t) => (
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          🚨 Suspend this user?
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.delete(`${API}/accountmanagement/users/suspend/${id}`);
                showToast("User suspended successfully.", "success");
                fetchUsers();
                closeModal();
              } catch {
                showToast("Suspend failed!", "error");
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

  /* ── Cascade Delete ── */
  const handleDeleteUser = (user) => {
    toast(
      (t) => (
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          ⚠️ Permanently delete <strong>{user.username}</strong> + all their data?
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setDeleting(true);
              try {
                const res = await axios.delete(`${API}/accountmanagement/users/delete/${user._id}`);
                setUsers(prev => prev.filter(u => u._id !== user._id));
                closeModal();
                showToast(
                  `✅ Deleted "${user.username}" — ` +
                  `${res.data.deletedPackages ?? 0} listing(s) and ` +
                  `${res.data.deletedBookings ?? 0} booking(s) removed.`,
                  "success"
                );
              } catch (err) {
                showToast("Delete failed: " + (err.response?.data?.message || err.message), "error");
              } finally {
                setDeleting(false);
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
      { duration: 8000 }
    );
  };

  if (loading) return <div className="admin-loader"><span /></div>;

  return (
    <div className="mgmt-page-container">

      {/* Toast */}
      {toastMsg && <Toast message={toastMsg.message} type={toastMsg.type} onDone={() => setToastMsg(null)} />}

      <header className="mgmt-page-header">
        <div className="header-text">
          <h1>User Directory</h1>
          <p>Manage and monitor platform participants</p>
        </div>
        <div className="header-stats">
          <div className="stat-pill">Total: {users.length}</div>
          <div className="stat-pill stat-pending">
            Pending: {users.filter(u => u.accountType === "pending").length}
          </div>
        </div>
      </header>

      <div className="data-card">
        <div className="table-responsive">
          <table className="modern-data-table">
            <thead>
              <tr>
                <th>Identity</th>
                <th>Email Address</th>
                <th>Privilege</th>
                <th>Country</th>
                <th>Registration</th>
                <th className="action-col">Operations</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className={user.accountType === "pending" ? "row-pending" : ""}>
                  <td>
                    <div className="user-profile-cell">
                      <div className="mini-avatar">{user.username.charAt(0)}</div>
                      <span className="username-text">{user.username}</span>
                    </div>
                  </td>
                  <td className="email-cell">{user.email}</td>
                  <td>
                    <span className={`status-tag tag-${user.accountType}`}>
                      {user.accountType === "pending" ? "⏳ pending" : user.accountType}
                    </span>
                  </td>
                  <td>{user.country || "—"}</td>
                  <td className="date-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="action-col">
                    <div className="action-btn-group">
                      <button className="btn-details" onClick={() => handleInspect(user)}>
                        {user.accountType === "pending" ? "🔍 Review" : "Inspect"}
                      </button>
                      <button
                        className="btn-delete-row"
                        title="Permanently delete this user and all their data"
                        onClick={() => handleDeleteUser(user)}
                        disabled={deleting}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MODAL
          ══════════════════════════════════════════════════════════ */}
      {selectedUser && (
        <div className="overlay-blur" onClick={closeModal}>
          <div className="profile-modal-card profile-modal-wide" onClick={(e) => e.stopPropagation()}>

            {/* Top bar */}
            <div className="modal-top-bar">
              <h3>
                {selectedUser.accountType === "pending"
                  ? "🔍 Partner Request Review"
                  : "Member Profile"}
              </h3>
              <button className="btn-close" onClick={closeModal}>&#x2715;</button>
            </div>

            {/* Scrollable body */}
            <div className="modal-content-area">

              {/* User hero */}
              <div className="profile-hero">
                <div className="large-avatar">{selectedUser.username.charAt(0)}</div>
                <h4>{selectedUser.username}</h4>
                <p className="hero-email">{selectedUser.email}</p>
                <span className={`hero-tag tag-${selectedUser.accountType}`}>{selectedUser.accountType}</span>
              </div>

              {/* Basic user details */}
              <div className="details-grid">
                <div className="data-item">
                  <label>User ID</label>
                  <p className="mono">{selectedUser._id}</p>
                </div>
                <div className="data-item">
                  <label>Country</label>
                  <p>{selectedUser.country || "—"}</p>
                </div>
                <div className="data-item">
                  <label>Age</label>
                  <p>{selectedUser.age || "—"}</p>
                </div>
                <div className="data-item">
                  <label>Job Role</label>
                  <p>{selectedUser.jobRole || "—"}</p>
                </div>
                <div className="data-item">
                  <label>Joined</label>
                  <p>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="data-item">
                  <label>Currency</label>
                  <p>{selectedUser.currency || "LKR"}</p>
                </div>
              </div>

              {/* ── Partner Request section (pending only) ── */}
              {selectedUser.accountType === "pending" && (
                <div className="partner-request-section">
                  <div className="prs-header">
                    <span className="prs-title">📑 Partner Application</span>
                  </div>

                  {loadingReq
                    ? <div className="br-loading">⏳ Loading application data…</div>
                    : <BusinessRequestDetail req={bizRequest} />}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer-area">
              {selectedUser.accountType === "pending" && bizRequest ? (
                <>
                  <button
                    className="btn-approve-action"
                    onClick={() => handleReview("approved")}
                    disabled={reviewing}
                  >
                    {reviewing ? "Processing…" : "✅ Approve Request"}
                  </button>
                  <button
                    className="btn-reject-action"
                    onClick={() => handleReview("rejected")}
                    disabled={reviewing}
                  >
                    {reviewing ? "Processing…" : "❌ Reject Request"}
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-suspend-action" onClick={() => handleSuspend(selectedUser._id)}>
                    Suspend Access
                  </button>
                  <button
                    className="btn-delete-action"
                    onClick={() => handleDeleteUser(selectedUser)}
                    disabled={deleting}
                    title="Permanently delete this user and all their data"
                  >
                    {deleting ? "Deleting…" : "🗑 Delete Account"}
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}