import React from 'react';
import { OverdueCustomersList } from '../OverdueCustomersList.jsx';
import { useDashboardStats } from '../../../services/dashboardService.js';

export default function CustomerInsightsTab() {
  const { data: stats } = useDashboardStats();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ 
        backgroundColor: 'var(--card-bg)', 
        borderRadius: '16px', 
        padding: '24px', 
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--shadow-sm)',
        minHeight: '600px'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Customer Insights & Receivables</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
          Detailed view of your customers with outstanding balances and stock alerts.
        </p>

        <div style={{ maxWidth: '800px' }}>
          <OverdueCustomersList data={stats?.overdue_customers} />
        </div>
      </div>
    </div>
  );
}
