import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { User } from '~/types';

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
          action: 'RefreshTokenBalance' 
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