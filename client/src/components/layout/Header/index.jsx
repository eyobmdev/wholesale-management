import React from 'react';

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="page-title">Dashboard</h1>
      </div>
      <div className="header-right">
        <div className="search-bar">
          <i className="ri-search-line"></i>
          <input type="text" placeholder="Search..." />
        </div>
        <button className="icon-btn"><i className="ri-notification-3-line"></i></button>
        <div className="user-profile">
          <div className="avatar"><i className="ri-user-smile-line"></i></div>
          <span className="username">Admin</span>
        </div>
      </div>
    </header>
  );
}
