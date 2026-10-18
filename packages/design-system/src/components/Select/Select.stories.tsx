import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { HelpText } from '../HelpText';
import { Label } from '../Label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './Select';

const meta = {
  title: 'Forms/Select',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select defaultValue="ngn">
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ngn">NGN — Naira</SelectItem>
        <SelectItem value="kes">KES — Shilling</SelectItem>
        <SelectItem value="usd">USD — Dollar</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithPlaceholder: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Select a branch" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ng">Lagos · NG</SelectItem>
        <SelectItem value="ke">Nairobi · KE</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Grouped: Story = {
  render: () => (
    <Select defaultValue="ngn">
      <SelectTrigger className="w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Africa</SelectLabel>
          <SelectItem value="ngn">NGN — Naira</SelectItem>
          <SelectItem value="kes">KES — Shilling</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Other</SelectLabel>
          <SelectItem value="usd">USD — Dollar</SelectItem>
          <SelectItem value="eur" disabled>
            EUR — Euro (coming soon)
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className="w-56">
      <Label htmlFor="tier">Tier</Label>
      <div className="mt-1.5">
        <Select>
          <SelectTrigger id="tier" className="w-full" aria-invalid aria-describedby="tier-help">
            <SelectValue placeholder="Select a tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Tier 1</SelectItem>
            <SelectItem value="2">Tier 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <HelpText id="tier-help" tone="danger">
        A tier is required to continue.
      </HelpText>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled defaultValue="ngn">
      <SelectTrigger className="w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ngn">NGN — Naira</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Clearable: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div className="w-72">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger clearable={Boolean(value)} onClear={() => setValue('')}>
            <SelectValue placeholder="Pick a channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="meta">Meta</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="google">Google Ads</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  },
};

export const Loading: Story = {
  render: () => (
    <div className="w-72">
      <Select>
        <SelectTrigger loading>
          <SelectValue placeholder="Loading channels…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="meta">Meta</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
