import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  ArrowRightOnRectangleIcon,
  BanknotesIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import { Button } from '../Button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './DropdownMenu';

const meta = {
  title: 'Overlays/DropdownMenu',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" endIcon={<ChevronDownIcon />}>
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Transfer</DropdownMenuLabel>
        <DropdownMenuItem>
          <BanknotesIcon /> Retry transfer
          <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ArrowRightOnRectangleIcon /> Reverse
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <UserIcon /> Assign to
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Ada Lovelace</DropdownMenuItem>
            <DropdownMenuItem>Grace Hopper</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem disabled>
          <Cog6ToothIcon /> Configure
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithCheckboxAndRadio: Story = {
  render: () => {
    const [flags, setFlags] = useState({ flagged: true, pinned: false });
    const [sort, setSort] = useState('newest');
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" endIcon={<ChevronDownIcon />}>
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-48">
          <DropdownMenuLabel>Options</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={flags.flagged}
            onCheckedChange={(v) => setFlags((f) => ({ ...f, flagged: v }))}
          >
            Flagged only
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={flags.pinned}
            onCheckedChange={(v) => setFlags((f) => ({ ...f, pinned: v }))}
          >
            Pinned first
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="amount">Amount</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};
