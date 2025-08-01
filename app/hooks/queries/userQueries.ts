import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { User } from '~/types';

// Generic fetch function
async function fetchResource<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.json();
}

// User queries
export function useUser(options?: Omit<UseQueryOptions<User, Error, User, ['user']>, 'queryKey' | 'queryFn'>): UseQueryResult<User, Error> {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => fetchResource<User>(`users/me`),
    ...options
  });
}