import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { CheckIcon, BellIcon } from '@heroicons/react/20/solid';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { Indicator } from './Indicator';

const AVATAR_IMG =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2080%2080'%3E%3Crect%20width='80'%20height='80'%20fill='%235B54E6'/%3E%3Ccircle%20cx='40'%20cy='30'%20r='13'%20fill='%23fff'%20fill-opacity='.95'/%3E%3Cpath%20d='M40%2048c-13.3%200-24%208.1-24%2018v14h48V66c0-9.9-10.7-18-24-18Z'%20fill='%23fff'%20fill-opacity='.95'/%3E%3C/svg%3E";

const meta = {
  title: 'Display/Indicator',
  component: Indicator,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    placement: {
      control: 'select',
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
    },
    anchor: { control: 'select', options: ['edge', 'corner'] },
    color: {
      control: 'select',
      options: ['accent', 'success', 'warning', 'danger', 'info', 'neutral'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: { color: 'success', placement: 'bottom-right', size: 'md' },
  render: (args) => (
    <div className="relative inline-flex">
      <Avatar size="lg" fallback="AL" />
      <Indicator {...args} label="Online" />
    </div>
  ),
} satisfies Meta<typeof Indicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnAvatar: Story = {};

export const OnIconButton: Story = {
  args: {
    size: 'lg',
  },

  render: (args) => (
    <div className="relative inline-flex">
      <IconButton aria-label="Notifications" variant="secondary">
        <BellIcon />
      </IconButton>
      <Indicator
        {...args}
        anchor="corner"
        placement="top-right"
        color="danger"
        count={3}
        label="3 unread"
      />
    </div>
  ),
};

export const OnGhostButton: Story = {
  render: (args) => (
    <div className="relative inline-flex">
      <IconButton aria-label="Notifications" variant="ghost" size="icon-xl">
        <BellIcon className="size-5" />
      </IconButton>
      <Indicator
        {...args}
        anchor="corner"
        placement="top-right"
        color="danger"
        size="lg"
        count={3}
        label="3 unread"
      />
    </div>
  ),
};

export const Anchors: Story = {
  render: (args) => (
    <div className="flex items-center gap-10">
      {(['edge', 'corner'] as const).map((anchor) => (
        <div key={anchor} className="flex flex-col items-center gap-3">
          <div className="relative inline-flex">
            <Avatar size="lg" fallback="AL" />
            <Indicator {...args} anchor={anchor} color="danger" count={3} />
          </div>
          <span className="text-[12px] text-text-muted">{anchor}</span>
        </div>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {(['accent', 'success', 'warning', 'danger', 'info', 'neutral'] as const).map((color) => (
        <div key={color} className="relative inline-flex">
          <Avatar fallback="AL" />
          <Indicator color={color} />
        </div>
      ))}
    </div>
  ),
};

export const Placements: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((placement) => (
        <div key={placement} className="relative inline-flex">
          <Avatar fallback="AL" />
          <Indicator placement={placement} color="info" />
        </div>
      ))}
    </div>
  ),
};

export const Content: Story = {
  args: {
    placement: 'top-right',
    anchor: 'edge',
  },

  render: () => (
    <div className="flex items-center gap-6">
      <div className="relative inline-flex">
        <Avatar size="lg" src={AVATAR_IMG} fallback="AL" />
        <Indicator color="success" />
      </div>
      <div className="relative inline-flex">
        <Avatar size="lg" fallback="GH" />
        <Indicator color="danger" count={12} label="12 messages" />
      </div>
      <div className="relative inline-flex">
        <Avatar size="lg" fallback="AT" />
        <Indicator color="info" icon={<CheckIcon />} label="Verified" />
      </div>
    </div>
  ),
};

export const SpringPopIn: Story = {
  args: {
    placement: 'top-right',
  },

  render: () => {
    const [key, setKey] = useState(0);
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative inline-flex">
          <Avatar size="lg" fallback="AL" />
          <Indicator key={key} color="success" placement="bottom-right" label="Online" />
        </div>
        <Button size="sm" variant="secondary" onClick={() => setKey((k) => k + 1)}>
          Replay pop-in
        </Button>
      </div>
    );
  },
};
