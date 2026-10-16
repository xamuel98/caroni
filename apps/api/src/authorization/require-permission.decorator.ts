import { SetMetadata } from '@nestjs/common';

export const PERMISSION_METADATA = 'caroni:required_permission';

/**
 * Declares the permission_id an endpoint requires. Enforced server-side by
 * `AuthorizationGuard` via an OPA decision — never trust the UI to hide it.
 */
export const RequirePermission = (permissionId: string) =>
  SetMetadata(PERMISSION_METADATA, permissionId);
