import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Autocomplete, type AutocompleteOption } from './Autocomplete';
import { HelpText } from '../HelpText';
import { Label } from '../Label';

const people: AutocompleteOption[] = [
  { value: 'ada', label: 'Ada Lovelace', description: '@ada · NG' },
  { value: 'grace', label: 'Grace Hopper', description: '@grace · KE' },
  { value: 'alan', label: 'Alan Turing', description: '@alan · NG' },
  { value: 'katherine', label: 'Katherine Johnson', description: '@katherine · KE' },
  { value: 'margaret', label: 'Margaret Hamilton', description: '@margaret · NG' },
];

const meta = {
  title: 'Forms/Autocomplete',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Accessible combobox (ARIA): type to filter, ↑/↓ to move, Enter to ' +
          'pick, Esc to close. Filters locally by default; pass `onQueryChange` ' +
          'to drive an async source.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string>();
    return (
      <div className="w-72">
        <Autocomplete
          options={people}
          value={value}
          onChange={setValue}
          placeholder="Find a recipient"
        />
      </div>
    );
  },
};

export const WithField: Story = {
  render: () => {
    const [value, setValue] = useState<string>();
    return (
      <div className="w-72">
        <Label htmlFor="recipient">Recipient</Label>
        <div className="mt-1.5">
          <Autocomplete
            id="recipient"
            options={people}
            value={value}
            onChange={setValue}
            placeholder="Name or @tag"
            aria-describedby="recipient-help"
          />
        </div>
        <HelpText id="recipient-help">
          {value ? `Sending to @${value}` : 'Start typing to search.'}
        </HelpText>
      </div>
    );
  },
};

export const Async: Story = {
  render: () => {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState(people);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
      const q = query.trim().toLowerCase();
      if (!q) {
        setOptions(people);
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
<Autocomplete
          options={options}
          onQueryChange={setQuery}
          loading={searching}
          placeholder="Search people..."
          emptyMessage="No matches"
        />
      </div>
    );
  },
};

export const Empty: Story = {
  render: () => (
    <div className="w-72">
      <Autocomplete options={[]} placeholder="Find a recipient" emptyMessage="No recipients yet" />
    </div>
  ),
};

export const Multiple: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['ada']);
    return (
      <div className="w-72">
        <Autocomplete multiple options={people} value={value} onChange={setValue} placeholder="Add recipients" />
      </div>
    );
  },
};
