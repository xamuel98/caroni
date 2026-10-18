import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

const meta = {
  title: 'Navigation/Tabs',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="all" className="w-80">
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="held">Held</TabsTrigger>
        <TabsTrigger value="failed">Failed</TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="pt-4 text-[13px] text-text-secondary">
        42 transfers
      </TabsContent>
      <TabsContent value="held" className="pt-4 text-[13px] text-text-secondary">
        3 transfers awaiting review
      </TabsContent>
      <TabsContent value="failed" className="pt-4 text-[13px] text-text-secondary">
        No failed transfers
      </TabsContent>
    </Tabs>
  ),
};

export const WithoutIndicator: Story = {
  render: () => (
    <Tabs defaultValue="a">
      <TabsList indicator={false}>
        <TabsTrigger value="a" className="data-[state=active]:bg-surface-raised">
          Overview
        </TabsTrigger>
        <TabsTrigger value="b" className="data-[state=active]:bg-surface-raised">
          Activity
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-80">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="archived" disabled>
          Archived
        </TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="pt-3 text-[13px] text-text-secondary">
        Overview panel
      </TabsContent>
      <TabsContent value="settings" className="pt-3 text-[13px] text-text-secondary">
        Settings panel
      </TabsContent>
    </Tabs>
  ),
};

export const WithIndicators: Story = {
  name: 'With indicators',
  render: () => (
    <Tabs defaultValue="all" className="w-96">
      <TabsList>
        <TabsTrigger value="all" indicator={<Badge size="sm" variant="neutral">24</Badge>}>
          All
        </TabsTrigger>
        <TabsTrigger value="active" indicator={<Badge size="sm" variant="success">8</Badge>}>
          Active
        </TabsTrigger>
        <TabsTrigger value="failed" indicator={<Badge size="sm" variant="danger">2</Badge>}>
          Failed
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="pt-3 text-[13px] text-text-secondary">
        All transfers
      </TabsContent>
    </Tabs>
  ),
};
