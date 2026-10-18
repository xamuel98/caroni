import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api';

/**
 * Sensible defaults for a server-state app:
 * - don't retry client errors (401/403/404 are not transient)
 * - refetch on focus/reconnect so ops queues stay fresh
 * - a modest staleTime so navigation doesn't refetch everything
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
