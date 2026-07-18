import React from 'react';
import './DashboardDatePicker.css';

export function DashboardDatePicker({ startDate, endDate, onChange }) {
  const handleStartChange = (e) => {
    onChange({ start: e.target.value, end: endDate });
  };

  const handleEndChange = (e) => {
    onChange({ start: startDate, end: e.target.value });
  };

  const handleClear = () => {
    onChange({ start: '', end: '' });
  };

  return (
    <div className="dashboard-date-picker">
      <input 
        type="date" 
        value={startDate} 
        onChange={handleStartChange} 
        className="date-input"
        placeholder="Start Date"
      />
      <span className="date-separator">&rarr;</span>
      <input 
        type="date" 
        value={endDate} 
        onChange={handleEndChange} 
        className="date-input"
        placeholder="End Date"
        min={startDate}
      />
      {(startDate || endDate) && (
        <button className="date-clear-btn" onClick={handleClear} title="Clear Custom Date">
          <i className="ri-close-line"></i>
        </button>
      )}
    </div>
  );
}
