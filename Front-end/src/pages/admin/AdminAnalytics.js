import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiPieChart, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminAnalytics.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
const STATUS_COLORS = {
  'Resolved': '#2ecc71',
  'In Progress': '#9b59b6',
  'Pending Review': '#f1c40f',
  'Rejected': '#e74c3c'
};

const AdminAnalytics = () => {
  const [reports, setReports] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const [reportsRes, authRes] = await Promise.all([
        axios.get(`${API_URL}/admin/reports`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/authorities`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setReports(reportsRes.data);
      setAuthorities(authRes.data);
    } catch (err) {
      setError('Failed to fetch analytics data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading analytics...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  // Process data for charts
  const reportsByDistrict = reports.reduce((acc, curr) => {
    acc[curr.region] = (acc[curr.region] || 0) + 1;
    return acc;
  }, {});
  const districtData = Object.keys(reportsByDistrict).map(key => ({ name: key, count: reportsByDistrict[key] }));

  const reportsByCategory = reports.reduce((acc, curr) => {
    acc[curr.violation_type] = (acc[curr.violation_type] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.keys(reportsByCategory).map(key => ({ name: key, count: reportsByCategory[key] }));

  const reportsByStatus = reports.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.keys(reportsByStatus).map(key => ({ name: key, value: reportsByStatus[key] }));

  return (
    <div className="admin-layout">
      <AdminNavbar />
      
      <div className="admin-main-content">
        <div className="admin-header">
          <h1>Analytics & Reports</h1>
          <p>Visual insights into system usage and performance</p>
        </div>

        <div className="analytics-grid">
          {/* Reports by Category - Pie Chart */}
          <div className="analytics-card">
            <h3 className="analytics-title"><FiPieChart /> Reports by Category</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reports by Status - Pie Chart */}
          <div className="analytics-card">
            <h3 className="analytics-title"><FiPieChart /> Resolution Status</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reports by District - Bar Chart */}
          <div className="analytics-card full-width">
            <h3 className="analytics-title"><FiBarChart2 /> Reports by District</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={districtData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3498db">
                    {districtData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
