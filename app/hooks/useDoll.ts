import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Doll } from '~/types';

export function useDoll(dollId: string) {
  return useQuery({
    queryKey: ['doll', dollId],
    queryFn: async (): Promise<Doll> => {
      const res = await fetchWithAuth(`dolls/${dollId}`);
      
      if (!res.ok) {
        throw new Error(`Failed to load doll: ${res.status}`);
      }
      
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
} 