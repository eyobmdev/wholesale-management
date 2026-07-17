import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { factoryPaymentService } from '../services/factoryPaymentService.js';

export const useFactoryPayments = (params = {}) => {
  return useQuery({
    queryKey: ['factory-payments', params],
    queryFn: () => factoryPaymentService.getFactoryPayments(params),
    keepPreviousData: true,
  });
};

export const useFactoryPaymentById = (id) => {
  return useQuery({
    queryKey: ['factory-payments', id],
    queryFn: () => factoryPaymentService.getFactoryPaymentById(id),
    enabled: !!id,
  });
};

export const useCreateFactoryPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => factoryPaymentService.createFactoryPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factory-payments'] });
      queryClient.invalidateQueries({ queryKey: ['factories'] });
    }
  });
};

export const useUpdateFactoryPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => factoryPaymentService.updateFactoryPayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factory-payments'] });
      queryClient.invalidateQueries({ queryKey: ['factories'] });
    }
  });
};

export const useDeleteFactoryPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => factoryPaymentService.deleteFactoryPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factory-payments'] });
      queryClient.invalidateQueries({ queryKey: ['factories'] });
    }
  });
};
