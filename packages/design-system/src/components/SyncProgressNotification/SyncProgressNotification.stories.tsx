import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Button } from '../Button';
import { SyncProgressNotification } from './SyncProgressNotification';
import { SyncStatusRow } from './SyncStatusRow';
import { DigitNumber } from '../Transitions';
import type { SyncTask } from './types';

const meta = {
  title: 'Feedback/SyncProgressNotification',
  component: SyncProgressNotification,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A floating, data-driven background-sync notification. The headline, ' +
          'tally, leading indicator (spinner → success/warning) and the ' +
          'contextual status panel are all derived from the `tasks` you pass — ' +
          'nothing is hardcoded. Dismissing only hides the UI; the sync keeps ' +
          'running.',
      },
    },
  },
  args: {
    tasks: [
      { id: 'meta', label: 'Meta', status: 'done' },
      { id: 'tiktok', label: 'TikTok', status: 'loading' },
      { id: 'google', label: 'Google Ads', status: 'queued' },
    ],
  },
} satisfies Meta<typeof SyncProgressNotification>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Wraps the fixed notification with a way to bring it back after dismissing. */
function Harness({
  tasks,
  position,
  title,
  subtitle,
}: {
  tasks: SyncTask[];
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  title?: string;
  subtitle?: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ minHeight: '100vh' }}>
      {!open && (
        <div className="grid min-h-[100vh] place-items-center">
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Show notification
          </Button>
        </div>
      )}
      <SyncProgressNotification
        tasks={tasks}
        open={open}
        onDismiss={() => setOpen(false)}
        position={position}
        title={title}
        subtitle={subtitle}
      />
    </div>
  );
}

/* ── State A — in progress ─────────────────────────────────────────── */
export const InProgress: Story = {
  render: () => (
    <Harness
      tasks={[
        { id: 'meta', label: 'Meta', status: 'done' },
        { id: 'tiktok', label: 'TikTok', status: 'loading' },
        { id: 'google', label: 'Google Ads', status: 'queued' },
      ]}
    />
  ),
};

/* ── State B — partial failure (other tasks keep going) ────────────── */
export const PartialFailure: Story = {
  render: () => (
    <Harness
      tasks={[
        { id: 'meta', label: 'Meta', status: 'done' },
        { id: 'tiktok', label: 'TikTok', status: 'failed' },
        { id: 'google', label: 'Google Ads', status: 'loading' },
      ]}
    />
  ),
};

/* ── State C — complete ────────────────────────────────────────────── */
export const Complete: Story = {
  render: () => (
    <Harness
      tasks={[
        { id: 'meta', label: 'Meta', status: 'done' },
        { id: 'tiktok', label: 'TikTok', status: 'done' },
        { id: 'google', label: 'Google Ads', status: 'done' },
      ]}
    />
  ),
};

/* ── State D — completed with failures ─────────────────────────────── */
export const CompletedWithFailures: Story = {
  render: () => (
    <Harness
      tasks={[
        { id: 'meta', label: 'Meta', status: 'done' },
        { id: 'tiktok', label: 'TikTok', status: 'failed' },
        { id: 'google', label: 'Google Ads', status: 'done' },
      ]}
    />
  ),
};

/* ── Everything still queued ───────────────────────────────────────── */
export const Queued: Story = {
  render: () => (
    <Harness
      tasks={[
        { id: 'meta', label: 'Meta', status: 'queued' },
        { id: 'tiktok', label: 'TikTok', status: 'queued' },
        { id: 'google', label: 'Google Ads', status: 'queued' },
      ]}
    />
  ),
};

/* ── Docked to another corner ──────────────────────────────────────── */
export const TopRight: Story = {
  render: () => (
    <Harness
      position="top-right"
      tasks={[
        { id: 'meta', label: 'Meta', status: 'done' },
        { id: 'tiktok', label: 'TikTok', status: 'loading' },
        { id: 'google', label: 'Google Ads', status: 'queued' },
      ]}
    />
  ),
};

/* ── A live, self-advancing run (stories-only simulation) ──────────── */
type SyncStatusScript = Record<'meta' | 'tiktok' | 'google', SyncTask['status']>;

const script: SyncStatusScript[] = [
  { meta: 'loading', tiktok: 'queued', google: 'queued' },
  { meta: 'done', tiktok: 'loading', google: 'queued' },
  { meta: 'done', tiktok: 'failed', google: 'loading' },
  { meta: 'done', tiktok: 'failed', google: 'done' },
];

export const Interactive: Story = {
  render: () => {
    const [step, setStep] = useState(0);
    const [open, setOpen] = useState(true);

    useEffect(() => {
      if (!open || step >= script.length - 1) return;
      const timer = window.setTimeout(() => setStep((s) => s + 1), 1400);
      return () => window.clearTimeout(timer);
    }, [open, step]);

    const frame = script[step] ?? {
      meta: 'queued',
      tiktok: 'queued',
      google: 'queued',
    };
    const tasks: SyncTask[] = [
      { id: 'meta', label: 'Meta', status: frame.meta },
      { id: 'tiktok', label: 'TikTok', status: frame.tiktok },
      { id: 'google', label: 'Google Ads', status: frame.google },
    ];

    return (
      <div style={{ minHeight: '100vh' }}>
        {!open && (
          <div className="grid min-h-[100vh] place-items-center">
            <Button
              variant="secondary"
              onClick={() => {
                setStep(0);
                setOpen(true);
              }}
            >
              Replay sync
            </Button>
          </div>
        )}
        <SyncProgressNotification
          tasks={tasks}
          open={open}
          onDismiss={() => setOpen(false)}
        />
      </div>
    );
  },
};

/* ── Isolated demo of the two label micro-interactions ─────────────── */
export const LabelTransitions: Story = {
  render: () => {
    const sequence: SyncTask['status'][] = ['queued', 'loading', 'failed', 'done'];
    const [step, setStep] = useState(0);

    useEffect(() => {
      const timer = window.setInterval(
        () => setStep((n) => (n + 1) % sequence.length),
        1700,
      );
      return () => window.clearInterval(timer);
    }, [sequence.length]);

    return (
      <div className="grid min-h-[100vh] place-items-center p-6">
        <div className="w-64 rounded-2xl bg-[#5B5B5B] p-4 text-white">
          <SyncStatusRow label="TikTok" status={sequence[step] ?? 'queued'} />
          <SyncStatusRow label="Meta" status="done" />
          <SyncStatusRow label="Google Ads" status="queued" />
        </div>
      </div>
    );
  },
};

/* ── Number pop-in: per-digit blur + stagger on every change ───────── */
export const CounterFlip: Story = {
  render: () => {
    const [n, setN] = useState(0);
    useEffect(() => {
      const timer = window.setInterval(() => setN((v) => (v + 7) % 1240), 1000);
      return () => window.clearInterval(timer);
    }, []);

    return (
      <div className="grid min-h-[100vh] place-items-center gap-6">
        <span className="text-[56px] font-medium leading-none tracking-[-0.02em] text-text">
          <DigitNumber value={String(n)} />
        </span>
        <span className="text-[14px] text-text-secondary">
          <DigitNumber value={String(n)} /> of <DigitNumber value="1240" />
        </span>
      </div>
    );
  },
};
export const WithRetry: Story = {
  name: 'With retry',
  render: () => (
    <div style={{ minHeight: '100vh' }}>
      <SyncProgressNotification
        tasks={[
          { id: 'meta', label: 'Meta', status: 'done' },
          { id: 'tiktok', label: 'TikTok', status: 'failed' },
          { id: 'google', label: 'Google Ads', status: 'failed' },
        ]}
        onRetry={() => {}}
      />
    </div>
  ),
};
