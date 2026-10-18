import type { Meta, StoryObj } from '@storybook/react-vite';
import { InboxIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '../Button';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: { title: 'No entries' },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <InboxIcon />,
    title: 'No transfers yet',
    description: 'Once you send or receive money, your activity will show up here.',
    action: <Button startIcon={<PlusIcon className="size-4" />}>New transfer</Button>,
  },
};

export const NoResults: Story = {
  name: 'No search results',
  args: {
    icon: <MagnifyingGlassIcon />,
    title: 'No matches',
    description: 'Try a different name, @tag, or reference number.',
  },
};

export const Small: Story = {
  name: 'Inline (sm)',
  render: () => (
    <div className="w-80 rounded-lg border border-border bg-surface-raised">
      <EmptyState
        size="sm"
        icon={<InboxIcon />}
        title="Nothing to review"
        description="New KYC cases appear here."
      />
    </div>
  ),
};

export const TitleOnly: Story = {
  name: 'Title only',
  args: { title: 'No entries' },
};