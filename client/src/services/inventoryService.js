import api from './api.js';

export const inventoryService = {
  getInventory: async (params = {}) => {
    return await api.get('/stock/', { params });
  },

  getInventoryItem: async (id) => {
    return await api.get(`/stock/${id}/`);
  },
};
