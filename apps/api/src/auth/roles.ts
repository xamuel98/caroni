/**
 * Decides the roles for a session. Real roles always win; the dev override only
 * applies when the token carries none, an override is configured, and we are not
 * in production. Pure, so the rule is unit-tested independently of Nest.
 */
export function resolveRoles(
  claimRoles: readonly string[],
  override: readonly string[],
  isProduction: boolean,
): { roles: string[]; usedOverride: boolean } {
  if (claimRoles.length > 0) return { roles: [...claimRoles], usedOverride: false };
  if (override.length === 0 || isProduction) return { roles: [], usedOverride: false };
  return { roles: [...override], usedOverride: true };
}
