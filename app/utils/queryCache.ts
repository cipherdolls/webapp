import { QueryClient } from '@tanstack/react-query';

// Global query client instance
let queryClient: QueryClient | null = null;

// Set the query client instance
export const setQueryClient = (client: QueryClient) => {
  queryClient = client;
};

// Clear all React Query cache
export const clearQueryCache = () => {
  if (queryClient) {
    queryClient.clear();
  } else {
    console.warn('Query client not available for cache clearing');
  }
};

// Clear specific query keys
export const clearQueryKeys = (queryKeys: string[]) => {
  if (queryClient) {
    queryClient.removeQueries({ queryKey: queryKeys });
  } else {
    console.warn('Query client not available for cache clearing');
  }
};
