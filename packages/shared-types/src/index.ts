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

export const AbilitiesResponseSchema = z.object({
  abilities: z.array(AbilitySchema),
  grants: z.array(z.string()),
  obligations: z.record(z.string(), z.unknown()).default({}),
  branchScope: z.array(z.string()),
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
