import { useQuery } from '@tanstack/react-query';
import type { TransactionLeg } from '~/types';
import { fetchResource } from './utils/fetchResource';

export function useTransactionLegs(transactionJobId: string) {
  return useQuery({
    queryKey: ['transactionLegs', transactionJobId],
    queryFn: () => fetchResource<TransactionLeg[]>(`transactionLegs?transactionJobId=${transactionJobId}`),
    enabled: !!transactionJobId,
  });
}