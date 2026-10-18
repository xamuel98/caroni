import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { buttonVariants } from './Button';

export interface ButtonLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {}

/**
 * An anchor styled with the button system. Defaults to the `link` variant, but
 * accepts any button variant/size so a link can look like a button.
 */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, variant = 'link', size, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        buttonVariants({ variant, size: variant === 'link' ? 'link' : size }),
        className,
      )}
      {...props}
    />
  ),
);
ButtonLink.displayName = 'ButtonLink';