import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { Link } from './Link';

const meta = {
  title: 'Primitives/Link',
  component: Link,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { href: '#', children: 'View the receipt' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'muted', 'inverse'] },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-2 text-[13px]">
      <Link href="#">Accent link</Link>
      <Link href="#" variant="muted">
        Muted link
      </Link>
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        Open report <ArrowTopRightOnSquareIcon className="size-3.5" />
      </>
    ),
  },
};
