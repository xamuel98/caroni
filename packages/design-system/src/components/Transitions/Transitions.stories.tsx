import type { Meta, StoryObj } from '@storybook/react-vite';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { Button } from '../Button';
import { IconSwap } from './IconSwap';
import { StatusCheck } from './StatusCheck';
import { DigitNumber, TextSwap } from './transitions';

const meta = {
  title: 'Foundations/Transitions',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Reusable motion primitives adapted from transitions.dev — all read ' +
          'their duration/easing/blur/distance from the `:root` tokens.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── Icon swap ─────────────────────────────────────────────────────── */
export const Icon: Story = {
  name: 'Icon swap',
  render: () => {
    const [value, setValue] = useState('sun');
    return (
      <Button
        variant="secondary"
        size="icon-lg"
        aria-label="Toggle theme icon"
        onClick={() => setValue((v) => (v === 'sun' ? 'moon' : 'sun'))}
      >
        <IconSwap
          value={value}
          className="size-5 place-items-center [&_svg]:size-5"
          items={[
            { key: 'sun', node: <SunIcon className="text-warning" /> },
            { key: 'moon', node: <MoonIcon className="text-accent" /> },
          ]}
        />
      </Button>
    );
  },
};

/* ── Success check ─────────────────────────────────────────────────── */
export const SuccessCheckStory: Story = {
  name: 'Success check',
  render: () => {
    const [nonce, setNonce] = useState(0);
    return (
      <div className="grid place-items-center gap-6">
        <div className="grid size-12 place-items-center rounded-full bg-success-soft text-success [&_svg]:size-6">
          <StatusCheck key={nonce} />
        </div>
        <Button variant="secondary" size="sm" onClick={() => setNonce((n) => n + 1)}>
          Replay
        </Button>
      </div>
    );
  },
};

/* ── Text states swap ──────────────────────────────────────────────── */
export const Text: Story = {
  name: 'Text states swap',
  render: () => {
    const [label, setLabel] = useState('Processing...');
    return (
      <div className="grid place-items-center gap-4">
        <span className="text-[15px] font-medium text-text">
          <TextSwap value={label}>{label}</TextSwap>
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setLabel((l) => (l === 'Processing...' ? 'Done' : 'Processing...'))}
        >
          Swap
        </Button>
      </div>
    );
  },
};

/* ── Number pop-in ─────────────────────────────────────────────────── */
export const Number: Story = {
  name: 'Number pop-in',
  render: () => {
    const [n, setN] = useState(1234);
    return (
      <div className="grid place-items-center gap-4">
        <span className="text-[56px] font-medium leading-none tracking-[-0.02em] text-text">
          <DigitNumber value={String(n)} />
        </span>
        <Button variant="secondary" size="sm" onClick={() => setN(Math.round(Math.random() * 9999))}>
          Randomise
        </Button>
      </div>
    );
  },
};