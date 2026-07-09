import { useMutation } from '@tanstack/react-query';
import api from './api.js';

// Toggle this to false when the backend is ready
const USE_MOCK = true;

export const authService = {
  async updatePassword(passwordData) {
    if (USE_MOCK) {
      return new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Password updated successfully' }), 800));
    }
    // Real API call
    return await api.put('/auth/password', passwordData); // Or whatever the django endpoint will be
  }
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (passwordData) => authService.updatePassword(passwordData),
  });
};
