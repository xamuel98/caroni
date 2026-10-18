import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export const linkVariants = cva(
  'inline-flex items-center gap-1 rounded-[3px] transition-colors duration-150 ease-out underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  {
    variants: {
      variant: {
        default: 'text-accent hover:text-accent-hover',
        muted: 'text-text-secondary hover:text-text',
        inverse: 'text-accent-fg hover:underline',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface LinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  /** Render the child element instead (e.g. a router `<Link>`). */
  asChild?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';
    return <Comp ref={ref} className={cn(linkVariants({ variant }), className)} {...props} />;
  },
);
Link.displayName = 'Link';
