import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminJobs from './AdminJobs';
import { get, remove } from 'firebase/database';
import { MemoryRouter } from 'react-router-dom';

// Mock Firebase
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}));

describe('AdminJobs Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders jobs fetched from Firebase', async () => {
    get.mockResolvedValueOnce({
      exists: () => true,
      val: () => ({
        job1: {
          title: 'Test Job 1',
          description: 'Description 1',
          category: 'Category 1',
          budget: '100',
          deadline: '2025-05-01',
        },
      }),
    });

    render(
      <MemoryRouter>
        <AdminJobs />
      </MemoryRouter>
    );

    expect(await screen.findByText('Test Job 1')).toBeInTheDocument();
    expect(screen.getByText(/Description 1/)).toBeInTheDocument();
    expect(screen.getByText(/Category 1/)).toBeInTheDocument();
    expect(screen.getByText(/\$100/)).toBeInTheDocument();
  });

  test('shows message when no jobs are available', async () => {
    get.mockResolvedValueOnce({
      exists: () => false,
    });

    render(
      <MemoryRouter>
        <AdminJobs />
      </MemoryRouter>
    );

    expect(await screen.findByText('No jobs available.')).toBeInTheDocument();
  });

  test('calls remove when delete button is clicked', async () => {
    get.mockResolvedValueOnce({
      exists: () => true,
      val: () => ({
        job1: {
          title: 'Test Job 1',
          description: 'Description 1',
          category: 'Category 1',
          budget: '100',
          deadline: '2025-05-01',
        },
      }),
    });

    remove.mockResolvedValueOnce();

    render(
      <MemoryRouter>
        <AdminJobs />
      </MemoryRouter>
    );

    const deleteButton = await screen.findByText('Delete Job Permanently');
    fireEvent.click(deleteButton);

    expect(remove).toHaveBeenCalled();
  });
});
