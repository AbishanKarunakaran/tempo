import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiFilter, FiLock, FiUnlock, FiTrash2, FiEye, FiCheck, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminAuthorities.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuthorityManagement = () => {
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    pending: true,
    approved: true,
    rejected: true
  });

  // Rejection Modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAuthId, setSelectedAuthId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchAuthorities();
  }, []);

  const fetchAuthorities = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/authorities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuthorities(response.data);
    } catch (err) {
      setError('Failed to fetch authorities.');
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
      fetchAuthorities();
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
      fetchAuthorities();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject authority.');
    }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm('Are you sure you want to suspend this authority?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(`${API_URL}/admin/authorities/${id}/suspend`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Authority suspended.');
      fetchAuthorities();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed.');
    }
  };

  const handleReactivate = async (id) => {
    if (!window.confirm('Are you sure you want to reactivate this authority?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(`${API_URL}/admin/authorities/${id}/reactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Authority reactivated.');
      fetchAuthorities();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this authority? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/admin/authorities/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Authority deleted.');
      fetchAuthorities();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed.');
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Approved': return 'badge-approved';
      case 'Pending Verification': return 'badge-pending';
      case 'Suspended': return 'badge-suspended';
      case 'Rejected': return 'badge-rejected';
      default: return 'badge-default';
    }
  };

  const districts = [...new Set(authorities.map(a => a.region))].sort();

  const filteredAuthorities = authorities.filter(auth => {
    const matchesSearch = auth.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          auth.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = districtFilter === 'All' || auth.region === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  const pendingAuths = filteredAuthorities.filter(a => a.status === 'Pending Verification');
  const approvedAuths = filteredAuthorities.filter(a => a.status === 'Approved' || a.status === 'Suspended');
  const rejectedAuths = filteredAuthorities.filter(a => a.status === 'Rejected');

  const renderTable = (auths, type) => {
    if (auths.length === 0) return <div className="admin-empty-state">No authorities found in this category.</div>;

    return (
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>District</th>
              <th>Status</th>
              <th>Reg. Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {auths.map(auth => (
              <tr key={auth.authority_id}>
                <td>
                  <div className="font-medium">{auth.name}</div>
                  {auth.google_id && <span className="small-text text-gray">(Google Auth)</span>}
                </td>
                <td>{auth.email}</td>
                <td>{auth.region}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(auth.status)}`}>
                    {auth.status}
                  </span>
                </td>
                <td>{new Date(auth.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons-inline">
                    {auth.registration_certificate && (
                      <a 
                        href={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${auth.registration_certificate}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-view-cert"
                      >
                        <FiEye /> View Certificate
                      </a>
                    )}
                    {type === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(auth.authority_id)} className="btn-icon btn-reactivate-icon" title="Approve">
                          <FiCheck />
                        </button>
                        <button onClick={() => openRejectModal(auth.authority_id)} className="btn-icon btn-delete-icon" title="Reject">
                          <FiX />
                        </button>
                      </>
                    )}
                    {type === 'approved' && auth.status === 'Approved' && (
                      <button onClick={() => handleSuspend(auth.authority_id)} className="btn-icon btn-suspend-icon" title="Suspend">
                        <FiLock />
                      </button>
                    )}
                    {type === 'approved' && auth.status === 'Suspended' && (
                      <button onClick={() => handleReactivate(auth.authority_id)} className="btn-icon btn-reactivate-icon" title="Reactivate">
                        <FiUnlock />
                      </button>
                    )}
                    {(type === 'approved' || type === 'rejected') && (
                      <button onClick={() => handleDelete(auth.authority_id)} className="btn-icon btn-delete-icon" title="Delete">
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="admin-layout">
      <AdminNavbar />
      
      <div className="admin-main-content">
        <div className="admin-header">
          <h1>Authority Management</h1>
          <p>Manage all registered authority accounts</p>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-toolbar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <FiFilter className="filter-icon" />
            <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
              <option value="All">All Districts</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">Loading authorities...</div>
        ) : (
          <div className="authorities-sections">
            {/* Pending Authorities Section */}
            <div className="authority-section">
              <div className="section-header" onClick={() => toggleSection('pending')}>
                <div className="section-title-wrapper">
                  <h2>Pending Authorities</h2>
                  <span className="section-badge badge-pending">{pendingAuths.length}</span>
                </div>
                {expandedSections.pending ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              {expandedSections.pending && renderTable(pendingAuths, 'pending')}
            </div>

            {/* Approved Authorities Section */}
            <div className="authority-section">
              <div className="section-header" onClick={() => toggleSection('approved')}>
                <div className="section-title-wrapper">
                  <h2>Approved Authorities</h2>
                  <span className="section-badge badge-approved">{approvedAuths.length}</span>
                </div>
                {expandedSections.approved ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              {expandedSections.approved && renderTable(approvedAuths, 'approved')}
            </div>

            {/* Rejected Authorities Section */}
            <div className="authority-section">
              <div className="section-header" onClick={() => toggleSection('rejected')}>
                <div className="section-title-wrapper">
                  <h2>Rejected Authorities</h2>
                  <span className="section-badge badge-rejected">{rejectedAuths.length}</span>
                </div>
                {expandedSections.rejected ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              {expandedSections.rejected && renderTable(rejectedAuths, 'rejected')}
            </div>
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

export default AuthorityManagement;
