import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface InputTextProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Prepend an icon inside the field (e.g. a search glyph). */
  startIcon?: ReactNode;
  /** Append content inside the field — a button, or a status glyph such as a
   * spinner / check for availability checks. */
  endIcon?: ReactNode;
}

export const InputText = forwardRef<HTMLInputElement, InputTextProps>(
  ({ className, type = 'text', startIcon, endIcon, ...props }, ref) => {
    const inputClasses = cn(
      // 16px on mobile (prevents iOS zoom-on-focus), 13px from md up
      'h-[34px] w-full rounded-sm border border-border-strong bg-surface px-3 text-[16px] text-text md:text-[13px]',
      'placeholder:text-text-muted',
      'transition duration-150 ease-out',
      // soft focus: accent border + translucent 3px halo (no heavy outline)
      'focus-visible:border-accent focus-visible:outline-none',
      'focus-visible:ring-[3px] focus-visible:ring-accent/20',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'aria-invalid:border-danger aria-invalid:ring-danger/20',
      className,
    );

    if (!startIcon && !endIcon) {
      return <input ref={ref} type={type} className={inputClasses} {...props} />;
    }

    return (
      <div className="relative w-full">
        {startIcon && (
          <span className="pointer-events-none absolute left-2.5 top-1/2 grid -translate-y-1/2 place-items-center text-text-muted [&_svg]:size-4 [&_svg]:shrink-0">
            {startIcon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(inputClasses, startIcon && 'pl-9', endIcon && 'pr-9')}
          {...props}
        />
        {endIcon && (
          <span className="absolute right-2.5 top-1/2 grid -translate-y-1/2 place-items-center [&_svg]:size-4 [&_svg]:shrink-0">
            {endIcon}
          </span>
        )}
      </div>
    );
  },
);
InputText.displayName = 'InputText';
