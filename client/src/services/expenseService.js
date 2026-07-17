import api from './api.js';

export const expenseService = {
  getExpenses: async (params) => {
    return await api.get('/expenses/', { params });
  },

  getExpenseById: async (id) => {
    return await api.get(`/expenses/${id}/`);
  },

  createExpense: async (data) => {
    return await api.post('/expenses/', data);
  },

  updateExpense: async (id, data) => {
    return await api.put(`/expenses/${id}/`, data);
  },

  patchExpense: async (id, data) => {
    return await api.patch(`/expenses/${id}/`, data);
  },

  deleteExpense: async (id) => {
    return await api.delete(`/expenses/${id}/`);
  }
};
