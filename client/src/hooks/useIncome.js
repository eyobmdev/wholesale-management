import { useQuery } from '@tanstack/react-query';
import { incomeService } from '../services/incomeService.js';

export const useIncome = (params = {}) => {
  return useQuery({
    queryKey: ['income', params],
    queryFn: () => incomeService.getIncome(params),
    keepPreviousData: true,
  });
};
