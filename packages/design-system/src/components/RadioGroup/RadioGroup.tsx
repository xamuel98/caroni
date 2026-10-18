import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { cn } from '../../lib/cn';

export const RadioGroup = RadioGroupPrimitive.Root;

export const RadioGroupItem = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      // No ring — a filled circular dot on a quiet sunken slot.
      'grid size-[18px] shrink-0 place-items-center rounded-full bg-surface-sunken',
      'transition-[background-color,box-shadow,transform] duration-150 ease-out',
      'hover:bg-border',
      'active:scale-95',
      'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/25',
      'data-[state=checked]:bg-accent data-[state=checked]:hover:bg-accent-hover',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-surface-sunken',
      className,
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="grid place-items-center">
      <span className="size-[7px] rounded-full bg-accent-fg animate-radio-pop motion-reduce:animate-none" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = 'RadioGroupItem';
