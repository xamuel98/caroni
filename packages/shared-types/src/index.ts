import { z } from 'zod';

/* ── Surfaces ───────────────────────────────────────────── */
export const SurfaceSchema = z.enum(['consumer', 'ops']);
export type Surface = z.infer<typeof SurfaceSchema>;

/* ── Session ────────────────────────────────────────────── */
export const BranchMembershipSchema = z.object({
  branchId: z.string(),
  roles: z.array(z.string()),
});

export const SessionSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  tag: z.string().optional(),
  surface: SurfaceSchema,
  activeBranchId: z.string(),
  branches: z.array(BranchMembershipSchema),
});
export type Session = z.infer<typeof SessionSchema>;

/* ── Abilities (glossary-driven permissions) ────────────── */
export const CapabilitySchema = z.enum([
  'visible',
  'modifiable',
  'actionable',
  'deletable',
  'archivable',
]);
export type Capability = z.infer<typeof CapabilitySchema>;

/** A single catalogue entry: one capability over one resource kind. */
export const AbilitySchema = z.object({
  permission_id: z.string(),
  app: SurfaceSchema,
  module: z.string(),
  resource_kind: z.string(),
  section: z.string().optional(),
  action: z.string(),
  capability: CapabilitySchema,
  label: z.string(),
  surface: z.string().optional(),
});
export type Ability = z.infer<typeof AbilitySchema>;

/** Policy outcome for one action (Fortis-style effect vocabulary). */
export const EffectSchema = z.enum(['EFFECT_ALLOW', 'EFFECT_DENY']);
export type Effect = z.infer<typeof EffectSchema>;

/** How the UI should treat an action: show it, hide it, or show it disabled. */
export const AbilityModeSchema = z.enum(['show', 'hide', 'disable']);
export type AbilityMode = z.infer<typeof AbilityModeSchema>;

/** The decision for a single action on a resource, with the reason it applies. */
export const AbilityActionSchema = z.object({
  effect: EffectSchema,
  permissionId: z.string(),
  mode: AbilityModeSchema,
  label: z.string().optional(),
  surface: z.string().optional(),
  reason: z.string().optional(),
});
export type AbilityAction = z.infer<typeof AbilityActionSchema>;

/** Identifies the resource an ability belongs to (grouping key). */
export const AbilityResourceSchema = z.object({
  app: SurfaceSchema,
  module: z.string(),
  kind: z.string(),
});
export type AbilityResource = z.infer<typeof AbilityResourceSchema>;

/** All action decisions for one resource kind. */
export const AbilityResultSchema = z.object({
  resource: AbilityResourceSchema,
  actions: z.record(z.string(), AbilityActionSchema),
});
export type AbilityResult = z.infer<typeof AbilityResultSchema>;

/**
 * Grouped abilities for the current session: one entry per visible resource,
 * each carrying an allow/deny decision per action. `grants` is a flat
 * convenience list of permitted permission ids for quick `can()` checks.
 */
export const AbilitiesResponseSchema = z.object({
  requestId: z.string(),
  branchScope: z.array(z.string()),
  grants: z.array(z.string()),
  results: z.array(AbilityResultSchema),
});
export type AbilitiesResponse = z.infer<typeof AbilitiesResponseSchema>;

/* ── Transfers ──────────────────────────────────────────── */
export const TransferStatusSchema = z.enum([
  'INITIATED',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'HELD',
  'REVERSED',
  'DISPUTED',
]);
export type TransferStatus = z.infer<typeof TransferStatusSchema>;

export const TransferSchema = z.object({
  id: z.string(),
  status: TransferStatusSchema,
  fromTag: z.string(),
  toTag: z.string(),
  amount: z.number(),
  currency: z.string(),
  note: z.string().optional(),
  createdAt: z.string(),
});
export type Transfer = z.infer<typeof TransferSchema>;
