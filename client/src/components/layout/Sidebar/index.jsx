import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ isOpen, setIsOpen }) {
  const navItems = [
    { name: 'Dashboard', icon: 'ri-dashboard-line', path: '/dashboard' },
    { name: 'Inventory', icon: 'ri-archive-line', path: '/inventory' },
    { name: 'Sales', icon: 'ri-shopping-cart-2-line', path: '/sales' },
    { name: 'Purchases', icon: 'ri-truck-line', path: '/purchases' },
    { name: 'Customers', icon: 'ri-team-line', path: '/customers' },
    { name: 'Factories', icon: 'ri-building-4-line', path: '/factories' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <i className="ri-box-3-fill logo-icon"></i>
        <h2>Wholesale</h2>
        <button className="icon-btn mobile-close" onClick={() => setIsOpen(false)} style={{marginLeft: 'auto'}}>
          <i className="ri-close-line"></i>
        </button>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink 
                to={item.path}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <i className={item.icon}></i> <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <ul>
          <li>
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="ri-settings-4-line"></i> <span>Settings</span>
            </NavLink>
          </li>
          <li>
            <a style={{cursor: 'pointer'}}>
              <i className="ri-logout-box-r-line"></i> <span>Logout</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}
