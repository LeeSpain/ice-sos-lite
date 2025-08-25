import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
      gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 408, 429
        if (error && 'status' in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
            return false;
          }
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      // Deduplicate requests - prevent multiple identical requests
      queryKeyHashFn: (queryKey) => JSON.stringify(queryKey),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});