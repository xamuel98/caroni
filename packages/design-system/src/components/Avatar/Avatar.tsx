import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { UserIcon } from '@heroicons/react/24/solid';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Children,
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';

export const avatarVariants = cva(
  'relative inline-grid shrink-0 select-none place-items-center overflow-hidden rounded-full font-medium',
  {
    variants: {
      size: {
        xs: 'size-6 text-[10px]',
        sm: 'size-8 text-[12px]',
        md: 'size-10 text-[13px]',
        lg: 'size-12 text-[15px]',
        xl: 'size-14 text-[17px]',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export type AvatarColor = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type AvatarVariant = 'soft' | 'solid';

/**
 * Colours are mixed from the semantic tokens with `color-mix`. Soft variants
 * mix into `--color-bg` (not `transparent`) so the tint is opaque — otherwise
 * overlapping avatars in a group show the one behind through the fill.
 */
const colorStyles: Record<AvatarColor, Record<AvatarVariant, string>> = {
  neutral: {
    soft: 'bg-[color-mix(in_srgb,var(--color-text-secondary)_12%,var(--color-bg))] text-text-secondary',
    solid: 'bg-text-secondary text-surface',
  },
  accent: {
    soft: 'bg-[color-mix(in_srgb,var(--color-accent)_14%,var(--color-bg))] text-accent',
    solid: 'bg-accent text-accent-fg',
  },
  success: {
    soft: 'bg-[color-mix(in_srgb,var(--color-success)_14%,var(--color-bg))] text-success',
    solid: 'bg-success text-white',
  },
  warning: {
    soft: 'bg-[color-mix(in_srgb,var(--color-warning)_16%,var(--color-bg))] text-warning',
    solid: 'bg-warning text-white',
  },
  danger: {
    soft: 'bg-[color-mix(in_srgb,var(--color-danger)_14%,var(--color-bg))] text-danger',
    solid: 'bg-danger text-white',
  },
  info: {
    soft: 'bg-[color-mix(in_srgb,var(--color-info)_14%,var(--color-bg))] text-info',
    solid: 'bg-info text-white',
  },
};

const autoPalette: AvatarColor[] = ['accent', 'success', 'warning', 'danger', 'info'];

/** Deterministic colour from the label, so a given person always looks the same. */
function autoColor(label?: string): AvatarColor {
  if (!label) return 'neutral';
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) hash = (hash * 31 + label.charCodeAt(i)) | 0;
  return autoPalette[Math.abs(hash) % autoPalette.length]!;
}

export interface AvatarProps
  extends ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  /**
   * Shown while the image loads, or when there is no `src`. Defaults to a
   * person glyph (the John/Jane Doe placeholder) sized to the avatar.
   */
  fallback?: ReactNode;
  /** Colour token. Defaults to a colour derived from the string `fallback`. */
  color?: AvatarColor;
  /** `soft` (tinted) or `solid`. Defaults to `soft`. */
  variant?: AvatarVariant;
}

export const Avatar = forwardRef<ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(
  ({ className, size, src, alt, fallback, color, variant = 'soft', ...props }, ref) => {
    const resolved = color ?? autoColor(typeof fallback === 'string' ? fallback : undefined);
    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size }), colorStyles[resolved][variant], className)}
        {...props}
      >
        {src && <AvatarPrimitive.Image src={src} alt={alt} className="size-full object-cover" />}
        <AvatarPrimitive.Fallback
          className="grid size-full place-items-center"
          delayMs={src ? 300 : 0}
        >
          {fallback ?? <UserIcon className="size-[60%]" aria-hidden="true" />}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    );
  },
);
Avatar.displayName = 'Avatar';

const overlapClasses: Record<NonNullable<AvatarGroupProps['size']>, string> = {
  xs: '-ml-1.5',
  sm: '-ml-2',
  md: '-ml-2.5',
  lg: '-ml-3',
  xl: '-ml-3.5',
};

export interface AvatarGroupProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  /** Avatars shown before collapsing the rest into a `+N`. Defaults to 4. */
  max?: number;
  /** Ring colour used to separate overlapping avatars. Defaults to `ring-bg`. */
  ringClassName?: string;
}

export function AvatarGroup({
  className,
  size = 'md',
  max = 4,
  ringClassName,
  children,
  ...props
}: AvatarGroupProps) {
  const items = Children.toArray(children);
  const visible = items.slice(0, max);
  const extra = items.length - visible.length;
  const ring = cn('ring-2 ring-bg', ringClassName);
  const overlap = overlapClasses[size ?? 'md'];

  return (
    <div className={cn('flex items-center', className)} {...props}>
      {visible.map((child, i) => (
        // `flex` (not block) so the inline-grid avatar can't add a baseline gap.
        <div key={i} className={cn('flex shrink-0 rounded-full', ring, i > 0 && overlap)}>
          {child}
        </div>
      ))}
      {extra > 0 && (
        <span
          className={cn(
            avatarVariants({ size }),
            'flex shrink-0 items-center justify-center bg-surface-sunken text-text-secondary',
            ring,
            overlap,
          )}
        >{`+${extra}`}</span>
      )}
    </div>
  );
}
