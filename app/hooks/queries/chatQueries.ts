import { useQuery } from '@tanstack/react-query';
import type { Chat } from '~/types';
import { fetchResource } from './utils/fetchResource';

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
    queryFn: () => fetchResource<Chat[]>(`chats`),
  });
}