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

  async fullUpdateSale(id, data) {
    return await api.put(`/sales/${id}/`, data);
  },

  async deleteSale(id) {
    return await api.delete(`/sales/${id}/`);
  },

  async getSaleItems(params = {}) {
    return await api.get('/sale-items/', { params });
  },

  async createSaleItem(data) {
    return await api.post('/sale-items/', data);
  },

  async updateSaleItem(id, data) {
    return await api.put(`/sale-items/${id}/`, data);
  },

  async deleteSaleItem(id) {
    return await api.delete(`/sale-items/${id}/`);
  },

  async getCustomerOptions(search = '') {
    const res = await api.get('/customer-options/', { params: search ? { search } : {} });
    return res;
  },

  async getStockOptions(search = '') {
    const res = await api.get('/stock-options/', { params: search ? { search } : {} });
    return res;
  },

  async getPaymentMethodOptions(search = '') {
    const res = await api.get('/payment-method-options/', { params: search ? { search } : {} });
    return res;
  }
};
