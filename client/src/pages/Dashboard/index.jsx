import React, { useState } from 'react';
import OverviewTab from './Tabs/Overview/index.jsx';
import SalesTrendTab from './Tabs/SalesTrend/index.jsx';
import ProfitTrendTab from './Tabs/ProfitTrend/index.jsx';
import CustomerInsightsTab from './Tabs/CustomerInsights/index.jsx';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { id: 'sales-trend', label: 'Sales Trend', icon: 'ri-line-chart-line' },
    { id: 'profit-trend', label: 'Profit Trend', icon: 'ri-bar-chart-box-line' },
    { id: 'customers', label: 'Customer Insights', icon: 'ri-team-line' },
  ];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-color)', margin: '0 0 4px 0' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            As of {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} &middot; Currency: ETB
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '0.75rem', 
            backgroundColor: '#ecfdf5', 
            color: '#047857', 
            border: '1px solid #a7f3d0', 
            padding: '6px 12px', 
            borderRadius: '9999px', 
            fontWeight: 500 
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
            Live
          </span>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px', 
        borderBottom: '1px solid var(--card-border)', 
        paddingBottom: '12px',
        overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? 'var(--sidebar-active-bg)' : 'transparent',
              color: activeTab === tab.id ? 'var(--sidebar-active)' : 'var(--text-muted)',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <i className={tab.icon} style={{ fontSize: '1.1rem' }}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'sales-trend' && <SalesTrendTab />}
        {activeTab === 'profit-trend' && <ProfitTrendTab />}
        {activeTab === 'customers' && <CustomerInsightsTab />}
      </div>
    </div>
  );
}
