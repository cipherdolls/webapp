import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Doll, DollBody } from '~/types';

// Generic fetch function
async function fetchResource<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.json();
}

// Doll queries
export function useDoll(dollId: string) {
  return useQuery({
    queryKey: ['doll', dollId],
    queryFn: () => fetchResource<Doll>(`dolls/${dollId}`),
    enabled: !!dollId,
  });
}

export function useDolls() {
  return useQuery({
    queryKey: ['dolls'],
    queryFn: () => fetchResource<Doll[]>('dolls'),
  });
}

// Doll Body queries
export function useDollBody(dollBodyId: string) {
  return useQuery({
    queryKey: ['dollBody', dollBodyId],
    queryFn: () => fetchResource<DollBody>(`doll-bodies/${dollBodyId}`),
    enabled: !!dollBodyId,
  });
}

export function useDollBodies(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['dollBodies', page, limit],
    queryFn: () => fetchResource<any>(`doll-bodies?page=${page}&limit=${limit}`),
  });
}