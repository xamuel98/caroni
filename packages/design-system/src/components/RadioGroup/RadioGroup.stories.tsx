import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from '../Label';
import { RadioGroup, RadioGroupItem } from './RadioGroup';

const meta = {
  title: 'Forms/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="standard" className="flex flex-col gap-3">
      {['standard', 'express', 'instant'].map((value) => (
        <div key={value} className="flex items-center gap-2">
          <RadioGroupItem value={value} id={value} />
          <Label htmlFor={value} className="capitalize">
            {value}
          </Label>
        </div>
      ))}
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="a" className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="a" id="radio-a" disabled />
        <Label htmlFor="radio-a" className="text-text-muted">
          Disabled option
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="b" id="radio-b" />
        <Label htmlFor="radio-b">Enabled option</Label>
      </div>
    </RadioGroup>
  ),
};
