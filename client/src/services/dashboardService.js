import { useQuery } from '@tanstack/react-query';
import api from './api.js';
import { mockDashboardData } from './mock/dashboardData.js';

// Toggle this to false when the backend is ready
const USE_MOCK = true;

export const dashboardService = {
  async getDashboardStats() {
    if (USE_MOCK) {
      return new Promise(resolve => setTimeout(() => resolve(mockDashboardData), 500));
    }
    // Real API call
    return await api.get('/dashboard/stats');
  }
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardService.getDashboardStats(),
  });
};
