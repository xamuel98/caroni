import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsUpDownIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { DatePicker } from '../DatePicker';
import { InputText } from '../InputText';
import { InputNumber } from '../InputNumber';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { RadioGroup, RadioGroupItem } from '../RadioGroup';
import { Separator } from '../Separator';
import { Slider } from '../Slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../Tooltip';

/* ── Icons ─────────────────────────────────────────────────────────────── */

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      focusable="false"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 6a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5h-12.5a.75.75 0 0 1-.75-.75Z" />
      <path d="M6.75 14a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75Z" />
      <path d="M5.5 9.25a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5h-9Z" />
    </svg>
  );
}

/* ── Schema ────────────────────────────────────────────────────────────── */

export type DataTableFilterType = 'multi' | 'text' | 'numberRange' | 'single' | 'boolean' | 'date';

export interface DataTableFilterOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface DataTableFilterDef<T> {
  field: string;
  label: string;
  type: DataTableFilterType;
  options?: DataTableFilterOption[];
  /** Async option source (search + load). */
  loadOptions?: (query: string) => Promise<DataTableFilterOption[]>;
  min?: number;
  max?: number;
  step?: number;
  format?: (value: number) => string;
  prefix?: string;
  suffix?: string;
  /** Allow this filter to be added more than once. Defaults to false. */
  allowMultipleInstances?: boolean;
  /** Max instances when `allowMultipleInstances`. */
  maxInstances?: number;
  disabled?: boolean;
  /** Client-side row predicate for this filter. */
  predicate?: (row: T, value: unknown) => boolean;
}

export interface DataTableFilterCondition {
  id: string;
  field: string;
  value: unknown;
}

export interface DataTableQuery {
  search: string;
  filters: DataTableFilterCondition[];
  sort: { field: string; order: 1 | -1 }[];
}

export interface DataTableSearchConfig<T> {
  /** Returns the searchable text for a row. */
  accessor: (row: T) => string;
  placeholder?: string;
  /** Debounce in ms. Defaults to 0 for client-side, 350 for server-side. */
  debounce?: number;
}

/* ── Value helpers ─────────────────────────────────────────────────────── */

export function isValidValue<T>(def: DataTableFilterDef<T>, value: unknown): boolean {
  switch (def.type) {
    case 'multi':
      return Array.isArray(value) && value.length > 0;
    case 'text':
      return typeof value === 'string' && value.trim().length > 0;
    case 'single':
      return typeof value === 'string' && value.length > 0;
    case 'boolean':
      return typeof value === 'boolean';
    case 'numberRange':
      return (
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === 'number' &&
        typeof value[1] === 'number'
      );
    case 'date':
      return typeof value === 'string' && value.length > 0;
    default:
      return value != null;
  }
}

function optionLabel<T>(def: DataTableFilterDef<T>, value: string): ReactNode {
  return def.options?.find((o) => o.value === value)?.label ?? value;
}

function summarize<T>(def: DataTableFilterDef<T>, value: unknown): string {
  const fmt = def.format ?? ((n: number) => String(n));
  switch (def.type) {
    case 'multi':
      return (value as string[]).map((v) => String(optionLabel(def, v))).join(', ');
    case 'single':
      return String(optionLabel(def, value as string));
    case 'boolean':
      return value === true ? 'Yes' : 'No';
    case 'numberRange': {
      const arr = value as number[];
      const a = arr[0] ?? 0;
      const b = arr[1] ?? 0;
      return `is between ${def.prefix ?? ''}${fmt(a)}${def.suffix ?? ''} and ${def.prefix ?? ''}${fmt(b)}${def.suffix ?? ''}`;
    }
    case 'date':
      return new Date(value as string).toDateString();
    default:
      return String(value ?? '');
  }
}

/* ── Editors ───────────────────────────────────────────────────────────── */

/** The "empty" value for a filter type (used by the Clear control). */
function clearValue<T>(def: DataTableFilterDef<T>): unknown {
  switch (def.type) {
    case 'multi':
      return [];
    case 'boolean':
      return null;
    default:
      return undefined;
  }
}

function FilterEditor<T>({
  def,
  value,
  onChange,
}: {
  def: DataTableFilterDef<T>;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  let control: ReactNode;
  switch (def.type) {
    case 'multi': {
      const vals = Array.isArray(value) ? (value as string[]) : [];
      control = (
        <div className="flex max-h-64 w-56 flex-col gap-0.5 overflow-y-auto p-1">
          {def.options?.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] text-text hover:bg-surface-sunken"
            >
              <Checkbox
                checked={vals.includes(option.value)}
                disabled={option.disabled}
                onCheckedChange={(checked) =>
                  onChange(
                    checked ? [...vals, option.value] : vals.filter((v) => v !== option.value),
                  )
                }
              />
              <span className="min-w-0 truncate">{option.label}</span>
            </label>
          ))}
        </div>
      );
      break;
    }
    case 'single':
      control = (
        <RadioGroup
          value={typeof value === 'string' ? value : ''}
          onValueChange={(next) => onChange(next)}
          className="flex w-56 flex-col gap-0.5 p-1"
        >
          {def.options?.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] text-text hover:bg-surface-sunken"
            >
              <RadioGroupItem value={option.value} disabled={option.disabled} />
              <span className="min-w-0 truncate">{option.label}</span>
            </label>
          ))}
        </RadioGroup>
      );
      break;
    case 'boolean':
      control = (
        <RadioGroup
          value={value === true ? 'true' : value === false ? 'false' : ''}
          onValueChange={(next) => onChange(next === 'true')}
          className="flex w-40 flex-col gap-0.5 p-1"
        >
          {(
            [
              ['Yes', 'true'],
              ['No', 'false'],
            ] as const
          ).map(([label, v]) => (
            <label
              key={v}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] text-text hover:bg-surface-sunken"
            >
              <RadioGroupItem value={v} />
              <span>{label}</span>
            </label>
          ))}
        </RadioGroup>
      );
      break;
    case 'numberRange': {
      const range = Array.isArray(value) ? (value as number[]) : [def.min ?? 0, def.max ?? 100];
      control = (
        <div className="w-64 space-y-3 p-1.5">
          <div className="flex items-center gap-2">
            <InputNumber
              value={range[0]}
              decimals={def.step && def.step < 1 ? 2 : 0}
              prefix={def.prefix}
              onChange={(v) => onChange([v ?? def.min ?? 0, range[1]])}
              className="h-8"
            />
            <span className="text-text-muted">–</span>
            <InputNumber
              value={range[1]}
              decimals={def.step && def.step < 1 ? 2 : 0}
              prefix={def.prefix}
              onChange={(v) => onChange([range[0], v ?? def.max ?? 0])}
              className="h-8"
            />
          </div>
          <Slider
            min={def.min}
            max={def.max}
            step={def.step}
            value={range}
            onValueChange={(v) => onChange(v)}
          />
        </div>
      );
      break;
    }
    case 'date':
      control = (
        <div className="w-64 p-1.5">
          <DatePicker
            value={value ? new Date(value as string) : undefined}
            onChange={(d) => onChange(d ? d.toISOString() : undefined)}
          />
        </div>
      );
      break;
    default:
      control = (
        <div className="w-56 p-1.5">
          <InputText
            autoFocus
            value={typeof value === 'string' ? value : ''}
            placeholder={def.label}
            className="h-8"
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      );
      break;
  }

  return (
    <div className="flex flex-col">
      {control}
      <div className="flex justify-end border-t border-border p-1">
        <Button variant="plain" size="xs" onClick={() => onChange(clearValue(def))}>
          Clear
        </Button>
      </div>
    </div>
  );
}

/* ── Chip ──────────────────────────────────────────────────────────────── */

function FilterChip<T>({
  def,
  condition,
  open,
  onOpenChange,
  onChange,
  onRemove,
  suppressOutside,
}: {
  def: DataTableFilterDef<T>;
  condition: DataTableFilterCondition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: unknown) => void;
  onRemove: () => void;
  /** While true, outside interactions are ignored (used right after adding). */
  suppressOutside?: () => boolean;
}) {
  const valid = isValidValue(def, condition.value);
  const text = valid ? summarize(def, condition.value) : '';

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <div className="c-dt-chip animate-dt-chip group relative inline-flex h-7 max-w-full items-center gap-1 rounded-sm bg-surface pl-2.5 pr-1 text-[12px] motion-reduce:animate-none">
        {/* Two border layers: dashed while empty, solid on hover or once a value is chosen. */}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 rounded-sm border border-dashed border-border-strong transition-opacity duration-150 ease-out',
            valid ? 'opacity-0' : 'group-hover:opacity-0',
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 rounded-sm border border-solid border-border-strong transition-opacity duration-150 ease-out',
            valid ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}
        />
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex min-w-0 items-center gap-1.5 rounded-sm text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span className="shrink-0 text-text-muted">
              {def.label}
              {valid && def.type !== 'numberRange' ? ':' : ''}
            </span>
            {valid && <span className="min-w-0 truncate font-medium text-text">{text}</span>}
            <ChevronDownIcon className="size-3 shrink-0 opacity-60" />
          </button>
        </PopoverTrigger>
        <button
          type="button"
          aria-label={`Remove ${def.label} filter`}
          onClick={onRemove}
          className="grid size-5 shrink-0 place-items-center rounded-sm text-text-muted transition-colors duration-150 ease-out hover:bg-surface-sunken hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <XMarkIcon className="size-3.5" />
        </button>
      </div>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-auto p-0"
        onInteractOutside={(event) => {
          if (suppressOutside?.()) event.preventDefault();
        }}
        onFocusOutside={(event) => {
          if (suppressOutside?.()) event.preventDefault();
        }}
      >
        <FilterEditor def={def} value={condition.value} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
}

/* ── Add filter (dashed → solid) ───────────────────────────────────────── */

function AddFilterButton<T>({
  available,
  disabled,
  onAdd,
}: {
  available: DataTableFilterDef<T>[];
  disabled: boolean;
  onAdd: (def: DataTableFilterDef<T>) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'group relative inline-flex h-7 shrink-0 items-center gap-1.5 rounded-sm px-2.5 text-[12px] font-medium',
            'text-text-secondary transition-colors duration-150 ease-out',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            '[--af-border:var(--color-border-strong)]',
            disabled && 'pointer-events-none text-text-disabled [--af-border:var(--color-border)]',
          )}
        >
          {/* Two border layers: the dashed layer fades out as the solid one fades in. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-sm border border-dashed border-[color:var(--af-border)] transition-opacity duration-150 ease-out group-hover:opacity-0"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-sm border border-solid border-[color:var(--af-border)] opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100"
          />
          <PlusIcon className="size-3.5" />
          Add filter
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {available.map((def) => (
          <DropdownMenuItem key={def.field} onSelect={() => onAdd(def)}>
            {def.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ── Sort popover ──────────────────────────────────────────────────────── */

export interface DataTableSortField {
  key: string;
  header: ReactNode;
  sortType?: 'text' | 'number' | 'date';
}

function directionLabel(type: DataTableSortField['sortType'], order: 1 | -1) {
  if (type === 'number') return order === 1 ? 'Ascending' : 'Descending';
  if (type === 'date') return order === 1 ? 'Oldest first' : 'Newest first';
  return order === 1 ? 'A–Z' : 'Z–A';
}

/**
 * A tooltip that opens on **hover only** (never on focus), so it can't flicker
 * while interacting with a popover it anchors.
 */
function HoverTooltip({
  label,
  children,
  disabled = false,
}: {
  label: ReactNode;
  children: ReactNode;
  /** While true (e.g. the anchored popover is open), never show the tooltip. */
  disabled?: boolean;
}) {
  const [hovering, setHovering] = useState(false);
  return (
    <Tooltip open={hovering && !disabled} onOpenChange={() => {}}>
      <TooltipTrigger asChild>
        <span
          className="inline-flex"
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function SortButton({
  fields,
  field,
  order,
  onChange,
}: {
  fields: DataTableSortField[];
  field?: string;
  order?: 1 | -1;
  onChange: (field: string, order: 1 | -1) => void;
}) {
  const active = fields.find((f) => f.key === field);
  const [open, setOpen] = useState(false);
  return (
    <HoverTooltip label="Sort" disabled={open}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size="icon-xs" variant="secondary" aria-label="Sort">
            <ArrowsUpDownIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={6} className="w-52 p-1.5">
          <div className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-text-muted">
            Sort by
          </div>
          <RadioGroup
            value={field ?? ''}
            onValueChange={(value) => onChange(value, order ?? 1)}
            className="flex flex-col gap-0.5"
          >
            {fields.map((f) => (
              <label
                key={f.key}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] text-text hover:bg-surface-sunken"
              >
                <RadioGroupItem value={f.key} />
                <span className="min-w-0 truncate">{f.header}</span>
              </label>
            ))}
          </RadioGroup>

          {field && (
            <>
              <Separator className="my-1" />
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => onChange(field, 1)}
                  className={cn(
                    'flex items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[13px] text-text hover:bg-surface-sunken',
                    order === 1 && 'bg-surface-sunken font-medium',
                  )}
                >
                  <ArrowUpIcon className="size-3.5 text-text-muted" />
                  <span>{directionLabel(active?.sortType, 1)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange(field, -1)}
                  className={cn(
                    'flex items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[13px] text-text hover:bg-surface-sunken',
                    order === -1 && 'bg-surface-sunken font-medium',
                  )}
                >
                  <ArrowDownIcon className="size-3.5 text-text-muted" />
                  <span>{directionLabel(active?.sortType, -1)}</span>
                </button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </HoverTooltip>
  );
}

/* ── Toolbar ───────────────────────────────────────────────────────────── */

export interface DataTableToolbarProps<T> {
  filters: DataTableFilterDef<T>[];
  conditions: DataTableFilterCondition[];
  searchValue: string;
  searchConfig?: DataTableSearchConfig<T>;
  searchDebounce: number;
  sortFields: DataTableSortField[];
  sortField?: string;
  sortOrder?: 1 | -1;
  onSearch: (value: string) => void;
  onSort: (field: string, order: 1 | -1) => void;
  onAddCondition: (def: DataTableFilterDef<T>, id: string) => void;
  onUpdateCondition: (id: string, value: unknown) => void;
  onRemoveCondition: (id: string) => void;
  onClearAll: () => void;
}

export function DataTableToolbar<T>({
  filters,
  conditions,
  searchValue,
  searchConfig,
  searchDebounce,
  sortFields,
  sortField,
  sortOrder,
  onSearch,
  onSort,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition,
  onClearAll,
}: DataTableToolbarProps<T>) {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState(searchValue);
  const [editingId, setEditingId] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const idCounter = useRef(0);
  // Grace window after adding, so the click/menu-close that created the
  // filter doesn't immediately abandon it.
  const recentAdd = useRef(0);

  // Keep the input in sync when the query is reset/reopened.
  useEffect(() => setText(searchValue), [searchValue]);

  const schedule = (value: string) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    if (searchDebounce <= 0) {
      onSearch(value);
      return;
    }
    timer.current = window.setTimeout(() => onSearch(value), searchDebounce);
  };
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const byField = useMemo(() => new Map(filters.map((f) => [f.field, f])), [filters]);

  // Availability derives from definitions + current instances + duplicate policy.
  const available = filters.filter((def) => {
    if (def.disabled) return false;
    const count = conditions.filter((c) => c.field === def.field).length;
    if (def.allowMultipleInstances) return count < (def.maxInstances ?? Number.POSITIVE_INFINITY);
    return count === 0;
  });

  const activeCount = conditions.length + (searchValue ? 1 : 0);

  return (
    <TooltipProvider delayDuration={400}>
      <div className="border-b border-border bg-surface">
        {expanded ? (
          <div className="animate-dt-expand space-y-2.5 py-3 motion-reduce:animate-none">
            <div className="flex items-center gap-2 px-3">
              <span className="min-w-0 flex-1">
                <InputText
                  autoFocus
                  value={text}
                  placeholder={searchConfig?.placeholder ?? 'Searching in all'}
                  startIcon={<MagnifyingGlassIcon />}
                  className="h-8 border-transparent bg-surface-sunken/60 transition-colors duration-150 ease-out hover:bg-surface-sunken"
                  endIcon={
                    text ? (
                      <button
                        type="button"
                        aria-label="Clear search"
                        onClick={() => {
                          setText('');
                          onSearch('');
                        }}
                        className="grid size-4 place-items-center rounded-full text-text-muted hover:text-text"
                      >
                        <XMarkIcon className="size-4" />
                      </button>
                    ) : undefined
                  }
                  onChange={(event) => {
                    setText(event.target.value);
                    schedule(event.target.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      if (timer.current !== null) window.clearTimeout(timer.current);
                      onSearch(text);
                    } else if (event.key === 'Escape' && text) {
                      event.preventDefault();
                      setText('');
                      onSearch('');
                    }
                  }}
                />
              </span>
              <Button size="sm" variant="secondary" onClick={() => setExpanded(false)}>
                Done
              </Button>
              <SortButton
                fields={sortFields}
                field={sortField}
                order={sortOrder}
                onChange={onSort}
              />
            </div>

            <Separator />

            {filters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 px-3">
                {conditions.map((condition) => {
                  const def = byField.get(condition.field);
                  if (!def) return null;
                  return (
                    <FilterChip
                      key={condition.id}
                      def={def}
                      condition={condition}
                      open={editingId === condition.id}
                      onOpenChange={(open) => {
                        if (
                          !open &&
                          !isValidValue(def, condition.value) &&
                          Date.now() - recentAdd.current > 400
                        ) {
                          onRemoveCondition(condition.id);
                        }
                        setEditingId(open ? condition.id : null);
                      }}
                      onChange={(value) => onUpdateCondition(condition.id, value)}
                      onRemove={() => {
                        onRemoveCondition(condition.id);
                        if (editingId === condition.id) setEditingId(null);
                      }}
                      suppressOutside={() => Date.now() - recentAdd.current < 400}
                    />
                  );
                })}

                <AddFilterButton
                  available={available}
                  disabled={available.length === 0}
                  onAdd={(def) => {
                    const id = `${def.field}-${idCounter.current++}`;
                    onAddCondition(def, id);
                    recentAdd.current = Date.now();
                    setEditingId(id);
                  }}
                />

                {conditions.length > 0 && (
                  <Button variant="monochrome" size="xs" onClick={onClearAll}>
                    Clear all
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2 px-3 py-2">
            <HoverTooltip label="Search and filter (F)">
              <Button
                size="xs"
                variant="secondary"
                aria-label="Search and filter"
                className="relative gap-2.5"
                onClick={() => setExpanded(true)}
              >
                <MagnifyingGlassIcon className="size-4" />
                <FilterIcon className="size-4" />
                {activeCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-accent text-[10px] font-medium text-accent-fg">
                    {activeCount}
                  </span>
                )}
              </Button>
            </HoverTooltip>
            <SortButton fields={sortFields} field={sortField} order={sortOrder} onChange={onSort} />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
