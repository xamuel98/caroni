import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Pagination } from './Pagination';

const meta = {
  title: 'Navigation/Pagination',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(5);
    return <Pagination page={page} pageCount={20} onPageChange={setPage} />;
  },
};

export const FewPages: Story = {
  render: () => {
    const [page, setPage] = useState(2);
    return <Pagination page={page} pageCount={3} onPageChange={setPage} />;
  },
};

export const FirstPage: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return <Pagination page={page} pageCount={20} onPageChange={setPage} />;
  },
};

export const WithLabels: Story = {
  render: () => {
    const [page, setPage] = useState(5);
    return (
      <Pagination page={page} pageCount={20} onPageChange={setPage} showLabels />
    );
  },
};

export const WithEdges: Story = {
  render: () => {
    const [page, setPage] = useState(5);
    return (
      <Pagination page={page} pageCount={20} onPageChange={setPage} showEdges />
    );
  },
};

export const Full: Story = {
  render: () => {
    const [page, setPage] = useState(5);
    return (
      <Pagination
        page={page}
        pageCount={20}
        onPageChange={setPage}
        showLabels
        showEdges
      />
    );
  },
};

export const CustomLabels: Story = {
  render: () => {
    const [page, setPage] = useState(3);
    return (
      <Pagination
        page={page}
        pageCount={12}
        onPageChange={setPage}
        showLabels
        showEdges
        previousLabel="Back"
        nextLabel="Forward"
      />
    );
  },
};
