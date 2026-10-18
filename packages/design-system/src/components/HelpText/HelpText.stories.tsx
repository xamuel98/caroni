import type { Meta, StoryObj } from '@storybook/react-vite';
import { HelpText } from './HelpText';

const meta = {
  title: 'Forms/HelpText',
  component: HelpText,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: { tone: { control: 'select', options: ['default', 'success', 'danger'] } },
  args: { children: 'We’ll only use this for transfer receipts.', tone: 'default' },
  render: (args) => (
    <div className="w-72">
      <HelpText {...args} />
    </div>
  ),
} satisfies Meta<typeof HelpText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <HelpText>Neutral guidance under a field.</HelpText>
      <HelpText tone="success">@ada is available.</HelpText>
      <HelpText tone="danger">@ada is already taken.</HelpText>
    </div>
  ),
};
