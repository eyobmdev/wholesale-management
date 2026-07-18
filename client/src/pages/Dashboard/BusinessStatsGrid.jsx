import React from 'react';

function StatWidget({ label, value, icon, color }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: `var(--${color}-light)`,
        color: `var(--${color}-color)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem'
      }}>
        <i className={icon}></i>
      </div>
      <div>
        <p style={{ margin: '0 0 4px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</p>
        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.3rem' }}>{value}</p>
      </div>
    </div>
  );
}

export function BusinessStatsGrid({ data }) {
  if (!data) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '24px',
      marginBottom: '24px'
    }}>
      <StatWidget label="Total Customers" value={data.total_customers || 0} icon="ri-group-line" color="primary" />
      <StatWidget label="Active Customers" value={data.active_customers || 0} icon="ri-user-star-line" color="success" />
      <StatWidget label="Total Factories" value={data.total_factories || 0} icon="ri-building-2-line" color="warning" />
      <StatWidget label="Active Factories" value={data.active_factories || 0} icon="ri-building-3-line" color="success" />
      <StatWidget label="Total Products" value={data.total_products || 0} icon="ri-shopping-bag-3-line" color="info" />
      <StatWidget label="Total Batches" value={data.total_stock_batches || 0} icon="ri-box-3-line" color="secondary" />
    </div>
  );
}

export function BusinessStatsGridSkeleton() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '24px',
      marginBottom: '24px'
    }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="skeleton" style={{ height: '82px', borderRadius: '12px' }}></div>
      ))}
    </div>
  );
}
