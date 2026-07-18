import React from 'react';
import './DashboardToggle.css';

export function DashboardToggle({ options, value, onChange }) {
  if (!options || options.length === 0) return null;

  return (
    <div className="dashboard-toggle">
      {options.map(option => (
        <button
          key={option}
          className={value === option ? 'active' : ''}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
