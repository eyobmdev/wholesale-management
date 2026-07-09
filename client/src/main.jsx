import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import MainLayout from './components/layout/MainLayout/index.jsx';
import Dashboard from './pages/Dashboard/index.jsx';
import Settings from './pages/Settings/index.jsx';
import './style.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Prevents excessive refetching during dev
    },
  },
});

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" expand={true} />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<div style={{padding: '32px', textAlign: 'center'}}>
              <h2>Page not implemented yet</h2>
              <p style={{color: 'var(--text-muted)', marginTop: '16px'}}>Select Dashboard or Settings from the sidebar.</p>
            </div>} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
