import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { cn } from '../../lib/cn';

/* ── Date helpers (local time, no dependency) ─────────────────────────── */

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const isSameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();
const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const dim = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(d.getDate(), dim));
  return target;
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface DateRange {
  from?: Date;
  to?: Date;
}

type ViewMode = 'days' | 'months' | 'years';
type WeekStart = 0 | 1;

interface SelectionApi {
  isSelected: (d: Date) => boolean;
  isStart: (d: Date) => boolean;
  isEnd: (d: Date) => boolean;
  isInRange: (d: Date) => boolean;
}

const navButton =
  'grid size-7 place-items-center rounded-sm text-text-muted transition-colors duration-150 ease-out hover:bg-surface-sunken hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';
const cellBase =
  'grid h-8 w-full place-items-center rounded-[4px] text-[13px] tabular-nums transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

interface CalendarCoreProps {
  selection: SelectionApi;
  onSelectDate: (date: Date) => void;
  onHoverDate?: (date: Date | null) => void;
  min?: Date;
  max?: Date;
  disabled?: (date: Date) => boolean;
  weekStartsOn?: WeekStart;
  defaultMonth?: Date;
  numberOfMonths?: number;
  className?: string;
}

function CalendarCore({
  selection,
  onSelectDate,
  onHoverDate,
  min,
  max,
  disabled,
  weekStartsOn = 0,
  defaultMonth,
  numberOfMonths = 1,
  className,
}: CalendarCoreProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [view, setView] = useState<ViewMode>('days');
  const [month, setMonth] = useState<Date>(() => startOfMonth(defaultMonth ?? new Date()));
  const [focused, setFocused] = useState<Date>(() => startOfDay(defaultMonth ?? new Date()));
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());

  const months = useMemo(
    () => Array.from({ length: numberOfMonths }, (_, i) => addMonths(month, i)),
    [month, numberOfMonths],
  );

  const isDisabled = (date: Date) => {
    if (min && startOfDay(date).getTime() < startOfDay(min).getTime()) return true;
    if (max && startOfDay(date).getTime() > startOfDay(max).getTime()) return true;
    return disabled?.(date) ?? false;
  };

  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => (i + weekStartsOn) % 7), [weekStartsOn]);

  const gridFor = (m: Date) => {
    const year = m.getFullYear();
    const monthIndex = m.getMonth();
    const firstWeekday = (new Date(year, monthIndex, 1).getDay() - weekStartsOn + 7) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const total = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
    const days = Array.from({ length: total }, (_, i) => new Date(year, monthIndex, 1 - firstWeekday + i));
    const out: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7) as Date[]);
    return out;
  };

  const first = months[0]!;
  const last = months[months.length - 1]!;
  const decadeStart = Math.floor(month.getFullYear() / 12) * 12;
  const rangeLabel =
    numberOfMonths === 1
      ? `${MONTHS[first.getMonth()]} ${first.getFullYear()}`
      : `${MONTHS[first.getMonth()]} – ${MONTHS[last.getMonth()]} ${last.getFullYear()}`;

  const focusDay = (date: Date) => {
    setFocused(date);
    if (!isSameMonth(date, first) && date < first) setMonth(startOfMonth(date));
    else if (date > last && !isSameMonth(date, last)) setMonth(addMonths(startOfMonth(date), -(numberOfMonths - 1)));
    window.requestAnimationFrame(() => dayRefs.current.get(date.toDateString())?.focus());
  };

  const handleDayKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, date: Date) => {
    const offset = (date.getDay() - weekStartsOn + 7) % 7;
    let next: Date | null = null;
    switch (event.key) {
      case 'ArrowLeft': next = addDays(date, -1); break;
      case 'ArrowRight': next = addDays(date, 1); break;
      case 'ArrowUp': next = addDays(date, -7); break;
      case 'ArrowDown': next = addDays(date, 7); break;
      case 'Home': next = addDays(date, -offset); break;
      case 'End': next = addDays(date, 6 - offset); break;
      case 'PageUp': next = addMonths(date, -1); break;
      case 'PageDown': next = addMonths(date, 1); break;
      default: return;
    }
    event.preventDefault();
    focusDay(next);
  };

  const shift = (n: number) =>
    setMonth((m) =>
      view === 'years' ? new Date(m.getFullYear() + n * 12, m.getMonth(), 1)
        : view === 'months' ? new Date(m.getFullYear() + n, m.getMonth(), 1)
          : addMonths(m, n),
    );

  return (
    <div className={cn('w-full select-none p-3', className)}>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" aria-label="Previous" onClick={() => shift(-1)} className={navButton}>
          <ChevronLeftIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setView(view === 'days' ? 'months' : 'years')}
          className="rounded-sm px-2 py-1 text-[13px] font-medium text-text transition-colors duration-150 ease-out hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {view === 'years' ? `${decadeStart} – ${decadeStart + 11}` : view === 'months' ? month.getFullYear() : rangeLabel}
        </button>
        <button type="button" aria-label="Next" onClick={() => shift(1)} className={navButton}>
          <ChevronRightIcon className="size-4" />
        </button>
      </div>

      {view === 'days' && (
        <div className="flex gap-3">
          {months.map((m) => (
            <div key={m.toISOString()} role="grid" aria-label={`${MONTHS[m.getMonth()]} ${m.getFullYear()}`} className={numberOfMonths > 1 ? 'w-[240px] shrink-0' : 'w-full'}>
              <div role="row" className="grid grid-cols-7">
                {weekdays.map((w) => (
                  <div key={w} role="columnheader" aria-label={WEEKDAYS_LONG[w]} className="grid h-7 place-items-center text-[11px] font-medium text-text-muted">
                    {WEEKDAYS[w]}
                  </div>
                ))}
              </div>
              {gridFor(m).map((week, wi) => (
                <div role="row" key={wi} className="grid grid-cols-7">
                  {week.map((date) => {
                    const outside = !isSameMonth(date, m);
                    const isDisabledDay = isDisabled(date);
                    const isToday = isSameDay(date, today);
                    const selected = selection.isSelected(date);
                    const start = selection.isStart(date);
                    const end = selection.isEnd(date);
                    const inRange = selection.isInRange(date);
                    const endpoint = start || end;
                    const isFocused = isSameDay(date, focused);
                    return (
                      <div role="gridcell" key={date.toDateString()} className="p-px">
                        <button
                          type="button"
                          ref={(node) => {
                            const key = date.toDateString();
                            if (node) dayRefs.current.set(key, node);
                            else dayRefs.current.delete(key);
                          }}
                          tabIndex={isFocused ? 0 : -1}
                          aria-selected={selected || start || end || undefined}
                          aria-current={isToday ? 'date' : undefined}
                          disabled={isDisabledDay}
                          onFocus={() => setFocused(date)}
                          onMouseEnter={() => onHoverDate?.(date)}
                          onKeyDown={(event) => handleDayKeyDown(event, date)}
                          onClick={() => onSelectDate(date)}
                          className={cn(
                            cellBase,
                            outside ? 'text-text-muted' : 'text-text',
                            !endpoint && !inRange && !isDisabledDay && 'hover:bg-surface-sunken',
                            (isToday || inRange) && 'bg-accent-soft text-accent-soft-fg',
                            isToday && 'font-medium',
                            endpoint && 'bg-accent font-medium text-accent-fg hover:bg-accent-hover',
                            isDisabledDay && 'cursor-not-allowed opacity-40 hover:bg-transparent',
                          )}
                        >
                          {date.getDate()}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {view === 'months' && (
        <div className="grid grid-cols-3 gap-1" role="group" aria-label="Choose a month">
          {MONTHS_SHORT.map((label, m) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setMonth(new Date(month.getFullYear(), m, 1));
                setView('days');
              }}
              className={cn(
                'grid h-10 place-items-center rounded-[4px] text-[13px] text-text transition-colors duration-150 ease-out hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                m === month.getMonth() && 'bg-accent-soft font-medium text-accent-soft-fg',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {view === 'years' && (
        <div className="grid grid-cols-3 gap-1" role="group" aria-label="Choose a year">
          {Array.from({ length: 12 }, (_, i) => decadeStart + i).map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => {
                setMonth(new Date(year, month.getMonth(), 1));
                setView('months');
              }}
              className={cn(
                'grid h-10 place-items-center rounded-[4px] text-[13px] tabular-nums text-text transition-colors duration-150 ease-out hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                year === month.getFullYear() && 'bg-accent-soft font-medium text-accent-soft-fg',
              )}
            >
              {year}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Single-date calendar ─────────────────────────────────────────────── */

export interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  defaultMonth?: Date;
  min?: Date;
  max?: Date;
  disabled?: (date: Date) => boolean;
  weekStartsOn?: WeekStart;
  className?: string;
}

export function Calendar({ value, onChange, ...rest }: CalendarProps) {
  const selection: SelectionApi = {
    isSelected: (d) => (value ? isSameDay(d, value) : false),
    isStart: () => false,
    isEnd: () => false,
    isInRange: () => false,
  };
  return <CalendarCore selection={selection} onSelectDate={(d) => onChange?.(d)} {...rest} />;
}

/* ── Range calendar (from → to, 1+ months) ────────────────────────────── */

export interface CalendarRangeProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  defaultMonth?: Date;
  min?: Date;
  max?: Date;
  disabled?: (date: Date) => boolean;
  weekStartsOn?: WeekStart;
  /** Months shown side by side. Defaults to 2. */
  numberOfMonths?: number;
  className?: string;
}

export function CalendarRange({ value, onChange, numberOfMonths = 2, ...rest }: CalendarRangeProps) {
  const [hover, setHover] = useState<Date | null>(null);
  const { from, to } = value ?? {};

  const isStart = (d: Date) => (from ? isSameDay(d, from) : false);
  const isEnd = (d: Date) => (to ? isSameDay(d, to) : false);
  const provisionalTo = to ?? (from && hover && hover > from ? hover : undefined);
  const lower = from && provisionalTo && provisionalTo >= from ? from : provisionalTo;
  const upper = from && provisionalTo && provisionalTo >= from ? provisionalTo : from;

  const isInRange = (d: Date) => {
    if (!lower || !upper) return false;
    const t = startOfDay(d).getTime();
    return t > startOfDay(lower).getTime() && t < startOfDay(upper).getTime();
  };

  const selection: SelectionApi = {
    isSelected: (d) => isStart(d) || isEnd(d),
    isStart,
    isEnd,
    isInRange,
  };

  const handleSelect = (date: Date) => {
    if (!from || (from && to)) {
      setHover(null);
      onChange?.({ from: date });
      return;
    }
    if (date < from) onChange?.({ from: date, to: from });
    else onChange?.({ from, to: date });
    setHover(null);
  };

  return (
    <div onPointerLeave={() => setHover(null)}>
      <CalendarCore
        selection={selection}
        onSelectDate={handleSelect}
        onHoverDate={setHover}
        numberOfMonths={numberOfMonths}
        {...rest}
      />
      <div className="sr-only" aria-live="polite">
        {from ? `Start ${from.toDateString()}${to ? `, end ${to.toDateString()}` : ''}` : ''}
      </div>
    </div>
  );
}