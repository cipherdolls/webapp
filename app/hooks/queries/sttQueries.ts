import { useQuery } from '@tanstack/react-query';
import type { SttProvider, Paginated } from '~/types';
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
    queryFn: async () => {
      const response = await fetchResource<Paginated<SttProvider>>(`stt-providers`);
      return response.data;
    },
  });
}
