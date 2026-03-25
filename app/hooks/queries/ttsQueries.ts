import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import type { TtsProvider, TtsVoice, Paginated } from '~/types';
import { fetchResource } from './utils/fetchResource';

// TTS Voice queries
export function useTtsVoice(ttsVoiceId: string) {
  return useQuery({
    queryKey: ['ttsVoice', ttsVoiceId],
    queryFn: () => fetchResource<TtsVoice>(`tts-voices/${ttsVoiceId}`),
    enabled: !!ttsVoiceId,
  });
}

interface TtsVoicesQueryParams {
  gender?: string;
  language?: string;
  name?: string;
  limit?: string;
}

export function useInfiniteTtsVoices(params: TtsVoicesQueryParams = {}) {
  return useInfiniteQuery({
    queryKey: ['ttsVoices', params] as const,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1, queryKey }) => {
      const [, currentParams] = queryKey;
      const allParams: Record<string, string> = { page: pageParam.toString(), limit: currentParams.limit || '10' };
      if (currentParams.gender) allParams.gender = currentParams.gender;
      if (currentParams.language) allParams.language = currentParams.language;
      if (currentParams.name) allParams.name = currentParams.name;
      const searchParams = new URLSearchParams(allParams);
      const response = await fetchResource<Paginated<TtsVoice>>(`tts-voices?${searchParams}`);
      return response;
    },
    getNextPageParam: (lastPage) => {
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


export function useTtsProvider(ttsProviderId: string) {
  return useQuery({
    queryKey: ['ttsProvider', ttsProviderId],
    queryFn: () => fetchResource<TtsProvider>(`tts-providers/${ttsProviderId}`),
    enabled: !!ttsProviderId,
  });
}

export function useTtsProviders() {
  return useQuery({
    queryKey: ['ttsProviders'],
    queryFn: async () => {
      const response = await fetchResource<Paginated<TtsProvider>>(`tts-providers`);
      return response.data;
    },
  });
}