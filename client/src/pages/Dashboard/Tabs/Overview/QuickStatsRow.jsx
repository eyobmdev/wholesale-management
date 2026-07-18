import React from 'react';

export function QuickStatsRow({ data }) {
  if (!data || !data.monthly_comparison) return null;
  const d = data;

  const stats = [
    { label: "Customers", value: d.total_customers, sub: `${d.active_customers} active`, color: "#2563eb" }, // text-blue-600
    { label: "Factories", value: d.total_factories, sub: `${d.active_factories} active`, color: "#7c3aed" }, // text-violet-600
    { label: "Products", value: d.total_products, sub: "distinct SKUs", color: "#059669" }, // text-emerald-600
    { label: "Stock Batches", value: d.total_stock_batches, sub: "all batches", color: "#0891b2" }, // text-cyan-600
    { label: "This Month Sales", value: `${(d.monthly_comparison.sales.this_month / 1000).toFixed(0)}K`, sub: "ETB", color: "#4f46e5" }, // text-indigo-600
    { label: "Net Profit", value: `${((d.monthly_comparison.profit.this_month - d.monthly_comparison.expenses.this_month) / 1000).toFixed(0)}K`, sub: "ETB this month", color: "#0d9488" }, // text-teal-600
  ];

  return (
    <>
      <style>{`
        .quick-stats-grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        @media (min-width: 640px) {
          .quick-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (min-width: 768px) {
          .quick-stats-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .quick-stats-grid {
            grid-template-columns: repeat(6, minmax(0, 1fr));
          }
        }
      `}</style>
      <div className="quick-stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '12px',
            border: '1px solid var(--card-border)',
            padding: '16px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>
              {stat.value}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-color)' }}>
              {stat.label}
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {stat.sub}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

export function QuickStatsRowSkeleton() {
  return (
    <div className="quick-stats-grid">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="skeleton" style={{ height: '90px', borderRadius: '12px' }}></div>
      ))}
    </div>
  );
}
