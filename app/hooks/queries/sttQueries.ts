import { useQuery } from '@tanstack/react-query';
import type { SttProvider } from '~/types';
import { fetchResource } from './utils/fetchResource';


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
