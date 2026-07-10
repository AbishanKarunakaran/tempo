import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "./AdminHome.css";

const AdminHome = () => {
  return (
    <>
      <Navbar portal="admin" />
      <div className="admin-home-container">
        
        {/* Hero Section */}
        <div className="admin-hero-section">
          <h1>Administrator Control Center</h1>
          <p>Manage authorities, verify registrations, oversee reports, and monitor the complete system.</p>
        </div>

        <div className="admin-content-wrapper">
          {/* Login Card */}
          <div className="admin-login-card">
            <h2>Authorized Administrators Only</h2>
            <p>Secure portal for system administration and comprehensive oversight.</p>
            <Link to="/admin/login" className="btn-feature-admin">
              Admin Login
            </Link>
          </div>

          {/* Workflow Section */}
          <div className="admin-workflow-section">
            <h2>Administrator Workflow</h2>
            <div className="admin-timeline-container">
              <div className="admin-timeline-step">
                <div className="admin-step-icon">📋</div>
                <p>Review new Authority registrations.</p>
              </div>
              <div className="admin-timeline-connector">↓</div>
              <div className="admin-timeline-step">
                <div className="admin-step-icon">📄</div>
                <p>View uploaded registration certificates.</p>
              </div>
              <div className="admin-timeline-connector">↓</div>
              <div className="admin-timeline-step">
                <div className="admin-step-icon">⚖️</div>
                <p>Approve or Reject Authority registration.</p>
              </div>
              <div className="admin-timeline-connector">↓</div>
              <div className="admin-timeline-step">
                <div className="admin-step-icon">📧</div>
                <p>Authority receives email notification.</p>
              </div>
              <div className="admin-timeline-connector">↓</div>
              <div className="admin-timeline-step">
                <div className="admin-step-icon">📈</div>
                <p>Monitor reports and system analytics.</p>
              </div>
            </div>
          </div>

          {/* Responsibilities Section */}
          <div className="responsibilities-section">
            <h2>Administrator Responsibilities</h2>
            <div className="admin-resp-grid">
              <div className="admin-resp-card">
                <div className="admin-resp-icon">✅</div>
                <p>Verify authority registrations</p>
              </div>
              <div className="admin-resp-card">
                <div className="admin-resp-icon">👍</div>
                <p>Approve or reject authority accounts</p>
              </div>
              <div className="admin-resp-card">
                <div className="admin-resp-icon">📄</div>
                <p>Review uploaded certificates</p>
              </div>
              <div className="admin-resp-card">
                <div className="admin-resp-icon">📂</div>
                <p>Manage all reports</p>
              </div>
              <div className="admin-resp-card">
                <div className="admin-resp-icon">📊</div>
                <p>View analytics</p>
              </div>
              <div className="admin-resp-card">
                <div className="admin-resp-icon">👥</div>
                <p>Manage authorities</p>
              </div>
              <div className="admin-resp-card">
                <div className="admin-resp-icon">🌐</div>
                <p>Monitor overall system health</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminHome;
