import * as SliderPrimitive from '@radix-ui/react-slider';
import { forwardRef, useMemo, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { cn } from '../../lib/cn';

const thumbClasses = cn(
  // A raised pill knob: white face, accent rim, hairline elevation.
  'block size-5 cursor-grab rounded-full border-2 border-accent bg-surface shadow-[var(--shadow-control)]',
  'transition-[transform,box-shadow] duration-150 ease-out',
  'hover:scale-110 active:cursor-grabbing active:scale-110',
  'focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/25',
  'disabled:cursor-not-allowed disabled:hover:scale-100 disabled:border-border-strong',
);

/**
 * A slider. Renders one knob per value, so a range (`[20, 70]`) shows both
 * thumbs.
 */
export const Slider = forwardRef<
  ElementRef<typeof SliderPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, value, defaultValue, min = 0, ...props }, ref) => {
  const values = useMemo(() => value ?? defaultValue ?? [min], [value, defaultValue, min]);

  return (
    <SliderPrimitive.Root
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      min={min}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        'data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-surface-sunken">
        <SliderPrimitive.Range className="absolute h-full bg-accent" />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb key={index} className={thumbClasses} />
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = 'Slider';