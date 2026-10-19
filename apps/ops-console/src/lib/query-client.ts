import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { redirectToSignIn } from '../auth/sign-in';
import { ApiError, isUnauthorized } from './api';

/**
 * Sensible defaults for a server-state app:
 * - don't retry client errors (401/403/404 are not transient)
 * - refetch on focus/reconnect so ops queues stay fresh
 * - a modest staleTime so navigation doesn't refetch everything
 *
 * Any 401 from *any* query/mutation redirects to sign-in via a single global
 * handler, so a resource query (e.g. the KYC queue) can't leave the user on a
 * dead screen with a Retry button that keeps failing.
 */
export function createQueryClient(): QueryClient {
  const onAuthError = (error: unknown): void => {
    if (isUnauthorized(error)) redirectToSignIn();
  };

  return new QueryClient({
    queryCache: new QueryCache({ onError: onAuthError }),
    mutationCache: new MutationCache({ onError: onAuthError }),
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
