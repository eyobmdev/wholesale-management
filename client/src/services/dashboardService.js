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
  },

  async getOverdueCustomers() {
    return await api.get('/dashboard/overdue-customers/');
  },

  async getStockOverview() {
    return await api.get('/dashboard/stock-overview/');
  },

  async getPaymentMethods(startDate, endDate) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return await api.get('/dashboard/payment-methods/', { params });
  },

  async getProductPerformance(startDate, endDate) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return await api.get('/dashboard/product-performance/', { params });
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

export const useOverdueCustomers = () => {
  return useQuery({
    queryKey: ['overdueCustomers'],
    queryFn: () => dashboardService.getOverdueCustomers(),
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useStockOverview = () => {
  return useQuery({
    queryKey: ['stockOverview'],
    queryFn: () => dashboardService.getStockOverview(),
    refetchInterval: 60000, // Refresh every minute
  });
};

export const usePaymentMethods = (startDate, endDate) => {
  return useQuery({
    queryKey: ['paymentMethods', startDate, endDate],
    queryFn: () => dashboardService.getPaymentMethods(startDate, endDate),
    refetchInterval: 60000,
  });
};

export const useProductPerformance = (startDate, endDate) => {
  return useQuery({
    queryKey: ['productPerformance', startDate, endDate],
    queryFn: () => dashboardService.getProductPerformance(startDate, endDate),
    refetchInterval: 60000,
  });
};
