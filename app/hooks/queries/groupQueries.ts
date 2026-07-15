import { useQuery } from '@tanstack/react-query';
import type { Group, Paginated } from '~/types';
import { fetchResource } from './utils/fetchResource';

interface GroupsQueryParams {
  mine?: string;
  all?: string;
  name?: string;
  page?: string;
  limit?: string;
}

export function useGroups(params?: GroupsQueryParams) {
  return useQuery({
    queryKey: ['groups', params],
    queryFn: () => fetchResource<Paginated<Group>>(`groups?${new URLSearchParams(params as Record<string, string>).toString()}`),
  });
}

export function useGroup(idOrSlug: string) {
  return useQuery({
    queryKey: ['group', idOrSlug],
    queryFn: () => fetchResource<Group>(`groups/${idOrSlug}`),
    enabled: !!idOrSlug,
  });
}
