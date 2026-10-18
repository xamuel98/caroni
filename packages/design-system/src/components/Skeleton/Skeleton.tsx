import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

/** A pulsing placeholder. Shape it with `className` (e.g. `h-4 w-32 rounded-md`). */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-sm bg-surface-sunken motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  );
}
