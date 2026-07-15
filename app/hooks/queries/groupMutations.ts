import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { handleApiError } from '~/utils/handleApiError';

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await fetchWithAuth('groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
      return response.json();
    },
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.setQueryData(['group', newGroup.id], newGroup);
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, data }: { groupId: string; data: Record<string, any> }) => {
      const response = await fetchWithAuth(`groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
      return response.json();
    },
    onSuccess: (updatedGroup) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', updatedGroup.id] });
      queryClient.invalidateQueries({ queryKey: ['group', updatedGroup.slug] });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const response = await fetchWithAuth(`groups/${groupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        await handleApiError(response);
      }
      return { groupId };
    },
    onSuccess: ({ groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.removeQueries({ queryKey: ['group', groupId] });
    },
  });
}
