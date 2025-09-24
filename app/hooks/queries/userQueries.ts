import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import type { User } from '~/types';
import { fetchResource } from './utils/fetchResource';

// User queries
export function useUser(options?: Omit<UseQueryOptions<User, Error, User, ['user']>, 'queryKey' | 'queryFn'>): UseQueryResult<User, Error> {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => fetchResource<User>(`users/me`),
    ...options
  });
}

export function useUserReferrals(options?: Omit<UseQueryOptions<User, Error, User, ['user-referrals']>, 'queryKey' | 'queryFn'>): UseQueryResult<User, Error> {
  const { data: user } = useUser()

  return useQuery({
    queryKey: ['user-referrals'],
    queryFn: () => fetchResource<User>(`users/${user?.id}`),
    ...options,
    enabled: !!user,
  });
}