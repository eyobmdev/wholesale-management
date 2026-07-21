import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api.js';

export const paymentService = {
  async getPaymentMethods() {
    return await api.get('/payment-method-options/');
  },

  async createIncome(data) {
    return await api.post('/income/', data);
  },

  async createFactoryPayment(data) {
    return await api.post('/factory-payments/', data);
  }
};

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: paymentService.getPaymentMethods,
    staleTime: Infinity, // Cache indefinitely during the session
    cacheTime: Infinity
  });
};

export const useCreateIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => paymentService.createIncome(data),
    onSuccess: (_, variables) => {
      if (variables.customer) {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        queryClient.invalidateQueries({ queryKey: ['customer', variables.customer] });
      }
    }
  });
};

export const useCreateFactoryPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => paymentService.createFactoryPayment(data),
    onSuccess: (_, variables) => {
      if (variables.factory) {
        queryClient.invalidateQueries({ queryKey: ['factories'] });
        queryClient.invalidateQueries({ queryKey: ['factory', variables.factory] });
      }
    }
  });
};
