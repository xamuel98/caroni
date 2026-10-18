import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional glyph shown in a soft medallion above the title. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Primary call to action — a Button, or a row of them. */
  action?: ReactNode;
  /** `sm` for inline (inside a table/card); `md` for a full panel. Defaults to `md`. */
  size?: 'sm' | 'md';
}

/**
 * The "nothing here yet" panel: a soft icon medallion, a title, an optional
 * line of supporting text, and an action. Centred and quiet.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, size = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'sm' ? 'gap-2.5 px-4 py-8' : 'gap-3 px-6 py-12',
        className,
      )}
      {...props}
    >
      {icon && (
        <div
          className={cn(
            'grid shrink-0 place-items-center rounded-full bg-surface-sunken text-text-muted',
            size === 'sm' ? 'size-9 [&_svg]:size-[18px]' : 'size-11 [&_svg]:size-5',
          )}
        >
          {icon}
        </div>
      )}

      <div className="space-y-1">
        <p
          className={cn(
            'font-medium text-text',
            size === 'sm' ? 'text-[13px]' : 'text-[14px]',
          )}
        >
          {title}
        </p>
        {description && (
          <p
            className={cn(
              'mx-auto max-w-sm text-text-muted',
              size === 'sm' ? 'text-[12.5px] leading-5' : 'text-[13px] leading-5',
            )}
          >
            {description}
          </p>
        )}
      </div>

      {action && <div className="mt-1 flex items-center gap-2">{action}</div>}
    </div>
  ),
);
EmptyState.displayName = 'EmptyState';