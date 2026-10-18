import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRightIcon, PlusIcon } from '@heroicons/react/20/solid';
import { Fragment, type ReactNode } from 'react';
import { Button, type ButtonProps } from './Button';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger', 'link', 'plain', 'plain-danger', 'monochrome'],
    },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'icon-xs', 'icon'] },
  },
  args: { children: 'Send money', variant: 'primary', size: 'md' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Button {...args} variant="primary">Primary</Button>
      <Button {...args} variant="secondary">Secondary</Button>
      <Button {...args} variant="ghost">Ghost</Button>
      <Button {...args} variant="danger">Danger</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Button {...args} size="xs">Extra small</Button>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  args: { startIcon: <PlusIcon />, endIcon: <ArrowRightIcon />, children: 'New transfer' },
};

export const Disabled: Story = {
  name: 'Disabled',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary" disabled>Primary</Button>
      <Button variant="secondary" disabled>Secondary</Button>
      <Button variant="ghost" disabled>Ghost</Button>
      <Button variant="danger" disabled>Danger</Button>
      <Button variant="link" disabled>Link</Button>
    </div>
  ),
};

export const Link: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button variant="link">Read the docs</Button>
      <Button variant="link" endIcon={<ArrowRightIcon />}>Read the docs</Button>
    </div>
  ),
};

type Row = { key: string; props: ButtonProps; children: ReactNode };

const ROWS: Row[] = [
  { key: 'default', props: {}, children: 'Label' },
  { key: 'start', props: { startIcon: <PlusIcon /> }, children: 'Label' },
  { key: 'end', props: { endIcon: <ArrowRightIcon /> }, children: 'Label' },
  { key: 'both', props: { startIcon: <PlusIcon />, endIcon: <ArrowRightIcon /> }, children: 'Label' },
  { key: 'icon', props: { 'aria-label': 'Add' }, children: <PlusIcon /> },
];

function Matrix({ variant }: { variant: 'plain' | 'plain-danger' | 'monochrome' }) {
  return (
    <div className="space-y-2">
      <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-text-muted">{variant}</p>
      <div className="grid grid-cols-2 items-center justify-items-start gap-x-12 gap-y-3">
        {ROWS.map((row) => (
          <Fragment key={row.key}>
            <Button variant={variant} {...row.props}>{row.children}</Button>
            <Button variant={variant} {...row.props} disabled>{row.children}</Button>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export const Plain: Story = {
  name: 'Plain (all states)',
  render: () => (
    <div className="flex flex-col gap-8">
      <Matrix variant="plain" />
      <Matrix variant="plain-danger" />
      <Matrix variant="monochrome" />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button loading>Primary</Button>
        <Button variant="secondary" loading>Saving…</Button>
        <Button variant="ghost" loading>Ghost</Button>
        <Button variant="danger" loading>Deleting</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="plain" loading>Plain</Button>
        <Button variant="plain-danger" loading>Delete</Button>
        <Button variant="monochrome" loading>Mono</Button>
      </div>
    </div>
  ),
};
