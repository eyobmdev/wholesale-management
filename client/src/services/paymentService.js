import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api.js';

export const paymentService = {
  async getPaymentMethods() {
    return await api.get('/payment-method-options/');
  },
  
  async createIncome(data) {
    return await api.post('/income/', data);
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
      // Invalidate both customers list and specific customer cache if applicable
      if (variables.customer) {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        queryClient.invalidateQueries({ queryKey: ['customer', variables.customer] });
      }
      
      // Invalidate factories if applicable
      if (variables.factory) {
        queryClient.invalidateQueries({ queryKey: ['factories'] });
        queryClient.invalidateQueries({ queryKey: ['factory', variables.factory] });
      }
    }
  });
};
