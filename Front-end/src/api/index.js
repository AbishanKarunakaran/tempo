import axios from "axios";

// Create axios instance with base URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://tempo-production-097c.up.railway.app/api/",
});

// Add token to requests if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth endpoints
export const login = (credentials) => API.post("/authorities/login", credentials);
export const register = (userData) => API.post("/authorities/register", userData);
export const googleLogin = (data) => API.post("/authorities/google-login", data);
export const forgotPassword = (data) => API.post("/authorities/forgot-password", data);
export const resetPassword = (data) => API.post("/authorities/reset-password", data);
export const changePassword = (data) => API.post("/authorities/change-password", data);
export const sendAuthorityOtp = (data) => API.post("/authorities/send-otp", data);
export const verifyAuthorityOtp = (data) => API.post("/authorities/verify-otp", data);

// Report OTP endpoints
export const sendReportOtp = (data) => API.post("/complaints/send-otp", data);
export const verifyReportOtp = (data) => API.post("/complaints/verify-otp", data);

// Report endpoints
export const getReports = (district) => 
  API.get("/authorities/complaints", { params: { district } });
export const getReportById = (id) => API.get(`/complaints/${id}/status`);
export const createReport = (data) => API.post("/complaints", data);
export const getPublicStats = () => API.get("/complaints/stats");
export const updateReport = (id, data) => API.post(`/complaints/${id}/status`, data);
export const deleteReport = (id) => API.post(`/authorities/complaints/${id}/delete`);
export const trackReport = (violationId) => API.get(`/complaints/track/${violationId}`);

// Admin endpoints
export const getPendingAuthorities = () => API.get("/admin/authorities/pending");
export const approveAuthority = (id) => API.post(`/admin/authorities/${id}/approve`);
export const rejectAuthority = (id, reason) => API.post(`/admin/authorities/${id}/reject`, { reason });

export default API;
