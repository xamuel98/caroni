import * as PopoverPrimitive from '@radix-ui/react-popover';
import { CheckIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { InputText } from '../InputText';
import { Spinner } from '../Spinner';

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface AutocompleteBaseProps {
  options: AutocompleteOption[];
  onQueryChange?: (query: string) => void;
  loading?: boolean;
  loadingMessage?: ReactNode;
  placeholder?: string;
  emptyMessage?: ReactNode;
  id?: string;
  disabled?: boolean;
  className?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

export type AutocompleteProps =
  | (AutocompleteBaseProps & { multiple?: false; value?: string; onChange?: (value: string) => void })
  | (AutocompleteBaseProps & { multiple: true; value?: string[]; onChange?: (value: string[]) => void });

export function Autocomplete(props: AutocompleteProps) {
  const {
    options,
    onQueryChange,
    loading = false,
    loadingMessage = 'Searching…',
    placeholder = 'Search...',
    emptyMessage = 'No results',
    id,
    disabled,
    className,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
  } = props;
  const multiple = props.multiple ?? false;
  const value = props.value;
  const onChange = props.onChange as ((value: string | string[]) => void) | undefined;
  const listId = useId();
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedValues = useMemo(
    () => (multiple ? (Array.isArray(value) ? value : value ? [value] : []) : value ? [value as string] : []),
    [multiple, value],
  );

  const isInsideAnchor = (target: EventTarget | null) =>
    target instanceof Node && anchorRef.current?.contains(target) === true;

  // Seed the input text from the single selected option.
  useEffect(() => {
    if (multiple) return;
    const selected = options.find((o) => o.value === value);
    setQuery(selected ? selected.label : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, multiple]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => setActiveIndex(0), [query, open]);

  const select = (option: AutocompleteOption) => {
    if (option.disabled) return;
    if (multiple) {
      const next = selectedValues.includes(option.value)
        ? selectedValues.filter((v) => v !== option.value)
        : [...selectedValues, option.value];
      onChange?.(next);
      setQuery('');
    } else {
      setQuery(option.label);
      onChange?.(option.value);
      setOpen(false);
    }
  };

  const remove = (v: string) => onChange?.(selectedValues.filter((x) => x !== v));

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) setOpen(true);
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter': {
        const option = filtered[activeIndex];
        if (open && option) {
          event.preventDefault();
          select(option);
        }
        break;
      }
      case 'Backspace':
        if (multiple && query === '' && selectedValues.length > 0) {
          onChange?.(selectedValues.slice(0, -1));
        }
        break;
      case 'Escape':
        setOpen(false);
        break;
    }
  };

  const activeOption = open ? filtered[activeIndex] : undefined;
  const selectedOption = (v: string) => options.find((o) => o.value === v);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Anchor asChild>
        <div ref={anchorRef} className={cn('relative w-full', className)}>
          {multiple ? (
            <div
              className={cn(
                'flex min-h-[34px] w-full flex-wrap items-center gap-1 rounded-sm border border-border-strong bg-surface py-1 pl-2 pr-3 text-[13px]',
                'focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/20',
                disabled && 'cursor-not-allowed opacity-50',
                ariaInvalid && 'border-danger ring-danger/20',
              )}
            >
              {selectedValues.map((v) => {
                const option = selectedOption(v);
                if (!option) return null;
                return (
                  <span
                    key={v}
                    className="inline-flex max-w-[10rem] items-center gap-1 rounded-sm bg-surface-sunken py-0.5 pl-2 pr-1 text-text"
                  >
                    <span className="truncate">{option.label}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${option.label}`}
                      disabled={disabled}
                      onClick={() => remove(v)}
                      className="grid size-4 shrink-0 place-items-center rounded-sm text-text-muted transition-colors duration-150 ease-out hover:bg-border hover:text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                    >
                      <XMarkIcon className="size-3.5" />
                    </button>
                  </span>
                );
              })}
              <input
                id={id}
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={activeOption ? `${listId}-${activeOption.value}` : undefined}
                aria-invalid={ariaInvalid}
                aria-describedby={ariaDescribedBy}
                autoComplete="off"
                disabled={disabled}
                placeholder={selectedValues.length === 0 ? placeholder : undefined}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  onQueryChange?.(event.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                className="h-6 min-w-[6rem] flex-1 bg-transparent text-[16px] text-text outline-none placeholder:text-text-muted md:text-[13px]"
              />
              {loading && <Spinner className="size-4 shrink-0 text-text-muted" />}
            </div>
          ) : (
            <InputText
              id={id}
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeOption ? `${listId}-${activeOption.value}` : undefined}
              aria-invalid={ariaInvalid}
              aria-describedby={ariaDescribedBy}
              autoComplete="off"
              disabled={disabled}
              placeholder={placeholder}
              value={query}
              startIcon={<MagnifyingGlassIcon />}
              endIcon={
                loading ? (
                  <Spinner className="size-4 text-accent" />
                ) : value ? (
                  <button
                    type="button"
                    aria-label="Clear"
                    className="grid size-4 place-items-center rounded-full text-text-muted transition-colors duration-150 ease-out hover:text-text"
                    onClick={() => {
                      setQuery('');
                      onChange?.('');
                    }}
                  >
                    <XMarkIcon className="size-4" />
                  </button>
                ) : undefined
              }
              onChange={(event) => {
                setQuery(event.target.value);
                onQueryChange?.(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
            />
          )}
        </div>
      </PopoverPrimitive.Anchor>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          onOpenAutoFocus={(event) => event.preventDefault()}
          onFocusOutside={(event) => {
            if (isInsideAnchor(event.target)) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (isInsideAnchor(event.target)) event.preventDefault();
          }}
          align="start"
          sideOffset={6}
          className={cn(
            'z-50 w-[var(--radix-popover-trigger-width)] rounded-md border border-border bg-surface-raised p-1 outline-none',
            'shadow-[0_8px_28px_-8px_rgb(16_16_20/0.24)] dark:shadow-[0_8px_28px_-8px_rgb(0_0_0/0.6)]',
            'origin-[var(--radix-popover-content-transform-origin)]',
            'data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out',
          )}
        >
          <ul id={listId} role="listbox" aria-multiselectable={multiple} className="max-h-64 overflow-y-auto">
            {loading && filtered.length === 0 ? (
              <li role="presentation" className="flex items-center justify-center gap-2 px-2 py-3 text-[13px] text-text-muted">
                <Spinner className="size-4" />
                <span>{loadingMessage}</span>
              </li>
            ) : filtered.length === 0 ? (
              <li className="px-2 py-3 text-center text-[13px] text-text-muted">{emptyMessage}</li>
            ) : (
              filtered.map((option, i) => {
                const selected = selectedValues.includes(option.value);
                const active = i === activeIndex && !option.disabled;
                return (
                  <li
                    key={option.value}
                    id={`${listId}-${option.value}`}
                    role="option"
                    aria-selected={selected}
                    aria-disabled={option.disabled || undefined}
                    className={cn(
                      'flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] text-text',
                      option.disabled && 'pointer-events-none opacity-50',
                      active && 'bg-surface-sunken',
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => !option.disabled && setActiveIndex(i)}
                    onClick={() => select(option)}
                  >
                    {multiple && (
                      <span
                        className={cn(
                          'grid size-4 shrink-0 place-items-center rounded-[4px] border',
                          selected ? 'border-accent bg-accent text-accent-fg' : 'border-border-strong',
                        )}
                        aria-hidden="true"
                      >
                        {selected && <CheckIcon className="size-3" />}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {option.description && (
                        <span className="block truncate text-[12px] text-text-muted">{option.description}</span>
                      )}
                    </span>
                    {selected && <CheckIcon className="size-4 shrink-0 text-accent" />}
                  </li>
                );
              })
            )}
          </ul>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}