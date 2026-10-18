import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BanknotesIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import type { ReactNode } from 'react';
import { Button } from '../Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogStatusIcon,
  DialogTitle,
  DialogTrigger,
  type DialogStatusTone,
} from './Dialog';

const meta = {
  title: 'Overlays/Dialog',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Centred composition: icon medallion → title → subtitle → full-width ' +
          'actions. Responsive by form — a centred Radix dialog on desktop, a Vaul ' +
          'bottom sheet at ≤ 640px (no corner dismiss icon there; drag or backdrop).',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Tone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral';

interface ShellProps {
  tone?: Tone;
  icon?: ReactNode;
  /** Render the animated transitions.dev status glyph instead of `icon`. */
  statusTone?: DialogStatusTone;
  title: string;
  description?: string;
  footer: ReactNode;
  showClose?: boolean;
  trigger?: string;
}

/** Shared, re-openable demo shell so each story shows one live instance. */
function Shell({
  tone = 'accent',
  icon,
  statusTone,
  title,
  description,
  footer,
  showClose = true,
  trigger = 'Open dialog',
}: ShellProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{trigger}</Button>
      </DialogTrigger>
      <DialogContent showClose={showClose}>
        <DialogHeader>
          {statusTone ? (
            <DialogStatusIcon tone={statusTone} />
          ) : (
            icon && <DialogIcon tone={tone}>{icon}</DialogIcon>
          )}
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {footer}
      </DialogContent>
    </Dialog>
  );
}

/* ── Animated success medallion (transitions.dev) ─────────────────────── */

export const SuccessCheck: Story = {
  name: 'Status · success check',
  render: () => (
    <Shell
      statusTone="success"
      title="Transfer complete"
      description="The check draws itself in as the dialog appears. Reopen to replay."
      footer={
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
          <Button>View receipt</Button>
        </DialogFooter>
      }
    />
  ),
};

export const Default: Story = {
  render: () => (
    <Shell
      tone="danger"
      icon={<ExclamationTriangleIcon />}
      title="Freeze this account?"
      description="Freezing blocks all outgoing transfers immediately. This is written to the audit log and can be reversed by an administrator."
      footer={
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button variant="danger">Freeze account</Button>
        </DialogFooter>
      }
    />
  ),
};

/* ── Footer orientations ──────────────────────────────────────────────── */

export const ActionsSideBySide: Story = {
  name: 'Footer · side by side',
  render: () => (
    <Shell
      statusTone="success"
      title="Approve this decision?"
      description="The reviewer and approver differ, so four-eyes is satisfied."
      footer={
        <DialogFooter orientation="row">
          <DialogClose asChild>
            <Button variant="secondary">Reject</Button>
          </DialogClose>
          <Button>Approve</Button>
        </DialogFooter>
      }
    />
  ),
};

export const ActionsStacked: Story = {
  name: 'Footer · stacked',
  render: () => (
    <Shell
      statusTone="success"
      title="KYC approved"
      description="The account tier has been upgraded. Limits update immediately."
      footer={
        <DialogFooter orientation="column">
          <DialogClose asChild>
            <Button>View account</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="ghost">Done</Button>
          </DialogClose>
        </DialogFooter>
      }
    />
  ),
};

/* ── Content composition ──────────────────────────────────────────────── */

export const WithoutIcon: Story = {
  name: 'Composition · no icon',
  render: () => (
    <Shell
      title="Rename branch"
      description="This changes the display name across the console. Nothing else is affected."
      footer={
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button>Save</Button>
        </DialogFooter>
      }
    />
  ),
};

export const WithoutDescription: Story = {
  name: 'Composition · title only',
  render: () => (
    <Shell
      tone="warning"
      icon={<ExclamationTriangleIcon />}
      title="Discard unsaved changes?"
      footer={
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Keep editing</Button>
          </DialogClose>
          <Button variant="danger">Discard</Button>
        </DialogFooter>
      }
    />
  ),
};

export const WithoutClose: Story = {
  name: 'Composition · no dismiss icon',
  render: () => (
    <Shell
      tone="danger"
      icon={<TrashIcon />}
      title="Delete draft?"
      description="This can’t be undone."
      showClose={false}
      footer={
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button variant="danger">Delete</Button>
        </DialogFooter>
      }
    />
  ),
};

/* ── Icon tones ───────────────────────────────────────────────────────── */

const toneDialog = (tone: Tone, icon: ReactNode, title: string, body: string, action: string) => (
  <Shell
    tone={tone}
    icon={icon}
    title={title}
    description={body}
    footer={
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">Cancel</Button>
        </DialogClose>
        <Button>{action}</Button>
      </DialogFooter>
    }
  />
);

export const IconAccent: Story = {
  name: 'Icon · accent',
  render: () =>
    toneDialog(
      'accent',
      <InformationCircleIcon />,
      'Heads up',
      'Accent medallion — the default, for neutral information.',
      'Got it',
    ),
};

export const IconSuccess: Story = {
  name: 'Icon · success',
  render: () => (
    <Shell
      statusTone="success"
      title="Transfer complete"
      description="Success medallion — confirmations and resolved states."
      footer={
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button>View receipt</Button>
        </DialogFooter>
      }
    />
  ),
};

export const IconWarning: Story = {
  name: 'Icon · warning',
  render: () =>
    toneDialog(
      'warning',
      <ExclamationTriangleIcon />,
      'Above tier limit',
      'Warning medallion — actions that need attention but aren’t destructive.',
      'Review',
    ),
};

export const IconDanger: Story = {
  name: 'Icon · danger',
  render: () =>
    toneDialog(
      'danger',
      <ExclamationTriangleIcon />,
      'Reverse this transfer?',
      'Danger medallion — destructive or irreversible actions.',
      'Reverse',
    ),
};

export const IconNeutral: Story = {
  name: 'Icon · neutral',
  render: () =>
    toneDialog(
      'neutral',
      <BanknotesIcon />,
      'Ledger entry',
      'Neutral medallion — informational, no semantic weight.',
      'Close',
    ),
};
