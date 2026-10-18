import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Bars3BottomLeftIcon,
  Bars3Icon,
  Squares2X2Icon,
} from '@heroicons/react/20/solid';
import { Button } from '../Button';
import { ButtonGroup } from './ButtonGroup';
import { IconButton } from '../IconButton';

const meta = {
  title: 'Primitives/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="secondary">Day</Button>
      <Button variant="secondary">Week</Button>
      <Button variant="secondary">Month</Button>
    </ButtonGroup>
  ),
};

export const IconButtons: Story = {
  render: () => (
    <ButtonGroup>
      <IconButton aria-label="List" variant="secondary">
        <Bars3BottomLeftIcon />
      </IconButton>
      <IconButton aria-label="Grid" variant="secondary">
        <Squares2X2Icon />
      </IconButton>
      <IconButton aria-label="Rows" variant="secondary">
        <Bars3Icon />
      </IconButton>
    </ButtonGroup>
  ),
};

export const Segmented: Story = {
  render: () => {
    const [range, setRange] = useState('week');
    return (
      <ButtonGroup>
        {['day', 'week', 'month'].map((r) => (
          <Button
            key={r}
            variant={range === r ? 'primary' : 'secondary'}
            onClick={() => setRange(r)}
            className="capitalize"
          >
            {r}
          </Button>
        ))}
      </ButtonGroup>
    );
  },
};

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="secondary">Copy</Button>
      <Button variant="secondary">Duplicate</Button>
      <Button variant="secondary">Delete</Button>
    </ButtonGroup>
  ),
};
