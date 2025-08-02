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
  mine?: boolean;
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



export function useInfiniteAvatars(params: Omit<AvatarsQueryParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['avatars', params],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const paramsWithPage = { ...params, page: pageParam.toString() };
      const searchParams = new URLSearchParams();
      
      Object.entries(paramsWithPage).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });
      
      const response = await fetchWithAuth(`avatars?${searchParams}`);
      if (!response.ok) throw new Error('Failed to fetch avatars');
      return response.json() as Promise<AvatarsPaginated>;
    },
    getNextPageParam: (lastPage: AvatarsPaginated) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage: AvatarsPaginated) => {
      if (firstPage.meta.page > 1) {
        return firstPage.meta.page - 1;
      }
      return undefined;
    },
  });
}
