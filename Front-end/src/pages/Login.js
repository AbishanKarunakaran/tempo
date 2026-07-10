import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { login, forgotPassword, resetPassword, register } from "../api";
import "./Login.css";

const SRI_LANKAN_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", 
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", 
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", 
  "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya", 
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // Forgot Password States
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotSendLoading, setForgotSendLoading] = useState(false);
  const [forgotResetLoading, setForgotResetLoading] = useState(false);

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      const { token, authority } = response.data;
      localStorage.setItem("token", token);
      if (authority) {
        localStorage.setItem("authority", JSON.stringify(authority));
      }

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };


  // Send Forgot Password OTP
  const handleSendForgotOtp = async () => {
    if (!forgotEmail) return setError("Please enter your email address!");
    setForgotSendLoading(true);
    setError("");
    try {
      await forgotPassword({ email: forgotEmail });
      setForgotOtpSent(true);
      alert("OTP sent to your email!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset OTP.");
    } finally {
      setForgotSendLoading(false);
    }
  };

  // Reset Password using OTP
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!forgotOtp) return setError("Please enter OTP!");
    
    const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
    if (!allRequirementsMet) return setError("Password does not meet requirements!");

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match!");
      return;
    }

    setForgotResetLoading(true);
    try {
      await resetPassword({
        email: forgotEmail,
        password: newPassword,
        otp: forgotOtp
      });
      alert("Password reset successfully! You can now login.");
      setIsForgotMode(false);
      setForgotEmail("");
      setForgotOtp("");
      setForgotOtpSent(false);
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setForgotResetLoading(false);
    }
  };


  // Render Forgot Password workflow
  if (isForgotMode) {
    return (
      <>
        <Navbar />
        <div className="login-container">
          <div className="login-card">
            <h2>Forgot Password</h2>
            <p className="login-subtitle">Reset your authority account password.</p>
            {error && <div className="error-message">{error}</div>}
            
            {!forgotOtpSent ? (
              <div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <button onClick={handleSendForgotOtp} className="login-btn" disabled={forgotSendLoading}>
                  {forgotSendLoading ? "Sending OTP..." : "Send Verification OTP"}
                </button>
                <button onClick={() => setIsForgotMode(false)} className="btn-secondary" style={{ width: '100%', marginTop: '10px' }}>
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit}>
                <div className="form-group">
                  <label>Verification OTP</label>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      checkPasswordStrength(e.target.value);
                    }}
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
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="login-btn" disabled={forgotResetLoading}>
                  {forgotResetLoading ? "Resetting Password..." : "Reset Password"}
                </button>
                <button type="button" onClick={() => setForgotOtpSent(false)} className="btn-secondary" style={{ width: '100%', marginTop: '10px' }}>
                  Back
                </button>
              </form>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="login-container">
        <div className="login-card">
          <h2>Authority Login</h2>
          <p className="login-subtitle">Sign in to access your dashboard.</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
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
                placeholder="Enter your password"
                required
              />
            </div>

            <div style={{ textAlign: "right", marginBottom: "1.5rem" }}>
              <button
                type="button"
                onClick={() => setIsForgotMode(true)}
                style={{ background: "none", border: "none", color: "var(--primary-color)", cursor: "pointer", fontSize: "0.9rem" }}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>



          <p className="register-link" style={{ marginTop: "20px" }}>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
