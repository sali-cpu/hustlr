import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import FreeOngoingJobs from './FreeOngoingJobs';
import * as firebase from 'firebase/database';

// Mock the Firebase database methods
jest.mock('firebase/database', () => {
  const originalModule = jest.requireActual('firebase/database');
  return {
    ...originalModule,
    ref: jest.fn(),
    get: jest.fn(),
  };
});

// Mock localStorage
beforeEach(() => {
  localStorage.setItem('userUID', 'freelancer123');
});

afterEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe('FreeOngoingJobs Component', () => {
  test('displays message when there are no ongoing jobs', async () => {
    firebase.get.mockResolvedValueOnce({
      exists: () => false,
    });

    render(<FreeOngoingJobs />);
    expect(screen.getByText(/ongoing jobs/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/no ongoing jobs found/i)).toBeInTheDocument();
    });
  });

  test('renders ongoing job with milestones', async () => {
    firebase.get.mockResolvedValueOnce({
      exists: () => true,
      forEach: (cb) => {
        const mockMilestones = [
          { description: 'Design phase', amount: '200', status: 'Done', dueDate: '2025-06-01' },
          { description: 'Implementation', amount: '300', status: 'Pending', dueDate: '2025-06-10' },
        ];

        const jobSnap = {
          key: 'job1',
          val: () => ({
            applicant_userUID: 'freelancer123',
            jobTitle: 'Test Project',
            job_milestones: mockMilestones,
          }),
        };

        const parentSnap = {
          forEach: (cbInner) => cbInner(jobSnap),
        };

        cb(parentSnap);
      },
    });

    render(<FreeOngoingJobs />);

    await waitFor(() => {
      expect(screen.getByText(/Test Project/)).toBeInTheDocument();
      expect(screen.getByText(/Design phase/)).toBeInTheDocument();
      expect(screen.getByText(/Implementation/)).toBeInTheDocument();
      expect(screen.getByText(/Completed: 1\/2/)).toBeInTheDocument();
      expect(screen.getByText(/Total: \$500/)).toBeInTheDocument();
      expect(screen.getByText(/Paid: \$200/)).toBeInTheDocument();
    });
  });
});
