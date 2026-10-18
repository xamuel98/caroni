import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from '../Label';
import { Switch } from './Switch';

const meta = {
  title: 'Forms/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Disabled: Story = { args: { disabled: true } };

export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch defaultChecked thumb="circle" />
      <Switch defaultChecked thumb="pill" />
      <Switch thumb="pill" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch size="sm" defaultChecked />
      <Switch size="md" defaultChecked />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="twofa" defaultChecked />
      <Label htmlFor="twofa">Require two-factor auth</Label>
    </div>
  ),
};
