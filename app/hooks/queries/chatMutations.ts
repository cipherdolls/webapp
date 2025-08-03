import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { handleApiError } from '~/utils/handleApiError';
import type { Chat } from '~/types';

// Create chat mutation
export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ avatarId, scenarioId }: { avatarId: string; scenarioId: string }) => {
      const response = await fetchWithAuth('chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarId, scenarioId }),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
      return response.json();
    },
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chat', newChat.id] });
    },
  });
}

// Update chat mutation
export function useUpdateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, data }: { chatId: string; data: Record<string, any> }) => {
      const response = await fetchWithAuth(`chats/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return response.json();
    },
    onSuccess: (updatedChat) => {
      queryClient.invalidateQueries({ queryKey: ['chat', updatedChat.id] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}

// Delete chat mutation
export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatId: string) => {
      const response = await fetchWithAuth(`chats/${chatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return { chatId };
    },
    onSuccess: ({ chatId }) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.removeQueries({ queryKey: ['chat', chatId] });
    },
  });
} 