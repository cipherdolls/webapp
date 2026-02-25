import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { handleApiError } from '~/utils/handleApiError';

export function useCreateDollBody() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetchWithAuth('doll-bodies', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        await handleApiError(response);
      }
      return response.json();
    },
    onSuccess: (newDollBody) => {
      queryClient.invalidateQueries({ queryKey: ['dollBodies'] });
      queryClient.setQueryData(['dollBody', newDollBody.id], newDollBody);
    },
  });
}

export function useUpdateDollBody() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dollBodyId, formData }: { dollBodyId: string; formData: FormData }) => {
      const response = await fetchWithAuth(`doll-bodies/${dollBodyId}`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return response.json();
    },
    onSuccess: (updatedDollBody) => {
      queryClient.setQueryData(['dollBody', updatedDollBody.id], updatedDollBody);
      queryClient.invalidateQueries({ queryKey: ['dollBodies'] });
    },
  });
}

export function useDeleteDollBody() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dollBodyId: string) => {
      const response = await fetchWithAuth(`doll-bodies/${dollBodyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return { dollBodyId };
    },
    onSuccess: ({ dollBodyId }) => {
      queryClient.invalidateQueries({ queryKey: ['dollBodies'] });
      queryClient.removeQueries({ queryKey: ['dollBody', dollBodyId] });
    },
  });
}
