import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { handleApiError } from '~/utils/handleApiError';

export function useCreateSponsorship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ scenarioId }: { scenarioId: string }) => {
      const response = await fetchWithAuth('sponsorships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId }),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsorships'] });
    },
  });
}

export function useDeleteSponsorship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sponsorshipId }: { sponsorshipId: string }) => {
      const response = await fetchWithAuth(`sponsorships/${sponsorshipId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return { sponsorshipId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsorships'] });
    },
  });
}
