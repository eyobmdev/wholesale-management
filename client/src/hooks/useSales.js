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

export const useSaleItems = (params = {}) => {
  return useQuery({
    queryKey: ['saleItems', params],
    queryFn: () => saleService.getSaleItems(params),
    keepPreviousData: true,
    enabled: !!params.sale,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => saleService.createSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
};

export const useFullUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => saleService.fullUpdateSale(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => saleService.updateSale(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
};

export const useCreateSaleItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => saleService.createSaleItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saleItems'] });
      queryClient.invalidateQueries({ queryKey: ['sale'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    }
  });
};

export const useUpdateSaleItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => saleService.updateSaleItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saleItems'] });
      queryClient.invalidateQueries({ queryKey: ['sale'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    }
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => saleService.deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
};

export const useDeleteSaleItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => saleService.deleteSaleItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saleItems'] });
      queryClient.invalidateQueries({ queryKey: ['sale'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    }
  });
};
