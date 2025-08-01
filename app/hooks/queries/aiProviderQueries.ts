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

export function useAiProviders(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['aiProviders', page, limit],
    queryFn: () => fetchResource<AiProvidersPaginated>(`ai-providers?page=${page}&limit=${limit}`),
  });
}

// Chat Model queries
export function useChatModel(chatModelId: string) {
  return useQuery({
    queryKey: ['chatModel', chatModelId],
    queryFn: () => fetchResource<ChatModel>(`chat-models/${chatModelId}`),
    enabled: !!chatModelId,
  });
}

export function useChatModels(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['chatModels', page, limit],
    queryFn: () => fetchResource<ChatModelsPaginated>(`chat-models?page=${page}&limit=${limit}`),
  });
}

// Embedding Model queries
export function useEmbeddingModel(embeddingModelId: string) {
  return useQuery({
    queryKey: ['embeddingModel', embeddingModelId],
    queryFn: () => fetchResource<EmbeddingModel>(`embedding-models/${embeddingModelId}`),
    enabled: !!embeddingModelId,
  });
}

export function useEmbeddingModels(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['embeddingModels', page, limit],
    queryFn: () => fetchResource<any>(`embedding-models?page=${page}&limit=${limit}`),
  });
}

// Reasoning Model queries
export function useReasoningModel(reasoningModelId: string) {
  return useQuery({
    queryKey: ['reasoningModel', reasoningModelId],
    queryFn: () => fetchResource<ChatModel>(`reasoning-models/${reasoningModelId}`),
    enabled: !!reasoningModelId,
  });
}

export function useReasoningModels(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['reasoningModels', page, limit],
    queryFn: () => fetchResource<any>(`reasoning-models?page=${page}&limit=${limit}`),
  });
}