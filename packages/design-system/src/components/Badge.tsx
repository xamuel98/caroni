import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

/**
 * Colours are derived with `color-mix` from the semantic token itself, so the
 * tint renders correctly over any surface and in both light and dark modes —
 * no hand-picked "soft" hex values.
 */
export const badgeVariants = cva(
  'inline-flex h-[23px] max-w-full items-center gap-1.5 overflow-hidden rounded-[6px] px-[7px] text-[13px] font-medium',
  {
    variants: {
      variant: {
        neutral:
          'bg-[color-mix(in_srgb,var(--color-text-secondary)_10%,transparent)] text-text-secondary',
        accent: 'bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-accent',
        success: 'bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-success',
        warning: 'bg-[color-mix(in_srgb,var(--color-warning)_16%,transparent)] text-warning',
        danger: 'bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] text-danger',
        info: 'bg-[color-mix(in_srgb,var(--color-info)_14%,transparent)] text-info',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}
