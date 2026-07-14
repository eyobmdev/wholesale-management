import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saleService } from '../services/saleService.js';

export const useSales = (params = {}) => {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => saleService.getSales(params),
    keepPreviousData: true,
  });
};

export const useSale = (id) => {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => saleService.getSale(id),
    enabled: !!id,
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => saleService.deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    }
  });
};
