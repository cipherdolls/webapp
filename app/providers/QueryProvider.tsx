import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, Suspense, lazy } from 'react';

// Lazy load devtools only in development
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((module) => ({
        default: module.ReactQueryDevtools,
      }))
    )
  : () => null;

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance for each app instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Don't refetch on window focus for better UX
            refetchOnWindowFocus: false,
            // Keep data for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache for 10 minutes
            gcTime: 10 * 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}