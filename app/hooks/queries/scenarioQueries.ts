import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { AvatarsPaginated, Scenario, ScenariosPaginated } from '~/types';

// Generic fetch function
async function fetchResource<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.json();
}

interface ScenariosQueryParams {
  mine?: string;
  chat?: string;
  published?: string;
  name?: string;
  gender?: string;
  page?: string;
  limit?: string;
}

// Scenario queries
export function useScenario(scenarioId: string) {
  return useQuery({
    queryKey: ['scenario', scenarioId],
    queryFn: () => fetchResource<Scenario>(`scenarios/${scenarioId}`),
    enabled: !!scenarioId,
  });
}

export function useScenarios(params?: ScenariosQueryParams) {
  return useQuery({
    queryKey: ['scenarios', params],
    queryFn: () => fetchResource<ScenariosPaginated>(`scenarios?${new URLSearchParams(params as Record<string, string>).toString()}`),
  });
}

export function useInfiniteScenarios(params?: Omit<ScenariosQueryParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['scenarios', params],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams({ ...params, page: pageParam.toString() });
      const response = await fetchWithAuth(`scenarios?${searchParams}`);
      if (!response.ok) throw new Error('Failed to fetch scenarios');
      return response.json() as Promise<ScenariosPaginated>;
    },
    getNextPageParam: (lastPage: ScenariosPaginated) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage: ScenariosPaginated) => {
      if (firstPage.meta.page > 1) {
        return firstPage.meta.page - 1;
      }
      return undefined;
    },
  });
}
