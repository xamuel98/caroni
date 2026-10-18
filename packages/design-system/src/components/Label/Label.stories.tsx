import type { Meta, StoryObj } from '@storybook/react-vite';
import { HelpText } from '../HelpText';
import { InputText } from '../InputText';
import { Label } from './Label';

const meta = {
  title: 'Forms/Label',
  component: Label,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { children: 'Email address' },
  render: (args) => (
    <div className="w-72">
      <Label {...args} />
    </div>
  ),
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
  args: { children: 'Email address *' },
};

export const WithField: Story = {
  render: () => (
    <div className="w-72">
      <Label htmlFor="amount">Amount</Label>
      <div className="mt-1.5">
        <InputText id="amount" placeholder="0.00" inputMode="decimal" />
      </div>
      <HelpText id="amount-help">Up to $500 per transfer on your tier.</HelpText>
    </div>
  ),
};
