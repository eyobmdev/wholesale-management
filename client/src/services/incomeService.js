import api from './api.js';

export const incomeService = {
  getIncome: async (params = {}) => {
    return await api.get('/income/', { params });
  },
  getPaymentMethodOptions: async () => {
    return await api.get('/payment-method-options/');
  },
  updateIncome: async (id, data) => {
    return await api.put(`/income/${id}/`, data);
  },
  deleteIncome: async (id) => {
    return await api.delete(`/income/${id}/`);
  }
};
