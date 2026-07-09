import { useMutation } from '@tanstack/react-query';
import api from './api.js';

export const authService = {
  async login(credentials) {
    // The api interceptor automatically returns response.data
    return await api.post('/auth/login/', credentials);
  },

  async register(userData) {
    return await api.post('/auth/register/', userData);
  },

  async updatePassword(passwordData) {
    return await api.put('/auth/password/', passwordData); 
  },

  async forgotPassword(email) {
    return await api.post('/auth/forgot-password/', { email });
  },

  async resetPassword(data) {
    return await api.post('/auth/reset-password/', data);
  },

  setTokens(access, refresh) {
    if (access) localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
  },

  getAccessToken() {
    return localStorage.getItem('access_token');
  },

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  },

  removeTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  async logout() {
    try {
      const refresh = this.getRefreshToken();
      if (refresh) {
        await api.post('/auth/logout/', { refresh });
      }
    } catch (error) {
      console.warn("Logout API call failed, but clearing local session anyway.");
    } finally {
      this.removeTokens();
      window.location.href = '/login';
    }
  },

  isAuthenticated() {
    return !!this.getAccessToken();
  }
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials) => authService.login(credentials),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (userData) => authService.register(userData),
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (passwordData) => authService.updatePassword(passwordData),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email) => authService.forgotPassword(email),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data) => authService.resetPassword(data),
  });
};
