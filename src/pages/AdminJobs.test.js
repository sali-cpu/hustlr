import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminJobs from './AdminJobs';
import { get, remove } from 'firebase/database';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';


global.MutationObserver = class {
    constructor() {}
    disconnect() {}
    observe() {}
  };

jest.mock('firebase/database', () => ({
    getDatabase: jest.fn(),  // ✅ Add this line
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

    test('calls remove and updates state when delete button is clicked', async () => {
  // Mock initial job data
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

  // Mock remove to succeed
  remove.mockResolvedValueOnce();

  // Mock alert to suppress actual popup
  window.alert = jest.fn();

  render(
    <MemoryRouter>
      <AdminJobs />
    </MemoryRouter>
  );

  // Ensure job is present
  expect(await screen.findByText('Test Job 1')).toBeInTheDocument();

  const deleteButton = screen.getByText('Delete Job Permanently');
  fireEvent.click(deleteButton);

  // 🔍 Assert .remove() was called
  expect(remove).toHaveBeenCalled();

  // 🔍 Assert alert was shown
  expect(window.alert).toHaveBeenCalledWith('Job deleted successfully.');

  // 🔍 Ensure the job is no longer rendered
  expect(screen.queryByText('Test Job 1')).not.toBeInTheDocument();
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

  test('shows alert when no jobs exist in database', async () => {
  // Mock get to return no jobs
  get.mockResolvedValueOnce({
    exists: () => false,
    val: () => null
  });

  // Mock window.alert
  const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

  render(
    <MemoryRouter>
      <AdminJobs />
    </MemoryRouter>
  );

  // Wait for the component to process the empty response
  await screen.findByText('No jobs available.');

  // Verify alert was shown
  expect(mockAlert).toHaveBeenCalledWith('No Jobs found.');
  
  // Clean up mock
  mockAlert.mockRestore();
});

test('shows error alert when job deletion fails', async () => {
  // Mock initial job data
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

  // Mock remove to reject with error
  const mockError = new Error('Deletion failed');
  remove.mockRejectedValueOnce(mockError);

  // Mock alert
  const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

  render(
    <MemoryRouter>
      <AdminJobs />
    </MemoryRouter>
  );

  // Click delete button
  const deleteButton = await screen.findByText('Delete Job Permanently');
  fireEvent.click(deleteButton);

  // Verify error handling
  expect(mockAlert).toHaveBeenCalledWith(mockError.message);
  
  // Verify job is still displayed (not removed from state)
  expect(screen.getByText('Test Job 1')).toBeInTheDocument();

  // Clean up mock
  mockAlert.mockRestore();
});

test('has working home navigation link', async () => {
  render(
    <MemoryRouter>
      <AdminJobs />
    </MemoryRouter>
  );

  const homeLink = screen.getByRole('link', { name: /home/i });
  expect(homeLink).toHaveAttribute('href', '/Admin');
});

test('renders jobs fetched from Firebase', async () => {
  // ... existing code
  await waitFor(() => {
    expect(screen.getByText('Test Job 1')).toBeInTheDocument();
  });
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
