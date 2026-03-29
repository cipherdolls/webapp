import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { AiProvider, AiProvidersPaginated, ChatModel, ChatModelsPaginated, EmbeddingModel, Paginated } from '~/types';
import { fetchResource } from './utils/fetchResource';

interface AiProvidersQueryParams {
  name?: string;
  page?: string;
  limit?: string;
}

interface ChatModelsQueryParams {
  page?: string; // default '1'
  limit?: string; // default '10'
  providerModelName?: string;
  contextWindowMin?: string;
  contextWindowMax?: string;
  dollarPerInputTokenMin?: string;
  dollarPerInputTokenMax?: string;
  dollarPerOutputTokenMin?: string;
  dollarPerOutputTokenMax?: string;
  recommended?: string;
  censored?: string;
  error?: string;
}

interface EmbeddingModelsQueryParams {
  name?: string;
  page?: string;
  limit?: string;
}

interface ReasoningModelsQueryParams {
  name?: string;
  page?: string;
  limit?: string;
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

function serializeParams(params: AiProvidersQueryParams) {
  return JSON.stringify(params, Object.keys(params).sort());
}

export function useInfiniteAiProviders(params: Omit<AiProvidersQueryParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: ['aiProviders', serializeParams(params)],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const allParams = { ...params, page: pageParam.toString() };
      const searchParams = new URLSearchParams(allParams);
      const response = await fetchResource<AiProvidersPaginated>(`ai-providers?${searchParams}`);
      return response;
    },
    getNextPageParam: (lastPage) => {
      // Defensive check, works with your backend response!
      if (lastPage?.meta?.page && lastPage?.meta?.totalPages && lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage?.meta?.page && firstPage.meta.page > 1) {
        return firstPage.meta.page - 1;
      }
      return undefined;
    },
  });
}


export function useChatModel(chatModelId: string) {
  return useQuery({
    queryKey: ['chatModel', chatModelId],
    queryFn: () => fetchResource<ChatModel>(`chat-models/${chatModelId}`),
    enabled: !!chatModelId,
  });
}

export function useInfiniteChatModels(params: Omit<ChatModelsQueryParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: ['chatModels', serializeParams(params)],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const allParams = { ...params, page: pageParam.toString() };
      const searchParams = new URLSearchParams(allParams);
      const response = await fetchResource<ChatModelsPaginated>(`chat-models?${searchParams}`);
      return response;
    },
    getNextPageParam: (lastPage) => {
      // Defensive check, works with your backend response!
      if (lastPage?.meta?.page && lastPage?.meta?.totalPages && lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage?.meta?.page && firstPage.meta.page > 1) {
        return firstPage.meta.page - 1;
      }
      return undefined;
    },
  });
}

export function useEmbeddingModel(embeddingModelId: string) {
  return useQuery({
    queryKey: ['embeddingModel', embeddingModelId],
    queryFn: () => fetchResource<EmbeddingModel>(`embedding-models/${embeddingModelId}`),
    enabled: !!embeddingModelId,
  });
}


export function useEmbeddingModels(params: EmbeddingModelsQueryParams = {}) {
  return useQuery<EmbeddingModel[]>({
    queryKey: ['embeddingModels', serializeParams(params)],
    queryFn: async () => {
      const searchParams = new URLSearchParams(params as any);
      const response = await fetchResource<Paginated<EmbeddingModel>>(`embedding-models?${searchParams}`);
      return response.data;
    },
  });
}

export function useReasoningModel(reasoningModelId: string) {
  return useQuery({
    queryKey: ['reasoningModel', reasoningModelId],
    queryFn: () => fetchResource<ChatModel>(`reasoning-models/${reasoningModelId}`),
    enabled: !!reasoningModelId,
  });
}


export function useReasoningModels(params: ReasoningModelsQueryParams = {}) {
  return useQuery<ChatModel[]>({
    queryKey: ['reasoningModels', serializeParams(params)],
    queryFn: async () => {
      const searchParams = new URLSearchParams(params as any);
      const response = await fetchResource<Paginated<ChatModel>>(`reasoning-models?${searchParams}`);
      return response.data;
    },
  });
}
