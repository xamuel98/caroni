import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarGroup, type AvatarColor } from './Avatar';

// A clean bust silhouette on the brand accent — the demo "photo".
const PHOTO =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2080%2080'%3E%3Crect%20width='80'%20height='80'%20fill='%235B54E6'/%3E%3Ccircle%20cx='40'%20cy='30'%20r='13'%20fill='%23fff'%20fill-opacity='.95'/%3E%3Cpath%20d='M40%2048c-13.3%200-24%208.1-24%2018v14h48V66c0-9.9-10.7-18-24-18Z'%20fill='%23fff'%20fill-opacity='.95'/%3E%3C/svg%3E";

const COLORS: AvatarColor[] = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'];

const meta = {
  title: 'Display/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placeholder: Story = {};

export const Initials: Story = { args: { fallback: 'AL' } };

export const JohnDoe: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-2">
      <Avatar size="lg" color="info" />
      <span className="text-[12px] text-text-muted">John Doe</span>
    </div>
  ),
};

export const JaneDoe: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-2">
      <Avatar size="lg" color="accent" />
      <span className="text-[12px] text-text-muted">Jane Doe</span>
    </div>
  ),
};

export const WithImage: Story = {
  args: { src: PHOTO, alt: 'Ada Lovelace', fallback: 'AL' },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar size="xs" color="accent" />
      <Avatar size="sm" color="accent" />
      <Avatar size="md" color="accent" />
      <Avatar size="lg" color="accent" />
      <Avatar size="xl" color="accent" />
    </div>
  ),
};

export const SoftColors: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {COLORS.map((color) => (
        <Avatar key={color} color={color} />
      ))}
    </div>
  ),
};

export const SolidColors: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {COLORS.map((color) => (
        <Avatar key={color} color={color} variant="solid" />
      ))}
    </div>
  ),
};

export const AutoColor: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Katherine Johnson', 'Margaret Hamilton'].map(
        (name) => (
          <Avatar
            key={name}
            fallback={name
              .split(' ')
              .map((w) => w[0])
              .join('')
              .slice(0, 2)}
          />
        ),
      )}
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <AvatarGroup max={3} size="md">
      <Avatar src={PHOTO} alt="Ada Lovelace" fallback="AL" />
      <Avatar fallback="GH" />
      <Avatar fallback="AT" />
      <Avatar fallback="KJ" />
      <Avatar fallback="MH" />
    </AvatarGroup>
  ),
};
