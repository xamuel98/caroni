import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Layout direction. Defaults to `horizontal`. */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Joins adjacent buttons/selections into one control: collapses the shared
 * borders and only rounds the outer corners. Children keep their own variants.
 */
export function ButtonGroup({ className, orientation = 'horizontal', ...props }: ButtonGroupProps) {
  return (
    <div
      role="group"
      className={cn(
        'inline-flex',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        // Outer corners only; inner edges square.
        '[&>*]:relative [&>*]:rounded-none',
        orientation === 'horizontal'
          ? '[&>*:not(:first-child)]:-ml-px [&>*:first-child]:rounded-l-sm [&>*:last-child]:rounded-r-sm'
          : '[&>*:not(:first-child)]:-mt-px [&>*:first-child]:rounded-t-sm [&>*:last-child]:rounded-b-sm',
        // Keep the focus ring above neighbours.
        '[&>*:focus-visible]:z-10',
        className,
      )}
      {...props}
    />
  );
}
