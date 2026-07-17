import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incomeService } from '../services/incomeService.js';

export const useIncome = (params = {}) => {
  return useQuery({
    queryKey: ['income', params],
    queryFn: () => incomeService.getIncome(params),
    keepPreviousData: true,
  });
};

export const useIncomeById = (id) => {
  return useQuery({
    queryKey: ['income', id],
    queryFn: () => incomeService.getIncomeById(id),
    enabled: !!id,
  });
};

export const useCreateIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => incomeService.createIncome(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
    }
  });
};

export const useUpdateIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => incomeService.updateIncome(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
    }
  });
};

export const useDeleteIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => incomeService.deleteIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
    }
  });
};
