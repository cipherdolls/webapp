import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Scenario, ScenariosPaginated } from '~/types';

// Generic fetch function
async function fetchResource<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.json();
}


type UseScenariosParams = {
  page?: number;
  limit?: number;
  published?: boolean;
  mine?: boolean;
};


// Scenario queries
export function useScenario(scenarioId: string) {
  return useQuery({
    queryKey: ['scenario', scenarioId],
    queryFn: () => fetchResource<Scenario>(`scenarios/${scenarioId}`),
    enabled: !!scenarioId,
  });
}

export function useScenarios(params: UseScenariosParams = {}) {
  const { page = 1, limit = 20, published, mine } = params;

  const query: Record<string, any> = { page, limit };
  if (published !== undefined) query.published = published;
  if (mine !== undefined) query.mine = mine;

  const key = ['scenarios', query];

  const search = new URLSearchParams(
    Object.entries(query).reduce(
      (acc, [k, v]) => ({ ...acc, [k]: String(v) }),
      {}
    )
  ).toString();

  return useQuery({
    queryKey: key,
    queryFn: () => fetchResource<ScenariosPaginated>(`scenarios?${search}`),
  });
}