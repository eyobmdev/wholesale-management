import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import App from './App.jsx';
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
      <Toaster position="top-right" expand={true} closeButton theme="system" />
      <BrowserRouter>
        <SkeletonTheme baseColor="var(--card-border)" highlightColor="var(--hover-bg)">
          <App />
        </SkeletonTheme>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
