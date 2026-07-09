import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api.js';

export const factoryService = {
  async getFactories(params = {}) {
    return await api.get('/factories/', { params });
  },

  async getFactory(id) {
    return await api.get(`/factories/${id}/`);
  },

  async createFactory(data) {
    return await api.post('/factories/', data);
  },

  async updateFactory(id, data) {
    return await api.put(`/factories/${id}/`, data);
  },

  async patchFactory(id, data) {
    return await api.patch(`/factories/${id}/`, data);
  },

  async deleteFactory(id) {
    return await api.delete(`/factories/${id}/`);
  }
};

export const useFactories = (params = {}) => {
  return useQuery({
    queryKey: ['factories', params],
    queryFn: () => factoryService.getFactories(params),
    keepPreviousData: true,
  });
};

export const useFactory = (id) => {
  return useQuery({
    queryKey: ['factory', id],
    queryFn: () => factoryService.getFactory(id),
    enabled: !!id,
  });
};

export const useCreateFactory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => factoryService.createFactory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factories'] });
    }
  });
};

export const useUpdateFactory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, partial = true }) => {
      if (partial) {
        return factoryService.patchFactory(id, data);
      }
      return factoryService.updateFactory(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['factories'] });
      queryClient.invalidateQueries({ queryKey: ['factory', variables.id] });
    }
  });
};

export const useDeleteFactory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => factoryService.deleteFactory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factories'] });
    }
  });
};
