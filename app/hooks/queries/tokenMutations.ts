import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { handleApiError } from '~/utils/handleApiError';

// Create token permit mutation
export function useCreateTokenPermit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permitData: Record<string, any>) => {
      const response = await fetchWithAuth('token-permits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permitData),
      });

      if (!response.ok) {
        throw new Error('Failed to create token permit');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokenPermits'] });
    },
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data, method = 'PATCH' }: { userId: string; data: Record<string, any>; method?: string }) => {
      const response = await fetchWithAuth(`users/${userId}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return response.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser);
    },
  });
}
