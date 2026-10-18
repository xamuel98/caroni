import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        // 16px on mobile (prevents iOS zoom-on-focus), 13px from md up
        'min-h-20 w-full resize-y rounded-sm border border-border-strong bg-surface px-3 py-2 text-[16px] leading-5 text-text md:text-[13px]',
        'placeholder:text-text-muted',
        'transition duration-150 ease-out',
        'focus-visible:border-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-danger aria-invalid:ring-danger/20',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
