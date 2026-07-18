import React from 'react';
import { formatCurrency, formatPercent } from '../../../utils/formatters.js';

export const SummaryCard = ({
  title, // from my previous code, the user snippet uses 'label'
  label,
  value,
  currency,
  change_percent,
  change_direction,
  is_positive,
  iconClass,
  colorGradient = "linear-gradient(135deg, #6366f1, #4f46e5)"
}) => {
  const displayLabel = label || title;
  const trendColor = is_positive ? '#10b981' : '#ef4444';
  const bgTrendColor = is_positive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '16px',
      border: '1px solid var(--card-border)',
      boxShadow: 'var(--shadow-sm)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '16px',
      transition: 'box-shadow 0.2s',
      cursor: 'default',
      height: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: colorGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '1.2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <i className={iconClass}></i>
        </div>

        {change_percent !== null && change_percent !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '4px 8px',
            borderRadius: '9999px',
            backgroundColor: bgTrendColor,
            color: trendColor
          }}>
            <i className={
              change_direction === "up" ? "ri-arrow-right-up-line" :
                change_direction === "down" ? "ri-arrow-right-down-line" : "ri-subtract-line"
            }></i>
            <span>{formatPercent(change_percent)}</span>
          </div>
        )}
      </div>

      <div>
        <p style={{ 
          fontSize: '0.75rem', 
          fontWeight: 500, 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em', 
          marginBottom: '4px' 
        }}>
          {displayLabel}
        </p>
        <p style={{ 
          fontSize: '1.5rem', 
          fontWeight: 700, 
          color: 'var(--text-color)', 
          lineHeight: '1.25' 
        }}>
          {currency ? formatCurrency(value, currency) : value?.toLocaleString()}
        </p>
        <p style={{ 
          fontSize: '0.75rem', 
          marginTop: '4px', 
          color: (change_percent !== null && change_percent !== undefined) ? trendColor : '#9ca3af' 
        }}>
          {(change_percent !== null && change_percent !== undefined)
            ? (change_direction === "up" ? "↑" : change_direction === "down" ? "↓" : "—")
            : "—"} vs last month
        </p>
      </div>
    </div>
  );
};
