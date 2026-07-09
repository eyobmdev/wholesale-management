import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api.js';
import { mockSettingsData } from './mock/settingsData.js';

// Toggle this to false when the backend is ready
const USE_MOCK = true;

export const settingsService = {
  async getSettings() {
    if (USE_MOCK) {
      return new Promise(resolve => setTimeout(() => resolve(mockSettingsData), 500));
    }
    // Real API call
    return await api.get('/settings');
  },
  
  async updateSettings(data) {
    if (USE_MOCK) {
      return new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Settings updated successfully', data }), 800));
    }
    // Real API call
    return await api.put('/settings', data);
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
    mutationFn: (data) => settingsService.updateSettings(data),
    onSuccess: (response) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};
