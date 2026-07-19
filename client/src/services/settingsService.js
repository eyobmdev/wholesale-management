import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api.js';

export const settingsService = {
  async getSettings() {
    const response = await api.get('/settings/');
    // If the backend returns an array (e.g., list of settings), grab the first one
    if (Array.isArray(response)) {
      return response[0];
    }
    // If it's paginated
    if (response && response.results && Array.isArray(response.results)) {
      return response.results[0];
    }
    return response;
  },
  
  async updateSettings(id, data) {
    return await api.put(`/settings/${id}/`, data);
  },

  async patchSettings(id, data) {
    return await api.patch(`/settings/${id}/`, data);
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
