import React, { useState, useEffect } from 'react';

export default function Header({ onMenuClick }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDark]);

  return (
    <header className="header">
      <div className="header-left">
        <button className="icon-btn menu-toggle" onClick={onMenuClick}>
          <i className="ri-menu-line"></i>
        </button>
        <h1 className="page-title">Dashboard</h1>
      </div>
      <div className="header-right">
        <div className="search-bar">
          <i className="ri-search-line"></i>
          <input type="text" placeholder="Search..." />
        </div>
        
        <button 
          className="icon-btn theme-toggle" 
          onClick={() => setIsDark(!isDark)}
          title="Toggle Theme"
        >
          {isDark ? <i className="ri-sun-line"></i> : <i className="ri-moon-line"></i>}
        </button>
        
        <button className="icon-btn"><i className="ri-notification-3-line"></i></button>
        <div className="user-profile">
          <div className="avatar"><i className="ri-user-smile-line"></i></div>
          <span className="username">Admin</span>
        </div>
      </div>
    </header>
  );
}
