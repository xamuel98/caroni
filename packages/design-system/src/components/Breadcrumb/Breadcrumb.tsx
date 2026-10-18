import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { Fragment, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';

export interface BreadcrumbItem {
  label: ReactNode;
  /** Glyph shown before the label. */
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  /** Underline this crumb (overrides the root default). */
  underline?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Custom separator. Defaults to a chevron. */
  separator?: ReactNode;
  /** Underline every crumb (each item can override). */
  underline?: boolean;
  className?: string;
}

function Crumb({
  item,
  current,
  underline,
}: {
  item: BreadcrumbItem;
  current?: boolean;
  underline?: boolean;
}) {
  const cls = cn(
    'inline-flex items-center gap-1 rounded-sm transition-colors duration-150 ease-out',
    current ? 'font-medium text-text' : 'text-text-muted hover:text-text',
    (item.underline ?? underline) && 'underline underline-offset-2',
  );
  const content = (
    <>
      {item.icon && (
        <span className="grid size-3.5 shrink-0 place-items-center [&_svg]:size-3.5">{item.icon}</span>
      )}
      <span>{item.label}</span>
    </>
  );

  if (current) {
    return (
      <span aria-current="page" className={cls}>
        {content}
      </span>
    );
  }
  if (item.href) {
    return (
      <a href={item.href} className={cn(cls, 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring')}>
        {content}
      </a>
    );
  }
  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        className={cn(cls, 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring')}
      >
        {content}
      </button>
    );
  }
  return <span className={cls}>{content}</span>;
}

/**
 * A breadcrumb that collapses its middle crumbs into an overflow menu on small
 * screens (≤ md), and shows every crumb inline from md up. Crumbs can carry an
 * icon and be underlined.
 */
export function Breadcrumb({ items, separator, underline, className }: BreadcrumbProps) {
  const sep = separator ?? <ChevronRightIcon className="size-3.5 shrink-0 text-text-muted" aria-hidden="true" />;
  const first = items[0];
  const last = items[items.length - 1];
  const middle = items.slice(1, -1);
  const collapse = items.length > 2;

  if (!first || !last) return null;

  if (!collapse) {
    return (
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-1.5 text-[13px]">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && sep}
              <Crumb item={item} current={i === items.length - 1} underline={underline} />
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1.5 text-[13px]">
        <li className="flex min-w-0 items-center gap-1.5">
          <Crumb item={first} underline={underline} />
        </li>

        <li className="hidden min-w-0 items-center gap-1.5 md:flex">
          {middle.map((item, i) => (
            <Fragment key={i}>
              {sep}
              <Crumb item={item} underline={underline} />
            </Fragment>
          ))}
        </li>

        <li className="flex items-center gap-1.5 md:hidden">
          {sep}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Show more"
                className="grid h-6 w-7 place-items-center rounded-sm text-text-muted transition-colors duration-150 ease-out hover:bg-surface-sunken hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span aria-hidden="true">…</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {middle.map((item, i) => (
                <DropdownMenuItem
                  key={i}
                  onSelect={() => {
                    item.onClick?.();
                  }}
                  asChild={Boolean(item.href)}
                >
                  {item.href ? (
                    <a href={item.href} className="inline-flex items-center gap-1.5">
                      {item.icon && <span className="[&_svg]:size-3.5">{item.icon}</span>}
                      {item.label}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      {item.icon && <span className="[&_svg]:size-3.5">{item.icon}</span>}
                      {item.label}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </li>

        <li className="flex min-w-0 items-center gap-1.5">
          {sep}
          <Crumb item={last} current underline={underline} />
        </li>
      </ol>
    </nav>
  );
}