import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/16/solid';
import { Badge } from './Badge';

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'accent', 'success', 'warning', 'danger', 'info'],
    },
  },
  args: { children: 'Pending review', variant: 'neutral' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="accent">Accent</Badge>
      <Badge variant="success">Completed</Badge>
      <Badge variant="warning">Held</Badge>
      <Badge variant="danger">Failed</Badge>
      <Badge variant="info">Processing</Badge>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="success" startIcon={<CheckCircleIcon />}>
        Verified
      </Badge>
      <Badge variant="warning" startIcon={<ClockIcon />}>
        Pending
      </Badge>
      <Badge variant="danger" startIcon={<ExclamationTriangleIcon />}>
        Failed
      </Badge>
      <Badge variant="accent" endIcon={<ArrowTrendingUpIcon />}>
        Tier 2
      </Badge>
      <Badge
        variant="info"
        startIcon={<ClockIcon />}
        endIcon={<ArrowTrendingUpIcon />}
      >
        Processing
      </Badge>
    </div>
  ),
};

export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Badge variant="success">Completed</Badge>
        <Badge variant="warning">Pending</Badge>
        <Badge variant="danger">Failed</Badge>
      </div>
      <div className="flex items-center gap-2">
        <Badge size="sm" variant="success">
          Completed
        </Badge>
        <Badge size="sm" variant="warning">
          Pending
        </Badge>
        <Badge size="sm" variant="danger">
          Failed
        </Badge>
      </div>
    </div>
  ),
};

export const Solid: Story = {
  name: 'Solid + pill',
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="neutral" solid>
          Draft
        </Badge>
        <Badge variant="accent" solid>
          New
        </Badge>
        <Badge variant="success" solid>
          Completed
        </Badge>
        <Badge variant="warning" solid>
          Pending
        </Badge>
        <Badge variant="danger" solid>
          Failed
        </Badge>
        <Badge variant="info" solid>
          In review
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="success" solid shape="pill">
          Completed
        </Badge>
        <Badge variant="warning" solid shape="pill">
          Pending
        </Badge>
        <Badge variant="danger" solid shape="pill">
          Failed
        </Badge>
        <Badge variant="neutral" shape="pill">
          Draft
        </Badge>
      </div>
    </div>
  ),
};
