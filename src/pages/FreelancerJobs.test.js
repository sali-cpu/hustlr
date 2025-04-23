import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FreelancerJobs from './FreelancerJobs';
import '@testing-library/jest-dom';
import * as firebaseDatabase from 'firebase/database';

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
    expect(screen.getByText('Website Design')).toBeInTheDocument();
  });

  test('filters job based on category', async () => {
    render(<FreelancerJobs />);

    await waitFor(() => {
      expect(screen.getByText('Website Design')).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/Category/i);
    fireEvent.change(select, { target: { value: 'Design' } });

    expect(screen.queryByText('Website Design')).not.toBeInTheDocument();
    expect(screen.getByText('App UI Mockup')).toBeInTheDocument();
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
