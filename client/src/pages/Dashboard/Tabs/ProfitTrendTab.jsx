import React from 'react';
import { MonthlyComparison } from '../MonthlyComparison.jsx';
import { useDashboardStats } from '../../../services/dashboardService.js';

export default function ProfitTrendTab() {
  const { data: stats } = useDashboardStats();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ 
        backgroundColor: 'var(--card-bg)', 
        borderRadius: '16px', 
        padding: '24px', 
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Profit & Monthly Comparison</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
          Compare your performance metrics this month versus last month.
        </p>

        <div style={{ minHeight: '500px', maxWidth: '800px' }}>
          <MonthlyComparison data={stats?.monthly_comparison} />
        </div>
      </div>
    </div>
  );
}
