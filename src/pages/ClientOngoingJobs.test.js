import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ClientOngoingJobs from '../pages/ClientOngoingJobs';
import { get, ref } from 'firebase/database';

// Mock Firebase and submodules
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn()
}));

// Mock firebaseConfig
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
      job_milestones: {
        0: {
          description: 'Initial Mockups',
          amount: '500',
          status: 'Done',
          dueDate: '2025-05-10'
        },
        1: {
          description: 'Final Delivery',
          amount: '1000',
          status: 'Pending',
          dueDate: '2025-06-10'
        }
      }
    },
    job2: {
      clientUID: 'testUID',
      jobTitle: 'Mobile App',
      job_milestones: {
        0: {
          description: 'UI Design',
          amount: '800',
          status: 'Done',
          dueDate: '2025-05-15'
        }
      }
    }
  };

  const createMockSnapshot = (data) => ({
    exists: () => true,
    forEach: (cb1) => {
      Object.entries(data).forEach(([jobId, jobData]) => {
        cb1({
          forEach: (cb2) => {
            cb2({
              key: jobId,
              val: () => jobData
            });
          }
        });
      });
    }
  });

  beforeEach(() => {
    localStorage.setItem('userUID', 'testUID');
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders job information correctly from Firebase', async () => {
    get.mockResolvedValueOnce(createMockSnapshot(mockJobData));
    render(<ClientOngoingJobs />);

    await waitFor(() => {
      expect(screen.getByText('Website Redesign')).toBeInTheDocument();
      expect(screen.getByText('Initial Mockups')).toBeInTheDocument();
      expect(screen.getByText('Final Delivery')).toBeInTheDocument();
      expect(screen.getByText('Completed: 1/2')).toBeInTheDocument();
      expect(screen.getByText('Total: $1,500')).toBeInTheDocument();
      expect(screen.getByText('Paid: $500')).toBeInTheDocument();
    });
  });

  it('handles multiple jobs correctly', async () => {
    get.mockResolvedValueOnce(createMockSnapshot(mockJobData));
    render(<ClientOngoingJobs />);

    await waitFor(() => {
      expect(screen.getByText('Website Redesign')).toBeInTheDocument();
      expect(screen.getByText('Mobile App')).toBeInTheDocument();
      expect(screen.getAllByText(/Completed: /)).toHaveLength(2);
    });
  });

  it('displays message when no jobs are found', async () => {
    get.mockResolvedValueOnce({ exists: () => false });
    render(<ClientOngoingJobs />);

    await waitFor(() => {
      expect(screen.getByText('No ongoing jobs found.')).toBeInTheDocument();
    });
  });

  it('handles jobs without milestones', async () => {
    const jobWithoutMilestones = {
      job3: {
        clientUID: 'testUID',
        jobTitle: 'Broken Job',
        job_milestones: null
      }
    };
    get.mockResolvedValueOnce(createMockSnapshot(jobWithoutMilestones));
    render(<ClientOngoingJobs />);

    await waitFor(() => {
      expect(screen.getByText('Broken Job')).toBeInTheDocument();
      expect(screen.queryByText(/Completed: /)).not.toBeInTheDocument();
    });
  });

  it('handles Firebase errors gracefully', async () => {
    get.mockRejectedValueOnce(new Error('Firebase error'));
    console.error = jest.fn(); // Suppress error logging
    
    render(<ClientOngoingJobs />);

    await waitFor(() => {
      expect(screen.getByText('No ongoing jobs found.')).toBeInTheDocument();
    });
  });

  it('handles jobs with missing milestone data', async () => {
    const incompleteJob = {
      job4: {
        clientUID: 'testUID',
        jobTitle: 'Incomplete Job',
        job_milestones: {
          0: {
            // Missing description and amount
            status: 'Pending'
          }
        }
      }
    };
    get.mockResolvedValueOnce(createMockSnapshot(incompleteJob));
    render(<ClientOngoingJobs />);

    await waitFor(() => {
      expect(screen.getByText('Incomplete Job')).toBeInTheDocument();
      expect(screen.getByText('Milestone 1')).toBeInTheDocument(); // Default name
      expect(screen.getByText('Total: $0')).toBeInTheDocument();
    });
  });

  it('filters out jobs for other clients', async () => {
    const mixedJobs = {
      ...mockJobData,
      job3: {
        clientUID: 'otherUID', // Different client
        jobTitle: 'Other Client Job',
        job_milestones: {
          0: {
            description: 'Task 1',
            amount: '300',
            status: 'Done'
          }
        }
      }
    };
    get.mockResolvedValueOnce(createMockSnapshot(mixedJobs));
    render(<ClientOngoingJobs />);

    await waitFor(() => {
      expect(screen.getByText('Website Redesign')).toBeInTheDocument();
      expect(screen.getByText('Mobile App')).toBeInTheDocument();
      expect(screen.queryByText('Other Client Job')).not.toBeInTheDocument();
    });
  });
});

describe('ClientOngoingJobs Initial State', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('initializes with empty ongoingJobs array', () => {
    render(<ClientOngoingJobs />);
    
    // Verify no jobs are shown initially (before data loads)
    expect(screen.getByText('No ongoing jobs found.')).toBeInTheDocument();
  });

  test('shows loading state before data is fetched', async () => {
    // Mock a delayed response to test initial render
    get.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<ClientOngoingJobs />);
    
    // Should show empty state initially
    expect(screen.getByText('No ongoing jobs found.')).toBeInTheDocument();
  });

  test('handles missing userUID in localStorage', async () => {
    localStorage.clear(); // Ensure no userUID
    
    render(<ClientOngoingJobs />);
    
    await waitFor(() => {
      expect(screen.getByText('No ongoing jobs found.')).toBeInTheDocument();
      expect(get).not.toHaveBeenCalled(); // Shouldn't try to fetch without userUID
    });
  });
});
