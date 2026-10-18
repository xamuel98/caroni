import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export const helpTextVariants = cva('mt-1.5 text-[12px] leading-4', {
  variants: {
    tone: {
      default: 'text-text-muted',
      success: 'text-success',
      danger: 'text-danger',
    },
  },
  defaultVariants: { tone: 'default' },
});

export interface HelpTextProps
  extends HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof helpTextVariants> {}

/**
 * Helper / validation text under a control. Link it to the field with
 * `aria-describedby` and switch `tone` to `danger` when the field is invalid.
 */
export function HelpText({ className, tone, ...props }: HelpTextProps) {
  return <p className={cn(helpTextVariants({ tone }), className)} {...props} />;
}
