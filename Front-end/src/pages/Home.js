import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getPublicStats } from "../api";
import "./Home.css";

const Home = () => {
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
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

  // Calculate resolution rate
  const resolutionRate = stats.total > 0
    ? Math.round((stats.resolved / stats.total) * 100)
    : 0;

  return (
    <>
      <Navbar />
      <div className="home-container">
        <div className="hero-section">
          <h1>Welcome to Report System</h1>
          <p>Report issues in your community and help make your city a better place.</p>
          
          <div className="hero-buttons">
            <Link to="/report" className="btn-primary">
              🚀 Report Violation
            </Link>
            <Link to="/dashboard" className="btn-secondary">
              Go to Dashboard
            </Link>
          </div>
        </div>

        <div className="features-section">
          <h2>How It Works</h2>
          <div className="features-grid">
            <div className="feature-card feature-submit">
              <div className="feature-icon">📝</div>
              <h3>Submit Report</h3>
              <p>Fill out a simple form to report any issue in your area.</p>
            </div>
            
            <div className="feature-card feature-track">
              <div className="feature-icon">👁️</div>
              <h3>Track Status</h3>
              <p>Monitor the status of your reports in real-time.</p>
            </div>
            
            <div className="feature-card feature-resolve">
              <div className="feature-icon">✅</div>
              <h3>Get Resolution</h3>
              <p>Authorities review and resolve reported issues.</p>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-item">
            <h3>{statsLoading ? "—" : stats.total}</h3>
            <p>Reports Submitted</p>
          </div>
          <div className="stat-item">
            <h3>{statsLoading ? "—" : stats.resolved}</h3>
            <p>Reports Resolved</p>
          </div>
          <div className="stat-item">
            <h3>{statsLoading ? "—" : `${resolutionRate}%`}</h3>
            <p>Resolution Rate</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
