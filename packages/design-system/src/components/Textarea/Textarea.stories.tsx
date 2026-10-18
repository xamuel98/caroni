import type { Meta, StoryObj } from '@storybook/react-vite';
import { HelpText } from '../HelpText';
import { Label } from '../Label';
import { Textarea } from './Textarea';

const meta = {
  title: 'Forms/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { placeholder: 'Add a note…' },
  render: (args) => (
    <div className="w-72">
      <Textarea {...args} />
    </div>
  ),
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithField: Story = {
  render: () => (
    <div className="w-72">
      <Label htmlFor="note">Note</Label>
      <div className="mt-1.5">
        <Textarea id="note" placeholder="Add a note…" aria-describedby="note-help" />
      </div>
      <HelpText id="note-help">Visible to your team.</HelpText>
    </div>
  ),
};

export const Invalid: Story = {
  args: { defaultValue: 'Too short', 'aria-invalid': true },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: 'Locked' } };
