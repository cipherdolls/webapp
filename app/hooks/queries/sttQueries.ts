import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { SttProvider, SttJob } from '~/types';

// Generic fetch function
async function fetchResource<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.json();
}

// STT Provider queries
export function useSttProvider(sttProviderId: string) {
  return useQuery({
    queryKey: ['sttProvider', sttProviderId],
    queryFn: () => fetchResource<SttProvider>(`stt-providers/${sttProviderId}`),
    enabled: !!sttProviderId,
  });
}

export function useSttProviders(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['sttProviders', page, limit],
    queryFn: () => fetchResource<any>(`stt-providers?page=${page}&limit=${limit}`),
  });
}

// STT Job queries
export function useSttJob(sttJobId: string) {
  return useQuery({
    queryKey: ['sttJob', sttJobId],
    queryFn: () => fetchResource<SttJob>(`stt-jobs/${sttJobId}`),
    enabled: !!sttJobId,
  });
}