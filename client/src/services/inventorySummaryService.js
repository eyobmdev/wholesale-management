import api from './api.js';

export const inventorySummaryService = {
  getInventorySummary: async (params = {}) => {
    return await api.get('/stock/summary/', { params });
  },
};
