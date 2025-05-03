import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminJobs from '../pages/AdminJobs';
import { db } from '../firebaseConfig';
import { ref, get, remove } from 'firebase/database';

// Mock the Firebase methods
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
  remove: jest.fn()
}));

jest.mock('../firebaseConfig', () => ({
  db: {}
}));

jest.mock('../components/HeaderAdmin', () => () => <div>HeaderAdmin</div>);

describe('AdminJobs Component', () => {
  const mockJobData = {
    job1: {
      title: 'Test Job 1',
      description: 'Test Description 1',
      category: 'Development',
      budget: 100,
      deadline: '2025-12-31',
    },
    job2: {
      title: 'Test Job 2',
      description: 'Test Description 2',
      category: 'Design',
      budget: 200,
      deadline: '2025-11-30',
    },
  };

  beforeEach(() => {
    get.mockResolvedValueOnce({
      exists: () => true,
      val: () => mockJobData,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders jobs fetched from Firebase', async () => {
    render(<AdminJobs />);

    // Wait for jobs to be loaded
    expect(await screen.findByText('Test Job 1')).toBeInTheDocument();
    expect(screen.getByText('Test Job 2')).toBeInTheDocument();
  });

  test('shows message when no jobs are available', async () => {
    get.mockResolvedValueOnce({
      exists: () => false,
    });

    render(<AdminJobs />);
    expect(await screen.findByText('No jobs available.')).toBeInTheDocument();
  });

  test('calls remove when delete button is clicked', async () => {
    remove.mockResolvedValueOnce();

    render(<AdminJobs />);
    const deleteButton = await screen.findAllByText('Delete Job Permanently');

    fireEvent.click(deleteButton[0]);

    await waitFor(() => {
      expect(remove).toHaveBeenCalledTimes(1);
    });
  });
});
