import { useQuery } from '@tanstack/react-query';
import type { Chat, Paginated } from '~/types';
import { fetchResource } from './utils/fetchResource';
import { fetchWithAuth } from '~/utils/fetchWithAuth';

// Chat queries
export function useChat(chatId: string) {
  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => fetchResource<Chat>(`chats/${chatId}`),
    enabled: !!chatId,
  });
}

export function useChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await fetchResource<Paginated<Chat>>(`chats`);
      return response.data;
    },
  });
}

export function useChatSystemPrompt(chatId: string) {
  return useQuery({
    queryKey: ['chat', chatId, 'system-prompt'],
    queryFn: async () => {
      const response = await fetchWithAuth(`chats/${chatId}/system-prompt`);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const text = await response.text();

      if (!text || text.trim() === '') {
        return null;
      }

      return { systemPrompt: text, scenarioName: '' };
    },
    enabled: !!chatId,
    staleTime: 0, // Don't cache on our side, it's cached in Redis. Reference: https://github.com/cipherdolls/webapp/pull/736#issuecomment-3471698321
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
