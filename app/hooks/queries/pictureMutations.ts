import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { handleApiError } from '~/utils/handleApiError';

export function useUploadPicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetchWithAuth('pictures', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        await handleApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avatars'] });
      queryClient.invalidateQueries({ queryKey: ['avatar'] });
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      queryClient.invalidateQueries({ queryKey: ['scenario'] });
    },
  });
}

export function useDeletePicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pictureId: string) => {
      const response = await fetchWithAuth(`pictures/${pictureId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        await handleApiError(response);
      }
      return { pictureId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avatars'] });
      queryClient.invalidateQueries({ queryKey: ['avatar'] });
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      queryClient.invalidateQueries({ queryKey: ['scenario'] });
    },
  });
}
