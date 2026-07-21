import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon, FiLogOut, FiMenu, FiX, FiUsers, FiHome, FiGrid } from 'react-icons/fi';
import './AdminNavbar.css';

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="admin-navbar">
      <div className="navbar-container">
        <Link to="/admin/dashboard" className="navbar-brand">
          <span className="brand-icon">🛡️</span> Admin Portal
        </Link>

        <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <Link to="/" className={`nav-item`} onClick={() => setIsOpen(false)}>
            <FiHome className="nav-icon" /> Public Home
          </Link>
          <Link to="/admin/dashboard" className={`nav-item ${isActive('/admin/dashboard')}`} onClick={() => setIsOpen(false)}>
            <FiGrid className="nav-icon" /> Dashboard
          </Link>
          <Link to="/admin/authorities" className={`nav-item ${isActive('/admin/authorities')}`} onClick={() => setIsOpen(false)}>
            <FiUsers className="nav-icon" /> Authorities
          </Link>

        </div>

        <div className="nav-right">
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>
          
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut className="logout-icon" />
            <span>Logout</span>
          </button>

          <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
