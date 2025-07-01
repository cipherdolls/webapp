import { useCallback, useEffect, useRef, useState } from 'react';
import type { meta } from '~/types';

interface UseInfiniteScrollOptions<T> {
  initialData: T[];
  initialMeta: meta;
  fetchMore: (page: number) => Promise<{ data: T[]; meta: meta }>;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
}

export function useInfiniteScroll<T>({
  initialData,
  initialMeta,
  fetchMore,
  enabled = true,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [meta, setMeta] = useState(initialMeta);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const hasMore = meta.page < meta.totalPages;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const nextPage = meta.page + 1;
      const result = await fetchMore(nextPage);
      
      setData(prevData => [...prevData, ...result.data]);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more data');
    } finally {
      setLoading(false);
    }
  }, [fetchMore, hasMore, loading, meta.page, enabled]);

  useEffect(() => {
    if (!enabled || !triggerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    observer.observe(triggerRef.current);

    return () => observer.disconnect();
  }, [loadMore, hasMore, loading, enabled]);

  // Reset data when initial data changes (for URL-based fetching)
  useEffect(() => {
    setData(initialData);
    setMeta(initialMeta);
    setError(null);
  }, [initialData, initialMeta]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    triggerRef,
  };
}