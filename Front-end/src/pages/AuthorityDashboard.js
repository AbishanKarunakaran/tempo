import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ReportCard from "../components/ReportCard";
import { getReports, updateReport, deleteReport as apiDeleteReport, changePassword } from "../api/index";
import "./AuthorityDashboard.css";

const AuthorityDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const authority = JSON.parse(localStorage.getItem("authority") || "{}");

  // Change Password States
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState("");

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setPasswordChangeError("");
    setPasswordChangeSuccess("");

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordChangeError("New password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError("New passwords do not match!");
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordChangeSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => setShowPasswordChange(false), 2000);
    } catch (err) {
      setPasswordChangeError(err.response?.data?.error || "Failed to change password.");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Get logged in authority's district
      const authority = JSON.parse(localStorage.getItem("authority") || "{}");
      const district = authority.region;
      
      const res = await getReports(district);
      const fetchedReports = res.data || [];
      const sortedReports = fetchedReports.sort((a, b) => new Date(b.report_date || b.createdAt) - new Date(a.report_date || a.createdAt));
      setReports(sortedReports);
      setError("");
    } catch (err) {
      setError("Failed to fetch reports. Please try again.");
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    const remark = window.prompt("Enter the mandatory Authority Remark for this status change:");
    if (remark === null) {
      // User cancelled
      return;
    }
    if (!remark.trim()) {
      alert("Authority Remark is mandatory to change status!");
      return;
    }

    const updateId = Number(id);
    const previousReports = [...reports];
    
    // Optimistic Update
    setReports((prev) =>
      prev.map((report) =>
        (Number(report.complaint_id || report.id) === updateId)
          ? { ...report, status }
          : report
      )
    );

    try {
      const auth = JSON.parse(localStorage.getItem("authority") || "{}");
      await updateReport(id, {
        status,
        authority_id: auth.authority_id || auth.id,
        description: remark
      });
      fetchReports(); // Reload to reflect history and remarks
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert("Failed to update status: " + errMsg);
      console.error("Error updating status:", err);
      // Rollback on failure
      setReports(previousReports);
    }
  };

  const deleteReport = async (id) => {
    console.log("Frontend: Requesting delete for ID:", id);
    const delId = Number(id);
    try {
      if (window.confirm("Are you sure you want to delete this report?")) {
        await apiDeleteReport(delId);
        setReports((prev) =>
          prev.filter(
            (report) => 
              Number(report.complaint_id || report.id) !== delId
          )
        );
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert("Failed to delete report: " + errMsg);
      console.error("Error deleting report:", err);
    }
  };

  const viewReportDetails = (id) => {
    const viewId = Number(id);
    const report = reports.find(
      (r) => Number(r.complaint_id || r.id) === viewId
    );
    if (report) {
      alert(`
📋 Report Details

Type: ${report.violation_type || report.categoryLabel || report.category}
Status: ${report.status}
Date: ${new Date(report.report_date || report.createdAt).toLocaleString()}
      `);
    }
  };

  const getReportId = (report) => report.complaint_id || report.id;

  const filteredReports = reports.filter((report) => {
    const matchesFilter = filter === "all" || report.status === filter;
    const searchTarget = (
      (report.violation_type || report.categoryLabel || report.category || "") +
      (report.description || "") +
      (report.locationName || "")
    ).toLowerCase();
    const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    approved: reports.filter((r) => r.status === "approved").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    notViewed: reports.filter((r) => r.status === "Not Viewed").length,
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Authority Dashboard</h1>
          {authority.region && (
            <div className="district-badge">
              <span className="district-icon">📍</span>
              <span>{authority.region} District</span>
              {authority.name && <span className="authority-name">| {authority.name}</span>}
            </div>
          )}
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <h3>{stats.total}</h3>
            <p>Total Reports</p>
          </div>
          <div className="stat-card pending">
            <h3>{stats.notViewed}</h3>
            <p>Not Viewed</p>
          </div>
          <div className="stat-card approved">
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
          <div className="stat-card resolved">
            <h3>{stats.resolved}</h3>
            <p>Resolved</p>
          </div>
        </div>

        <div style={{ marginBottom: '25px', padding: '0 20px' }}>
          <button 
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="btn-secondary"
            style={{ padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', fontWeight: '600', transition: 'all 0.3s' }}
          >
            🔑 {showPasswordChange ? "Hide Change Password" : "Change Password"}
          </button>
          
          {showPasswordChange && (
            <form onSubmit={handlePasswordChangeSubmit} style={{ marginTop: '15px', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', maxWidth: '450px', boxShadow: 'var(--shadow)' }}>
              <h3 style={{ marginBottom: '15px', color: 'var(--text-color)' }}>Change Password</h3>
              {passwordChangeError && <div className="error-message" style={{ marginBottom: '12px' }}>{passwordChangeError}</div>}
              {passwordChangeSuccess && <div style={{ color: '#2e7d32', fontWeight: 'bold', marginBottom: '12px' }}>{passwordChangeSuccess}</div>}
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'var(--text-color)' }}>Current Password</label>
                <input 
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'var(--text-color)' }}>New Password</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'var(--text-color)' }}>Confirm New Password</label>
                <input 
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', backgroundColor: 'var(--primary-color)', color: 'white', cursor: 'pointer', fontWeight: '600' }}>
                Update Password
              </button>
            </form>
          )}
        </div>

        <div className="filters-container">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="Not Viewed">Not Viewed</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="resolved">Resolved</option>
          </select>

          <button onClick={fetchReports} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="reports-list">
          {filteredReports.length === 0 ? (
            <div className="no-reports">
              <p>No reports found.</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <ReportCard
                key={getReportId(report)}
                report={report}
                isAuthority={true}
                onUpdate={(id, status) => updateStatus(id, status)}
                onDelete={(id) => deleteReport(id)}
                onView={(id) => viewReportDetails(id)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default AuthorityDashboard;
