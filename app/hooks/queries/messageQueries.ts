import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Message, MessagesPaginated } from '~/types';

// Generic fetch function
async function fetchResource<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.json();
}

// Message queries
export function useMessage(messageId: string) {
  return useQuery({
    queryKey: ['message', messageId],
    queryFn: () => fetchResource<Message>(`messages/${messageId}`),
    enabled: !!messageId,
  });
}

export function useMessages(chatId: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: ['messages', chatId],
    queryFn: ({ pageParam = 1 }) =>
      fetchResource<MessagesPaginated>(`chats/${chatId}/messages?page=${pageParam}&limit=${limit}`),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    enabled: !!chatId,
    initialPageParam: 1,
  });
}