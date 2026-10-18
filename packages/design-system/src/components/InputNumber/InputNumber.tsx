import { forwardRef, useEffect, useId, useState, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type NumberFormatPreset = 'us' | 'eur' | 'in';

export interface NumberFormatConfig {
  locale: string;
  group: string;
  decimal: string;
}

const PRESETS: Record<NumberFormatPreset, NumberFormatConfig> = {
  us: { locale: 'en-US', group: ',', decimal: '.' },
  eur: { locale: 'de-DE', group: '.', decimal: ',' },
  in: { locale: 'en-IN', group: ',', decimal: '.' },
};

/** Re-group on every keystroke, keeping the in-progress decimal part. */
function formatLive(
  raw: string,
  preset: NumberFormatConfig,
  decimals: number,
): { text: string; value: number | null } {
  const keep = new Set(['-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', preset.decimal]);
  const cleaned = [...raw].filter((c) => keep.has(c)).join('');
  const negative = cleaned.startsWith('-');
  const hadDecimal = cleaned.includes(preset.decimal);
  const [intRaw = '', ...fracRest] = cleaned.replace(/-/g, '').split(preset.decimal);
  const intDigits = intRaw.replace(/\D/g, '');
  const frac = decimals > 0 ? fracRest.join('').replace(/\D/g, '').slice(0, decimals) : '';
  const groupedInt = intDigits
    ? new Intl.NumberFormat(preset.locale, { maximumFractionDigits: 0 }).format(Number(intDigits))
    : '';

  let text = (negative ? '-' : '') + groupedInt;
  if (decimals > 0 && (hadDecimal || frac)) text += preset.decimal + frac;

  const value =
    intDigits || frac
      ? Number(`${negative ? '-' : ''}${intDigits || '0'}${frac ? `.${frac}` : ''}`)
      : null;
  return { text, value };
}

export interface InputNumberProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value?: number | null;
  onChange?: (value: number | null) => void;
  /** Locale grouping preset. Defaults to `us` (`1,234.56`). `eur` is `1.234,56`, `in` is `1,23,456.78`. */
  format?: NumberFormatPreset;
  /** Fixed decimal places. Omit for integers. */
  decimals?: number;
  min?: number;
  max?: number;
  /** Visual prefix inside the field (e.g. `$`). Not part of the value. */
  prefix?: string;
  /** Visual suffix inside the field (e.g. `kg`). Not part of the value. */
  suffix?: string;
}

/**
 * A number field with locale-aware grouping. US (`1,234.56`), euro
 * (`1.234,56`) and Indian (`1,23,456.78`) formats, with optional decimals.
 */
export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  (
    { className, value, onChange, format = 'us', decimals, min, max, prefix, suffix, id, onBlur, onFocus, ...props },
    ref,
  ) => {
    const reactId = useId();
    const preset = PRESETS[format];
    const formatter = new Intl.NumberFormat(preset.locale, {
      minimumFractionDigits: decimals ?? 0,
      maximumFractionDigits: decimals ?? 0,
    });
    const [text, setText] = useState(() => (value != null ? formatter.format(value) : ''));
    const [focused, setFocused] = useState(false);

    useEffect(() => {
      if (!focused) setText(value != null ? formatter.format(value) : '');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, focused, format, decimals]);

    const parse = (raw: string): number | null => {
      const trimmed = raw.trim();
      if (!trimmed) return null;
      const withoutGroups = trimmed.split(preset.group).join('');
      const normalized = withoutGroups.split(preset.decimal).join('.');
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const clamp = (n: number | null) => {
      if (n == null) return null;
      let next = n;
      if (min != null) next = Math.max(min, next);
      if (max != null) next = Math.min(max, next);
      return next;
    };

    return (
      <div className="relative w-full">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-text-muted">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={id ?? reactId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={text}
          onChange={(event) => {
            const { text: next, value } = formatLive(event.target.value, preset, decimals ?? 0);
            setText(next);
            onChange?.(value);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            const clamped = clamp(parse(text));
            setText(clamped != null ? formatter.format(clamped) : '');
            onChange?.(clamped);
            onBlur?.(event);
          }}
          className={cn(
            'h-[34px] w-full rounded-sm border border-border-strong bg-surface px-3 text-[16px] text-text tabular-nums md:text-[13px]',
            'placeholder:text-text-muted',
            'transition duration-150 ease-out',
            'focus-visible:border-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'aria-invalid:border-danger aria-invalid:ring-danger/20',
            prefix && 'pl-7',
            suffix && 'pr-9',
            className,
          )}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-text-muted">
            {suffix}
          </span>
        )}
      </div>
    );
  },
);
InputNumber.displayName = 'InputNumber';