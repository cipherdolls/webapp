import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { TokenPermit, TokenPermitsPaginated, PaymentJob } from '~/types';

// Generic fetch function
async function fetchResource<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.json();
}

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
