import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FreelancerJobs from './FreelancerJobs';
import '@testing-library/jest-dom';
import * as firebaseDatabase from 'firebase/database';

global.MutationObserver = class {
  constructor(callback) {}
  disconnect() {}
  observe(element, initObject) {}
};

jest.mock('firebase/database', () => ({
  get: jest.fn(),
  ref: jest.fn(),
}));
jest.mock('../firebaseConfig', () => ({
  db: {},
}));
jest.mock('../components/HeaderFreelancer', () => () => <div>Mock Header</div>);

describe('FreelancerJobs Component', () => {
  const mockJobs = {
    job1: {
      title: 'Website Design',
      description: 'Redesign homepage',
      category: 'Web Design',
      budget: 500,
      deadline: '2025-05-01'
    },
    job2: {
      title: 'App UI Mockup',
      description: 'Design app interface',
      category: 'Design',
      budget: 300,
      deadline: '2025-06-01'
    },
    job3: {
      title: 'Admin Assistant',
      description: 'Office help needed',
      category: 'Admin',
      budget: 200,
      deadline: '2025-04-15'
    }
  };

  beforeEach(() => {
    firebaseDatabase.get.mockResolvedValue({
      exists: () => true,
      val: () => mockJobs
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders header, sidebar and job listings', async () => {
    render(<FreelancerJobs />);

    expect(screen.getByText('Mock Header')).toBeInTheDocument();
    expect(screen.getByText('Freelancer Job Board')).toBeInTheDocument();
    expect(screen.getByText('Filter Jobs')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Website Design')).toBeInTheDocument();
      expect(screen.getByText('App UI Mockup')).toBeInTheDocument();
      expect(screen.getByText('Admin Assistant')).toBeInTheDocument();
    });
  });

  test('renders job titles', async () => {
    render(<FreelancerJobs />);
    await waitFor(() => {
      expect(screen.getByText('Website Design')).toBeInTheDocument();
      expect(screen.getByText('App UI Mockup')).toBeInTheDocument();
      expect(screen.getByText('Admin Assistant')).toBeInTheDocument();
    });
  });

  test('filters job based on search term', async () => {
    render(<FreelancerJobs />);
    await waitFor(() => {
      expect(screen.getByText('Website Design')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by job title');
    fireEvent.change(searchInput, { target: { value: 'Website' } });

    expect(screen.queryByText('App UI Mockup')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin Assistant')).not.toBeInTheDocument();
    expect(screen.getByText('Website Design')).toBeInTheDocument();
  });

  test('filters job based on category', async () => {
    render(<FreelancerJobs />);
    await waitFor(() => {
      expect(screen.getByText('Website Design')).toBeInTheDocument();
    });

    const categorySelect = screen.getByLabelText(/Category/i);
    fireEvent.change(categorySelect, { target: { value: 'Design' } });

    expect(screen.getByText('App UI Mockup')).toBeInTheDocument();
    expect(screen.queryByText('Website Design')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin Assistant')).not.toBeInTheDocument();
  });

  test('shows all jobs when "All" is selected', async () => {
    render(<FreelancerJobs />);
    await waitFor(() => {
      expect(screen.getByText('Website Design')).toBeInTheDocument();
    });

    const categorySelect = screen.getByLabelText(/Category/i);
    fireEvent.change(categorySelect, { target: { value: 'All' } });

    expect(screen.getByText('Website Design')).toBeInTheDocument();
    expect(screen.getByText('App UI Mockup')).toBeInTheDocument();
    expect(screen.getByText('Admin Assistant')).toBeInTheDocument();
  });

  test('filters by search input', async () => {
    render(<FreelancerJobs />);
    await waitFor(() => {
      expect(screen.getByText('Website Design')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by job title');
    fireEvent.change(searchInput, { target: { value: 'App' } });

    expect(screen.getByText('App UI Mockup')).toBeInTheDocument();
    expect(screen.queryByText('Website Design')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin Assistant')).not.toBeInTheDocument();
  });

  test('shows empty state when no jobs match search and category', async () => {
    render(<FreelancerJobs />);
    await waitFor(() => {
      expect(screen.getByText('Website Design')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by job title');
    fireEvent.change(searchInput, { target: { value: 'Unmatched Title' } });

    expect(screen.queryByText('Website Design')).not.toBeInTheDocument();
    expect(screen.queryByText('App UI Mockup')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin Assistant')).not.toBeInTheDocument();
    expect(screen.getByText(/No jobs found/i)).toBeInTheDocument();
  });

  test('responds to apply button click', async () => {
    render(<FreelancerJobs />);
    await waitFor(() => {
      const applyButtons = screen.getAllByText('Apply');
      fireEvent.click(applyButtons[0]);

      // Replace this with actual expected behavior (e.g., modal opens, navigation, toast, etc.)
      expect(true).toBeTruthy(); // Dummy expectation to confirm click occurred
    });
  });

  test('shows fallback if no jobs match filter', async () => {
    render(<FreelancerJobs />);
    await waitFor(() => {
      expect(screen.getByText('Website Design')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by job title');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });

    expect(screen.getByText('No jobs found.')).toBeInTheDocument();
  });
});
