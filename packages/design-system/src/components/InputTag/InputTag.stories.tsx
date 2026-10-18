import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { InputTag } from './InputTag';

const meta = {
  title: 'Forms/InputTag',
  component: InputTag,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof InputTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [tags, setTags] = useState<string[]>([]);
    return (
      <div className="w-80">
        <InputTag value={tags} onChange={setTags} />
      </div>
    );
  },
};

export const WithValue: Story = {
  name: 'With values',
  render: () => {
    const [tags, setTags] = useState<string[]>(['ada', 'grace', 'alan']);
    return (
      <div className="w-80">
        <InputTag value={tags} onChange={setTags} />
      </div>
    );
  },
};

export const Max: Story = {
  name: 'Max 3',
  render: () => {
    const [tags, setTags] = useState<string[]>(['one', 'two']);
    return (
      <div className="w-80">
        <InputTag value={tags} onChange={setTags} max={3} placeholder="Up to 3 tags" />
      </div>
    );
  },
};