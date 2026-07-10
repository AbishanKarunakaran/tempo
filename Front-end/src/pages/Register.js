import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { register, sendAuthorityOtp, verifyAuthorityOtp } from '../api';
import "./Register.css";

const SRI_LANKAN_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", 
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", 
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", 
  "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya", 
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];


const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    district: "",
  });
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP Verification States
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);

  // Password Requirements States
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const checkPasswordStrength = (pass) => {
    setPasswordRequirements({
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "password") {
      checkPasswordStrength(value);
    }
    if (name === "email") {
      setEmailVerified(false);
      setOtpSent(false);
      setOtp("");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setCertificate(e.target.files[0]);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError("Please enter a valid email address first!");
      return;
    }
    setSendOtpLoading(true);
    setError("");
    try {
      await sendAuthorityOtp({ email: formData.email, purpose: "REGISTRATION" });
      setOtpSent(true);
      alert("Verification OTP sent to your email!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send verification OTP.");
    } finally {
      setSendOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP sent to your email!");
      return;
    }
    setVerifyOtpLoading(true);
    setError("");
    try {
      await verifyAuthorityOtp({ email: formData.email, otp, purpose: "REGISTRATION" });
      setEmailVerified(true);
      alert("Email verified successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or expired OTP.");
    } finally {
      setVerifyOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailVerified) {
      setError("Please verify your email using OTP first!");
      return;
    }

    if (!certificate) {
      setError("Registration Certificate upload is mandatory!");
      return;
    }

    const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
    if (!allRequirementsMet) {
      setError("Password does not meet all strength requirements!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      // Use FormData for file upload support
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("region", formData.district);
      submitData.append("registration_certificate", certificate);

      await register(submitData);

      alert("Registration successful! Account status is 'Pending Verification'. Please wait for Admin approval.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="register-container">
        <div className="register-card">
          <h2>Create Account</h2>
          <p className="register-subtitle">Join us to report issues in your community.</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="district">District</label>
              <select
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
              >
                <option value="">Select your district</option>
                {SRI_LANKAN_DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  style={{ flex: 1 }}
                  disabled={emailVerified}
                />
                {!emailVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendOtpLoading}
                    style={{ padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    {sendOtpLoading ? "Sending..." : "Send OTP"}
                  </button>
                )}
              </div>
              {otpSent && !emailVerified && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyOtpLoading}
                    style={{ padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    {verifyOtpLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              )}
              {emailVerified && (
                <span style={{ color: 'green', fontSize: '0.9rem', display: 'block', marginTop: '4px' }}>
                  ✅ Email Verified
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="certificate">Registration Certificate (Mandatory - PDF, JPG, PNG)</label>
              <input
                type="file"
                id="certificate"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                required
                style={{ padding: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
              <div style={{ marginTop: '8px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ color: passwordRequirements.length ? '#2e7d32' : '#d32f2f', fontWeight: '500' }}>
                  {passwordRequirements.length ? '✓' : '✗'} Minimum 8 characters
                </div>
                <div style={{ color: passwordRequirements.uppercase ? '#2e7d32' : '#d32f2f', fontWeight: '500' }}>
                  {passwordRequirements.uppercase ? '✓' : '✗'} At least one uppercase letter (A-Z)
                </div>
                <div style={{ color: passwordRequirements.lowercase ? '#2e7d32' : '#d32f2f', fontWeight: '500' }}>
                  {passwordRequirements.lowercase ? '✓' : '✗'} At least one lowercase letter (a-z)
                </div>
                <div style={{ color: passwordRequirements.number ? '#2e7d32' : '#d32f2f', fontWeight: '500' }}>
                  {passwordRequirements.number ? '✓' : '✗'} At least one number (0-9)
                </div>
                <div style={{ color: passwordRequirements.specialChar ? '#2e7d32' : '#d32f2f', fontWeight: '500' }}>
                  {passwordRequirements.specialChar ? '✓' : '✗'} At least one special character (!@#$%^&* etc.)
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <p className="login-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
