import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { handleApiError } from '~/utils/handleApiError';

export function useCreateFillerWord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ text, avatarId }: { text: string; avatarId: string }) => {
      const response = await fetchWithAuth('filler-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, avatarId }),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fillerWords', variables.avatarId] });
    },
  });
}

export function useDeleteFillerWord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fillerWordId, avatarId }: { fillerWordId: string; avatarId: string }) => {
      const response = await fetchWithAuth(`filler-words/${fillerWordId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return { fillerWordId, avatarId };
    },
    onSuccess: ({ avatarId }) => {
      queryClient.invalidateQueries({ queryKey: ['fillerWords', avatarId] });
    },
  });
}
