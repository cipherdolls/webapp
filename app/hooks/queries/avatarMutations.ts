import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
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
      
      const responseData = await response.json();
      if (!response.ok) {
        if (responseData && typeof responseData.message === 'object') {
          responseData.message = JSON.stringify(responseData.message);
        }
        const error = new Error(responseData.message || 'Request failed');
        throw error;
      }

      return responseData;
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
    mutationFn: async ({ avatarId, formData }: { avatarId: string; formData: FormData }) => {
      const response = await fetchWithAuth(`avatars/${avatarId}`, {
        method: 'PATCH',
        body: formData,
      });
      
      const responseData = await response.json();
      if (!response.ok) {
        if (responseData && typeof responseData.message === 'object') {
          responseData.message = JSON.stringify(responseData.message);
        }
        const error = new Error(responseData.message || 'Request failed');
        throw error;
      }
      
      return response.json();
    },
    onSuccess: (updatedAvatar) => {
      // Update specific avatar cache
      queryClient.setQueryData(['avatar', updatedAvatar.id], updatedAvatar);
      // Invalidate avatars list to reflect changes
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
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to delete avatar: ${response.status} ${response.statusText}`);
      }
      
      return { avatarId };
    },
    onSuccess: ({ avatarId }) => {
      // Remove from avatars list
      queryClient.setQueriesData(
        { queryKey: ['avatars'], type: 'active' },
        (oldData: any) => {
          if (!oldData?.data) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.filter((avatar: Avatar) => avatar.id !== avatarId),
          };
        }
      );
      
      // Remove specific avatar cache
      queryClient.removeQueries({ queryKey: ['avatar', avatarId] });
    },
  });
}

// Publish/Unpublish avatar mutation
export function useToggleAvatarPublish() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ avatarId, published }: { avatarId: string; published: boolean }) => {
      const formData = new FormData();
      formData.append('published', published.toString());
      
      const response = await fetchWithAuth(`avatars/${avatarId}`, {
        method: 'PATCH',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to ${published ? 'publish' : 'unpublish'} avatar: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (updatedAvatar) => {
      // Update specific avatar cache
      queryClient.setQueryData(['avatar', updatedAvatar.id], updatedAvatar);
      // Invalidate avatars lists
      queryClient.invalidateQueries({ queryKey: ['avatars'] });
    },
  });
}