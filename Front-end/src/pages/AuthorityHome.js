import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./AuthorityHome.css";

const AuthorityHome = () => {
  return (
    <>
      <Navbar portal="authority" />
      <div className="authority-home-container">
        
        {/* Hero Section */}
        <div className="authority-hero-section">
          <h1>Authority Management Portal</h1>
          <p>Verified authorities can review reports, update status, and resolve violations.</p>
        </div>

        <div className="authority-content-wrapper">
          {/* Login Card */}
          <div className="authority-login-card">
            <h2>Already a verified authority?</h2>
            <p>Access your dashboard to manage district reports and resolve complaints.</p>
            <Link to="/login" className="btn-feature-authority">
              Login
            </Link>
          </div>

          {/* Workflow Section */}
          <div className="authority-workflow-section">
            <h2>Authority Workflow</h2>
            <div className="auth-timeline-container">
              <div className="auth-timeline-step">
                <div className="auth-step-icon">📝</div>
                <p>Register Authority Account</p>
              </div>
              <div className="auth-timeline-connector">↓</div>
              <div className="auth-timeline-step">
                <div className="auth-step-icon">📄</div>
                <p>Upload Registration Certificate</p>
              </div>
              <div className="auth-timeline-connector">↓</div>
              <div className="auth-timeline-step">
                <div className="auth-step-icon">✉️</div>
                <p>Verify Official Email using OTP</p>
              </div>
              <div className="auth-timeline-connector">↓</div>
              <div className="auth-timeline-step">
                <div className="auth-step-icon">🛡️</div>
                <p>Admin Verification</p>
              </div>
              <div className="auth-timeline-connector">↓</div>
              <div className="auth-timeline-step">
                <div className="auth-step-icon">✅</div>
                <p>Account Approved</p>
              </div>
              <div className="auth-timeline-connector">↓</div>
              <div className="auth-timeline-step">
                <div className="auth-step-icon">📊</div>
                <p>Access Dashboard</p>
              </div>
            </div>
          </div>

          {/* Responsibilities Section */}
          <div className="responsibilities-section">
            <h2>Authority Responsibilities</h2>
            <div className="resp-grid">
              <div className="resp-card">
                <div className="resp-icon">📋</div>
                <p>Review submitted violations</p>
              </div>
              <div className="resp-card">
                <div className="resp-icon">🔍</div>
                <p>Verify uploaded evidence</p>
              </div>
              <div className="resp-card">
                <div className="resp-icon">🔄</div>
                <p>Update report status</p>
              </div>
              <div className="resp-card">
                <div className="resp-icon">💬</div>
                <p>Add authority remarks</p>
              </div>
              <div className="resp-card">
                <div className="resp-icon">✅</div>
                <p>Resolve complaints</p>
              </div>
              <div className="resp-card">
                <div className="resp-icon">📍</div>
                <p>Manage district-based reports</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default AuthorityHome;
