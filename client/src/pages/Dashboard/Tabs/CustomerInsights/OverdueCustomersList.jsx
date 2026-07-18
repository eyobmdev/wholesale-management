import React from 'react';
import { formatCurrency } from '../../../../utils/formatters.js';

const getTailwindBucketColor = (label) => {
  const l = label.toLowerCase();
  if (l.includes('0-30')) return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' }; // blue
  if (l.includes('30-60')) return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' }; // amber
  if (l.includes('60-90')) return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' }; // red
  if (l.includes('90+')) return { bg: 'rgba(220, 38, 38, 0.15)', text: '#dc2626', border: 'rgba(220, 38, 38, 0.3)' }; // red darker
  return { bg: 'var(--search-bg)', text: 'var(--text-muted)', border: 'transparent' };
};

export function OverdueCustomersList({ data = [] }) {
  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '16px',
      border: '1px solid var(--card-border)',
      boxShadow: 'var(--shadow-sm)',
      padding: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <i className="ri-error-warning-line" style={{ color: '#ef4444', fontSize: '1rem' }}></i>
        <h2 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-color)' }}>Overdue Customers</h2>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
            No overdue customers.
          </div>
        ) : (
          data.map((bucket) => {
            const colors = getTailwindBucketColor(bucket.label);
            return (
              <div key={bucket.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`
                  }}>
                    {bucket.label}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-color)' }}>
                    {formatCurrency(Number(bucket.total_amount), "ETB")}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                    ({bucket.count})
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function OverdueCustomersSkeleton() {
  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '16px',
      border: '1px solid var(--card-border)',
      padding: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div className="skeleton" style={{ height: '16px', width: '16px', borderRadius: '50%' }}></div>
        <div className="skeleton" style={{ height: '20px', width: '150px' }}></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="skeleton" style={{ height: '20px', width: '80px', borderRadius: '4px' }}></div>
            <div className="skeleton" style={{ height: '20px', width: '120px' }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
