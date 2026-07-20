import React from 'react';
import Skeleton from 'react-loading-skeleton';

const getTailwindAlertColor = (type) => {
  const l = type.toLowerCase();
  if (l.includes('sold out')) return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' }; // red
  if (l.includes('low')) return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' }; // amber
  return { bg: 'var(--search-bg)', text: 'var(--text-muted)', border: 'transparent' };
};

export function StockAlertsWidget({ alerts = [] }) {
  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '16px',
      border: '1px solid var(--card-border)',
      boxShadow: 'var(--shadow-sm)',
      padding: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <i className="ri-box-3-line" style={{ color: '#f59e0b', fontSize: '1rem' }}></i>
        <h2 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-color)' }}>Stock Alerts</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {alerts.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
            All stock levels are healthy.
          </div>
        ) : (
          alerts.map((alert) => {
            const colors = getTailwindAlertColor(alert.alert_type);
            return (
              <div key={alert.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'var(--text-color)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {alert.product_name}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {alert.item_code} &middot; {alert.remaining_bags} bags left
                  </p>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  flexShrink: 0
                }}>
                  {alert.alert_type.replace("_", " ")}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function StockAlertsSkeleton() {
  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '16px',
      border: '1px solid var(--card-border)',
      padding: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Skeleton height={16} width={16} circle={true} />
        <Skeleton height={20} width={120} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <Skeleton height={14} width="80%" style={{ marginBottom: '4px' }} />
              <Skeleton height={12} width="50%" />
            </div>
            <Skeleton height={20} width={70} borderRadius={4} />
          </div>
        ))}
      </div>
    </div>
  );
}
