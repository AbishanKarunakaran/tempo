import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import PublicHome from "./pages/PublicHome";
import AuthorityHome from "./pages/AuthorityHome";
import AdminHome from "./pages/admin/AdminHome";

import AuthorityDashboard from "./pages/AuthorityDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PublicReport from "./pages/PublicReport";
import TrackReport from "./pages/TrackReport";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PendingAuthorities from "./pages/admin/PendingAuthorities";
import AuthorityManagement from "./pages/admin/AuthorityManagement";
import Footer from "./components/common/Footer";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Role Selection Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Portals */}
        <Route path="/public" element={<PublicHome />} />
        <Route path="/authority" element={<AuthorityHome />} />
        <Route path="/admin" element={<AdminHome />} />

        {/* Public Flow Routes */}
        <Route path="/report" element={<PublicReport />} />
        <Route path="/track" element={<TrackReport />} />

        {/* Authority Flow Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AuthorityDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/admin/authorities/pending" element={<AdminProtectedRoute><PendingAuthorities /></AdminProtectedRoute>} />
        <Route path="/admin/authorities" element={<AdminProtectedRoute><AuthorityManagement /></AdminProtectedRoute>} />
        
        {/* Dynamic routes / Fallbacks */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;