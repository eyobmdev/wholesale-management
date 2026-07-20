import React, { useState } from 'react';
import OverviewTab from './Tabs/Overview/index.jsx';
import SalesTrendTab from './Tabs/SalesTrend/index.jsx';
import ProfitTrendTab from './Tabs/ProfitTrend/index.jsx';
import CustomerInsightsTab from './Tabs/CustomerInsights/index.jsx';
import StockOverviewTab from './Tabs/StockOverview/index.jsx';
import PaymentMethodsTab from './Tabs/PaymentMethods/index.jsx';
import ProductPerformanceTab from './Tabs/ProductPerformance/index.jsx';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { id: 'sales-trend', label: 'Sales Trend', icon: 'ri-line-chart-line' },
    { id: 'profit-trend', label: 'Profit Trend', icon: 'ri-bar-chart-box-line' },
    { id: 'customers', label: 'Customer Insights', icon: 'ri-team-line' },
    { id: 'stock-overview', label: 'Stock Overview', icon: 'ri-box-3-line' },
    { id: 'product-performance', label: 'Product Performance', icon: 'ri-line-chart-line' },
    { id: 'payment-methods', label: 'Payment Methods', icon: 'ri-bank-card-line' },
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
        {activeTab === 'stock-overview' && <StockOverviewTab />}
        {activeTab === 'product-performance' && <ProductPerformanceTab />}
        {activeTab === 'payment-methods' && <PaymentMethodsTab />}
      </div>
    </div>
  );
}
