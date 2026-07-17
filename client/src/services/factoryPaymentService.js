import api from './api.js';

export const factoryPaymentService = {
  getFactoryPayments: async (params = {}) => {
    return await api.get('/factory-payments/', { params });
  },
  getFactoryPaymentById: async (id) => {
    return await api.get(`/factory-payments/${id}/`);
  },
  createFactoryPayment: async (data) => {
    return await api.post('/factory-payments/', data);
  },
  updateFactoryPayment: async (id, data) => {
    return await api.put(`/factory-payments/${id}/`, data);
  },
  deleteFactoryPayment: async (id) => {
    return await api.delete(`/factory-payments/${id}/`);
  },
};
