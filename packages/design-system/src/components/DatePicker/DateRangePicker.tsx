import { CalendarDaysIcon } from '@heroicons/react/20/solid';
import { useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { CalendarRange, type DateRange } from './Calendar';
import type { DateFieldIconPosition } from './DatePicker';

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  placeholder?: string;
  /** Display format passed to `Intl.DateTimeFormat`. */
  format?: Intl.DateTimeFormatOptions;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  icon?: ReactNode;
  /** Where the glyph sits. Defaults to `start`. */
  iconPosition?: DateFieldIconPosition;
  /** Months shown side by side. Defaults to 2. */
  numberOfMonths?: number;
  id?: string;
  className?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

/** A date-range field: a button that opens a {@link CalendarRange} in a popover. */
export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Pick a date range',
  format = DEFAULT_FORMAT,
  min,
  max,
  disabled,
  icon,
  iconPosition = 'start',
  numberOfMonths = 2,
  id,
  className,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const formatter = new Intl.DateTimeFormat(undefined, format);
  const { from, to } = value ?? {};
  const label = from
    ? `${formatter.format(from)}${to ? ` – ${formatter.format(to)}` : ' – …'}`
    : null;
  const glyph = icon ?? <CalendarDaysIcon className="size-4 shrink-0 text-text-muted" />;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          data-placeholder={label ? undefined : ''}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className={cn(
            'flex h-[34px] w-full items-center gap-2 rounded-sm border border-border-strong bg-surface px-3 text-left text-[13px] text-text',
            'data-[placeholder]:text-text-muted',
            'transition duration-150 ease-out',
            'focus-visible:border-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'aria-invalid:border-danger aria-invalid:ring-danger/20',
            className,
          )}
        >
          {iconPosition === 'start' && glyph}
          <span className="min-w-0 flex-1 truncate">{label ?? placeholder}</span>
          {iconPosition === 'end' && glyph}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-auto min-w-[var(--radix-popover-trigger-width)] p-0"
      >
        <CalendarRange
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          numberOfMonths={numberOfMonths}
        />
      </PopoverContent>
    </Popover>
  );
}