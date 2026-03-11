import { useQuery } from '@tanstack/react-query';
import type { FillerWord, FillerWordsPaginated } from '~/types';
import { fetchResource } from './utils/fetchResource';

export function useFillerWords(avatarId: string) {
  return useQuery({
    queryKey: ['fillerWords', avatarId],
    queryFn: () => fetchResource<FillerWordsPaginated>(`filler-words?avatarId=${avatarId}&limit=100`),
    enabled: !!avatarId,
  });
}

export function useFillerWord(fillerWordId: string) {
  return useQuery({
    queryKey: ['fillerWord', fillerWordId],
    queryFn: () => fetchResource<FillerWord>(`filler-words/${fillerWordId}`),
    enabled: !!fillerWordId,
  });
}
