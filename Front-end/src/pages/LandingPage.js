import React from "react";
import { Link } from "react-router-dom";
import { FiUser, FiBriefcase, FiShield } from "react-icons/fi";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="landing-header">
        <h1>Environmental Violation Reporting System</h1>
        <p>Please select your role to continue.</p>
      </div>

      <div className="role-cards-container">
        <div className="role-card">
          <div className="role-icon-wrapper public-icon">
            <FiUser className="role-icon" />
          </div>
          <h2>Public User</h2>
          <p>Report violations, upload evidence, and track complaint status.</p>
          <Link to="/public" className="role-btn public-btn">
            Continue as Public User
          </Link>
        </div>

        <div className="role-card">
          <div className="role-icon-wrapper authority-icon">
            <FiBriefcase className="role-icon" />
          </div>
          <h2>Authority</h2>
          <p>Review reports, manage violations, and update complaint status.</p>
          <Link to="/authority" className="role-btn authority-btn">
            Continue as Authority
          </Link>
        </div>

        <div className="role-card">
          <div className="role-icon-wrapper admin-icon">
            <FiShield className="role-icon" />
          </div>
          <h2>Administrator</h2>
          <p>Verify authorities, manage reports, monitor analytics, and administer the entire system.</p>
          <Link to="/admin" className="role-btn admin-btn">
            Continue as Administrator
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
