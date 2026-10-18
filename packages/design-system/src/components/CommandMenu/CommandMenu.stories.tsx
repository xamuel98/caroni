import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ArrowPathIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid';
import { useState } from 'react';
import { Button } from '../Button';
import { CommandMenu } from './CommandMenu';

const meta = {
  title: 'Overlays/CommandMenu',
  component: CommandMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A ⌘K command palette. Keyboard-first, so it opens with no entrance ' +
          'animation (per the motion rules). Press ⌘K/Ctrl+K to toggle, type to ' +
          'filter, ↑/↓ to move, Enter to run, Escape to close.',
      },
    },
  },
  args: { open: false, onOpenChange: () => {}, items: [] },
} satisfies Meta<typeof CommandMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="grid min-h-[100vh] place-items-center">
        <Button onClick={() => setOpen(true)}>Open command menu · ⌘K</Button>
        <CommandMenu
          open={open}
          onOpenChange={setOpen}
          groups={[
            { id: 'actions', label: 'Actions' },
            { id: 'navigation', label: 'Navigation' },
          ]}
          items={[
            {
              id: 'new-transfer',
              group: 'actions',
              label: 'New transfer',
              icon: <PlusIcon />,
              shortcut: '⌘N',
              keywords: ['send money', 'pay'],
              onSelect: () => {},
            },
            {
              id: 'reconcile',
              group: 'actions',
              label: 'Reconcile ledger',
              icon: <ArrowPathIcon />,
              keywords: ['sync', 'match'],
            },
            {
              id: 'invite',
              group: 'actions',
              label: 'Invite teammate',
              icon: <UserGroupIcon />,
              keywords: ['member', 'add'],
            },
            { id: 'search', group: 'actions', label: 'Search transactions', icon: <MagnifyingGlassIcon /> },
            { id: 'ledger', group: 'navigation', label: 'Go to Ledger', icon: <BanknotesIcon /> },
            { id: 'settings', group: 'navigation', label: 'Settings', icon: <Cog6ToothIcon />, shortcut: '⌘,' },
            {
              id: 'danger',
              group: 'navigation',
              label: 'Close account (disabled)',
              disabled: true,
            },
          ]}
        />
      </div>
    );
  },
};

export const NoHotkey: Story = {
  name: 'No hotkey binding',
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="grid min-h-[100vh] place-items-center">
        <Button onClick={() => setOpen(true)}>Open</Button>
        <CommandMenu
          open={open}
          onOpenChange={setOpen}
          hotkey={false}
          items={[
            { id: 'a', label: 'Approve transfer' },
            { id: 'b', label: 'Decline transfer' },
          ]}
        />
      </div>
    );
  },
};