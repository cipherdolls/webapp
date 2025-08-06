import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { SttProvider } from '~/types';


async function fetchResource<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint);
  if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.json();
}


export function useSttProvider(sttProviderId: string) {
  return useQuery({
    queryKey: ['sttProvider', sttProviderId],
    queryFn: () => fetchResource<SttProvider>(`stt-providers/${sttProviderId}`),
    enabled: !!sttProviderId,
  });
}

export function useSttProviders() {
  return useQuery({
    queryKey: ['sttProviders'],
    queryFn: () => fetchResource<SttProvider[]>(`stt-providers`),
  });
}
