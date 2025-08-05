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

// TTS Provider queries
export function useTtsProvider(ttsProviderId: string) {
  return useQuery({
    queryKey: ['ttsProvider', ttsProviderId],
    queryFn: () => fetchResource<TtsProvider>(`tts-providers/${ttsProviderId}`),
    enabled: !!ttsProviderId,
  });
}

export function useTtsProviders(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['ttsProviders', page, limit],
    queryFn: () => fetchResource<any>(`tts-providers?page=${page}&limit=${limit}`),
  });
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

export function useTtsVoicesByProvider(ttsProviderId: string) {
  return useQuery({
    queryKey: ['ttsVoices', 'provider', ttsProviderId],
    queryFn: () => fetchResource<TtsVoice[]>(`tts-providers/${ttsProviderId}/tts-voices`),
    enabled: !!ttsProviderId,
  });
}

// TTS Job queries
export function useTtsJob(ttsJobId: string) {
  return useQuery({
    queryKey: ['ttsJob', ttsJobId],
    queryFn: () => fetchResource<TtsJob>(`tts-jobs/${ttsJobId}`),
    enabled: !!ttsJobId,
  });
}