import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiLock, FiShield } from 'react-icons/fi';
import './AdminLogin.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/admin/login`, { email, password });
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminInfo', JSON.stringify(response.data.admin));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <FiShield className="admin-login-icon" />
          <h2>Admin Portal</h2>
          <p>Secure Access Only</p>
        </div>

        {error && <div className="admin-login-error">{error}</div>}

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="email">Email</label>
            <div className="admin-input-wrapper">
              <FiMail className="admin-input-icon" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@greenjustice.com"
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Password</label>
            <div className="admin-input-wrapper">
              <FiLock className="admin-input-icon" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="admin-submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
        
        <div className="admin-login-footer">
          <p>Unauthorized access is strictly prohibited.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
