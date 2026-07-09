import React from 'react';
import Sidebar from '../Sidebar/index.jsx';
import Header from '../Header/index.jsx';

export default function MainLayout({ children }) {
  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        <main className="middle-class">
          {children}
        </main>
      </div>
    </>
  );
}
