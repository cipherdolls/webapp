import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import type { Avatar, AvatarsPaginated } from '~/types';
import { fetchResource } from './utils/fetchResource';

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
  free?: string;
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

export function useInfiniteAvatars(params: Omit<AvatarsQueryParams, 'page'>, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: ['avatars', serializeParams(params)],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const allParams = { ...params, page: pageParam.toString() };
      const searchParams = new URLSearchParams(allParams);

      const response = await fetchResource<AvatarsPaginated>(`avatars?${searchParams}`);
      return response;
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
    enabled: options?.enabled ?? true,
  });
}
