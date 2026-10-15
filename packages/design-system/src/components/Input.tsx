import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        // 16px on mobile (prevents iOS zoom-on-focus), 13px from md up
        'h-[34px] w-full rounded-[6px] border border-border-strong bg-surface px-3 text-[16px] text-text md:text-[13px]',
        'placeholder:text-text-muted',
        'transition duration-150 ease-out',
        // soft focus: accent border + translucent 3px halo (no heavy outline)
        'focus-visible:border-accent focus-visible:outline-none',
        'focus-visible:ring-[3px] focus-visible:ring-accent/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
