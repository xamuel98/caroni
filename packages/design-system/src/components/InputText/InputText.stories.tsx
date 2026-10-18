import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import {
  AtSymbolIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
} from '@heroicons/react/20/solid';
import { HelpText } from '../HelpText';
import { InputText } from './InputText';
import { Label } from '../Label';
import { Spinner } from '../Spinner';
import { IconSwap } from '../Transitions';

const meta = {
  title: 'Forms/InputText',
  component: InputText,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { placeholder: 'you@example.com' },
  render: (args) => (
    <div className="w-72">
      <InputText {...args} />
    </div>
  ),
} satisfies Meta<typeof InputText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = { args: { defaultValue: 'ada@caroni.dev' } };

export const Invalid: Story = {
  args: {
    defaultValue: 'not-an-email',
    'aria-invalid': true,
  },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: 'Locked' } };

export const PrependIcon: Story = {
  args: { startIcon: <MagnifyingGlassIcon />, placeholder: 'Search transfers' },
};

export const AppendIcon: Story = {
  args: { endIcon: <CheckCircleIcon className="text-success" />, defaultValue: 'ada@caroni' },
};

/** Async availability check: spinner while checking, then a solid check or x. */
export const Availability: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

    useEffect(() => {
      if (value.trim().length < 3) {
        setStatus('idle');
        return;
      }
      setStatus('checking');
      const timer = setTimeout(() => {
        setStatus(['ada', 'grace', 'alan'].includes(value.trim().toLowerCase()) ? 'taken' : 'available');
      }, 900);
      return () => clearTimeout(timer);
    }, [value]);

    return (
      <div className="w-72">
        <Label htmlFor="tag">Caroni tag</Label>
        <div className="mt-1.5">
          <InputText
            id="tag"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="yourname"
            autoComplete="off"
            aria-invalid={status === 'taken'}
            aria-describedby="tag-help"
            startIcon={<AtSymbolIcon />}
            endIcon={
              <IconSwap
                value={status}
                items={[
                  { key: 'checking', node: <Spinner className="text-text-muted" /> },
                  { key: 'available', node: <CheckCircleIcon className="text-success" /> },
                  { key: 'taken', node: <XCircleIcon className="text-danger" /> },
                ]}
              />
            }
          />
        </div>
        <HelpText
          id="tag-help"
          tone={status === 'taken' ? 'danger' : status === 'available' ? 'success' : 'default'}
        >
          {status === 'checking'
            ? 'Checking availability…'
            : status === 'available'
              ? `@${value} is available`
              : status === 'taken'
                ? `@${value} is already taken`
                : 'Letters and numbers, at least 3 characters.'}
        </HelpText>
      </div>
    );
  },
};

export const FormField: Story = {
  render: () => (
    <div className="w-72">
      <Label htmlFor="email">Email address</Label>
      <div className="mt-1.5">
        <InputText
          id="email"
          type="email"
          placeholder="you@example.com"
          aria-describedby="email-help"
        />
      </div>
      <HelpText id="email-help">We’ll only use this for transfer receipts.</HelpText>
    </div>
  ),
};
