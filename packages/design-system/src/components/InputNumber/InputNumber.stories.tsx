import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { InputNumber } from './InputNumber';

const meta = {
  title: 'Forms/InputNumber',
  component: InputNumber,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Locale-aware number field: US `1,234.56`, euro `1.234,56`, Indian ' +
          '`1,23,456.78`, with optional decimals.',
      },
    },
  },
} satisfies Meta<typeof InputNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<number | null>(1234567);
    return (
      <div className="w-72">
        <InputNumber value={value} onChange={setValue} />
      </div>
    );
  },
};

export const Formats: Story = {
  render: () => {
    const [us, setUs] = useState<number | null>(1234567.89);
    const [eur, setEur] = useState<number | null>(1234567.89);
    const [inr, setInr] = useState<number | null>(1234567.89);
    return (
      <div className="flex w-72 flex-col gap-3">
        <InputNumber value={us} onChange={setUs} decimals={2} />
        <InputNumber value={eur} onChange={setEur} format="eur" decimals={2} />
        <InputNumber value={inr} onChange={setInr} format="in" decimals={2} />
      </div>
    );
  },
};

export const Affixes: Story = {
  name: 'Prefix / suffix',
  render: () => {
    const [amount, setAmount] = useState<number | null>(250000);
    const [weight, setWeight] = useState<number | null>(12.5);
    return (
      <div className="flex w-72 flex-col gap-3">
        <InputNumber value={amount} onChange={setAmount} prefix="$" decimals={2} min={0} />
        <InputNumber value={weight} onChange={setWeight} suffix="kg" decimals={1} />
      </div>
    );
  },
};