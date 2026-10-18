import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ArrowDownTrayIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/20/solid';
import { IconButton } from './IconButton';

const meta = {
  title: 'Primitives/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { 'aria-label': 'Add', children: <PlusIcon /> },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'select', options: ['icon-sm', 'icon', 'icon-lg'] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton aria-label="Add">
        <PlusIcon />
      </IconButton>
      <IconButton aria-label="Download" variant="secondary">
        <ArrowDownTrayIcon />
      </IconButton>
      <IconButton aria-label="More" variant="ghost">
        <EllipsisHorizontalIcon />
      </IconButton>
      <IconButton aria-label="Delete" variant="danger">
        <TrashIcon />
      </IconButton>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton aria-label="Add small" size="icon-sm">
        <PlusIcon />
      </IconButton>
      <IconButton aria-label="Add" size="icon">
        <PlusIcon />
      </IconButton>
      <IconButton aria-label="Add large" size="icon-lg">
        <PlusIcon />
      </IconButton>
    </div>
  ),
};
