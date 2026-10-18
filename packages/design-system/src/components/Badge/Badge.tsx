import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * Tints are derived with `color-mix` from the semantic token itself, so they
 * render correctly over any surface and in both light and dark modes. When
 * `solid` is set, the token colour becomes the background with a contrasting
 * foreground.
 */
export const badgeVariants = cva(
  'inline-flex max-w-full items-center font-medium [&_svg]:shrink-0',
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
      size: {
        md: 'h-[23px] gap-1.5 px-[7px] text-[13px] [&_svg:not([class*=size-])]:size-4',
        sm: 'h-5 gap-1 px-1.5 text-[11.5px] [&_svg:not([class*=size-])]:size-3.5',
      },
      shape: {
        rounded: 'rounded-sm',
        /** Fully rounded (pill). */
        pill: 'rounded-full',
      },
      solid: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { solid: true, variant: 'neutral', class: 'bg-text text-bg' },
      { solid: true, variant: 'accent', class: 'bg-accent text-accent-fg' },
      { solid: true, variant: 'success', class: 'bg-success text-white dark:text-bg' },
      { solid: true, variant: 'warning', class: 'bg-warning text-white dark:text-bg' },
      { solid: true, variant: 'danger', class: 'bg-danger text-white dark:text-bg' },
      { solid: true, variant: 'info', class: 'bg-info text-white dark:text-bg' },
    ],
    defaultVariants: { variant: 'neutral', size: 'md', shape: 'rounded' },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /** Leading icon (e.g. a solid Heroicon). */
  startIcon?: ReactNode;
  /** Trailing icon. */
  endIcon?: ReactNode;
}

export function Badge({
  className,
  variant,
  size,
  shape,
  solid,
  startIcon,
  endIcon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, shape, solid }), className)} {...props}>
      {startIcon}
      <span className="min-w-0 truncate">{children}</span>
      {endIcon}
    </span>
  );
}
