import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { HelpText } from '../HelpText';
import { Label } from '../Label';
import { Calendar, CalendarRange, type DateRange } from './Calendar';
import { DatePicker } from './DatePicker';
import { DateRangePicker } from './DateRangePicker';

const meta = {
  title: 'Forms/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Date fields built on a hand-rolled calendar (native `Date`, no date ' +
          'dependency). The header navigates to month and year pickers. ' +
          'Keyboard: arrows move by day/week, Home/End jump to the week edges, ' +
          'PageUp/PageDown change month, Enter selects.',
      },
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(undefined);
    return (
      <div className="w-72">
        <DatePicker value={date} onChange={setDate} />
      </div>
    );
  },
};

export const IconPositions: Story = {
  name: 'Icon position',
  render: () => {
    const [a, setA] = useState<Date | undefined>(new Date());
    return (
      <div className="flex w-72 flex-col gap-3">
        <DatePicker value={a} onChange={setA} iconPosition="start" />
        <DatePicker value={a} onChange={setA} iconPosition="end" />
        <DatePicker value={a} onChange={setA} iconPosition="none" />
      </div>
    );
  },
};

export const Formats: Story = {
  name: 'Date formats',
  render: () => {
    const [a, setA] = useState<Date | undefined>(new Date(2026, 9, 16));
    return (
      <div className="flex w-72 flex-col gap-3">
        <DatePicker value={a} onChange={setA} />
        <DatePicker value={a} onChange={setA} format={{ dateStyle: 'long' }} />
        <DatePicker value={a} onChange={setA} format={{ dateStyle: 'full' }} />
        <DatePicker value={a} onChange={setA} format={{ year: 'numeric', month: '2-digit', day: '2-digit' }} />
      </div>
    );
  },
};

export const Range: Story = {
  name: 'Date range',
  render: () => {
    const [range, setRange] = useState<DateRange>({});
    return (
      <div className="w-72">
        <DateRangePicker value={range} onChange={setRange} />
      </div>
    );
  },
};

export const RangeSingleMonth: Story = {
  name: 'Date range · 1 month',
  render: () => {
    const [range, setRange] = useState<DateRange>({});
    return (
      <div className="w-72">
        <DateRangePicker value={range} onChange={setRange} numberOfMonths={1} />
      </div>
    );
  },
};

export const Bounded: Story = {
  name: 'Min / max range',
  render: () => {
    const [date, setDate] = useState<Date | undefined>(undefined);
    return (
      <div className="w-72">
        <DatePicker
          value={date}
          onChange={setDate}
          min={new Date(2026, 9, 5)}
          max={new Date(2026, 9, 26)}
        />
        <p className="mt-2 text-[12px] text-text-muted">Only 5–26 October 2026 is selectable.</p>
      </div>
    );
  },
};

export const WithField: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <div className="w-72">
        <Label htmlFor="settle">Settlement date</Label>
        <div className="mt-1.5">
          <DatePicker id="settle" value={date} onChange={setDate} aria-describedby="settle-help" />
        </div>
        <HelpText id="settle-help">
          {date ? `Settles ${date.toDateString()}` : 'Choose when funds should settle.'}
        </HelpText>
      </div>
    );
  },
};

export const InlineCalendars: Story = {
  name: 'Calendar & range (inline)',
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [range, setRange] = useState<DateRange>({});
    return (
      <div className="flex flex-wrap gap-4">
        <div className="w-[280px] rounded-lg border border-border bg-surface-raised">
          <Calendar value={date} onChange={setDate} />
        </div>
        <div className="w-[280px] rounded-lg border border-border bg-surface-raised">
          <CalendarRange value={range} onChange={setRange} />
        </div>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="w-72">
      <DatePicker value={new Date()} disabled />
    </div>
  ),
};