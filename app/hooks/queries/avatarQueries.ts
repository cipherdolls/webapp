import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Avatar, AvatarsPaginated } from '~/types';

// Generic fetch function
async function fetchResource<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.json();
}

// Avatar queries
export function useAvatar(avatarId: string) {
  return useQuery({
    queryKey: ['avatar', avatarId],
    queryFn: () => fetchResource<Avatar>(`avatars/${avatarId}`),
    enabled: !!avatarId,
  });
}

interface AvatarsQueryParams {
  page?: number;
  limit?: number;
  mine?: boolean;
  published?: boolean;
}

export function useAvatars(params: AvatarsQueryParams) {
  return useQuery({
    queryKey: ['avatars', params],
    queryFn: () => fetchResource<AvatarsPaginated>(`avatars?${new URLSearchParams(params as Record<string, string>).toString()}`),
  });
}

