import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { authService } from '../../../services/authService.js';

export default function Sidebar({ isOpen, setIsOpen }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', icon: 'ri-dashboard-line', path: '/dashboard' },
    { name: 'Inventory', icon: 'ri-archive-line', path: '/inventory' },
    { name: 'Sales', icon: 'ri-shopping-cart-2-line', path: '/sales' },
    { name: 'Purchases', icon: 'ri-truck-line', path: '/purchases' },
    { name: 'Customers', icon: 'ri-team-line', path: '/customers' },
    { name: 'Factories', icon: 'ri-building-4-line', path: '/factories' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header" style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '0' : '0 24px' }}>
        <i className="ri-box-3-fill logo-icon"></i>
        
        {!isCollapsed && <h2>Wholesale</h2>}
        
        {/* Mobile close button (only shows on mobile via CSS) */}
        <button className="icon-btn mobile-close" onClick={() => setIsOpen(false)} style={{ marginLeft: 'auto' }}>
          <i className="ri-close-line"></i>
        </button>

        {/* Desktop collapse button (only shows on desktop via CSS) */}
        <button 
          className="icon-btn desktop-collapse" 
          onClick={() => setIsCollapsed(!isCollapsed)} 
        >
          <i className={isCollapsed ? "ri-arrow-right-s-line" : "ri-arrow-left-s-line"}></i>
        </button>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink 
                to={item.path}
                className={({ isActive }) => isActive ? 'active' : ''}
                title={isCollapsed ? item.name : ""}
                style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '12px 0' : '12px 24px' }}
              >
                <i className={item.icon} style={{ margin: isCollapsed ? '0' : '0 12px 0 0' }}></i> 
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <ul>
          <li>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => isActive ? 'active' : ''} 
              title={isCollapsed ? "Settings" : ""}
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '12px 0' : '12px 24px' }}
            >
              <i className="ri-settings-4-line" style={{ margin: isCollapsed ? '0' : '0 12px 0 0' }}></i> 
              {!isCollapsed && <span>Settings</span>}
            </NavLink>
          </li>
          <li>
            <a 
              className="logout-btn"
              onClick={() => authService.logout()}
              style={{ cursor: 'pointer', justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '12px 0' : '12px 24px' }} 
              title={isCollapsed ? "Logout" : ""}
            >
              <i className="ri-logout-box-r-line" style={{ margin: isCollapsed ? '0' : '0 12px 0 0' }}></i> 
              {!isCollapsed && <span>Logout</span>}
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}
