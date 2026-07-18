import React from 'react';
import { SalesTrendChart } from '../SalesTrendChart.jsx';

export default function SalesTrendTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ 
        backgroundColor: 'var(--card-bg)', 
        borderRadius: '16px', 
        padding: '24px', 
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Sales & Profit Trend</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
          Deep dive into your revenue and profit margins over time.
        </p>

        <div style={{ minHeight: '500px' }}>
          <SalesTrendChart />
        </div>
      </div>
    </div>
  );
}
