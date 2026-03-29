import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { handleApiError } from '~/utils/handleApiError';

export function useUpdateDoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dollId, formData }: { dollId: string; formData: FormData }) => {
      const response = await fetchWithAuth(`dolls/${dollId}`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return response.json();
    },
    onSuccess: (updatedDoll) => {
      queryClient.setQueryData(['doll', updatedDoll.id], updatedDoll);
      queryClient.invalidateQueries({ queryKey: ['dolls'] });
    },
  });
}

export function useDeleteDoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dollId: string) => {
      const response = await fetchWithAuth(`dolls/${dollId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return { dollId };
    },
    onSuccess: ({ dollId }) => {
      queryClient.invalidateQueries({ queryKey: ['dolls'] });
      queryClient.removeQueries({ queryKey: ['doll', dollId] });
    },
  });
}
