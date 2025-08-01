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

export function useAvatars(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['avatars', page, limit],
    queryFn: () => fetchResource<AvatarsPaginated>(`avatars?page=${page}&limit=${limit}`),
  });
}

export function useMyAvatars() {
  return useQuery({
    queryKey: ['avatars', 'mine'],
    queryFn: () => fetchResource<AvatarsPaginated>('avatars?mine=true'),
  });
}

export function usePublicAvatars(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['avatars', 'public', page, limit],
    queryFn: () => fetchResource<AvatarsPaginated>(`avatars?published=true&page=${page}&limit=${limit}`),
  });
}