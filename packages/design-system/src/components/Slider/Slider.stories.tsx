import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './Slider';

const meta = {
  title: 'Forms/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-72">
      <Slider defaultValue={[40]} max={100} step={1} />
    </div>
  ),
};

export const Range: Story = {
  render: () => (
    <div className="w-72">
      <Slider defaultValue={[20, 70]} max={100} step={1} />
    </div>
  ),
};

export const Steps: Story = {
  render: () => (
    <div className="w-72">
      <Slider defaultValue={[2]} min={0} max={4} step={1} />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-72">
      <Slider defaultValue={[40]} max={100} disabled />
    </div>
  ),
};
