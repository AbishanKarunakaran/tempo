import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar"; 
import LocationPicker from "../components/LocationPicker";
import { useSubmitReport } from '../hooks/useSubmitReport';
import { FormField } from '../components/common/FormField';
import "../pages/PublicReport.css";

const violationCategories = [
  { value: "", label: "Select Violation Type" },
  { value: "illegal-dumping", label: "♻️ Illegal Dumping" },
  { value: "water-pollution", label: "💧 Water Pollution" },
  { value: "air-pollution", label: "💨 Air Pollution" },
  { value: "deforestation", label: "🌲 Deforestation" },
  { value: "wildlife", label: "🦁 Wildlife Poaching" },
  { value: "noise", label: "🔊 Noise Pollution" },
  { value: "chemical", label: "☢️ Chemical Waste" },
  { value: "landfill", label: "🗑️ Illegal Landfill" },
  { value: "other", label: "❓ Other" },
];

const PublicReport = () => {
  const { 
    formData, setFormData, mediaFiles, loading, success, violationId,
    otp, setOtp, otpSent, emailVerified, sendOtpLoading, verifyOtpLoading,
    handleSendOtp, handleVerifyOtp,
    handleChange, handleMediaChange, removeMedia, handleSubmit 
  } = useSubmitReport();

  if (success) {
    return (
      <>
        <Navbar />
        <div className="success-container">
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h2>Report Submitted Successfully!</h2>
            <p>Thank you for helping protect the environment.</p>
            <div className="violation-id-box">
              <p>Your unique Violation ID is:</p>
              <h3 className="violation-id-display">{violationId}</h3>
              <p className="warning-text">⚠️ Please copy and save this ID for future status tracking.</p>
            </div>
            <div style={{ marginTop: '20px' }}>
              <Link to="/" className="btn-primary" style={{ display: 'inline-block', padding: '10px 20px', borderRadius: '5px', backgroundColor: 'var(--primary-color)', color: 'white' }}>
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="report-container">
        <div className="report-card">
          <div className="report-header">
            <h1>🌍 Report Environmental Violation</h1>
            <p>Help us protect our environment by reporting violations.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <FormField label="Violation Type" required>
              <select name="category" value={formData.category} onChange={handleChange} required>
                {violationCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </FormField>

            <FormField label="📍 Location" required>
              <LocationPicker formData={formData} setFormData={setFormData} />
              {formData.latitude && (
                <p className="coordinates">
                  📌 Lat: {formData.latitude.toFixed(6)}, Lng: {formData.longitude.toFixed(6)}
                </p>
              )}
              <input
                type="text"
                name="locationName"
                value={formData.locationName}
                onChange={handleChange}
                placeholder="Enter location name / landmark (optional)"
                className="location-input"
              />
            </FormField>

            <FormField label="📷 Photo/Video Evidence (Max 5)">
              <div className="upload-container">
                <input
                  type="file" id="media-upload" required onChange={handleMediaChange}
                  accept="image/*,video/*" multiple disabled={mediaFiles.length >= 5}
                />
                <label htmlFor="media-upload" className="upload-label">
                  <span className="upload-icon">📁</span>
                  <span>Click to upload photos/videos</span>
                </label>
              </div>

              {mediaFiles.length > 0 && (
                <div className="media-preview">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="media-item">
                      {file.type.startsWith("image/") ? (
                        <img src={file.data} alt="preview" />
                      ) : (
                        <div className="video-preview">🎬 <br /> Video</div>
                      )}
                      <button type="button" onClick={() => removeMedia(index)} className="remove-btn">✕</button>
                      <span className="file-name">{file.name.substring(0, 12)}...</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="media-count">{mediaFiles.length}/5 files selected</p>
            </FormField>

            <FormField label="📧 Email Address (Optional - Enter to receive tracking notifications)">
              <input
                type="email"
                name="user_email"
                value={formData.user_email}
                onChange={handleChange}
                placeholder="Enter your email address"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-color)',
                  outline: 'none',
                  fontSize: '1rem',
                  marginBottom: '10px'
                }}
              />
              {formData.user_email && (
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                      disabled={sendOtpLoading}
                    >
                      {sendOtpLoading ? "Sending OTP..." : "📩 Send Verification OTP"}
                    </button>
                  )}
                  {otpSent && !emailVerified && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--input-bg)',
                          color: 'var(--text-color)',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: 'var(--primary-color)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                        disabled={verifyOtpLoading}
                      >
                        {verifyOtpLoading ? "Verifying..." : "Verify OTP"}
                      </button>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        style={{
                          padding: '10px 12px',
                          backgroundColor: '#757575',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Resend
                      </button>
                    </div>
                  )}
                  {emailVerified && (
                    <span style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ✅ Email Verified
                    </span>
                  )}
                </div>
              )}
            </FormField>

            <FormField label="📝 Description (Optional)">
              <textarea
                name="description" value={formData.description} onChange={handleChange}
                placeholder="Describe the violation..." rows="4"
              />
            </FormField>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Submitting..." : "🚀 Submit Report"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PublicReport;
