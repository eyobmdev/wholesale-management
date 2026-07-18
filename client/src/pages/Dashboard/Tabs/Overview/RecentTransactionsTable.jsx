import React from 'react';
import { formatCurrency, formatDate, getTransactionTypeLabel } from '../../../../utils/formatters.js';

const getTailwindColor = (type) => {
  const map = {
    'sale': { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' }, // emerald
    'purchase': { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' }, // red
    'income': { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' }, // blue
    'expense': { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' }, // amber
    'factory_payment': { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' } // purple
  };
  return map[type] || { bg: 'var(--search-bg)', text: 'var(--text-muted)', border: 'transparent' };
};

export function RecentTransactionsTable({ transactions = [] }) {
  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '16px',
      border: '1px solid var(--card-border)',
      boxShadow: 'var(--shadow-sm)',
      padding: '20px',
      height: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-color)' }}>Recent Transactions</h2>
        <i className="ri-time-line" style={{ color: 'var(--text-muted)', fontSize: '1rem' }}></i>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {transactions.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
            No recent transactions.
          </div>
        ) : (
          transactions.map((tx, idx) => {
            const isLast = idx === transactions.length - 1;
            const colors = getTailwindColor(tx.type);
            const isNegative = tx.type === "expense" || tx.type === "factory_payment";
            
            return (
              <div key={`${tx.type}-${tx.id}`} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                paddingBottom: '8px',
                borderBottom: isLast ? 'none' : '1px solid var(--card-border)'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  flexShrink: 0
                }}>
                  {getTransactionTypeLabel(tx.type)}
                </span>
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
                    {tx.description}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {tx.reference} &middot; {formatDate(tx.date)}
                  </p>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.875rem', 
                    fontWeight: 700, 
                    color: isNegative ? '#dc2626' : 'var(--text-color)' 
                  }}>
                    {isNegative ? '−' : '+'}{formatCurrency(Number(tx.amount), tx.currency)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function RecentTransactionsSkeleton() {
  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '16px',
      border: '1px solid var(--card-border)',
      padding: '20px',
      height: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div className="skeleton" style={{ height: '20px', width: '150px' }}></div>
        <div className="skeleton" style={{ height: '16px', width: '16px', borderRadius: '50%' }}></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
            <div className="skeleton" style={{ height: '20px', width: '80px', borderRadius: '6px' }}></div>
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: '14px', width: '60%', marginBottom: '4px' }}></div>
              <div className="skeleton" style={{ height: '12px', width: '40%' }}></div>
            </div>
            <div className="skeleton" style={{ height: '20px', width: '70px' }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
