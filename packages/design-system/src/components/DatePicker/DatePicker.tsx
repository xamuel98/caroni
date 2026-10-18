import { CalendarDaysIcon } from '@heroicons/react/20/solid';
import { useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Calendar } from './Calendar';

export type DateFieldIconPosition = 'start' | 'end' | 'none';

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  /** Display format passed to `Intl.DateTimeFormat`. */
  format?: Intl.DateTimeFormatOptions;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  /** Glyph shown in the field. */
  icon?: ReactNode;
  /** Where the glyph sits. Defaults to `end`. */
  iconPosition?: DateFieldIconPosition;
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

/** A date field: a button that opens a {@link Calendar} in a popover. */
export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  format = DEFAULT_FORMAT,
  min,
  max,
  disabled,
  icon,
  iconPosition = 'end',
  id,
  className,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const label = value ? new Intl.DateTimeFormat(undefined, format).format(value) : null;
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
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Calendar
          value={value}
          onChange={(date) => {
            onChange?.(date);
            setOpen(false);
          }}
          min={min}
          max={max}
        />
      </PopoverContent>
    </Popover>
  );
}