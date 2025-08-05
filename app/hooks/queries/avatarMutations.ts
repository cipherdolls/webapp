import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { handleApiError } from '~/utils/handleApiError';
import type { Avatar } from '~/types';

// Create avatar mutation
export function useCreateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetchWithAuth('avatars', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        await handleApiError(response);
      }
      return response.json();
    },
    onSuccess: (newAvatar) => {
      queryClient.invalidateQueries({ queryKey: ['avatars'] });
      queryClient.setQueryData(['avatar', newAvatar.id], newAvatar);
    },
  });
}

// Update avatar mutation
export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Avatar) => {
      const response = await fetchWithAuth(`avatars/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return response.json();
    },
    onSuccess: (updatedAvatar) => {
      queryClient.setQueryData(['avatar', updatedAvatar.id], updatedAvatar);
      queryClient.invalidateQueries({ queryKey: ['avatars'] });
    },
  });
}

// Delete avatar mutation
export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (avatarId: string) => {
      const response = await fetchWithAuth(`avatars/${avatarId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return { avatarId };
    },
    onSuccess: ({ avatarId }) => {
      queryClient.invalidateQueries({ queryKey: ['avatars'] });
      queryClient.removeQueries({ queryKey: ['avatar', avatarId] });
    },
  });
}
