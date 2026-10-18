import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button';
import {
  Toast,
  ToastAction,
  ToastActions,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  type ToastPosition,
  type ToastVariant,
} from './Toast';

const meta = {
  title: 'Overlays/Toast',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A single notification toast with status variants (success / info / ' +
          'warning / danger) and a configurable dock position on `ToastProvider` ' +
          '(use `bottom-center` for a snackbar). For batches of async work, use ' +
          '`ProcessToast`.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <ToastProvider>
        <Button onClick={() => setOpen(true)}>Show toast</Button>
        <Toast open={open} onOpenChange={setOpen}>
          <div className="grid gap-0.5">
            <ToastTitle>Transfer held</ToastTitle>
            <ToastDescription>
              Transfer #4821 is above your tier limit and is awaiting verification.
            </ToastDescription>
          </div>
          <ToastActions>
            <ToastAction altText="Review the case" onClick={() => setOpen(false)}>
              Review
            </ToastAction>
            <ToastClose />
          </ToastActions>
        </Toast>
      </ToastProvider>
    );
  },
};

const variantCopy: Record<
  Exclude<ToastVariant, 'neutral'>,
  { title: string; body: string }
> = {
  success: { title: 'Transfer sent', body: 'Ada received $25.00 instantly.' },
  info: { title: 'Rate updated', body: 'NGN → USD now settles at 0.00065.' },
  warning: { title: 'Above tier limit', body: 'This transfer needs verification.' },
  danger: { title: 'Transfer failed', body: 'The recipient account is frozen.' },
};

export const Variants: Story = {
  render: () => {
    const [state, setState] = useState<{ open: boolean; variant: Exclude<ToastVariant, 'neutral'> }>(
      { open: false, variant: 'success' },
    );
    const show = (variant: Exclude<ToastVariant, 'neutral'>) => setState({ open: true, variant });
    return (
      <ToastProvider>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="secondary" onClick={() => show('success')}>
            Success
          </Button>
          <Button variant="secondary" onClick={() => show('info')}>
            Info
          </Button>
          <Button variant="secondary" onClick={() => show('warning')}>
            Warning
          </Button>
          <Button variant="secondary" onClick={() => show('danger')}>
            Error
          </Button>
        </div>
        <Toast
          open={state.open}
          onOpenChange={(open) => setState((s) => ({ ...s, open }))}
          variant={state.variant}
        >
          <div className="grid gap-0.5">
            <ToastTitle>{variantCopy[state.variant].title}</ToastTitle>
            <ToastDescription>{variantCopy[state.variant].body}</ToastDescription>
          </div>
          <ToastActions>
            <ToastClose />
          </ToastActions>
        </Toast>
      </ToastProvider>
    );
  },
};

export const Snackbar: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <ToastProvider position="bottom-center">
        <Button onClick={() => setOpen(true)}>Show snackbar</Button>
        <Toast open={open} onOpenChange={setOpen} variant="success">
          <ToastDescription className="text-text">Transfer sent to ada@caroni</ToastDescription>
          <ToastActions>
            <ToastAction altText="View the receipt" onClick={() => setOpen(false)}>
              Undo
            </ToastAction>
            <ToastClose />
          </ToastActions>
        </Toast>
      </ToastProvider>
    );
  },
};

export const Position: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<ToastPosition>('bottom-center');
    const positions: ToastPosition[] = [
      'top-left',
      'top-center',
      'top-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ];
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex max-w-md flex-wrap justify-center gap-1.5">
          {positions.map((p) => (
            <Button
              key={p}
              size="sm"
              variant={position === p ? 'primary' : 'secondary'}
              onClick={() => setPosition(p)}
            >
              {p}
            </Button>
          ))}
        </div>
        <ToastProvider position={position}>
          <Button onClick={() => setOpen(true)}>Show toast</Button>
          <Toast open={open} onOpenChange={setOpen} variant="info">
            <div className="grid gap-0.5">
              <ToastTitle>Docked {position}</ToastTitle>
              <ToastDescription>Change the dock above, then reopen.</ToastDescription>
            </div>
            <ToastActions>
              <ToastClose />
            </ToastActions>
          </Toast>
        </ToastProvider>
      </div>
    );
  },
};
