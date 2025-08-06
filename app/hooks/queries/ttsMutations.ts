import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { handleApiError } from '~/utils/handleApiError';

export function useCreateTtsProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetchWithAuth('tts-providers', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      return res.json();
    },
    onSuccess: (newData) => {
      queryClient.invalidateQueries({ queryKey: ['ttsProviders'] });
    },
  });
}

export function useUpdateTtsProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ttsProviderId, formatData }: { ttsProviderId: string; formatData: FormData }) => {
      const res = await fetchWithAuth(`tts-providers/${ttsProviderId}`, {
        method: 'PATCH',
        body: formatData,
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      return res.json();
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['ttsProvider', updatedData.id], updatedData);
      queryClient.invalidateQueries({ queryKey: ['ttsProviders'] });
    },
  });
}

export function useDeleteTtsProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`tts-providers/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ttsProviders'] });
    },
  });
}

export function useCreateTtsVoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ttsProviderId, jsonData}: {ttsProviderId: string, jsonData: Record<string, any>}) => {
      const res = await fetchWithAuth('tts-voices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ttsVoices'] });
      queryClient.invalidateQueries({ queryKey: ['ttsProviders'] });
    },
  });
}

export function useUpdateTtsVoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ttsVoiceId, jsonData }: { ttsVoiceId: string; jsonData: Record<string, any> }) => {
      const res = await fetchWithAuth(`tts-voices/${ttsVoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      return res.json();
    },
    onSuccess: (updatedData, { ttsVoiceId }) => {
      queryClient.setQueryData(['ttsVoice', ttsVoiceId], updatedData);
      queryClient.invalidateQueries({ queryKey: ['ttsVoices'] });
      queryClient.invalidateQueries({ queryKey: ['ttsProviders'] });
    },
  });
}

export function useDeleteTtsVoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`tts-voices/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ttsVoices'] });
      queryClient.invalidateQueries({ queryKey: ['ttsProviders'] });
    },
  });
}
