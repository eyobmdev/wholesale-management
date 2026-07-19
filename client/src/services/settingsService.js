import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api.js';

export const settingsService = {
  async getSettings() {
    const response = await api.get('/settings/');
    return response.data;
  },
  
  async updateSettings(id, data) {
    const response = await api.put(`/settings/${id}/`, data);
    return response.data;
  },

  async patchSettings(id, data) {
    const response = await api.patch(`/settings/${id}/`, data);
    return response.data;
  }
};

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => settingsService.updateSettings(id, data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

export const usePatchSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => settingsService.patchSettings(id, data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};
