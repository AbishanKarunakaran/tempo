import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { trackReport } from "../api";
import "./TrackReport.css";

const TrackReport = () => {
  const [violationId, setViolationId] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!violationId.trim()) return;

    setLoading(true);
    setError("");
    setReportData(null);

    try {
      const response = await trackReport(violationId);
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Report not found or error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="track-container">
        <div className="track-card">
          <h2>Track Report Status</h2>
          <form onSubmit={handleSearch} className="track-form">
            <input
              type="text"
              placeholder="Enter Violation ID (e.g. VR-2026-000001)"
              value={violationId}
              onChange={(e) => setViolationId(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}

          {reportData && reportData.report && (
            <div className="report-details" style={{ marginTop: '20px', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--card-bg)' }}>
              <h3 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Report Details</h3>
              <p style={{ margin: '8px 0' }}><strong>Violation Category:</strong> {reportData.report.violation_type}</p>
              <p style={{ margin: '8px 0' }}><strong>District:</strong> {reportData.report.district}</p>
              <p style={{ margin: '8px 0' }}><strong>Location:</strong> {reportData.report.location_name || 'N/A'}</p>
              <p style={{ margin: '8px 0' }}><strong>Current Status:</strong> <span className={`status ${reportData.report.status.replace(/\s+/g, '-').toLowerCase()}`} style={{ fontWeight: 'bold' }}>{reportData.report.status}</span></p>
              <p style={{ margin: '8px 0' }}><strong>Last Updated:</strong> {
                reportData.updates && reportData.updates.length > 0 
                  ? new Date(reportData.updates[0].timestamp).toLocaleString() 
                  : new Date(reportData.report.report_date).toLocaleString()
              }</p>
              <p style={{ margin: '8px 0' }}><strong>Latest Authority Remark:</strong> {
                reportData.updates && reportData.updates.length > 0 
                  ? reportData.updates[0].description 
                  : 'No remarks yet'
              }</p>
              
              <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Status History</h4>
              <ul className="status-history" style={{ listStyle: 'none', paddingLeft: 0 }}>
                {reportData.updates && reportData.updates.length > 0 ? (
                  reportData.updates.map((update, index) => (
                    <li key={index} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span className="update-date" style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>{new Date(update.timestamp).toLocaleString()}</span>
                      <p style={{ margin: '4px 0' }}><strong>Status:</strong> {update.status}</p>
                      <p style={{ margin: '4px 0' }}><strong>Remark:</strong> {update.description}</p>
                    </li>
                  ))
                ) : (
                  <li style={{ color: '#7f8c8d' }}>No status updates recorded yet.</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TrackReport;
