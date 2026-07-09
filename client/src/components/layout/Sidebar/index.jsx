import React, { useState } from 'react';

export default function Sidebar() {
  const [active, setActive] = useState('Dashboard');

  const navItems = [
    { name: 'Dashboard', icon: 'ri-dashboard-line' },
    { name: 'Inventory', icon: 'ri-archive-line' },
    { name: 'Sales', icon: 'ri-shopping-cart-2-line' },
    { name: 'Purchases', icon: 'ri-truck-line' },
    { name: 'Customers', icon: 'ri-team-line' },
    { name: 'Factories', icon: 'ri-building-4-line' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <i className="ri-box-3-fill logo-icon"></i>
        <h2>Wholesale</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li 
              key={item.name} 
              className={active === item.name ? 'active' : ''}
              onClick={() => setActive(item.name)}
            >
              <i className={item.icon}></i> <span>{item.name}</span>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <ul>
          <li><i className="ri-settings-4-line"></i> <span>Settings</span></li>
          <li><i className="ri-logout-box-r-line"></i> <span>Logout</span></li>
        </ul>
      </div>
    </aside>
  );
}
