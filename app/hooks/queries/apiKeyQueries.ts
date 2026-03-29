import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ApiKey } from '~/types';
import { fetchResource } from './utils/fetchResource';

export function useApiKeys(): UseQueryResult<ApiKey[], Error> {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: () => fetchResource<ApiKey[]>('api-keys'),
  });
}
