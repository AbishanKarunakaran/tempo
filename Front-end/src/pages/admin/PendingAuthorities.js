import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEye, FiCheck, FiX, FiSearch } from 'react-icons/fi';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminAuthorities.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PendingAuthorities = () => {
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Rejection Modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAuthId, setSelectedAuthId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPendingAuthorities();
  }, []);

  const fetchPendingAuthorities = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/authorities/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuthorities(response.data);
    } catch (err) {
      setError('Failed to fetch pending authorities.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this authority?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API_URL}/admin/authorities/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Authority approved successfully.');
      fetchPendingAuthorities();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve authority.');
    }
  };

  const openRejectModal = (id) => {
    setSelectedAuthId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API_URL}/admin/authorities/${selectedAuthId}/reject`, 
        { reason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Authority rejected successfully.');
      setShowRejectModal(false);
      fetchPendingAuthorities();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject authority.');
    }
  };

  const filteredAuthorities = authorities.filter(auth => 
    auth.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    auth.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    auth.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-layout">
      <AdminNavbar />
      
      <div className="admin-main-content">
        <div className="admin-header">
          <h1>Pending Authority Registrations</h1>
          <p>Review and approve new authority accounts</p>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-toolbar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, email, or district..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">Loading pending requests...</div>
        ) : filteredAuthorities.length === 0 ? (
          <div className="admin-empty-state">
            <p>No pending authority registrations found.</p>
          </div>
        ) : (
          <div className="authorities-grid-view">
            {filteredAuthorities.map(auth => (
              <div key={auth.authority_id} className="authority-card">
                <div className="authority-card-header">
                  <h3>{auth.name}</h3>
                  <span className="badge badge-pending">Pending</span>
                </div>
                <div className="authority-card-body">
                  <p><strong>Email:</strong> {auth.email}</p>
                  <p><strong>District:</strong> {auth.region}</p>
                  <p><strong>Reg. Date:</strong> {new Date(auth.created_at).toLocaleDateString()}</p>
                </div>
                <div className="authority-card-actions">
                  {auth.registration_certificate && (
                    <a 
                      href={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${auth.registration_certificate}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-view"
                    >
                      <FiEye /> View Certificate
                    </a>
                  )}
                  <button onClick={() => handleApprove(auth.authority_id)} className="btn-approve">
                    <FiCheck /> Approve
                  </button>
                  <button onClick={() => openRejectModal(auth.authority_id)} className="btn-reject">
                    <FiX /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <h2>Reject Authority Registration</h2>
              <form onSubmit={handleReject}>
                <div className="form-group">
                  <label>Reason for Rejection *</label>
                  <select 
                    value={rejectReason} 
                    onChange={(e) => setRejectReason(e.target.value)}
                    required
                  >
                    <option value="">Select a reason...</option>
                    <option value="Invalid Registration Certificate">Invalid Registration Certificate</option>
                    <option value="Information Mismatch">Information Mismatch</option>
                    <option value="Unclear Document">Unclear Document</option>
                    <option value="Insufficient Verification Details">Insufficient Verification Details</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowRejectModal(false)} className="btn-cancel">Cancel</button>
                  <button type="submit" className="btn-confirm-reject">Confirm Rejection</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PendingAuthorities;
