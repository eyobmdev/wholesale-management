import React from 'react';
import { useDashboardStats } from '../../services/dashboardService.js';

export default function Dashboard() {
  const { data: stats, isLoading, isError } = useDashboardStats();

  if (isError) {
    return <div style={{ padding: '32px', textAlign: 'center', color: '#ef4444' }}>Failed to load dashboard stats.</div>;
  }

  return (
    <>
      <div className="welcome-card">
        <div className="card-icon"><i className="ri-hand-coin-line"></i></div>
        <div className="card-text">
          <h2>Welcome back, Admin</h2>
          <p>Here is what's happening with your wholesale operations today.</p>
        </div>
      </div>
      
      {isLoading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <i className="ri-loader-4-line" style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: '2rem', marginBottom: '16px' }}></i>
          <p>Loading your dashboard...</p>
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><i className="ri-money-dollar-circle-line"></i></div>
            <div className="stat-details">
              <h3>Total Sales</h3>
              <p className="value">${stats.totalSales.toLocaleString()}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="ri-shopping-bag-3-line"></i></div>
            <div className="stat-details">
              <h3>Orders</h3>
              <p className="value">{stats.orders.toLocaleString()}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="ri-group-line"></i></div>
            <div className="stat-details">
              <h3>Customers</h3>
              <p className="value">{stats.customers.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
