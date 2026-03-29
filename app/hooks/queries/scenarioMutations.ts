import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { handleApiError } from '~/utils/handleApiError';

// Create scenario mutation
export function useCreateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetchWithAuth('scenarios', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        await handleApiError(response);
      }
      return response.json();
    },
    onSuccess: (newScenario) => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      queryClient.setQueryData(['scenario', newScenario.id], newScenario);
    },
  });
}

// Update scenario mutation
export function useUpdateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ scenarioId, formData }: { scenarioId: string; formData: FormData }) => {
      const response = await fetchWithAuth(`scenarios/${scenarioId}`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return response.json();
    },
    onSuccess: (updatedScenario) => {
      queryClient.setQueryData(['scenario', updatedScenario.id], updatedScenario);
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}

// Delete scenario mutation
export function useDeleteScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scenarioId: string) => {
      const response = await fetchWithAuth(`scenarios/${scenarioId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return { scenarioId };
    },
    onError: (error) => {
      console.error('Error deleting scenario:', error);
    },
    onSuccess: ({ scenarioId }) => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      queryClient.removeQueries({ queryKey: ['scenario', scenarioId] });
    },
  });
}
