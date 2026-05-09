import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import "./styles/AdminRequests.css";

const API_BASE_URL = "http://localhost:5000/api/business";

export default function AdminBusinessRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/pending-requests`);
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = (userId, bizName) => {
    toast(
      (t) => (
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          ✅ Approve <strong>{bizName}</strong>?
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const tid = toast.loading("🚀 Approving business…");
              try {
                await axios.post(`${API_BASE_URL}/approve`, { userId });
                toast.success("🚀 Business approved successfully!", { id: tid });
                fetchRequests();
              } catch {
                toast.error("❌ Approval failed. Please try again.", { id: tid });
              }
            }}
            style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
          >Approve</button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ background: "rgba(255,255,255,0.1)", color: "#f1f5f9", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
          >Cancel</button>
        </span>
      ),
      { duration: 6000 }
    );
  };

  const handleReject = (bizName) => {
    toast.error(`❌ ${bizName} request has been rejected.`);
  };

  if (loading) return <div className="loader-container"><div className="loader"></div><p>Loading Requests...</p></div>;

  return (
    <div className="admin-req-wrapper">
      <header className="admin-req-header">
        <div className="header-info">
          <h2>Business Approval Center</h2>
          <p>Review and verify incoming partner applications ({requests.length} pending)</p>
        </div>
      </header>

      <div className="requests-grid">
        {requests.length === 0 ? (
          <div className="no-data-card">
            <p className="no-data">✨ All caught up! No pending requests.</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req._id} className="req-card">
              <div className="req-card-header">
                <div>
                  <h3>{req.name}</h3>
                  <span className="badge-category">{req.category}</span>
                </div>
                <div className="req-date">{new Date(req.createdAt).toLocaleDateString()}</div>
              </div>
              
              <div className="req-body">
                <div className="info-row">
                  <span className="info-label">Owner:</span>
                  <span className="info-value">{req.owner?.username} ({req.owner?.email})</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Contact:</span>
                  <span className="info-value">{req.contact}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Address:</span>
                  <span className="info-value">{req.address}</span>
                </div>
                <div className="req-desc-box">
                  <label>Business Description:</label>
                  <p>{req.description}</p>
                </div>
              </div>

              <div className="req-footer">
                <button className="btn-approve" onClick={() => handleApprove(req.owner?._id, req.name)}>
                  ✅ Approve Partner
                </button>
                <button className="btn-reject" onClick={() => handleReject(req.name)}>
                  ❌ Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}