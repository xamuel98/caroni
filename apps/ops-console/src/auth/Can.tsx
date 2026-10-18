import type { ReactNode } from 'react';
import { useCan } from './useCan';

/** Renders `children` only when the session holds `permission`, else `fallback`. */
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const can = useCan();
  return <>{can(permission) ? children : fallback}</>;
}
