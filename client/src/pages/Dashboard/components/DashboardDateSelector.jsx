import React, { useState, useRef, useEffect } from 'react';
import './DashboardDateSelector.css';

export function DashboardDateSelector({ 
  period, 
  startDate, 
  endDate, 
  displayDuration, 
  onChange,
  options 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePresetClick = (opt) => {
    onChange({ period: opt, start: '', end: '' });
    setIsOpen(false);
  };

  const handleCustomDateChange = (field, value) => {
    const newStart = field === 'start' ? value : startDate;
    const newEnd = field === 'end' ? value : endDate;
    onChange({ period: '', start: newStart, end: newEnd });
  };

  return (
    <div className="dashboard-date-selector" ref={dropdownRef}>
      <button className="selector-trigger" onClick={() => setIsOpen(!isOpen)}>
        <i className="ri-calendar-line"></i>
        <span>{displayDuration ? `${displayDuration} data` : 'Select Date Range'}</span>
        <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line`}></i>
      </button>

      {isOpen && (
        <div className="selector-dropdown">
          <div className="selector-section">
            <span className="selector-label">Quick Presets</span>
            <div className="preset-buttons">
              {options.includes('daily') && (
                <button 
                  className={period === 'daily' ? 'active' : ''} 
                  onClick={() => handlePresetClick('daily')}
                >
                  Last 30 Days (Daily)
                </button>
              )}
              {options.includes('weekly') && (
                <button 
                  className={period === 'weekly' ? 'active' : ''} 
                  onClick={() => handlePresetClick('weekly')}
                >
                  Last 90 Days (Weekly)
                </button>
              )}
              {options.includes('monthly') && (
                <button 
                  className={period === 'monthly' ? 'active' : ''} 
                  onClick={() => handlePresetClick('monthly')}
                >
                  Last 12 Months (Monthly)
                </button>
              )}
            </div>
          </div>

          <div className="selector-divider"></div>

          <div className="selector-section">
            <span className="selector-label">Custom Range</span>
            <div className="custom-date-inputs">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => handleCustomDateChange('start', e.target.value)} 
              />
              <span className="selector-arrow">&rarr;</span>
              <input 
                type="date" 
                value={endDate} 
                min={startDate}
                onChange={(e) => handleCustomDateChange('end', e.target.value)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
