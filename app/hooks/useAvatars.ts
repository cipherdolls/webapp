import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedData } from '~/utils/fetchWithAuth';
import type { AvatarsPaginated } from '~/types';

interface UseAvatarsParams {
  page?: number;
  limit?: number;
  mine?: boolean;
  published?: boolean;
  gender?: string;
  name?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useAvatars(params: UseAvatarsParams = {}) {
  const {
    page = 1,
    limit = 10,
    mine,
    published = true,
    gender,
    name,
    sortBy = 'updatedAt',
    sortOrder = 'desc'
  } = params;

  return useQuery({
    queryKey: ['avatars', params],
    queryFn: async (): Promise<AvatarsPaginated> => {
      const searchParams = new URLSearchParams();

      // Add parameters
      if (mine !== undefined) searchParams.set('mine', mine.toString());
      if (published !== undefined) searchParams.set('published', published.toString());
      if (name) searchParams.set('name', name);
      if (gender && gender !== 'All') {
        const capitalizedGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
        searchParams.set('gender', capitalizedGender);
      }
      searchParams.set('sortBy', sortBy);
      searchParams.set('sortOrder', sortOrder);

      return fetchPaginatedData<AvatarsPaginated>('avatars', searchParams, page, limit);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
} 