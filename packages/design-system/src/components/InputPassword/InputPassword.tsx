import { EyeIcon, EyeSlashIcon } from '@heroicons/react/20/solid';
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type PasswordStrength = 'weak' | 'okay' | 'strong';

export interface InputPasswordProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Show the show/hide toggle. Defaults to true. */
  showToggle?: boolean;
  /** Show the strength meter. Defaults to true. */
  showMeter?: boolean;
  /**
   * Custom strength scorer. Return `0` (nothing) … `3` (strong). Overrides the
   * built-in heuristic so you decide the criteria.
   */
  score?: (password: string) => 0 | 1 | 2 | 3;
  /** Custom copy per level. */
  strengthLabels?: Partial<Record<PasswordStrength, ReactNode>>;
}

const DEFAULT_LABELS: Record<PasswordStrength, string> = {
  weak: 'Too weak',
  okay: 'Almost there',
  strong: 'Strong password',
};

const BAR_TONE: Record<number, string> = {
  1: 'bg-danger',
  2: 'bg-warning',
  3: 'bg-success',
};

const TEXT_TONE: Record<PasswordStrength, string> = {
  weak: 'text-danger',
  okay: 'text-warning',
  strong: 'text-success',
};

function defaultScore(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  if (password.length < 8 || checks <= 1) return 1;
  if (checks <= 3) return 2;
  return 3;
}

const levelToStrength = (level: number): PasswordStrength | null =>
  level === 1 ? 'weak' : level === 2 ? 'okay' : level === 3 ? 'strong' : null;

export const InputPassword = forwardRef<HTMLInputElement, InputPasswordProps>(
  (
    {
      className,
      showToggle = true,
      showMeter = true,
      score,
      strengthLabels,
      value,
      defaultValue,
      disabled,
      id,
      onChange,
      ...props
    },
    ref,
  ) => {
    const reactId = useId();
    const passwordId = id ?? reactId;
    const meterId = `${passwordId}-meter`;
    const [visible, setVisible] = useState(false);
    const [internal, setInternal] = useState(() =>
      typeof defaultValue === 'string' ? defaultValue : '',
    );
    const isControlled = typeof value === 'string';
    const password = isControlled ? value : internal;

    const rawLevel = score ? score(password) : defaultScore(password);
    const level = Math.max(0, Math.min(3, rawLevel));
    const strength = levelToStrength(level);

    return (
      <div className={cn('w-full', className)}>
        <div className="relative">
          <input
            ref={ref}
            id={passwordId}
            type={visible ? 'text' : 'password'}
            value={password}
            disabled={disabled}
            onChange={(event) => {
              if (!isControlled) setInternal(event.target.value);
              onChange?.(event);
            }}
            aria-describedby={showMeter ? meterId : props['aria-describedby']}
            className={cn(
              'h-[34px] w-full rounded-sm border border-border-strong bg-surface px-3 text-[16px] text-text md:text-[13px]',
              'placeholder:text-text-muted',
              'transition duration-150 ease-out',
              'focus-visible:border-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'aria-invalid:border-danger aria-invalid:ring-danger/20',
              showToggle && 'pr-9',
            )}
            {...props}
          />
          {showToggle && (
            <button
              type="button"
              disabled={disabled}
              aria-label={visible ? 'Hide password' : 'Show password'}
              onClick={() => setVisible((v) => !v)}
              className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-text-muted transition-colors duration-150 ease-out hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none"
            >
              {visible ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </button>
          )}
        </div>

        {showMeter && (
          <div className="mt-2 flex items-center gap-2" id={meterId} aria-live="polite">
            <span className="flex items-end gap-1" role="presentation" aria-hidden="true">
              {[1, 2, 3].map((bar) => (
                <span
                  key={bar}
                  className={cn(
                    'w-1 rounded-full transition-colors duration-200 ease-out',
                    bar === 1 ? 'h-1.5' : bar === 2 ? 'h-2' : 'h-2.5',
                    bar <= level ? BAR_TONE[level] : 'bg-surface-sunken',
                  )}
                />
              ))}
            </span>
            {strength && (
              <span className={cn('text-[12px] font-medium', TEXT_TONE[strength])}>
                {strengthLabels?.[strength] ?? DEFAULT_LABELS[strength]}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);
InputPassword.displayName = 'InputPassword';