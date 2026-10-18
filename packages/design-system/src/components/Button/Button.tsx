import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from '../Spinner';

export const buttonVariants = cva(
  [
    'inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-sm',
    'text-[13px] font-medium leading-none',
    '[&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0',
    'transition duration-150 ease-out active:scale-[0.97]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-fg shadow-[var(--shadow-control)] hover:bg-accent-hover',
        secondary:
          'border border-border-strong bg-surface text-text shadow-[var(--shadow-control)] hover:bg-surface-sunken',
        ghost: 'text-text hover:bg-surface-sunken',
        danger: 'bg-danger text-white shadow-[var(--shadow-control)] hover:brightness-95',
        link: 'rounded-none text-accent hover:text-plain-hover hover:underline underline-offset-4',
        /** Text-only, no chrome; label underlined. */
        plain: 'rounded-none text-accent hover:text-plain-hover',
        /** Text-only, danger tone; label underlined. */
        'plain-danger': 'rounded-none text-danger hover:text-plain-danger-hover',
        /** Text-only, monochrome (neutral); no underline. */
        monochrome: 'rounded-none text-text hover:text-plain-mono-hover',
      },
      size: {
        xs: 'h-[26px] px-2 text-[12px]',
        sm: 'h-[30px] px-3',
        md: 'h-[34px] px-3.5',
        lg: 'h-[38px] px-4',
        'icon-xs': 'size-[26px] px-0',
        'icon-sm': 'size-[30px] px-0',
        icon: 'size-[34px] px-0',
        'icon-lg': 'size-[38px] px-0',
        'icon-xl': 'size-[44px] px-0',
        // No-op size for the chrome-less text variants.
        link: '',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

const TEXT_SIZES = new Set(['link', 'plain', 'plain-danger', 'monochrome']);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element (Radix Slot). Icons/loading are ignored. */
  asChild?: boolean;
  /** Leading icon (e.g. a solid Heroicon). */
  startIcon?: ReactNode;
  /** Trailing icon. */
  endIcon?: ReactNode;
  /** Swap the label for a centred spinner and disable interaction. */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      startIcon,
      endIcon,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const resolvedSize = variant && TEXT_SIZES.has(variant) ? 'link' : size;
    const classes = cn(
      buttonVariants({ variant, size: resolvedSize }),
      loading && 'relative disabled:opacity-100',
      className,
    );

    // Plain variants underline their text label — never the icons. Icon-only
    // buttons (element children) are left alone.
    const underline = variant === 'plain' || variant === 'plain-danger';
    const label =
      underline && (typeof children === 'string' || typeof children === 'number') ? (
        <span className="underline underline-offset-2">{children}</span>
      ) : (
        children
      );

    return (
      <Comp
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            <span className={cn('inline-flex items-center gap-1.5', loading && 'invisible')}>
              {startIcon}
              {label}
              {endIcon}
            </span>
            {loading && (
              <span className="absolute inset-0 grid place-items-center">
                <Spinner className="size-4" />
              </span>
            )}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';