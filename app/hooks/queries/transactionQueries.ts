import { useQuery } from '@tanstack/react-query';
import type { Transaction } from '~/types';
import { fetchResource } from './utils/fetchResource';

export function useTransactions(messageId: string) {
  return useQuery({
    queryKey: ['transactions', messageId],
    queryFn: () => fetchResource<Transaction[]>(`transactions?messageId=${messageId}`),
    enabled: !!messageId,
  });
}
