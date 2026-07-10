import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiFilter, FiTrash2, FiEye, FiMapPin, FiCalendar } from 'react-icons/fi';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminReports.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
    } catch (err) {
      setError('Failed to fetch reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/admin/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Report deleted.');
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed.');
    }
  };

  const districts = [...new Set(reports.map(r => r.region))].sort();
  const categories = [...new Set(reports.map(r => r.violation_type))].sort();

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesDistrict = districtFilter === 'All' || r.region === districtFilter;
    const matchesCategory = categoryFilter === 'All' || r.violation_type === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesDistrict && matchesCategory;
  });

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Resolved': return 'badge-approved';
      case 'Pending Review': return 'badge-pending';
      case 'In Progress': return 'badge-progress';
      case 'Rejected': return 'badge-rejected';
      default: return 'badge-default';
    }
  };

  return (
    <div className="admin-layout">
      <AdminNavbar />
      
      <div className="admin-main-content">
        <div className="admin-header">
          <h1>Report Management</h1>
          <p>Monitor and manage all violation reports</p>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-toolbar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search descriptions or locations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <FiFilter className="filter-icon" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="filter-box">
            <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
              <option value="All">All Districts</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="filter-box">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="admin-empty-state">No reports found matching the criteria.</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID / Category</th>
                  <th>Location</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(report => (
                  <tr key={report.complaint_id}>
                    <td>
                      <div className="font-medium">{report.violation_type}</div>
                      <span className="small-text text-gray">ID: {report.complaint_id}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FiMapPin className="text-gray" />
                        <span>{report.location_name || report.region}</span>
                      </div>
                    </td>
                    <td>
                      <div className="truncate-text" title={report.description}>
                        {report.description || 'No description provided'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FiCalendar className="text-gray" />
                        <span>{new Date(report.report_date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons-inline">
                        <button onClick={() => handleDelete(report.complaint_id)} className="btn-icon btn-delete-icon" title="Delete">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportManagement;
