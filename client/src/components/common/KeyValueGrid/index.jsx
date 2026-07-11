import React from 'react';
import './KeyValueGrid.css';

export const KeyValueGrid = ({ items = [] }) => {
  return (
    <div className="key-value-grid">
      {items.map((item, index) => (
        <div 
          key={index} 
          className={`kv-group ${item.fullWidth ? 'kv-full-width' : ''}`}
        >
          <span className="kv-label">{item.label}</span>
          <span className="kv-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
};
