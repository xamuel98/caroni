import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Button } from '../Button';
import { ToastProvider } from '../Toast';
import { ProcessToast, type ProcessItem } from './ProcessToast';

const meta = {
  title: 'Overlays/ProcessToast',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Aggregates a batch of async work into one toast — "2 of 3 complete · ' +
          '1 failed" with a progress bar. Expand to see each item and retry the ' +
          'failures. Stays open while anything is in flight, auto-dismisses when done.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const runningItems: ProcessItem[] = [
  { id: '1', label: 'Transfer to ada@caroni', status: 'success' },
  { id: '2', label: 'Transfer to grace@caroni', status: 'running' },
  { id: '3', label: 'Transfer to alan@caroni', status: 'queued' },
];

const doneItems: ProcessItem[] = [
  { id: '1', label: 'Transfer to ada@caroni', status: 'success' },
  { id: '2', label: 'Transfer to grace@caroni', status: 'success' },
  { id: '3', label: 'Transfer to alan@caroni', status: 'success' },
];

const failedItems: ProcessItem[] = [
  { id: '1', label: 'Transfer to ada@caroni', status: 'success' },
  { id: '2', label: 'Transfer to grace@caroni', status: 'failed', detail: 'Insufficient funds' },
  { id: '3', label: 'Transfer to alan@caroni', status: 'success' },
];

export const Running: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <ToastProvider>
        <Button onClick={() => setOpen(true)}>Run batch</Button>
        <ProcessToast
          open={open}
          onOpenChange={setOpen}
          title="Processing transfers"
          items={runningItems}
        />
      </ToastProvider>
    );
  },
};

export const Completed: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <ToastProvider>
        <Button onClick={() => setOpen(true)}>Run batch</Button>
        <ProcessToast
          open={open}
          onOpenChange={setOpen}
          title="Processing transfers"
          items={doneItems}
        />
      </ToastProvider>
    );
  },
};

export const WithFailures: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState(failedItems);
    return (
      <ToastProvider>
        <Button onClick={() => setOpen(true)}>Run batch</Button>
        <ProcessToast
          open={open}
          onOpenChange={setOpen}
          title="Processing transfers"
          items={items}
          onRetry={(ids) =>
            setItems((prev) =>
              prev.map((it) => (ids.includes(it.id) ? { ...it, status: 'queued', detail: undefined } : it)),
            )
          }
        />
      </ToastProvider>
    );
  },
};

export const LiveBatch: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<ProcessItem[]>([]);

    const start = () => {
      setItems([
        { id: '1', label: 'Transfer to ada@caroni', status: 'queued' },
        { id: '2', label: 'Transfer to grace@caroni', status: 'queued' },
        { id: '3', label: 'Transfer to alan@caroni', status: 'queued' },
      ]);
      setOpen(true);
    };

    useEffect(() => {
      if (!open) return;
      const timer = setInterval(() => {
        setItems((prev) => {
          const i = prev.findIndex((it) => it.status === 'queued' || it.status === 'running');
          if (i === -1) return prev;
          const copy = [...prev];
          const item = copy[i]!;
          if (item.status === 'queued') {
            copy[i] = { ...item, status: 'running' };
          } else {
            const failed = item.id === '2';
            copy[i] = {
              ...item,
              status: failed ? 'failed' : 'success',
              detail: failed ? 'Insufficient funds' : undefined,
            };
          }
          return copy;
        });
      }, 1200);
      return () => clearInterval(timer);
    }, [open]);

    return (
      <ToastProvider>
        <Button onClick={start}>Run batch</Button>
        <ProcessToast
          open={open}
          onOpenChange={setOpen}
          title="Processing transfers"
          items={items}
          onRetry={(ids) =>
            setItems((prev) =>
              prev.map((it) => (ids.includes(it.id) ? { ...it, status: 'queued', detail: undefined } : it)),
            )
          }
        />
      </ToastProvider>
    );
  },
};
