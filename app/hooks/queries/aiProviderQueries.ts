import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { AiProvider, AiProvidersPaginated, ChatModel, ChatModelsPaginated, EmbeddingModel } from '~/types';

// Generic fetch function
async function fetchResource<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.json();
}

// AI Provider queries
export function useAiProvider(aiProviderId: string) {
  return useQuery({
    queryKey: ['aiProvider', aiProviderId],
    queryFn: () => fetchResource<AiProvider>(`ai-providers/${aiProviderId}`),
    enabled: !!aiProviderId,
  });
}

export function useAiProviders() {
  return useQuery({
    queryKey: ['aiProviders'],
    queryFn: () => fetchResource<AiProvidersPaginated>(`ai-providers`),
  });
}
