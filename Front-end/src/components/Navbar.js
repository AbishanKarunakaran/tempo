import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { FiSun, FiMoon } from "react-icons/fi";
import "./Navbar.css";

const Navbar = ({ portal }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const token = localStorage.getItem("token");
  const authority = JSON.parse(localStorage.getItem("authority") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authority");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🚨 Report System</Link>
      </div>
      
      <div className="navbar-links">
        {/* Home link always goes to the Landing Page now, or we can make it go to specific home */}
        <Link to="/">Home</Link>

        {portal === "public" && (
          <>
            <Link to="/track">Track Report Status</Link>
            <Link to="/report" className="report-link">
              🚀 Report Violation
            </Link>
          </>
        )}

        {portal === "authority" && !token && (
          <Link to="/login" className="report-link">
            Login
          </Link>
        )}

        {portal === "admin" && (
          <Link to="/admin/login" className="report-link">
            Admin Login
          </Link>
        )}

        {/* Generic authenticated state for non-specific portal pages */}
        {!portal && token && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <span className="user-name">Welcome, {authority.name || "User"}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        )}

        {!portal && !token && (
           <Link to="/login">Login</Link>
        )}

        <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Theme">
          {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;