import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getPublicStats } from "../api";
import "./PublicHome.css";

const PublicHome = () => {
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, in_progress: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getPublicStats();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <Navbar portal="public" />
      <div className="public-home-container">
        
        {/* Hero Section */}
        <div className="public-hero-section">
          <h1>Report Violations Easily</h1>
          <p>Help build a safer community by reporting violations with location and evidence.</p>
        </div>

        <div className="public-content-wrapper">
          {/* Feature Card */}
          <div className="public-feature-card">
            <h2>Take Action Today</h2>
            <ul className="feature-list">
              <li>📍 Select violation location on the map</li>
              <li>📸 Upload photos or videos as evidence</li>
              <li>📝 Submit detailed violation information</li>
              <li>🔍 Track your complaint status instantly</li>
            </ul>
            <Link to="/report" className="btn-feature-primary">
              🚀 Report Violation Now
            </Link>
          </div>

          {/* Workflow Section */}
          <div className="workflow-section">
            <h2>How This Website Works</h2>
            <div className="timeline-container">
              <div className="timeline-step">
                <div className="step-icon">📝</div>
                <div className="step-content">
                  <h3>Step 1</h3>
                  <p>Submit Report</p>
                </div>
              </div>
              <div className="timeline-connector">↓</div>
              <div className="timeline-step">
                <div className="step-icon">👨‍⚖️</div>
                <div className="step-content">
                  <h3>Step 2</h3>
                  <p>Authority Reviews</p>
                </div>
              </div>
              <div className="timeline-connector">↓</div>
              <div className="timeline-step">
                <div className="step-icon">⚡</div>
                <div className="step-content">
                  <h3>Step 3</h3>
                  <p>Action Taken</p>
                </div>
              </div>
              <div className="timeline-connector">↓</div>
              <div className="timeline-step">
                <div className="step-icon">🔍</div>
                <div className="step-content">
                  <h3>Step 4</h3>
                  <p>Track Status using Violation ID</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real Statistics Section */}
        <div className="statistics-section">
          <h2>Real-Time System Impact</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{statsLoading ? "—" : stats.total}</div>
              <div className="stat-label">Total Reports Submitted</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{statsLoading ? "—" : stats.in_progress || 0}</div>
              <div className="stat-label">Reports In Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{statsLoading ? "—" : stats.resolved}</div>
              <div className="stat-label">Resolved Reports</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">25+</div>
              <div className="stat-label">Active Authorities</div>
            </div>
            <div className="stat-card monitoring">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Monitoring System</div>
            </div>
          </div>
        </div>
        
      </div>
    </>
  );
};

export default PublicHome;
