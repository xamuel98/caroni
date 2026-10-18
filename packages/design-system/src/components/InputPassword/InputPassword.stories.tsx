import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Label } from '../Label';
import { InputPassword } from './InputPassword';

const meta = {
  title: 'Forms/InputPassword',
  component: InputPassword,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof InputPassword>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div className="w-72">
        <Label htmlFor="pw">Password</Label>
        <div className="mt-1.5">
          <InputPassword id="pw" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
      </div>
    );
  },
};

export const Levels: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      <InputPassword readOnly defaultValue="abc" />
      <InputPassword readOnly defaultValue="abcdefgh" />
      <InputPassword readOnly defaultValue="Abcdefg1!" />
    </div>
  ),
};

export const NoMeter: Story = {
  name: 'No meter',
  render: () => <InputPassword className="w-72" readOnly defaultValue="Abcdefg1!" showMeter={false} />,
};
export const CustomScore: Story = {
  name: 'Custom scorer',
  render: () => (
    <div className="w-72">
      <InputPassword
        defaultValue="caroni"
        score={(password) => (password.length >= 8 ? 3 : password.length >= 5 ? 2 : 1)}
      />
    </div>
  ),
};
