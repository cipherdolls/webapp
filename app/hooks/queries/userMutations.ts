import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { handleApiError } from '~/utils/handleApiError';

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await fetchWithAuth(`users/${data.userId}`, {
        method: 'PATCH',
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

// Refresh token balance mutation
export function useRefreshTokenBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, signerAddress }: { userId: string; signerAddress: string }) => {
      const response = await fetchWithAuth(`users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signerAddress,
          action: 'RefreshTokenBalance',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh balance');
      }

      return response.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser);
    },
  });
}
