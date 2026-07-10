import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiFileText, FiClock, FiCheckCircle, FiXCircle, FiUsers, FiUserCheck, FiUserPlus, FiActivity } from 'react-icons/fi';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading dashboard...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-layout">
      <AdminNavbar />
      
      <div className="admin-main-content">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>System overview and statistics</p>
        </div>

        <div className="admin-section">
          <h2 className="section-title"><FiFileText /> Reports Overview</h2>
          <div className="admin-stats-grid">
            <div className="admin-stat-card total">
              <div className="stat-icon"><FiFileText /></div>
              <div className="stat-content">
                <h3>Total Reports</h3>
                <p className="stat-number">{stats?.reports?.total || 0}</p>
              </div>
            </div>
            <div className="admin-stat-card pending">
              <div className="stat-icon"><FiClock /></div>
              <div className="stat-content">
                <h3>Pending</h3>
                <p className="stat-number">{stats?.reports?.pending || 0}</p>
              </div>
            </div>
            <div className="admin-stat-card progress">
              <div className="stat-icon"><FiActivity /></div>
              <div className="stat-content">
                <h3>In Progress</h3>
                <p className="stat-number">{stats?.reports?.in_progress || 0}</p>
              </div>
            </div>
            <div className="admin-stat-card resolved">
              <div className="stat-icon"><FiCheckCircle /></div>
              <div className="stat-content">
                <h3>Resolved</h3>
                <p className="stat-number">{stats?.reports?.resolved || 0}</p>
              </div>
            </div>
            <div className="admin-stat-card rejected">
              <div className="stat-icon"><FiXCircle /></div>
              <div className="stat-content">
                <h3>Rejected</h3>
                <p className="stat-number">{stats?.reports?.rejected || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-section">
          <h2 className="section-title"><FiUsers /> Authorities Overview</h2>
          <div className="admin-stats-grid authorities-grid">
            <div className="admin-stat-card auth-total">
              <div className="stat-icon"><FiUsers /></div>
              <div className="stat-content">
                <h3>Total Authorities</h3>
                <p className="stat-number">{stats?.authorities?.total || 0}</p>
              </div>
            </div>
            <div className="admin-stat-card auth-active">
              <div className="stat-icon"><FiUserCheck /></div>
              <div className="stat-content">
                <h3>Active Authorities</h3>
                <p className="stat-number">{stats?.authorities?.active || 0}</p>
              </div>
            </div>
            <div className="admin-stat-card auth-pending">
              <div className="stat-icon"><FiUserPlus /></div>
              <div className="stat-content">
                <h3>Pending Verifications</h3>
                <p className="stat-number">{stats?.authorities?.pending || 0}</p>
                {stats?.authorities?.pending > 0 && (
                  <span className="notification-badge">Requires Action</span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
