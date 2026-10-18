import type { Meta, StoryObj } from '@storybook/react-vite';
import { InformationCircleIcon } from '@heroicons/react/20/solid';
import { Button } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip';

const meta = {
  title: 'Overlays/Tooltip',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>Transfers settle instantly</TooltipContent>
    </Tooltip>
  ),
};

export const WithArrow: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary">With arrow</Button>
      </TooltipTrigger>
      <TooltipContent arrow>Transfers settle instantly</TooltipContent>
    </Tooltip>
  ),
};

export const Toolbar: Story = {
  render: () => (
    <div className="flex items-center gap-1.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="ghost" aria-label="Details">
            <InformationCircleIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Details</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="ghost" aria-label="Retry">
            Retry
          </Button>
        </TooltipTrigger>
        <TooltipContent>Retry the transfer</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="ghost" aria-label="Reverse">
            Reverse
          </Button>
        </TooltipTrigger>
        <TooltipContent>Reverse the transfer</TooltipContent>
      </Tooltip>
    </div>
  ),
};
