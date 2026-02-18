import { useQuery } from '@tanstack/react-query';
import type { Transaction, Paginated } from '~/types';
import { fetchResource } from './utils/fetchResource';

export function useTransactions(messageId: string) {
  return useQuery({
    queryKey: ['transactions', messageId],
    queryFn: async () => {
      const response = await fetchResource<Paginated<Transaction>>(`transactions?messageId=${messageId}`);
      return response.data;
    },
    enabled: !!messageId,
  });
}
