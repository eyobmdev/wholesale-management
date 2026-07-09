import { useQuery } from '@tanstack/react-query';
import api from './api.js';

export const customerService = {
  async getCustomers(params = {}) {
    const response = await api.get('/customers/', { params });
    // The interceptor already returns response.data
    return response;
  },

  async getCustomer(id) {
    return await api.get(`/customers/${id}/`);
  }
};

export const useCustomers = (params = {}) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerService.getCustomers(params),
    keepPreviousData: true,
  });
};
