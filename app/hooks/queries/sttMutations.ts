import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { SttProvider } from '~/types';
import { handleApiError } from '~/utils/handleApiError';


export function useCreateSttProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetchWithAuth('stt-providers', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        await handleApiError(response);
      }
      return response.json() as Promise<SttProvider>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sttProviders'] });
    },
  });
}

export function useUpdateSttProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sttProviderId, formData }: { sttProviderId: string; formData: FormData }) => {
      const response = await fetchWithAuth(`stt-providers/${sttProviderId}`, {
        method: 'PATCH',
        body: formData,
      });
      if (!response.ok) {
        await handleApiError(response);
      }
      return response.json() as Promise<SttProvider>;
    },
    onSuccess: (newData, { sttProviderId }) => {
      queryClient.setQueryData(['sttProvider', sttProviderId], newData);
      queryClient.invalidateQueries({ queryKey: ['sttProviders'] });
    },
  });
}

export function useDeleteSttProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sttProviderId: string) => {
      const response = await fetchWithAuth(`stt-providers/${sttProviderId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        await handleApiError(response);
      }
      return response.json() as Promise<SttProvider>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sttProviders'] });
    },
  });
}
