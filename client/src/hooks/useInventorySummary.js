import { useQuery } from '@tanstack/react-query';
import { inventorySummaryService } from '../services/inventorySummaryService.js';

export const useInventorySummary = (params = {}) => {
  return useQuery({
    queryKey: ['inventory-summary', params],
    queryFn: () => inventorySummaryService.getInventorySummary(params),
    keepPreviousData: true,
  });
};
