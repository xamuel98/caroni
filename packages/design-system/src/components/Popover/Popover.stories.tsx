import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button';
import { InputText } from '../InputText';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';

const meta = {
  title: 'Overlays/Popover',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Filter</Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <h3 className="text-[13px] font-medium text-text">Filters</h3>
        <p className="mt-1 text-[13px] text-text-secondary">
          Scales in from the trigger edge, not the panel centre.
        </p>
        <div className="mt-3">
          <InputText placeholder="Search tags…" />
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex flex-col items-center gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="secondary">{open ? 'Close' : 'Open'} popover</Button>
          </PopoverTrigger>
          <PopoverContent align="center">
            <p className="text-[13px] text-text-secondary">
              Controlled popover. Press Escape or click outside to dismiss.
            </p>
          </PopoverContent>
        </Popover>
        <span className="text-[12px] text-text-muted">open: {String(open)}</span>
      </div>
    );
  },
};
