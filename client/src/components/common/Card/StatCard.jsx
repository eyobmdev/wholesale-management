import React from 'react';

export const StatCard = ({ label, value, icon, valueColor, iconColor, iconBg }) => {
  return (
    <div style={{
      border: '1px solid var(--card-border, #e5e7eb)',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      backgroundColor: 'var(--card-bg, #ffffff)',
      boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.02))',
      flex: '1 1 auto',
      minWidth: '200px'
    }}>
      {icon && (
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: iconBg || 'var(--content-bg, #f3f4f6)',
          color: iconColor || 'var(--text-color, #111827)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          flexShrink: 0
        }}>
          <i className={icon}></i>
        </div>
      )}
      <div style={{ minWidth: 0, overflow: 'hidden' }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--text-muted, #6b7280)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '4px'
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: valueColor || 'var(--text-color, #111827)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {value}
        </div>
      </div>
    </div>
  );
};
