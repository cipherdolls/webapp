import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Chat } from '~/types';

// Generic fetch function
async function fetchResource<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.json();
}

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