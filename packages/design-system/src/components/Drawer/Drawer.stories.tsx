import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  type DrawerSide,
} from './Drawer';

const meta = {
  title: 'Overlays/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { open: false, onOpenChange: () => {} },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ side }: { side: DrawerSide }) {
  const [open, setOpen] = useState(false);
  return (
    <Drawer open={open} onOpenChange={setOpen} side={side}>
      <DrawerTrigger asChild>
        <Button variant="secondary">{side}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Refine the transfers list. Slides in from the {side}.</DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 text-[13px] text-text-secondary">
          Drawer body content goes here.
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="secondary" className="flex-1">
              Cancel
            </Button>
          </DrawerClose>
          <Button className="flex-1">Apply</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export const Sides: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Demo side="right" />
      <Demo side="left" />
      <Demo side="top" />
      <Demo side="bottom" />
    </div>
  ),
};