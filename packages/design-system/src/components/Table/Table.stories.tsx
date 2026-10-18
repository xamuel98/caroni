import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../Badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './Table';

const meta = {
  title: 'Data/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
  { id: 'TR-4821', to: '@ada', amount: '₦250,000.00', status: 'Held' as const },
  { id: 'TR-4820', to: '@grace', amount: '₦1,200,000.00', status: 'Completed' as const },
  { id: 'TR-4819', to: '@alan', amount: '₦18,500.00', status: 'Failed' as const },
];

const tone = { Held: 'warning', Completed: 'success', Failed: 'danger' } as const;

export const Basic: Story = {
  render: () => (
    <div className="w-[560px] rounded-lg border border-border bg-surface-raised overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.id}</TableCell>
              <TableCell className="text-text-secondary">{r.to}</TableCell>
              <TableCell className="tnum text-right">{r.amount}</TableCell>
              <TableCell className="text-right">
                <Badge variant={tone[r.status]}>{r.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};

export const WithFooter: Story = {
  name: 'With footer + caption',
  render: () => (
    <div className="w-[560px] rounded-lg border border-border bg-surface-raised overflow-hidden">
      <Table>
        <TableCaption>Settled today · Lagos branch</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Recipient</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="text-text-secondary">{r.to}</TableCell>
              <TableCell className="tnum text-right">{r.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="hover:bg-transparent">
            <TableCell>Total</TableCell>
            <TableCell className="tnum text-right">₦1,468,500.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  ),
};