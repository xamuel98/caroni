import type { Meta, StoryObj } from '@storybook/react-vite';
import { BanknotesIcon, HomeIcon } from '@heroicons/react/20/solid';
import { Breadcrumb } from './Breadcrumb';

const meta = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  args: { items: [] },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Collapses its middle crumbs into an overflow menu below `md`; shows the full trail from `md` up.',
      },
    },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Transfers', href: '#' },
      { label: 'Batch #4821', href: '#' },
      { label: 'Recipients', href: '#' },
      { label: 'Ada Lovelace' },
    ],
  },
};

export const Short: Story = {
  args: { items: [{ label: 'Home', href: '#' }, { label: 'Settings' }] },
};

export const Narrow: Story = {
  name: 'Responsive (narrow)',
  render: () => (
    <div className="w-[320px] rounded-lg border border-border p-4">
      <Breadcrumb
        items={[
          { label: 'Home', href: '#' },
          { label: 'Operations', href: '#' },
          { label: 'KYC queue', href: '#' },
          { label: 'Case #1043' },
        ]}
      />
    </div>
  ),
};
export const WithIcons: Story = {
  name: 'With icons',
  args: {
    items: [
      { label: 'Home', href: '#', icon: <HomeIcon /> },
      { label: 'Transfers', href: '#', icon: <BanknotesIcon /> },
      { label: 'Ada Lovelace' },
    ],
  },
};

export const Underlined: Story = {
  name: 'Underlined',
  args: {
    underline: true,
    items: [
      { label: 'Home', href: '#' },
      { label: 'Transfers', href: '#' },
      { label: 'Batch #4821' },
    ],
  },
};
