import { useQuery } from '@tanstack/react-query';
import type { TokenPermit, TokenPermitsPaginated } from '~/types';
import { fetchResource } from './utils/fetchResource';

// Token Permit queries
export function useTokenPermit(tokenPermitId: string) {
  return useQuery({
    queryKey: ['tokenPermit', tokenPermitId],
    queryFn: () => fetchResource<TokenPermit>(`token-permits/${tokenPermitId}`),
    enabled: !!tokenPermitId,
  });
}

export function useTokenPermits(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['tokenPermits', page, limit],
    queryFn: () => fetchResource<TokenPermitsPaginated>(`token-permits?page=${page}&limit=${limit}`),
  });
}
