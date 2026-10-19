import type { AbilitiesResponse } from '@caroni/shared-types';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export interface SessionInfo {
  userId: string;
  displayName: string;
  email?: string;
  roles: string[];
  createdAt: string;
  expiresAt: string;
}

export const queryKeys = {
  session: ['session'] as const,
  abilities: ['abilities'] as const,
};

/** Current identity. Auth failures are terminal here (handled by the shell). */
export function useSession() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: () => apiFetch<SessionInfo>('/api/session'),
    retry: false,
  });
}

/** Catalogue entries + grants the caller holds — drives nav and guards. */
export function useAbilities() {
  return useQuery({
    queryKey: queryKeys.abilities,
    queryFn: () => apiFetch<AbilitiesResponse>('/api/session/abilities'),
    retry: false,
  });
}
