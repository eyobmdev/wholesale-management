import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './auth.css';
import MainLayout from './components/layout/MainLayout/index.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute/index.jsx';
import Dashboard from './pages/Dashboard/index.jsx';
import Settings from './pages/Settings/index.jsx';
import Login from './pages/Auth/Login.jsx';
import Signup from './pages/Auth/Signup.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={
            <div style={{padding: '32px', textAlign: 'center'}}>
              <h2>Page not implemented yet</h2>
              <p style={{color: 'var(--text-muted)', marginTop: '16px'}}>Select Dashboard or Settings from the sidebar.</p>
            </div>
          } />
        </Route>
      </Route>
    </Routes>
  );
}
