import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
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
  mine?: string;
  chat?: string;
  published?: string;
  name?: string;
  gender?: string;
  page?: string;
  limit?: string;
}

export function useAvatars(params?: AvatarsQueryParams) {
  return useQuery({
    queryKey: ['avatars', params],
    queryFn: () => fetchResource<AvatarsPaginated>(`avatars?${new URLSearchParams(params as Record<string, string>).toString()}`),
  });
}

function serializeParams(params: AvatarsQueryParams) {
  return JSON.stringify(params, Object.keys(params).sort());
}

export function useInfiniteAvatars(params: Omit<AvatarsQueryParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['avatars', serializeParams(params)],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      // Merge params and page
      const allParams = { ...params, page: pageParam.toString() };
      const searchParams = new URLSearchParams(allParams);

      const response = await fetchWithAuth(`avatars?${searchParams}`);
      if (!response.ok) throw new Error('Failed to fetch avatars');

      // No need for type assertion here, just await .json()
      return await response.json(); // AvatarsPaginated
    },
    getNextPageParam: (lastPage) => {
      // Defensive check, works with your backend response!
      if (
        lastPage?.meta?.page &&
        lastPage?.meta?.totalPages &&
        lastPage.meta.page < lastPage.meta.totalPages
      ) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage?.meta?.page && firstPage.meta.page > 1) {
        return firstPage.meta.page - 1;
      }
      return undefined;
    },
  });
}
