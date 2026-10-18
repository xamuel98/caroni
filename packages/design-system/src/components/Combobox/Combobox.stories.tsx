import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Combobox, type ComboboxOption } from './Combobox';
import { HelpText } from '../HelpText';
import { Label } from '../Label';

const people: ComboboxOption[] = [
  { value: 'ada', label: 'Ada Lovelace', description: 'ada@caroni.io' },
  { value: 'grace', label: 'Grace Hopper', description: 'grace@caroni.io' },
  { value: 'alan', label: 'Alan Turing', description: 'alan@caroni.io' },
  { value: 'katherine', label: 'Katherine Johnson', description: 'katherine@caroni.io' },
  { value: 'margaret', label: 'Margaret Hamilton', description: 'margaret@caroni.io' },
];

const meta = {
  title: 'Forms/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  args: { options: people },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Searchable select. A button trigger shows the current value and ' +
          'opens a popover with a filter field and a listbox. Type to filter, ' +
          '↑/↓ to move, Enter to pick, Esc to close. Pass `onQueryChange` for ' +
          'an async source.',
      },
    },
  },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string>();
    return (
      <div className="w-72">
        <Combobox options={people} value={value} onChange={setValue} />
      </div>
    );
  },
};

export const WithField: Story = {
  render: () => {
    const [value, setValue] = useState<string>('grace');
    return (
      <div className="w-72">
        <Label htmlFor="assignee">Assignee</Label>
        <div className="mt-1.5">
          <Combobox
            id="assignee"
            options={people}
            value={value}
            onChange={setValue}
            aria-describedby="assignee-help"
          />
        </div>
        <HelpText id="assignee-help">
          {value ? `Assigned to ${people.find((p) => p.value === value)?.label}` : 'Pick a teammate.'}
        </HelpText>
      </div>
    );
  },
};

export const Async: Story = {
  render: () => {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<ComboboxOption[]>([]);
    const [searching, setSearching] = useState(false);
    const [value, setValue] = useState<string>();

    useEffect(() => {
      const q = query.trim().toLowerCase();
      if (!q) {
        setOptions([]);
        return;
      }
      setSearching(true);
      const timer = setTimeout(() => {
        setOptions(people.filter((p) => p.label.toLowerCase().includes(q)));
        setSearching(false);
      }, 600);
      return () => clearTimeout(timer);
    }, [query]);

    return (
      <div className="w-72">
        <Combobox
          options={options}
          value={value}
          onChange={setValue}
          onQueryChange={setQuery}
          loading={searching}
          placeholder="Search people…"
          emptyMessage="No matches"
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="w-72">
      <Combobox options={people} value="ada" disabled />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="w-72">
      <Combobox options={[]} emptyMessage="No teammates yet" />
    </div>
  ),
};
export const Multiple: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['ada', 'grace']);
    return (
      <div className="w-72">
        <Combobox multiple options={people} value={value} onChange={setValue} clearable />
      </div>
    );
  },
};

export const ClearableLoading: Story = {
  name: 'Clearable + loading',
  render: () => {
    const [value, setValue] = useState<string | undefined>('ada');
    return (
      <div className="w-72">
        <Combobox options={people} value={value} onChange={setValue} clearable loading />
      </div>
    );
  },
};
