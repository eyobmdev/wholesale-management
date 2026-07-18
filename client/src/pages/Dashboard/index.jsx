import React from 'react';
import { useDashboardStats } from '../../services/dashboardService.js';
import { Button } from '../../components/common/index.js';

// Dashboard Components
import { DashboardCards, DashboardCardsSkeleton } from './DashboardCards.jsx';
import { QuickStatsRow, QuickStatsRowSkeleton } from './QuickStatsRow.jsx';
import { SalesTrendChart, SalesTrendChartSkeleton } from './SalesTrendChart.jsx';
import { MonthlyComparison, MonthlyComparisonSkeleton } from './MonthlyComparison.jsx';
import { OverdueCustomersList, OverdueCustomersSkeleton } from './OverdueCustomersList.jsx';
import { RecentTransactionsTable, RecentTransactionsSkeleton } from './RecentTransactionsTable.jsx';
import { StockAlertsWidget, StockAlertsSkeleton } from './StockAlertsWidget.jsx';

export default function Dashboard() {
  const { data: stats, isLoading, isError, refetch } = useDashboardStats();

  if (isError) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <i className="ri-error-warning-line" style={{ fontSize: '3rem', color: 'var(--danger-color)', marginBottom: '16px', display: 'block' }}></i>
          <h2 style={{ marginBottom: '8px' }}>Failed to load dashboard</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>There was a problem retrieving your analytics data. Please try again.</p>
          <Button variant="primary" onClick={() => refetch()} leftIcon="ri-refresh-line">
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-color)', margin: '0 0 4px 0' }}>Dashboard Overview</h1>
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

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <DashboardCardsSkeleton />
          <QuickStatsRowSkeleton />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '24px', '@media (minWidth: 1024px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' } }}>
            <SalesTrendChartSkeleton />
            <MonthlyComparisonSkeleton />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '24px', '@media (minWidth: 1024px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' } }}>
            <div style={{ gridColumn: 'span 2' }}>
              <RecentTransactionsSkeleton />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <OverdueCustomersSkeleton />
              <StockAlertsSkeleton />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <DashboardCards cards={stats?.cards} />
          <QuickStatsRow data={stats} />

          <div className="charts-row" style={{ display: 'grid', gap: '24px' }}>
            <SalesTrendChart />
            <MonthlyComparison data={stats?.monthly_comparison} />
          </div>

          <div className="bottom-row" style={{ display: 'grid', gap: '24px' }}>
            <div className="recent-tx-col">
              <RecentTransactionsTable transactions={stats?.recent_transactions} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <OverdueCustomersList data={stats?.overdue_customers} />
              <StockAlertsWidget alerts={stats?.stock_alerts} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .charts-row {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
        .bottom-row {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
        @media (min-width: 1024px) {
          .charts-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .bottom-row {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .recent-tx-col {
            grid-column: span 2 / span 2;
          }
        }
      `}</style>
    </div>
  );
}
