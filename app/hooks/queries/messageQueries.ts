import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import type { Message, MessagesPaginatedCursor } from '~/types';
import { fetchResource } from './utils/fetchResource';

// Message queries
export function useMessage(messageId: string) {
  return useQuery({
    queryKey: ['message', messageId],
    queryFn: () => fetchResource<Message>(`messages/${messageId}`),
    enabled: !!messageId,
    refetchOnMount: 'always',
  });
}

// Infinite messages query with cursor-based pagination
export function useInfiniteMessages(chatId: string, limit = 20) {
  return useInfiniteQuery<MessagesPaginatedCursor, Error>({
    queryKey: ['messages', chatId],
    initialPageParam: undefined as string | undefined, // Start with no cursor
    enabled: !!chatId,
    queryFn: async ({ pageParam }) => {
      let url = `messages?chatId=${chatId}&limit=${limit}&direction=next&order=desc`;
      if (pageParam) url += `&cursor=${pageParam}`;
      return fetchResource<MessagesPaginatedCursor>(url);
    },
    getNextPageParam: (lastPage) => lastPage.meta?.nextCursor ?? undefined,
  });
}