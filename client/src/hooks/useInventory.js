import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService.js';

export const useInventory = (params = {}) => {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => inventoryService.getInventory(params),
    keepPreviousData: true,
  });
};

export const useInventoryItem = (id) => {
  return useQuery({
    queryKey: ['inventory', id],
    queryFn: () => inventoryService.getInventoryItem(id),
    enabled: !!id,
  });
};
