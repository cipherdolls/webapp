import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { handleApiError } from '~/utils/handleApiError';

export function useCreateAiProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetchWithAuth(`ai-providers`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['aiProviders'] });
    },
  });
}

export function useUpdateAiProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ aiProviderId, formData }: { aiProviderId: string; formData: FormData }) => {
      const res = await fetchWithAuth(`ai-providers/${aiProviderId}`, {
        method: 'PATCH',
        body: formData,
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['aiProviders'] });
      queryClient.invalidateQueries({ queryKey: ['aiProvider', data.id] });
    },
  });
}

export function useDeleteAiProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (aiProviderId: string) => {
      const res = await fetchWithAuth(`ai-providers/${aiProviderId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiProviders'] });
    },
  });
}

export function useCreateChatModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jsonData: Record<string, any>) => {
      const res = await fetchWithAuth(`chat-models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['aiProviders'] });
      queryClient.invalidateQueries({ queryKey: ['chatModels'] });
    },
  });
}

export function useUpdateChatModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatModelId, jsonData }: { chatModelId: string; jsonData: Record<string, any> }) => {
      const res = await fetchWithAuth(`chat-models/${chatModelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['aiProviders'] });
      queryClient.invalidateQueries({ queryKey: ['chatModels'] });
      queryClient.invalidateQueries({ queryKey: ['chatModel', data.id] });
    },
  });
}

export function useDeleteChatModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatModelId: string) => {
      const res = await fetchWithAuth(`chat-models/${chatModelId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiProviders'] });
      queryClient.invalidateQueries({ queryKey: ['chatModels'] });
    },
  });
}

export function useCreateEmbeddingModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jsonData: Record<string, any>) => {
      const res = await fetchWithAuth(`embedding-models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['aiProviders'] });
      queryClient.invalidateQueries({ queryKey: ['embeddingModels'] });
    },
  });
}

export function useUpdateEmbeddingModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ embeddingModelId, jsonData }: { embeddingModelId: string; jsonData: Record<string, any> }) => {
      const res = await fetchWithAuth(`embedding-models/${embeddingModelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['aiProviders'] });
      queryClient.invalidateQueries({ queryKey: ['embeddingModels'] });
      queryClient.invalidateQueries({ queryKey: ['embeddingModel', data.id] });
    },
  });
}

export function useDeleteEmbeddingModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (embeddingModelId: string) => {
      const res = await fetchWithAuth(`embedding-models/${embeddingModelId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiProviders'] });
      queryClient.invalidateQueries({ queryKey: ['embeddingModels'] });
    },
  });
}

export function useCreateReasoningModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jsonData: Record<string, any>) => {
      const res = await fetchWithAuth(`reasoning-models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['aiProviders'] });
      queryClient.invalidateQueries({ queryKey: ['reasoningModels'] });
    },
  });
}

export function useUpdateReasoningModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reasoningModelId, jsonData }: { reasoningModelId: string; jsonData: Record<string, any> }) => {
      const res = await fetchWithAuth(`reasoning-models/${reasoningModelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['aiProviders'] });
      queryClient.invalidateQueries({ queryKey: ['reasoningModels'] });
      queryClient.invalidateQueries({ queryKey: ['reasoningModel', data.id] });
    },
  });
}

export function useDeleteReasoningModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reasoningModelId: string) => {
      const res = await fetchWithAuth(`reasoning-models/${reasoningModelId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiProviders'] });
      queryClient.invalidateQueries({ queryKey: ['reasoningModels'] });
    },
  });
}