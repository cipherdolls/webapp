import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { ChatCompletionJob, EmbeddingJob } from '~/types';

// Generic fetch function
async function fetchResource<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.json();
}

// Chat Completion Job queries
export function useChatCompletionJob(jobId: string) {
  return useQuery({
    queryKey: ['chatCompletionJob', jobId],
    queryFn: () => fetchResource<ChatCompletionJob>(`chat-completion-jobs/${jobId}`),
    enabled: !!jobId,
  });
}

export function useChatCompletionJobs(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['chatCompletionJobs', page, limit],
    queryFn: () => fetchResource<any>(`chat-completion-jobs?page=${page}&limit=${limit}`),
  });
}

// Embedding Job queries
export function useEmbeddingJob(jobId: string) {
  return useQuery({
    queryKey: ['embeddingJob', jobId],
    queryFn: () => fetchResource<EmbeddingJob>(`embedding-jobs/${jobId}`),
    enabled: !!jobId,
  });
}

export function useEmbeddingJobs(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['embeddingJobs', page, limit],
    queryFn: () => fetchResource<any>(`embedding-jobs?page=${page}&limit=${limit}`),
  });
}