'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';

/**
 * React Query client configuration
 * Optimized for data fetching with caching and revalidation
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 1 hour by default
        staleTime: 60 * 60 * 1000, // 1 hour
        gcTime: 60 * 60 * 1000, // 1 hour (formerly cacheTime)

        // Retry configuration
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Refetch configuration
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * React Query provider for client-side data fetching
 * Provides caching, background updates, and optimistic updates
 *
 * Usage:
 * ```tsx
 * import { useQuery } from '@tanstack/react-query';
 *
 * function MyComponent() {
 *   const { data, error, isLoading } = useQuery({
 *     queryKey: ['agents'],
 *     queryFn: () => fetch('/api/agents').then(r => r.json()),
 *   });
 * }
 * ```
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // NOTE: Avoid useState when initializing the query client if you don't
  // have a suspense boundary between this and the code that may
  // suspend because React will throw away the client on the initial
  // render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
