import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Badge } from '../Badge';
import { DataTable, type DataTableColumn } from './DataTable';

interface Transfer {
  id: string;
  to: string;
  amount: number;
  status: 'Held' | 'Completed' | 'Failed';
  date: string;
}

const transfers: Transfer[] = [
  { id: 'TR-4821', to: '@ada', amount: 250000, status: 'Held', date: '2026-10-12' },
  { id: 'TR-4820', to: '@grace', amount: 1200000, status: 'Completed', date: '2026-10-11' },
  { id: 'TR-4819', to: '@alan', amount: 18500, status: 'Failed', date: '2026-10-09' },
  { id: 'TR-4818', to: '@katherine', amount: 75000, status: 'Completed', date: '2026-10-09' },
];

const tone = { Held: 'warning', Completed: 'success', Failed: 'danger' } as const;
const ngn = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

const columns: DataTableColumn<Transfer>[] = [
  {
    key: 'id',
    header: 'Reference',
    cell: (t) => <span className="font-medium">{t.id}</span>,
    sortable: true,
    sortType: 'text',
    sortAccessor: (t) => t.id,
  },
  {
    key: 'to',
    header: 'Recipient',
    cell: (t) => <span className="text-text-secondary">{t.to}</span>,
  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    cell: (t) => <span className="tnum">{ngn.format(t.amount)}</span>,
    sortable: true,
    sortType: 'number',
    sortAccessor: (t) => t.amount,
  },
  {
    key: 'date',
    header: 'Date',
    align: 'right',
    cell: (t) => <span className="text-text-muted">{t.date}</span>,
    sortable: true,
    sortType: 'date',
    sortAccessor: (t) => t.date,
  },
  {
    key: 'status',
    header: 'Status',
    align: 'right',
    cell: (t) => <Badge variant={tone[t.status]}>{t.status}</Badge>,
  },
];

const meta = {
  title: 'Data/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  args: { columns, data: transfers, getRowId: (t: Transfer) => t.id },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable<Transfer>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[680px]">
      <DataTable
        columns={columns}
        data={transfers}
        getRowId={(t) => t.id}
        onRowClick={() => {}}
        sortField="amount" sortOrder={-1}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="w-[680px]">
      <DataTable
        columns={columns}
        data={[]}
        getRowId={(t) => t.id}
        emptyTitle="No transfers"
        emptyDescription="Transfers you send or receive will appear here."
      />
    </div>
  ),
};

export const NotSortable: Story = {
  name: 'Not sortable',
  render: () => (
    <div className="w-[680px]">
      <DataTable columns={columns} data={transfers} getRowId={(t) => t.id} />
    </div>
  ),
};

export const Selectable: Story = {
  name: 'Row selection',
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <div className="w-[680px]">
        <DataTable
          columns={columns}
          data={transfers}
          getRowId={(t) => t.id}
          selectable
          selectedKeys={selected}
          onSelectedKeysChange={setSelected}
          sortField="date" sortOrder={-1}
        />
        <p className="mt-2 text-[12px] text-text-muted">{selected.length} selected</p>
      </div>
    );
  },
};

export const StickyHeader: Story = {
  name: 'Sticky header',
  render: () => {
    const statuses = ['Held', 'Completed', 'Failed'] as const;
    const many = Array.from({ length: 40 }, (_, i) => ({
      id: `TR-${5000 - i}`,
      to: `@user${i}`,
      amount: (i + 1) * 1000,
      status: statuses[i % 3]!,
      date: `2026-10-${String((i % 28) + 1).padStart(2, '0')}`,
    }));
    return (
      <div className="w-[680px]">
        <DataTable
          columns={columns}
          data={many}
          getRowId={(t) => t.id}
          maxHeight={280}
          sortField="id" sortOrder={1}
        />
      </div>
    );
  },
};

const statuses = ['Held', 'Completed', 'Failed'] as const;
const bigData: Transfer[] = Array.from({ length: 5000 }, (_, i) => ({
  id: `TR-${i + 1}`,
  to: `@user${i}`,
  amount: (i + 1) * 137,
  status: statuses[i % 3]!,
  date: `2026-10-${String((i % 28) + 1).padStart(2, '0')}`,
}));

export const Loading: Story = {
  name: 'Loading (skeleton)',
  render: () => (
    <div className="w-[680px]">
      <DataTable columns={columns} data={[]} getRowId={(t) => t.id} isLoading skeletonRows={6} />
    </div>
  ),
};

export const Virtualized: Story = {
  name: 'Virtualized (5000 rows)',
  render: () => (
    <div className="w-[680px]">
      <DataTable
        columns={columns}
        data={bigData}
        getRowId={(t) => t.id}
        virtualized
        rowHeight={41}
        maxHeight={360}
        sortField="id" sortOrder={1}
      />
    </div>
  ),
};

export const StickyColumn: Story = {
  name: 'Sticky column',
  render: () => (
    <div className="w-[520px]">
      <DataTable columns={columns} data={transfers} getRowId={(t) => t.id} stickyFirstColumn maxHeight={320} />
    </div>
  ),
};

export const Resizable: Story = {
  name: 'Resizable + dividers',
  render: () => (
    <div className="w-[720px]">
      <DataTable
        columns={[
          { ...columns[0]!, width: 140 },
          { ...columns[1]!, width: 160 },
          columns[2]!,
          { ...columns[3]!, width: 130 },
          columns[4]!,
        ]}
        data={transfers}
        getRowId={(t) => t.id}
        resizable
        columnDividers
        sortField="id"
        sortOrder={1}
      />
    </div>
  ),
};

export const MultiSort: Story = {
  name: 'Multi-column sort',
  render: () => (
    <div className="w-[680px]">
      <DataTable
        columns={columns}
        data={transfers}
        getRowId={(t) => t.id}
        sortMode="multiple"
        removableSort
        sortField="status"
        sortOrder={1}
      />
    </div>
  ),
};

export const RemovableSort: Story = {
  name: 'Removable sort',
  render: () => (
    <div className="w-[680px]">
      <DataTable
        columns={columns}
        data={transfers}
        getRowId={(t) => t.id}
        removableSort
        sortField="amount"
        sortOrder={-1}
      />
    </div>
  ),
};

export const Striped: Story = {
  name: 'Striped rows',
  render: () => (
    <div className="w-[680px]">
      <DataTable columns={columns} data={transfers} getRowId={(t) => t.id} stripedRows />
    </div>
  ),
};

export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div className="flex flex-col gap-6">
      {(['small', 'medium', 'large'] as const).map((s) => (
        <div key={s} className="w-[680px]">
          <p className="mb-2 text-[12px] uppercase tracking-[0.04em] text-text-muted">{s}</p>
          <DataTable columns={columns} data={transfers.slice(0, 3)} getRowId={(t) => t.id} size={s} />
        </div>
      ))}
      <div className="w-[680px]">
        <p className="mb-2 text-[12px] uppercase tracking-[0.04em] text-text-muted">default</p>
        <DataTable columns={columns} data={transfers.slice(0, 3)} getRowId={(t) => t.id} />
      </div>
    </div>
  ),
};

export const MultipleStickyColumns: Story = {
  name: 'Multiple sticky columns',
  render: () => (
    <div className="w-[420px]">
      <DataTable columns={columns} data={transfers} getRowId={(t) => t.id} stickyColumns={2} maxHeight={320} />
    </div>
  ),
};

export const KeyboardSelection: Story = {
  name: 'Keyboard selection',
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <div className="w-[680px]">
        <DataTable
          columns={columns}
          data={transfers}
          getRowId={(t) => t.id}
          selectable
          selectionMode="multiple"
          metaKeySelection
          selectedKeys={selected}
          onSelectedKeysChange={setSelected}
          maxHeight={320}
        />
        <p className="mt-2 text-[12px] text-text-muted">
          {selected.length} selected · ↑/↓ move focus · Space toggles · Shift+↑/↓ extends
        </p>
      </div>
    );
  },
};
export const Paginated: Story = {
  name: 'Paginated',
  render: () => (
    <div className="w-[680px]">
      <DataTable columns={columns} data={bigData.slice(0, 47)} getRowId={(t) => t.id} paginator rowsPerPage={10} />
    </div>
  ),
};

/* ── Grouping + contextual bulk actions (References A & C) ─────────────── */

interface Customer {
  id: string;
  name: string;
  location: string;
  orders: number;
  spent: number;
  lastOrder: string;
}

const customers: Customer[] = [
  { id: '1', name: 'Mae Jemison', location: 'Decatur, USA', orders: 11, spent: 2400, lastOrder: 'May 31, 2023' },
  { id: '2', name: 'Ellen Ochoa', location: 'Los Angeles, USA', orders: 30, spent: 975, lastOrder: 'May 31, 2023' },
  { id: '3', name: 'Colm Dillane', location: 'New York, USA', orders: 27, spent: 2885, lastOrder: 'May 31, 2023' },
  { id: '4', name: 'Al Chemist', location: 'New York, USA', orders: 19, spent: 1209, lastOrder: 'April 4, 2023' },
  { id: '5', name: 'Larry June', location: 'San Francisco, USA', orders: 22, spent: 1400, lastOrder: 'March 19, 2023' },
];

const customerColumns: DataTableColumn<Customer>[] = [
  {
    key: 'name',
    header: 'Name',
    width: 200,
    sortable: true,
    sortType: 'text',
    sortAccessor: (c) => c.name,
    cell: (c) => <span className="font-medium">{c.name}</span>,
  },
  { key: 'location', header: 'Location', cell: (c) => <span className="text-text-secondary">{c.location}</span> },
  {
    key: 'orders',
    header: 'Order count',
    align: 'right',
    sortable: true,
    sortType: 'number',
    sortAccessor: (c) => c.orders,
    cell: (c) => c.orders,
  },
  {
    key: 'spent',
    header: 'Amount spent',
    align: 'right',
    sortable: true,
    sortType: 'number',
    sortAccessor: (c) => c.spent,
    cell: (c) => ngn.format(c.spent),
  },
];

const bulkActions = [
  { key: 'edit', label: 'Edit customers', onAction: async () => {} },
  {
    key: 'assign',
    label: 'Assign',
    items: [
      { key: 'me', label: 'Assign to me', onSelect: async () => {} },
      { key: 'team', label: 'Assign to team', onSelect: async () => {} },
      { key: 'queue', label: 'Add to review queue', onSelect: async () => {} },
    ],
  },
  {
    key: 'delete',
    label: 'Delete customers',
    destructive: true,
    confirm: { title: 'Delete selected customers?', description: 'This cannot be undone.' },
    onAction: async () => {},
  },
  { key: 'export', label: 'Export', onAction: async () => {} },
];

export const Grouped: Story = {
  name: 'Grouped',
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <div className="w-[760px]">
        <DataTable
          columns={customerColumns}
          data={customers}
          getRowId={(c) => c.id}
          selectable
          selectedKeys={selected}
          onSelectedKeysChange={setSelected}
          groupBy={(c) => ({ key: c.lastOrder, label: `Last order placed: ${c.lastOrder}` })}
          bulkActions={bulkActions}
          sortField="name" sortOrder={1}
        />
      </div>
    );
  },
};

export const BulkActions: Story = {
  name: 'Bulk actions',
  render: () => {
    const [selected, setSelected] = useState<string[]>(['1', '3']);
    return (
      <div className="flex flex-col gap-3">
        <div className="w-[760px]">
          <DataTable
            columns={customerColumns}
            data={customers}
            getRowId={(c) => c.id}
            selectable
            selectedKeys={selected}
            onSelectedKeysChange={setSelected}
            bulkActions={bulkActions}
          />
        </div>
        <p className="text-[12px] text-text-muted">{selected.length} selected — the header became a bulk toolbar.</p>
      </div>
    );
  },
};

const locations = Array.from(new Set(customers.map((c) => c.location))).map((l) => ({ value: l, label: l }));

export const SearchAndFilters: Story = {
  name: 'Search + filters',
  render: () => (
    <div className="w-[880px]">
      <DataTable
        columns={customerColumns}
        data={customers}
        getRowId={(c) => c.id}
        selectable
        search={{ accessor: (c) => `${c.name} ${c.location}` }}
        filters={[
          {
            field: 'location',
            label: 'Location',
            type: 'multi',
            options: locations,
            predicate: (c, v) => (v as string[]).includes(c.location),
          },
          {
            field: 'orders',
            label: 'Order count',
            type: 'numberRange',
            min: 0,
            max: 40,
            predicate: (c, v) => c.orders >= (v as number[])[0]! && c.orders <= (v as number[])[1]!,
          },
          {
            field: 'name',
            label: 'Name',
            type: 'text',
            predicate: (c, v) => c.name.toLowerCase().includes(String(v).toLowerCase()),
          },
          {
            field: 'spent',
            label: 'Big spender',
            type: 'boolean',
            predicate: (c, v) => (c.spent > 2000) === v,
          },
        ]}
        paginator
        rowsPerPage={5}
        sortField="name"
        sortOrder={1}
      />
    </div>
  ),
};
