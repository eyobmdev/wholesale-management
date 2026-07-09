import { useMutation } from '@tanstack/react-query';
import api from './api.js';

// Toggle this to false when the backend is ready
const USE_MOCK = true;

export const authService = {
  async login(credentials) {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (credentials.email && credentials.password) {
            resolve({ token: 'mock-jwt-token-12345', user: { email: credentials.email } });
          } else {
            reject(new Error('Invalid email or password'));
          }
        }, 800);
      });
    }
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  async register(userData) {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (userData.password !== userData.password2) {
             reject(new Error('Passwords do not match'));
          } else {
             resolve({ token: 'mock-jwt-token-12345', user: { email: userData.email, first_name: userData.first_name } });
          }
        }, 1000);
      });
    }
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  async updatePassword(passwordData) {
    if (USE_MOCK) {
      return new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Password updated successfully' }), 800));
    }
    // Real API call
    return await api.put('/auth/password', passwordData); 
  },

  setToken(token) {
    localStorage.setItem('auth_token', token);
  },

  getToken() {
    return localStorage.getItem('auth_token');
  },

  removeToken() {
    localStorage.removeItem('auth_token');
  },

  isAuthenticated() {
    return !!this.getToken();
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
