import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './auth.css';
import MainLayout from './components/layout/MainLayout/index.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute/index.jsx';
import Dashboard from './pages/Dashboard/index.jsx';
import Settings from './pages/Settings/index.jsx';
import Customers from './pages/Customers/index.jsx';
import CustomerDetails from './pages/Customers/CustomerDetails.jsx';
import Factories from './pages/Factories/index.jsx';
import FactoryDetails from './pages/Factories/FactoryDetails.jsx';
import Purchases from './pages/Purchases/index.jsx';
import PurchaseDetails from './pages/Purchases/PurchaseDetails.jsx';
import PurchaseCreate from './pages/Purchases/PurchaseCreate.jsx';
import Sales from './pages/Sales/index.jsx';
import SaleDetails from './pages/Sales/SaleDetails.jsx';
import SaleCreate from './pages/Sales/SaleCreate.jsx';
import Inventory from './pages/Inventory/index.jsx';
import InventoryDetails from './pages/Inventory/InventoryDetails.jsx';
import Login from './pages/Auth/Login.jsx';
import Signup from './pages/Auth/Signup.jsx';
import ForgotPassword from './pages/Auth/ForgotPassword.jsx';
import ResetPassword from './pages/Auth/ResetPassword.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/:id" element={<InventoryDetails />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route path="/factories" element={<Factories />} />
          <Route path="/factories/:id" element={<FactoryDetails />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/purchases/new" element={<PurchaseCreate />} />
          <Route path="/purchases/:id" element={<PurchaseDetails />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/new" element={<SaleCreate />} />
          <Route path="/sales/:id" element={<SaleDetails />} />
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
