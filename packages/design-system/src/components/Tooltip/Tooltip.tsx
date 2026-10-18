import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { cn } from '../../lib/cn';

export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * Wrap the app once. `skipDelayDuration` makes adjacent tooltips open with no
 * delay once one is already showing — the whole toolbar feels faster.
 */
export const TooltipProvider = TooltipPrimitive.Provider;

export const TooltipArrow = forwardRef<
  ElementRef<typeof TooltipPrimitive.Arrow>,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>
>(({ className, width = 11, height = 5, ...props }, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    width={width}
    height={height}
    className={cn('fill-text', className)}
    {...props}
  />
));
TooltipArrow.displayName = 'TooltipArrow';

export interface TooltipContentProps
  extends ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  /** Show a pointer arrow on the trigger-facing edge. Defaults to false. */
  arrow?: boolean;
}

export const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, arrow = false, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={arrow ? 8 : 6}
      className={cn(
        'z-50 max-w-xs rounded-sm bg-text px-2 py-1 text-[12px] font-medium leading-4 text-bg',
        'shadow-[var(--shadow-control)] outline-none',
        // Origin-aware, and instant on the next tooltip in a toolbar.
        'origin-[var(--radix-tooltip-content-transform-origin)]',
        'data-[state=delayed-open]:animate-tooltip-in data-[state=closed]:animate-tooltip-out',
        'data-[state=instant-open]:animate-none',
        className,
      )}
      {...props}
    >
      {children}
      {arrow && <TooltipArrow />}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = 'TooltipContent';
