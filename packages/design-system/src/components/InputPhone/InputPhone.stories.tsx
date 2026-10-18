import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { HelpText } from '../HelpText';
import { Label } from '../Label';
import { InputPhone } from './InputPhone';

const meta = {
  title: 'Forms/InputPhone',
  component: InputPhone,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Phone field with a searchable country-code dropdown. The trigger ' +
          'shows the flag + dial code; the list shows flag + name + dial code. ' +
          'Flags are the local circle-flags set (no runtime fetch).',
      },
    },
  },
} satisfies Meta<typeof InputPhone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div className="w-72">
        <InputPhone value={value} onChange={setValue} defaultCountry="NG" />
      </div>
    );
  },
};

export const WithField: Story = {
  render: () => {
    const [value, setValue] = useState('803 123 4567');
    const [country, setCountry] = useState('KE');
    return (
      <div className="w-72">
        <Label htmlFor="phone">Phone number</Label>
        <div className="mt-1.5">
          <InputPhone
            id="phone"
            value={value}
            onChange={setValue}
            country={country}
            onCountryChange={setCountry}
            aria-describedby="phone-help"
          />
        </div>
        <HelpText id="phone-help">
          We&apos;ll text a verification code to {country} +{value.replace(/\s/g, '')}.
        </HelpText>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="w-72">
      <InputPhone value="803 123 4567" defaultCountry="NG" disabled />
    </div>
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className="w-72">
      <InputPhone value="12" defaultCountry="US" aria-invalid />
    </div>
  ),
};
export const Loading: Story = {
  render: () => (
    <div className="w-72">
      <InputPhone value="" onChange={() => {}} defaultCountry="NG" loading />
    </div>
  ),
};
