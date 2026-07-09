import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout/index.jsx';
import Settings from './pages/Settings/index.jsx';
import './style.css';

const DashboardContent = () => (
  <>
    <div className="welcome-card">
      <div className="card-icon"><i className="ri-hand-coin-line"></i></div>
      <div className="card-text">
        <h2>Welcome back, Admin</h2>
        <p>Here is what's happening with your wholesale operations today.</p>
      </div>
    </div>
    
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon"><i className="ri-money-dollar-circle-line"></i></div>
        <div className="stat-details">
          <h3>Total Sales</h3>
          <p className="value">$24,500</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon"><i className="ri-shopping-bag-3-line"></i></div>
        <div className="stat-details">
          <h3>Orders</h3>
          <p className="value">142</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon"><i className="ri-group-line"></i></div>
        <div className="stat-details">
          <h3>Customers</h3>
          <p className="value">89</p>
        </div>
      </div>
    </div>
  </>
);

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardContent />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<div style={{padding: '32px', textAlign: 'center'}}>
            <h2>Page not implemented yet</h2>
            <p style={{color: 'var(--text-muted)', marginTop: '16px'}}>Select Dashboard or Settings from the sidebar.</p>
          </div>} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  </React.StrictMode>
);
