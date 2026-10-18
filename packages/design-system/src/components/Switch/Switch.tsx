import * as SwitchPrimitive from '@radix-ui/react-switch';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { cn } from '../../lib/cn';

export type SwitchSize = 'sm' | 'md';
export type SwitchThumb = 'circle' | 'pill';

const trackSize: Record<`${SwitchSize}-${SwitchThumb}`, string> = {
  'sm-circle': 'h-4 w-7',
  'sm-pill': 'h-4 w-10',
  'md-circle': 'h-5 w-9',
  'md-pill': 'h-5 w-12',
};

const thumbSize: Record<SwitchSize, Record<SwitchThumb, string>> = {
  sm: { circle: 'size-3', pill: 'h-3 w-5' },
  md: { circle: 'size-4', pill: 'h-4 w-6' },
};

// Checked travel = track width − thumb width − 2px inset.
const thumbTravel: Record<`${SwitchSize}-${SwitchThumb}`, string> = {
  'sm-circle': 'data-[state=checked]:translate-x-[14px]',
  'sm-pill': 'data-[state=checked]:translate-x-[18px]',
  'md-circle': 'data-[state=checked]:translate-x-[18px]',
  'md-pill': 'data-[state=checked]:translate-x-[22px]',
};

export interface SwitchProps
  extends ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  /** Track/thumb scale. Defaults to `md`. */
  size?: SwitchSize;
  /** `circle` (round knob) or `pill` (a longer, rounded knob). Defaults to `circle`. */
  thumb?: SwitchThumb;
}

export const Switch = forwardRef<ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  ({ className, size = 'md', thumb = 'circle', ...props }, ref) => (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        'group/switch inline-flex shrink-0 cursor-pointer items-center rounded-full bg-border-strong',
        'transition-colors duration-[var(--duration-base)] ease-out',
        'data-[state=checked]:bg-accent',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/20 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'disabled:cursor-not-allowed disabled:opacity-50',
        trackSize[`${size}-${thumb}`],
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block rounded-full bg-bg shadow-[var(--shadow-control)]',
          'transition-transform duration-[var(--duration-base)] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          'motion-reduce:transition-none',
          'data-[state=unchecked]:translate-x-0.5',
          'group-active/switch:scale-90',
          thumbSize[size][thumb],
          thumbTravel[`${size}-${thumb}`],
        )}
      />
    </SwitchPrimitive.Root>
  ),
);
Switch.displayName = 'Switch';
