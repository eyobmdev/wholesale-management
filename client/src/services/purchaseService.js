import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api.js';

export const purchaseService = {
  async getPurchases(params = {}) {
    return await api.get('/purchases/', { params });
  },

  async getPurchase(id) {
    return await api.get(`/purchases/${id}/`);
  },

  async getPurchaseItems(params = {}) {
    return await api.get('/purchase-items/', { params });
  },

  async updatePurchase(id, data) {
    return await api.patch(`/purchases/${id}/`, data);
  },

  async deletePurchase(id) {
    return await api.delete(`/purchases/${id}/`);
  },
  
  async getFactoryOptions(search = '') {
    const res = await api.get('/factory-options/', { params: search ? { search } : {} });
    return res;
  }
};

export const usePurchases = (params = {}) => {
  return useQuery({
    queryKey: ['purchases', params],
    queryFn: () => purchaseService.getPurchases(params),
    keepPreviousData: true,
  });
};

export const usePurchase = (id) => {
  return useQuery({
    queryKey: ['purchase', id],
    queryFn: () => purchaseService.getPurchase(id),
    enabled: !!id,
  });
};

export const usePurchaseItems = (params = {}) => {
  return useQuery({
    queryKey: ['purchaseItems', params],
    queryFn: () => purchaseService.getPurchaseItems(params),
    keepPreviousData: true,
    enabled: !!params.purchase,
  });
};

export const useUpdatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => purchaseService.updatePurchase(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase'] });
      queryClient.invalidateQueries({ queryKey: ['factories'] });
      queryClient.invalidateQueries({ queryKey: ['factory'] });
    }
  });
};

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => purchaseService.deletePurchase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      // Invalidate factories since their balances may have changed
      queryClient.invalidateQueries({ queryKey: ['factories'] });
      queryClient.invalidateQueries({ queryKey: ['factory'] });
    }
  });
};
