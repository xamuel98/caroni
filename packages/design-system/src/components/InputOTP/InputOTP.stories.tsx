import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { InputOTP } from './InputOTP';

const meta = {
  title: 'Forms/InputOTP',
  component: InputOTP,
  tags: ['autodocs'],
  args: { length: 6 },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Segmented one-time-code field. Boxes, optional mask, and grouped layout (e.g. 3-3).',
      },
    },
  },
} satisfies Meta<typeof InputOTP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [code, setCode] = useState('');
    return <InputOTP length={6} value={code} onChange={setCode} />;
  },
};

export const Masked: Story = {
  render: () => {
    const [code, setCode] = useState('');
    return <InputOTP length={4} mask value={code} onChange={setCode} />;
  },
};

export const Grouped: Story = {
  name: 'Grouped (3-3)',
  render: () => {
    const [code, setCode] = useState('');
    return <InputOTP length={6} groups={[3, 3]} value={code} onChange={setCode} />;
  },
};

export const Disabled: Story = {
  args: { length: 6, value: '1234', disabled: true },
};