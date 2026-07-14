import api from './api.js';

export const saleService = {
  async getSales(params = {}) {
    return await api.get('/sales/', { params });
  },

  async getSale(id) {
    return await api.get(`/sales/${id}/`);
  },

  async createSale(data) {
    return await api.post('/sales/', data);
  },

  async updateSale(id, data) {
    return await api.patch(`/sales/${id}/`, data);
  },

  async deleteSale(id) {
    return await api.delete(`/sales/${id}/`);
  },

  async getCustomerOptions(search = '') {
    const res = await api.get('/customer-options/', { params: search ? { search } : {} });
    return res;
  }
};
