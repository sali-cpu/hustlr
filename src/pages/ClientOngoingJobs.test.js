import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ClientOngoingJobs from '../pages/ClientOngoingJobs';

import { get, ref } from 'firebase/database';

// Mock Firebase and submodules
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn()
}));

// Mock firebaseConfig (just to avoid crashes)
jest.mock('../firebaseConfig', () => ({
  db: {},
  applications_db: {}
}));

// Mock Header and Footer
jest.mock('../components/HeaderClient', () => () => <div>MockHeader</div>);
jest.mock('../components/FooterClient', () => () => <div>MockFooter</div>);

describe('ClientOngoingJobs Component', () => {
  const mockJobData = {
    job1: {
      clientUID: 'testUID',
      jobTitle: 'Website Redesign',
      job_milestones: [
        {
          description: 'Initial Mockups',
          amount: '500',
          status: 'Done',
          dueDate: '2025-05-10'
        },
        {
          description: 'Final Delivery',
          amount: '1000',
          status: 'Pending',
          dueDate: '2025-06-10'
        }
      ]
    }
  };

  const mockSnapshot = {
    exists: () => true,
    forEach: (cb1) => {
      cb1({
        forEach: (cb2) => {
          cb2({
            key: 'job1',
            val: () => mockJobData.job1
          });
        }
      });
    }
  };

  beforeEach(() => {
    localStorage.setItem('userUID', 'testUID');
    get.mockResolvedValueOnce(mockSnapshot);
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders job information correctly from Firebase', async () => {
    render(<ClientOngoingJobs />);

    expect(screen.getByText('Ongoing Jobs')).toBeInTheDocument();
    expect(screen.getByText('Active work in progress')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Website Redesign')).toBeInTheDocument();
      expect(screen.getByText('Initial Mockups')).toBeInTheDocument();
      expect(screen.getByText('Final Delivery')).toBeInTheDocument();
      expect(screen.getByText('Completed: 1/2')).toBeInTheDocument();
      expect(screen.getByText('Total: $1,500')).toBeInTheDocument();
      expect(screen.getByText('Paid: $500')).toBeInTheDocument();
    });
  });

  it('displays message when no jobs are found', async () => {
    get.mockResolvedValueOnce({ exists: () => false });

    render(<ClientOngoingJobs />);

    await waitFor(() => {
      expect(screen.getByText('No ongoing jobs found.')).toBeInTheDocument();
    });
  });

  it('displays message when UID is missing', async () => {
    localStorage.removeItem('userUID');
    render(<ClientOngoingJobs />);

    await waitFor(() => {
      expect(screen.getByText('No ongoing jobs found.')).toBeInTheDocument();
    });
  });
});
