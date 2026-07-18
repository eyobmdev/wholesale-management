import React from 'react';
import { SalesTrendChart } from '../SalesTrendChart.jsx';
import { MonthlyComparison } from '../MonthlyComparison.jsx';
import { useDashboardStats } from '../../../services/dashboardService.js';

export default function FinancialAnalyticsTab() {
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
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Financial Analytics</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
          Deep dive into your revenue, profit margins, and performance comparisons over time.
        </p>

        <div className="financial-charts-grid">
          <div style={{ minHeight: '400px' }}>
            {/* The SalesTrendChart handles its own data fetching, so we don't need to pass stats to it */}
            <SalesTrendChart />
          </div>
          <div style={{ minHeight: '400px' }}>
            <MonthlyComparison data={stats?.monthly_comparison} />
          </div>
        </div>
      </div>
      <style>{`
        .financial-charts-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 24px;
        }
        @media (min-width: 1024px) {
          .financial-charts-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
