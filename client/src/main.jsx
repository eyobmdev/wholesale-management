import React from 'react';
import ReactDOM from 'react-dom/client';
import MainLayout from './components/layout/MainLayout/index.jsx';
import './style.css';

const InitialContent = () => (
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
    <MainLayout>
      <InitialContent />
    </MainLayout>
  </React.StrictMode>
);
