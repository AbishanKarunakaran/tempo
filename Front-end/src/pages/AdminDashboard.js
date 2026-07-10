import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getPendingAuthorities, approveAuthority, rejectAuthority } from "../api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);

  const fetchAuthorities = async () => {
    try {
      const response = await getPendingAuthorities();
      setAuthorities(response.data);
    } catch (err) {
      setError("Failed to load pending authorities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthorities();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveAuthority(id);
      fetchAuthorities();
    } catch (err) {
      alert("Failed to approve authority");
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    try {
      await rejectAuthority(id, rejectionReason);
      setRejectingId(null);
      setRejectionReason("");
      fetchAuthorities();
    } catch (err) {
      alert("Failed to reject authority");
    }
  };

  return (
    <>
      <Navbar />
      <div className="admin-container">
        <h2>Admin Dashboard</h2>
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="authorities-list">
            {authorities.length === 0 ? (
              <p>No pending authorities.</p>
            ) : (
              authorities.map(auth => (
                <div key={auth.authority_id} className="authority-card">
                  <h3>{auth.name}</h3>
                  <p><strong>Email:</strong> {auth.email}</p>
                  <p><strong>District:</strong> {auth.region}</p>
                  {auth.registration_certificate && (
                    <p>
                      <strong>Certificate:</strong> 
                      <a href={`http://localhost:5000${auth.registration_certificate}`} target="_blank" rel="noreferrer">
                        View Document
                      </a>
                    </p>
                  )}
                  
                  <div className="actions">
                    <button className="approve-btn" onClick={() => handleApprove(auth.authority_id)}>Approve</button>
                    {rejectingId === auth.authority_id ? (
                      <div className="reject-form">
                        <input 
                          type="text" 
                          placeholder="Rejection reason..." 
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <button className="reject-btn" onClick={() => handleReject(auth.authority_id)}>Confirm Reject</button>
                        <button className="cancel-btn" onClick={() => setRejectingId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button className="reject-btn" onClick={() => setRejectingId(auth.authority_id)}>Reject</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
