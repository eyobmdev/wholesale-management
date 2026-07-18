import { useQuery } from '@tanstack/react-query';
import api from './api.js';

export const dashboardService = {
  async getDashboardStats() {
    return await api.get('/dashboard/');
  },

  async getSalesTrend(period, startDate, endDate) {
    const params = {};
    if (period) params.period = period;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return await api.get('/dashboard/sales-trend/', { params });
  },

  async getProfitTrend(period, startDate, endDate) {
    const params = {};
    if (period) params.period = period;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return await api.get('/dashboard/profit-trend/', { params });
  }
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardService.getDashboardStats(),
  });
};

export const useSalesTrend = (period, startDate, endDate) => {
  return useQuery({
    queryKey: ['salesTrend', period, startDate, endDate],
    queryFn: () => dashboardService.getSalesTrend(period, startDate, endDate),
    refetchInterval: 30000, // Live updates every 30s
  });
};

export const useProfitTrend = (period, startDate, endDate) => {
  return useQuery({
    queryKey: ['profitTrend', period, startDate, endDate],
    queryFn: () => dashboardService.getProfitTrend(period, startDate, endDate),
    refetchInterval: 30000,
  });
};
