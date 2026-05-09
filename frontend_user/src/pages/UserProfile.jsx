import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./styles/profile.css";

/* ── Calculate age from a Date or ISO string ───────────────── */
function calcAge(dob) {
  if (!dob) return null;
  const birth   = new Date(dob);
  const today   = new Date();
  let age       = today.getFullYear() - birth.getFullYear();
  const m       = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/* ── Format DOB for display: "12 Jan 1995" ─────────────────── */
function formatDOB(dob) {
  if (!dob) return "—";
  return new Date(dob).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function UserProfile() {
  const { user, setUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);

  // Only email is editable — all other fields read-only
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setEmail(user.email || "");
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("💾 Saving profile changes…");
    try {
      const res = await API.put(`/user/update/${user._id}`, { email });
      setUser(res.data);
      setIsEditing(false);
      toast.success("✅ Profile updated successfully!", { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Update failed!", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.username?.charAt(0).toUpperCase() || "U";
  const age      = calcAge(user?.dateOfBirth);

  return (
    <div className="profile-page">
      <div className="profile-layout">

        {/* ═══════════════════════════ HERO / IDENTITY CARD */}
        <div className="pf-card">
          <div className="pf-cover">
            <div className="pf-cover-gradient" />
            <div className="pf-cover-pattern" />
            <div className="pf-cover-chips">
              <div className="pf-cover-chip">🌴 CeylonRoam</div>
              <div className="pf-cover-chip">✨ AI Travel</div>
            </div>
          </div>

          <div className="pf-identity">
            <div className="pf-avatar-wrap">
              <div className="pf-avatar">{initials}</div>
              <div className="pf-avatar-edit-overlay" title="Change photo" aria-label="Edit avatar">
                📸
              </div>
            </div>

            <div className="pf-identity-text">
              <h2 className="pf-identity-name">{user?.username || "Traveller"}</h2>
              <div className="pf-identity-meta">
                <span className="pf-identity-email">{user?.email}</span>
                <span className="pf-badge">
                  {user?.accountType === "business" ? "🏢" : "🌿"}{" "}
                  {user?.accountType
                    ? user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1)
                    : "Member"}{" "}
                  Account
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════ PERSONAL INFORMATION CARD */}
        <div className="pf-card">
          <div className="pf-card-body">
            <p className="pf-section-label">Personal Information</p>

            {/* ── VIEW MODE ─────────────────────────────────────── */}
            {!isEditing ? (
              <div className="pf-animate-in">
                <div className="pf-info-grid">

                  <div className="pf-info-item">
                    <div className="pf-info-label">👤 Username</div>
                    <div className="pf-info-value">{user?.username || "—"}</div>
                  </div>

                  <div className="pf-info-item">
                    <div className="pf-info-label">✉️ Email Address</div>
                    <div className="pf-info-value">{user?.email || "—"}</div>
                  </div>

                  <div className="pf-info-item">
                    <div className="pf-info-label">🌍 Country</div>
                    <div className="pf-info-value">{user?.country || "—"}</div>
                  </div>

                  <div className="pf-info-item">
                    <div className="pf-info-label">🎂 Age</div>
                    <div className="pf-info-value">
                      {age !== null ? `${age} years old` : "—"}
                      {user?.dateOfBirth && (
                        <span style={{ fontSize:"0.8rem", color:"#94a3b8", marginLeft:6 }}>
                          ({formatDOB(user.dateOfBirth)})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pf-info-item">
                    <div className="pf-info-label">💼 Profession</div>
                    <div className="pf-info-value">{user?.jobRole || "—"}</div>
                  </div>

                  <div className="pf-info-item">
                    <div className="pf-info-label">🏷️ Account Type</div>
                    <div className="pf-info-value">
                      {user?.accountType
                        ? user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1)
                        : "User"}
                    </div>
                  </div>

                </div>

                <div className="pf-btn-row">
                  <button className="pf-btn-primary" onClick={() => setIsEditing(true)}>
                    ✏️ Edit Profile
                  </button>
                </div>
              </div>

            ) : (
              /* ── EDIT MODE — only email is editable ─────────── */
              <form onSubmit={handleUpdate} className="pf-form pf-animate-in">

                {/* Username — read-only */}
                <div className="pf-field">
                  <label className="pf-field-label">Username <span className="pf-readonly-tag">Read Only</span></label>
                  <div className="pf-input-wrap">
                    <span className="pf-input-icon">👤</span>
                    <input className="pf-input pf-input-disabled" value={user?.username || ""} disabled />
                  </div>
                </div>

                {/* Email — EDITABLE */}
                <div className="pf-field">
                  <label className="pf-field-label">Email Address</label>
                  <div className="pf-input-wrap">
                    <span className="pf-input-icon">✉️</span>
                    <input
                      className="pf-input"
                      type="email"
                      value={email}
                      placeholder="Enter new email"
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Country — read-only */}
                <div className="pf-field">
                  <label className="pf-field-label">Country <span className="pf-readonly-tag">Read Only</span></label>
                  <div className="pf-input-wrap">
                    <span className="pf-input-icon">🌍</span>
                    <input className="pf-input pf-input-disabled" value={user?.country || ""} disabled />
                  </div>
                </div>

                {/* Date of Birth — read-only, shows calculated age */}
                <div className="pf-field">
                  <label className="pf-field-label">Date of Birth <span className="pf-readonly-tag">Read Only</span></label>
                  <div className="pf-input-wrap">
                    <span className="pf-input-icon">🎂</span>
                    <input
                      className="pf-input pf-input-disabled"
                      value={
                        user?.dateOfBirth
                          ? `${formatDOB(user.dateOfBirth)} (${age} yrs)`
                          : "Not set"
                      }
                      disabled
                    />
                  </div>
                </div>

                {/* Profession — read-only */}
                <div className="pf-field">
                  <label className="pf-field-label">Profession <span className="pf-readonly-tag">Read Only</span></label>
                  <div className="pf-input-wrap">
                    <span className="pf-input-icon">💼</span>
                    <input className="pf-input pf-input-disabled" value={user?.jobRole || ""} disabled />
                  </div>
                </div>

                {/* Password update link */}
                <Link to="/editpassword" className="pf-password-link">
                  🔒 Update Password →
                </Link>

                {/* Buttons */}
                <div className="pf-btn-row">
                  <button type="submit" className="pf-btn-primary" disabled={loading}>
                    {loading ? <><span className="pf-spinner" /> Saving…</> : "✓ Save Changes"}
                  </button>
                  <button type="button" className="pf-btn-ghost" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>

        {/* ═══════════════════════════ ACCOUNT SECURITY CARD */}
        <div className="pf-card">
          <div className="pf-card-body">
            <p className="pf-section-label">Account Security</p>
            <div className="pf-security-row">
              <div className="pf-security-info">
                <h4>Password</h4>
                <p>Keep your account secure with a strong, unique password. We recommend updating it every few months.</p>
              </div>
              <Link to="/editpassword" className="pf-btn-primary" style={{ textDecoration:"none", flexShrink:0 }}>
                🔒 Change Password
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}