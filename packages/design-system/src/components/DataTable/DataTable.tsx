import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { ChevronDownIcon, EllipsisHorizontalIcon } from '@heroicons/react/20/solid';
import { cn } from '../../lib/cn';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../Dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { EmptyState } from '../EmptyState';
import { Pagination } from '../Pagination';
import { Skeleton } from '../Skeleton';
import { TextSwap } from '../Transitions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import {
  DataTableToolbar,
  isValidValue,
  type DataTableFilterCondition,
  type DataTableFilterDef,
  type DataTableQuery,
  type DataTableSearchConfig,
} from './DataTableToolbar';

/** `useLayoutEffect` on the client, `useEffect` on the server (no SSR warning). */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export type DataTableSortOrder = 1 | -1;
export interface DataTableSort {
  field: string;
  order: DataTableSortOrder;
}

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  sortAccessor?: (row: T) => string | number;
  /** Drives the sort-direction labels in the sort popover. */
  sortType?: 'text' | 'number' | 'date';
  truncate?: boolean;
  className?: string;
}

export type DataTableSize = 'small' | 'medium' | 'large';
export type SelectionMode = 'single' | 'multiple';

/** A group descriptor resolved from a row. `key` is the stable identity. */
export interface DataTableGroup<T> {
  key: string;
  label?: ReactNode;
  meta?: unknown;
  /** Optional sort weight for group ordering (lower first). */
  order?: number;
  /** Original rows, filled in by the table. */
  rows?: T[];
}

export interface DataTableBulkMenuItem<T> {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  onSelect: (ids: string[], rows: T[]) => void | Promise<void>;
}

export interface DataTableBulkAction<T> {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  destructive?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  /** Show a confirmation step before running. */
  confirm?: {
    title: ReactNode;
    description?: ReactNode;
    confirmLabel?: ReactNode;
    cancelLabel?: ReactNode;
  };
  /** A plain action. */
  onAction?: (ids: string[], rows: T[]) => void | Promise<void>;
  /** Render as a dropdown menu of sub-actions instead of a plain button. */
  items?: DataTableBulkMenuItem<T>[];
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: ReactNode;

  sortField?: string;
  sortOrder?: DataTableSortOrder;
  removableSort?: boolean;
  sortMode?: 'single' | 'multiple';
  onSortChange?: (sort: DataTableSort[]) => void;

  /** Enable the contextual Search + Filter toolbar. */
  search?: DataTableSearchConfig<T>;
  /** Schema-driven filter definitions. */
  filters?: DataTableFilterDef<T>[];
  /** `client` filters the loaded rows; `server` expects the consumer to refetch. */
  filterMode?: 'client' | 'server';
  /** Initial search / filter state. */
  defaultQuery?: DataTableQuery;
  /** Notified whenever the query changes (search, filters, or sort). */
  onQueryChange?: (query: DataTableQuery) => void;
  /** Search debounce (ms). Defaults to 0 client-side, 350 server-side. */
  searchDebounce?: number;

  selectable?: boolean;
  selectionMode?: SelectionMode;
  metaKeySelection?: boolean;
  selectedKeys?: string[];
  onSelectedKeysChange?: (keys: string[]) => void;
  /** Block individual rows from being selected. */
  isRowSelectable?: (row: T) => boolean;

  /** Group rows into labelled sections. */
  groupBy?: (row: T) => DataTableGroup<T>;
  /** Show a per-group select checkbox (requires `selectable`). Defaults to `selectable`. */
  groupSelection?: boolean;
  /** Fully customise a group subheader. */
  renderGroupHeader?: (group: DataTableGroup<T>, rows: T[]) => ReactNode;

  /** Contextual actions shown in place of the column headers when rows are selected. */
  bulkActions?: DataTableBulkAction<T>[];
  renderBulkToolbar?: (ctx: {
    selectedIds: string[];
    selectedRows: T[];
    allSelected: boolean;
    someSelected: boolean;
    clear: () => void;
  }) => ReactNode;
  /** Selection-count copy. Defaults to `${count} selected`. */
  formatSelectionCount?: (count: number) => ReactNode;
  /** Max inline bulk actions before the rest go into a "More" menu. Defaults to 2. */
  maxInlineBulkActions?: number;

  stickyColumns?: number;
  stickyFirstColumn?: boolean;
  resizable?: boolean;
  columnDividers?: boolean;
  stripedRows?: boolean;
  size?: DataTableSize;

  isLoading?: boolean;
  skeletonRows?: number;
  virtualized?: boolean;
  rowHeight?: number;
  maxHeight?: number | string;

  paginator?: boolean;
  rowsPerPage?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

const alignCell = { left: 'text-left', center: 'text-center', right: 'text-right tabular-nums' } as const;
const alignHead = { left: 'text-left', center: 'text-center', right: 'text-right' } as const;
const alignJustify = { left: 'justify-start', center: 'justify-center', right: 'justify-end' } as const;

const PAD: Record<DataTableSize, { head: string; cell: string }> = {
  small: { head: 'h-8 px-3', cell: 'px-3 py-1.5 text-[12px]' },
  medium: { head: 'h-11 px-4', cell: 'px-4 py-3' },
  large: { head: 'h-[52px] px-5', cell: 'px-5 py-4 text-[14px]' },
};

const HEAD_HEIGHT: Record<DataTableSize, number> = { small: 32, medium: 44, large: 52 };
const HEAD_HEIGHT_DEFAULT = 40;

const SELECT_WIDTH = 40;
const OVERSCAN = 8;
const parsePx = (v: number | string | undefined) =>
  typeof v === 'number' ? v : v ? Number.parseFloat(v) || 0 : 0;

/** Blur + fade + a small vertical shift, used for the header swap. */
const swapTransition =
  'transition-[opacity,filter,transform] duration-[var(--duration-fast)] ease-out';

/** The chevron up/down indicator: the active direction is brighter. */
function SortIndicator({ order, position }: { order?: DataTableSortOrder; position?: number }) {
  return (
    <span className="relative inline-flex shrink-0 items-center" aria-hidden="true">
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
        <path
          className={cn('transition-colors duration-150 ease-out', order === 1 ? 'text-text' : 'text-text-muted')}
          d="M10.53 3.47a.75.75 0 0 0-1.06 0L6.22 6.72a.75.75 0 0 0 1.06 1.06L10 5.06l2.72 2.72a.75.75 0 1 0 1.06-1.06l-3.25-3.25Z"
        />
        <path
          className={cn('transition-colors duration-150 ease-out', order === -1 ? 'text-text' : 'text-text-muted')}
          d="m6.22 13.28 3.25 3.25a.75.75 0 0 0 1.06 0l3.25-3.25a.75.75 0 1 0-1.06-1.06L10 14.94l-2.72-2.72a.75.75 0 0 0-1.06 1.06Z"
        />
      </svg>
      {position ? (
        <span className="absolute -right-2 -top-1 grid size-3.5 place-items-center rounded-full bg-accent text-[9px] font-medium text-accent-fg">
          {position}
        </span>
      ) : null}
    </span>
  );
}

function initialFilterValue<T>(def: DataTableFilterDef<T>): unknown {
  switch (def.type) {
    case 'multi':
      return [];
    case 'boolean':
      return null;
    case 'numberRange':
      return undefined;
    default:
      return '';
  }
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  onRowClick,
  empty,
  emptyTitle = 'No rows',
  emptyDescription,
  sortField,
  sortOrder,
  removableSort = false,
  sortMode = 'single',
  onSortChange,
  search,
  filters,
  filterMode = 'client',
  defaultQuery,
  onQueryChange,
  searchDebounce,
  selectable = false,
  selectionMode = 'multiple',
  metaKeySelection = true,
  selectedKeys,
  onSelectedKeysChange,
  isRowSelectable,
  groupBy,
  groupSelection,
  renderGroupHeader,
  bulkActions,
  renderBulkToolbar,
  formatSelectionCount,
  maxInlineBulkActions = 2,
  stickyColumns,
  stickyFirstColumn = false,
  resizable = false,
  columnDividers = false,
  stripedRows = false,
  size,
  isLoading = false,
  skeletonRows = 8,
  virtualized = false,
  rowHeight = 41,
  maxHeight,
  paginator = false,
  rowsPerPage = 10,
  page,
  onPageChange,
  className,
}: DataTableProps<T>) {
  const [sortState, setSortState] = useState<DataTableSort[]>(() =>
    sortField && sortOrder ? [{ field: sortField, order: sortOrder }] : [],
  );
  const [searchText, setSearchText] = useState(defaultQuery?.search ?? '');
  const [conditions, setConditions] = useState<DataTableFilterCondition[]>(defaultQuery?.filters ?? []);
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const [colWidths, setColWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(columns.filter((c) => c.width != null).map((c) => [c.key, c.width as number])),
  );
  const [scrollTop, setScrollTop] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [anchorIndex, setAnchorIndex] = useState<number | null>(null);
  const [pinnedLefts, setPinnedLefts] = useState<Record<string, number>>({});
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<DataTableBulkAction<T> | null>(null);
  const drag = useRef<{ key: string; startX: number; startW: number } | null>(null);
  const headRefs = useRef(new Map<string, HTMLTableCellElement | null>());
  const rowRefs = useRef(new Map<number, HTMLTableRowElement | null>());
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  const isControlled = selectedKeys !== undefined;
  const selected = selectedKeys ?? internalSelected;
  const setSelected = (keys: string[]) => {
    if (!isControlled) setInternalSelected(keys);
    onSelectedKeysChange?.(keys);
  };

  const selectableRow = (row: T) => (isRowSelectable ? isRowSelectable(row) : true);

  const pinnedCount = Math.max(0, Math.min(stickyColumns ?? (stickyFirstColumn ? 1 : 0), columns.length));
  const pinSelection = selectable && pinnedCount > 0;
  const pinnedKeys = useMemo(() => columns.slice(0, pinnedCount).map((c) => c.key), [columns, pinnedCount]);

  const filteredData = useMemo(() => {
    if (filterMode === 'server') return data;
    const q = searchText.trim().toLowerCase();
    return data.filter((row) => {
      if (q && search && !search.accessor(row).toLowerCase().includes(q)) return false;
      for (const condition of conditions) {
        const def = filters?.find((f) => f.field === condition.field);
        if (!def || !isValidValue(def, condition.value)) continue;
        if (def.predicate && !def.predicate(row, condition.value)) return false;
      }
      return true;
    });
  }, [data, filterMode, searchText, conditions, filters, search]);

  const rows = useMemo(() => {
    if (!sortState.length) return filteredData;
    const accessors = sortState.map((s) => columns.find((c) => c.key === s.field)?.sortAccessor);
    return [...filteredData].sort((a, b) => {
      for (let i = 0; i < sortState.length; i += 1) {
        const accessor = accessors[i];
        const order = sortState[i]!.order;
        if (!accessor) continue;
        const va = accessor(a);
        const vb = accessor(b);
        const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
        if (cmp !== 0) return order === 1 ? cmp : -cmp;
      }
      return 0;
    });
  }, [filteredData, columns, sortState]);

  const [internalPage, setInternalPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const currentPage = Math.min(Math.max(page ?? internalPage, 1), pageCount);
  const setPage = (next: number) => {
    if (page === undefined) setInternalPage(next);
    onPageChange?.(next);
  };
  const view = paginator ? rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage) : rows;

  // Grouping: reorder so each group is contiguous (groups in first-seen order,
  // optionally weighted by `order`), and record where each subheader goes.
  const { orderedRows, groupStarts } = useMemo(() => {
    if (!groupBy) return { orderedRows: view, groupStarts: new Map<number, DataTableGroup<T>>() };
    const map = new Map<string, DataTableGroup<T>>();
    const seen: string[] = [];
    for (const row of view) {
      const g = groupBy(row);
      if (!map.has(g.key)) {
        map.set(g.key, { ...g, rows: [] });
        seen.push(g.key);
      }
      map.get(g.key)!.rows!.push(row);
    }
    const ordered = seen
      .map((key) => map.get(key)!)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const flat: T[] = [];
    const starts = new Map<number, DataTableGroup<T>>();
    for (const group of ordered) {
      starts.set(flat.length, group);
      flat.push(...group.rows!);
    }
    return { orderedRows: flat, groupStarts: starts };
  }, [view, groupBy]);

  const cycleHeader = (key: string, additive: boolean) =>
    setSortState((prev) => {
      const next = [...prev];
      const index = next.findIndex((s) => s.field === key);
      const current = index >= 0 ? next[index]! : undefined;
      const order: DataTableSortOrder | 0 = !current ? 1 : current.order === 1 ? -1 : removableSort ? 0 : 1;
      let result: DataTableSort[];
      if (additive) {
        if (order === 0) result = next.filter((s) => s.field !== key);
        else if (current) result = next.map((s) => (s.field === key ? { field: key, order } : s));
        else result = [...next, { field: key, order }];
      } else {
        result = order === 0 ? [] : [{ field: key, order }];
      }
      onSortChange?.(result);
      return result;
    });

  const sortOrderOf = (key: string) => sortState.find((s) => s.field === key)?.order;
  const sortPositionOf = (key: string) =>
    sortMode === 'multiple' && sortState.length > 1
      ? sortState.findIndex((s) => s.field === key) + 1 || undefined
      : undefined;

  const uniq = (keys: string[]) => Array.from(new Set(keys));
  const toggleRow = (id: string) =>
    setSelected(selected.includes(id) ? selected.filter((k) => k !== id) : [...selected, id]);
  const selectOnly = (id: string) => setSelected([id]);
  const selectRange = (a: number, b: number) => {
    const [lo, hi] = a < b ? [a, b] : [b, a];
    setSelected(orderedRows.slice(lo, hi + 1).filter(selectableRow).map(getRowId));
  };
  const removeRows = (ids: string[]) => selected.filter((k) => !ids.includes(k));

  const widthOf = (key: string, fallback?: number) => colWidths[key] ?? fallback;
  const fixed = resizable || columns.some((c) => c.width != null);
  const columnCount = columns.length + (selectable ? 1 : 0);
  const pad = size ? PAD[size] : undefined;
  const headerH = size ? HEAD_HEIGHT[size] : HEAD_HEIGHT_DEFAULT;

  useIsomorphicLayoutEffect(() => {
    const lefts: Record<string, number> = {};
    let start = pinSelection ? SELECT_WIDTH : 0;
    if (pinSelection) lefts.__select = 0;
    for (const key of pinnedKeys) {
      lefts[key] = start;
      start += headRefs.current.get(key)?.offsetWidth ?? widthOf(key) ?? 160;
    }
    setPinnedLefts(lefts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinnedKeys.join(','), pinSelection, colWidths, data.length, size]);

  const divCls = columnDividers ? 'border-r border-border last:border-r-0' : '';
  const lastColKey = columns[columns.length - 1]?.key;

  const virtual = virtualized && !isLoading && !groupBy && orderedRows.length > 0;
  const viewport = parsePx(maxHeight) || 400;
  const start = virtual ? Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN) : 0;
  const end = virtual
    ? Math.min(orderedRows.length, Math.ceil((scrollTop + viewport) / rowHeight) + OVERSCAN)
    : orderedRows.length;
  const visibleRows = orderedRows.slice(start, end);
  const padTop = virtual ? start * rowHeight : 0;
  const padBottom = virtual ? (orderedRows.length - end) * rowHeight : 0;

  const selectableIds = data.filter(selectableRow).map(getRowId);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.includes(id));
  const someSelected = !allSelected && selectableIds.some((id) => selected.includes(id));

  const selectedRows = useMemo(
    () => data.filter((row) => selected.includes(getRowId(row))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, selected],
  );

  const bulkEnabled = selectable && (bulkActions?.length || renderBulkToolbar);
  const bulkActive = Boolean(bulkEnabled && selected.length > 0);
  const visibleBulkActions = (bulkActions ?? []).filter((a) => !a.hidden);
  const inlineActions = visibleBulkActions.slice(0, maxInlineBulkActions);
  const overflowActions = visibleBulkActions.slice(maxInlineBulkActions);

  // If the header had focus when it collapses into the toolbar, move focus to
  // the toolbar so focus isn't stranded on a hidden control.
  useEffect(() => {
    if (!bulkActive) return;
    const active = document.activeElement as HTMLElement | null;
    if (active && active.closest('thead')) toolbarRef.current?.focus();
  }, [bulkActive]);

  const ensureVisible = (absIndex: number) => {
    if (!virtual) return;
    const top = absIndex * rowHeight;
    const bottom = top + rowHeight;
    if (top < scrollTop) setScrollTop(top);
    else if (bottom > scrollTop + viewport) setScrollTop(bottom - viewport);
  };

  const focusRowAt = (absIndex: number) => {
    const clamped = Math.max(0, Math.min(orderedRows.length - 1, absIndex));
    setFocusedIndex(clamped);
    ensureVisible(clamped);
    window.requestAnimationFrame(() => rowRefs.current.get(clamped)?.focus());
    return clamped;
  };

  const applySelection = (absIndex: number, meta: boolean) => {
    const id = getRowId(orderedRows[absIndex]!);
    setAnchorIndex(absIndex);
    if (selectionMode === 'single') {
      selectOnly(id);
      return;
    }
    if (metaKeySelection) {
      if (meta) toggleRow(id);
      else selectOnly(id);
    } else {
      toggleRow(id);
    }
  };

  const onRowKeyDown = (event: ReactKeyboardEvent<HTMLTableRowElement>, absIndex: number) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = focusRowAt(absIndex + (event.key === 'ArrowDown' ? 1 : -1));
      if (event.shiftKey && selectable && anchorIndex != null) selectRange(anchorIndex, next);
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      if (selectable) {
        event.preventDefault();
        applySelection(absIndex, event.metaKey || event.ctrlKey);
      } else if (onRowClick) {
        event.preventDefault();
        onRowClick(orderedRows[absIndex]!);
      }
    }
  };

  const runBulk = async (key: string, fn: (ids: string[], rows: T[]) => void | Promise<void>) => {
    if (runningAction) return;
    setRunningAction(key);
    try {
      await fn(selected, selectedRows);
      // Clear only after success, and only when uncontrolled.
      if (!isControlled) setInternalSelected([]);
    } catch {
      // Preserve the selection so the user can retry.
    } finally {
      setRunningAction(null);
    }
  };

  const runAction = (action: DataTableBulkAction<T>) => {
    if (!action.onAction) return;
    if (action.confirm) setPendingConfirm(action);
    else void runBulk(action.key, action.onAction);
  };

  const onHandleDown = (event: ReactPointerEvent<HTMLSpanElement>, key: string) => {
    const th = event.currentTarget.closest('th') as HTMLElement | null;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    drag.current = { key, startX: event.clientX, startW: th?.offsetWidth ?? 160 };
    event.preventDefault();
  };
  const onHandleMove = (event: ReactPointerEvent<HTMLSpanElement>, key: string) => {
    if (!drag.current || drag.current.key !== key) return;
    const column = columns.find((c) => c.key === key);
    const min = column?.minWidth ?? 72;
    const max = column?.maxWidth ?? 800;
    const next = Math.max(min, Math.min(max, drag.current.startW + (event.clientX - drag.current.startX)));
    setColWidths((w) => ({ ...w, [key]: next }));
  };
  const onHandleUp = () => {
    drag.current = null;
  };

  const container = cn('relative overflow-hidden rounded-lg border border-border bg-surface-raised', className);
  const scrollStyle = maxHeight !== undefined ? { maxHeight } : undefined;
  const rowStripe = (absIndex: number) => (stripedRows && absIndex % 2 === 1 ? 'bg-surface-sunken/40' : undefined);

  useEffect(() => {
    onQueryChange?.({ search: searchText, filters: conditions, sort: sortState });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, conditions, sortState]);

  const sortFields = columns
    .filter((c) => c.sortable && c.sortAccessor)
    .map((c) => ({ key: c.key, header: c.header, sortType: c.sortType }));
  const toolbar =
    search || (filters && filters.length > 0) ? (
      <DataTableToolbar
        filters={filters ?? []}
        conditions={conditions}
        searchValue={searchText}
        searchConfig={search}
        searchDebounce={searchDebounce ?? (filterMode === 'server' ? 350 : 0)}
        sortFields={sortFields}
        sortField={sortState[0]?.field}
        sortOrder={sortState[0]?.order}
        onSearch={setSearchText}
        onSort={(field, order) => setSortState([{ field, order }])}
        onAddCondition={(def, id) =>
          setConditions((prev) => [...prev, { id, field: def.field, value: initialFilterValue(def) }])
        }
        onUpdateCondition={(id, value) =>
          setConditions((prev) => prev.map((c) => (c.id === id ? { ...c, value } : c)))
        }
        onRemoveCondition={(id) => setConditions((prev) => prev.filter((c) => c.id !== id))}
        onClearAll={() => setConditions([])}
      />
    ) : null;

  const headerCheckbox = (
    <Checkbox
      aria-label="Select all rows"
      checked={allSelected ? true : someSelected ? 'indeterminate' : false}
      onCheckedChange={(value) => setSelected(value ? selectableIds : [])}
      tabIndex={bulkActive ? -1 : undefined}
    />
  );

  const renderHeaderCells = () => (
    <TableHeader
      aria-hidden={bulkActive || undefined}
      className={cn(bulkActive && '[&_[data-dt-head]]:pointer-events-none [&_[data-dt-head]]:opacity-0 [&_[data-dt-head]]:blur-[2px] [&_[data-dt-head]]:-translate-y-0.5')}
    >
      <TableRow className="hover:bg-transparent">
        {selectable && (
          <TableHead
            className={cn('w-10 pl-4 pr-0', divCls, pinSelection && 'sticky z-30')}
            style={pinSelection ? { left: 0 } : undefined}
          >
            <span data-dt-head className={cn('flex items-center', swapTransition)}>
              {headerCheckbox}
            </span>
          </TableHead>
        )}
        {columns.map((column) => {
          const order = sortOrderOf(column.key);
          const sortableCol = column.sortable && column.sortAccessor;
          const align = column.align ?? 'left';
          const pinned = pinnedKeys.includes(column.key);
          return (
            <TableHead
              key={column.key}
              ref={(node) => {
                if (pinned) headRefs.current.set(column.key, node);
              }}
              aria-sort={order ? (order === 1 ? 'ascending' : 'descending') : undefined}
              style={pinned ? { left: pinnedLefts[column.key] } : undefined}
              className={cn('relative', alignHead[align], divCls, pad?.head, pinned && 'sticky z-30', column.className)}
            >
              <span data-dt-head className={cn('block', swapTransition)}>
                {sortableCol ? (
                  <button
                    type="button"
                    tabIndex={bulkActive ? -1 : undefined}
                    onClick={(event) => cycleHeader(column.key, sortMode === 'multiple' && (event.metaKey || event.ctrlKey))}
                    className={cn(
                      'group/sort -mx-1.5 inline-flex w-[calc(100%+0.75rem)] items-center gap-1 rounded-sm px-1.5 py-0.5 text-[12px] font-medium text-text-secondary transition-colors duration-150 ease-out hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                      alignJustify[align],
                    )}
                  >
                    <span className="truncate">{column.header}</span>
                    <SortIndicator order={order} position={sortPositionOf(column.key)} />
                  </button>
                ) : (
                  <span className="block truncate">{column.header}</span>
                )}
              </span>
              {resizable && column.key !== lastColKey && (
                <span
                  role="separator"
                  aria-orientation="vertical"
                  aria-label={`Resize ${typeof column.header === 'string' ? column.header : column.key}`}
                  onPointerDown={(e) => onHandleDown(e, column.key)}
                  onPointerMove={(e) => onHandleMove(e, column.key)}
                  onPointerUp={onHandleUp}
                  className={cn(
                    'absolute right-0 top-0 z-10 h-full w-1.5 cursor-col-resize touch-none select-none bg-transparent hover:bg-accent/40',
                    bulkActive && 'pointer-events-none opacity-0',
                  )}
                />
              )}
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );

  const countNode = (
    <span className="inline-flex items-baseline text-[13px] font-medium text-text">
      <TextSwap value={String(selected.length)} className="inline-block min-w-[2ch] tabular-nums">
        {selected.length}
      </TextSwap>
      <span className="ml-1 text-text-secondary">&nbsp;selected</span>
    </span>
  );

  const bulkToolbar =
    bulkActive &&
    (renderBulkToolbar ? (
      renderBulkToolbar({
        selectedIds: selected,
        selectedRows,
        allSelected,
        someSelected,
        clear: () => setSelected([]),
      })
    ) : (
      <div
        ref={toolbarRef}
        tabIndex={-1}
        role="toolbar"
        aria-label="Bulk actions"
        className={cn(
          'sticky left-0 top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-surface px-4 outline-none',
          swapTransition,
        )}
        style={{ height: headerH, marginBottom: -headerH }}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span data-dt-head className={cn('flex items-center', swapTransition)}>
            {headerCheckbox}
          </span>
          {formatSelectionCount ? (
            formatSelectionCount(selected.length)
          ) : (
            <span className="min-w-0 truncate">{countNode}</span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {inlineActions.map((action) =>
            action.items && action.items.length > 0 ? (
              <BulkMenuAction key={action.key} action={action} running={runningAction} onRun={runBulk} />
            ) : (
              <Button
                key={action.key}
                size="xs"
                variant={action.variant ?? (action.destructive ? 'danger' : 'secondary')}
                startIcon={action.icon}
                disabled={action.disabled || runningAction !== null}
                loading={runningAction === action.key}
                onClick={() => runAction(action)}
              >
                {action.label}
              </Button>
            ),
          )}

          {overflowActions.length > 0 && (
            <BulkOverflow actions={overflowActions} disabled={runningAction !== null} onSelect={runAction} />
          )}
        </div>
      </div>
    ));

  if (!isLoading && data.length === 0) {
    return (
      <div className={container}>
        {toolbar}
        {empty ?? <EmptyState size="sm" title={emptyTitle} description={emptyDescription} />}
      </div>
    );
  }

  const groupSelectionOn = groupSelection ?? selectable;

  return (
    <div className={container}>
      {toolbar}
      <div
        className="overflow-auto overscroll-x-contain"
        style={scrollStyle}
        onScroll={(e) => virtual && setScrollTop(e.currentTarget.scrollTop)}
      >
        {bulkToolbar}

        <Table className={cn(fixed && 'table-fixed')} aria-multiselectable={selectable && selectionMode === 'multiple'}>
          <colgroup>
            {selectable && <col style={{ width: SELECT_WIDTH }} />}
            {columns.map((c) => (
              <col
                key={c.key}
                style={widthOf(c.key, c.width) != null ? { width: widthOf(c.key, c.width) } : undefined}
              />
            ))}
          </colgroup>

          {renderHeaderCells()}

          <TableBody>
            {isLoading &&
              Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="hover:bg-transparent" style={virtual ? { height: rowHeight } : undefined}>
                  {selectable && (
                    <TableCell className={cn('w-10 pl-4 pr-0', divCls, pad?.cell)}>
                      <Skeleton className="size-4 rounded-[4px]" />
                    </TableCell>
                  )}
                  {columns.map((c) => (
                    <TableCell key={c.key} className={cn(divCls, pad?.cell, c.className)}>
                      <Skeleton className="h-3.5 w-3/4" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {virtual && padTop > 0 && (
              <tr aria-hidden="true">
                <td colSpan={columnCount} className="p-0" style={{ height: padTop }} />
              </tr>
            )}

            {!isLoading &&
              visibleRows.map((row, i) => {
                const absIndex = start + i;
                const id = getRowId(row);
                const isSelected = selected.includes(id);
                const interactive = selectable || onRowClick;
                const group = groupStarts.get(absIndex);
                const groupRows = group?.rows ?? [];
                const groupIds = groupRows.filter(selectableRow).map(getRowId);
                const rowSelectable = selectableRow(row);
                return (
                  <Fragment key={id}>
                    {group && (
                      <GroupRow
                        group={group}
                        columnCount={columnCount}
                        showCheckbox={selectable && groupSelectionOn}
                        selected={selected}
                        ids={groupIds}
                        onChange={(checked) =>
                          setSelected(checked ? uniq([...selected, ...groupIds]) : removeRows(groupIds))
                        }
                        render={renderGroupHeader}
                      />
                    )}
                    <TableRow
                      data-selected={isSelected ? '' : undefined}
                      ref={(node) => {
                        rowRefs.current.set(absIndex, node);
                      }}
                      tabIndex={interactive ? (focusedIndex === absIndex || (focusedIndex == null && absIndex === 0) ? 0 : -1) : undefined}
                      aria-selected={selectable ? isSelected : undefined}
                      onFocus={() => setFocusedIndex(absIndex)}
                      onKeyDown={(event) => onRowKeyDown(event, absIndex)}
                      onClick={
                        selectable
                          ? (event) => applySelection(absIndex, event.metaKey || event.ctrlKey)
                          : onRowClick
                            ? () => onRowClick(row)
                            : undefined
                      }
                      style={virtual ? { height: rowHeight } : undefined}
                      className={cn(
                        interactive && 'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring',
                        rowStripe(absIndex),
                      )}
                    >
                      {selectable && (
                        <TableCell
                          className={cn(
                            'w-10 pl-4 pr-0',
                            divCls,
                            pad?.cell,
                            pinSelection &&
                              'sticky z-20 bg-surface-raised group-hover:bg-surface-sunken group-data-[selected]:bg-accent-soft',
                          )}
                          style={pinSelection ? { left: 0 } : undefined}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Checkbox
                            aria-label={`Select row ${id}`}
                            checked={isSelected}
                            disabled={!rowSelectable}
                            onCheckedChange={(value) =>
                              setSelected(value ? uniq([...selected, id]) : selected.filter((k) => k !== id))
                            }
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => {
                        const pinned = pinnedKeys.includes(column.key);
                        return (
                          <TableCell
                            key={column.key}
                            style={pinned ? { left: pinnedLefts[column.key] } : undefined}
                            className={cn(
                              alignCell[column.align ?? 'left'],
                              divCls,
                              pad?.cell,
                              virtual && 'py-0',
                              pinned &&
                                'sticky z-20 bg-surface-raised group-hover:bg-surface-sunken group-data-[selected]:bg-accent-soft',
                              column.className,
                            )}
                          >
                            <div className={cn('min-w-0', (column.truncate ?? true) && 'truncate')}>{column.cell(row)}</div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </Fragment>
                );
              })}

            {virtual && padBottom > 0 && (
              <tr aria-hidden="true">
                <td colSpan={columnCount} className="p-0" style={{ height: padBottom }} />
              </tr>
            )}
          </TableBody>
        </Table>
      </div>

      {paginator && (
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5">
          <span className="text-[12px] text-text-muted">
            {rows.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}–
            {Math.min(currentPage * rowsPerPage, rows.length)} of {rows.length}
          </span>
          <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
        </div>
      )}

      {pendingConfirm && (
        <ConfirmDialog
          action={pendingConfirm}
          count={selected.length}
          onCancel={() => setPendingConfirm(null)}
          onConfirm={() => {
            const action = pendingConfirm;
            setPendingConfirm(null);
            void runAction(action);
          }}
        />
      )}
    </div>
  );
}

/* ── Group subheader ───────────────────────────────────────────────────── */

function GroupRow<T>({
  group,
  columnCount,
  showCheckbox,
  selected,
  ids,
  onChange,
  render,
}: {
  group: DataTableGroup<T>;
  columnCount: number;
  showCheckbox: boolean;
  selected: string[];
  ids: string[];
  onChange: (checked: boolean) => void;
  render?: (group: DataTableGroup<T>, rows: T[]) => ReactNode;
}) {
  const all = ids.length > 0 && ids.every((id) => selected.includes(id));
  const some = !all && ids.some((id) => selected.includes(id));
  const labelText = typeof group.label === 'string' ? group.label : group.key;
  return (
    <TableRow className="c-dt-group-row hover:bg-transparent">
      <TableCell colSpan={columnCount} className="border-y border-border bg-surface-sunken px-4 py-1.5">
        <div className="flex items-center gap-2.5">
          {showCheckbox && (
            <Checkbox
              aria-label={`Select all rows in ${labelText}`}
              checked={all ? true : some ? 'indeterminate' : false}
              onCheckedChange={(value) => onChange(Boolean(value))}
            />
          )}
          <span className="text-[12px] font-medium text-text-secondary">
            {render ? render(group, group.rows ?? []) : (group.label ?? group.key)}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}

/* ── Dropdown bulk action ──────────────────────────────────────────────── */

function BulkMenuAction<T>({
  action,
  running,
  onRun,
}: {
  action: DataTableBulkAction<T>;
  running: string | null;
  onRun: (key: string, fn: (ids: string[], rows: T[]) => void | Promise<void>) => void;
}) {
  const items = action.items ?? [];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="xs"
          variant={action.variant ?? 'secondary'}
          startIcon={action.icon}
          endIcon={<ChevronDownIcon className="size-3.5 opacity-70" />}
          disabled={action.disabled || running !== null}
        >
          {action.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.key}
            disabled={item.disabled || running !== null}
            onSelect={() => onRun(`${action.key}:${item.key}`, item.onSelect)}
            className={cn(item.destructive && 'text-danger')}
          >
            {item.icon}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ── Overflow menu for extra bulk actions ──────────────────────────────── */

function BulkOverflow<T>({
  actions,
  disabled,
  onSelect,
}: {
  actions: DataTableBulkAction<T>[];
  disabled: boolean;
  onSelect: (action: DataTableBulkAction<T>) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon-xs" variant="secondary" aria-label="More actions" disabled={disabled}>
          <EllipsisHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.key}
            disabled={action.disabled || disabled}
            onSelect={() => onSelect(action)}
            className={cn(action.destructive && 'text-danger')}
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ── Confirmation (reuses the DS Dialog) ───────────────────────────────── */

function ConfirmDialog<T>({
  action,
  count,
  onCancel,
  onConfirm,
}: {
  action: DataTableBulkAction<T>;
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const confirm = typeof action.confirm === 'object' ? action.confirm : undefined;
  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{confirm?.title ?? 'Are you sure?'}</DialogTitle>
          {confirm?.description && <DialogDescription>{confirm.description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" onClick={onCancel}>
              {confirm?.cancelLabel ?? 'Cancel'}
            </Button>
          </DialogClose>
          <Button variant={action.destructive ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirm?.confirmLabel ?? action.label ?? 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
