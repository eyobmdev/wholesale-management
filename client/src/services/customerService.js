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
  },

  async createCustomer(data) {
    return await api.post('/customers/', data);
  },

  async updateCustomer(id, data) {
    return await api.put(`/customers/${id}/`, data);
  },

  async patchCustomer(id, data) {
    return await api.patch(`/customers/${id}/`, data);
  },

  async deleteCustomer(id) {
    return await api.delete(`/customers/${id}/`);
  }
};

export const useCustomers = (params = {}) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerService.getCustomers(params),
    keepPreviousData: true,
  });
};

export const useCustomer = (id) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getCustomer(id),
    enabled: !!id,
  });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => customerService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, partial = true }) => {
      if (partial) {
        return customerService.patchCustomer(id, data);
      }
      return customerService.updateCustomer(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
    }
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => customerService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
};
