import { useQuery } from '@tanstack/react-query';
import type { Sponsorship } from '~/types';
import { fetchResource } from './utils/fetchResource';

interface SponsorshipsQueryParams {
  scenarioId?: string;
  userId?: string;
}

export function useSponsorships(params?: SponsorshipsQueryParams) {
  const queryParams = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';

  return useQuery({
    queryKey: ['sponsorships', params],
    queryFn: () => fetchResource<Sponsorship[]>(`sponsorships${queryParams}`),
  });
}

export function useSponsorship(id: string) {
  return useQuery({
    queryKey: ['sponsorship', id],
    queryFn: () => fetchResource<Sponsorship>(`sponsorships/${id}`),
    enabled: !!id,
  });
}
