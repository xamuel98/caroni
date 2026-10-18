/** Pure permission predicates — no React, so they're trivially testable. */

export function hasGrant(grants: readonly string[], permissionId: string): boolean {
  return grants.includes(permissionId);
}
