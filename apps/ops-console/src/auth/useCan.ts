import { useMemo } from 'react';
import { useAbilities } from '../queries/session';

/** Returns a `can(permissionId)` predicate backed by the session's grants. */
export function useCan(): (permissionId: string) => boolean {
  const { data } = useAbilities();
  return useMemo(() => {
    const grants = new Set(data?.grants ?? []);
    return (permissionId: string) => grants.has(permissionId);
  }, [data]);
}
