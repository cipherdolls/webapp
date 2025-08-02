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
    // Гарантуємо що дані завжди свіжі
    staleTime: 5 * 60 * 1000, // 5 хвилин
    // Не показуємо кешовані дані під час refetch
    refetchOnWindowFocus: false,
  });
} 