import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { TtsProvider, TtsVoice, TtsJob } from '~/types';

// Generic fetch function
async function fetchResource<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.json();
}

// TTS Voice queries
export function useTtsVoice(ttsVoiceId: string) {
  return useQuery({
    queryKey: ['ttsVoice', ttsVoiceId],
    queryFn: () => fetchResource<TtsVoice>(`tts-voices/${ttsVoiceId}`),
    enabled: !!ttsVoiceId,
  });
}

export function useTtsVoices() {
  return useQuery({
    queryKey: ['ttsVoices'],
    queryFn: () => fetchResource<TtsVoice[]>(`tts-voices`),
  });
}


export function useTtsProvider(ttsProviderId: string) {
  return useQuery({
    queryKey: ['ttsProvider', ttsProviderId],
    queryFn: () => fetchResource<TtsProvider>(`tts-providers/${ttsProviderId}`),
    enabled: !!ttsProviderId,
  });
}

export function useTtsProviders() {
  return useQuery({
    queryKey: ['ttsProviders'],
    queryFn: () => fetchResource<TtsProvider[]>(`tts-providers`),
  });
}