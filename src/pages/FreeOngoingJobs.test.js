import { render, screen, waitFor } from '@testing-library/react';
import FreeOngoingJobs from './FreeOngoingJobs';
import { get } from 'firebase/database';

// Mock Firebase and localStorage
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
}));

jest.mock('../firebaseConfig', () => ({
  applications_db: {},
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock components
jest.mock('../components/HeaderClient', () => () => <header>Header Client</header>);
jest.mock('../components/FooterClient', () => () => <footer>Footer Client</footer>);

describe('FreeOngoingJobs', () => {
  beforeEach(() => {
    localStorage.getItem.mockClear();
    get.mockClear();
  });

  test('renders loading state initially', () => {
    localStorage.getItem.mockReturnValue('test-uid');
    get.mockImplementation(() => Promise.resolve({ exists: () => false }));

    render(<FreeOngoingJobs />);
    expect(screen.getByText('Ongoing Jobs')).toBeInTheDocument();
  });

  test('shows no jobs message when no jobs found', async () => {
    localStorage.getItem.mockReturnValue('test-uid');
    get.mockImplementation(() => Promise.resolve({ exists: () => false }));

    render(<FreeOngoingJobs />);
    
    await waitFor(() => {
      expect(screen.getByText('No ongoing jobs found.')).toBeInTheDocument();
    });
  });

  test('displays error message when user UID is not found', async () => {
    localStorage.getItem.mockReturnValue(null);
    
    render(<FreeOngoingJobs />);
    
    await waitFor(() => {
      expect(screen.getByText('No ongoing jobs found.')).toBeInTheDocument();
    });
  });

  test('displays ongoing jobs for freelancer when data is available', async () => {
    localStorage.getItem.mockReturnValue('test-freelancer-uid');
    
    const mockJobData = {
      exists: () => true,
      forEach: (callback) => {
        // Mock parent snapshot
        const parentSnapshot = {
          forEach: (jobCallback) => {
            // Mock job snapshot
            const jobSnapshot = {
              key: 'job1',
              val: () => ({
                applicant_userUID: 'test-freelancer-uid',
                jobTitle: 'Mobile App Development',
                job_milestones: [
                  { description: 'UI Design', amount: '1500', status: 'Done', dueDate: '2023-03-01' },
                  { description: 'Backend API', amount: '2500', status: 'In Progress', dueDate: '2023-04-01' },
                  { description: 'Testing', amount: '1000', status: 'Pending', dueDate: '2023-05-01' },
                ],
              }),
            };
            jobCallback(jobSnapshot);
          },
        };
        callback(parentSnapshot);
      },
    };
    
    get.mockImplementation(() => Promise.resolve(mockJobData));

    render(<FreeOngoingJobs />);
    
    await waitFor(() => {
      expect(screen.getByText('Mobile App Development')).toBeInTheDocument();
      expect(screen.getByText('UI Design')).toBeInTheDocument();
      expect(screen.getByText('Backend API')).toBeInTheDocument();
      expect(screen.getByText('Testing')).toBeInTheDocument();
      expect(screen.getByText('Total: $5,000')).toBeInTheDocument();
      expect(screen.getByText('Paid: $1,500')).toBeInTheDocument();
      expect(screen.getByText('Completed: 1/3')).toBeInTheDocument();
    });
  });

  test('only shows jobs for the current freelancer', async () => {
    localStorage.getItem.mockReturnValue('correct-freelancer-uid');
    
    const mockJobData = {
      exists: () => true,
      forEach: (callback) => {
        const parentSnapshot = {
          forEach: (jobCallback) => {
            // This job should be shown
            const correctJob = {
              key: 'job1',
              val: () => ({
                applicant_userUID: 'correct-freelancer-uid',
                jobTitle: 'Correct Job',
                job_milestones: [
                  { description: 'Milestone 1', amount: '1000', status: 'Done' },
                ],
              }),
            };
            
            // This job should NOT be shown
            const wrongJob = {
              key: 'job2',
              val: () => ({
                applicant_userUID: 'other-freelancer-uid',
                jobTitle: 'Wrong Job',
                job_milestones: [
                  { description: 'Milestone 1', amount: '2000', status: 'Done' },
                ],
              }),
            };
            
            jobCallback(correctJob);
            jobCallback(wrongJob);
          },
        };
        callback(parentSnapshot);
      },
    };
    
    get.mockImplementation(() => Promise.resolve(mockJobData));

    render(<FreeOngoingJobs />);
    
    await waitFor(() => {
      expect(screen.getByText('Correct Job')).toBeInTheDocument();
      expect(screen.queryByText('Wrong Job')).not.toBeInTheDocument();
    });
  });

  test('handles Firebase error gracefully', async () => {
    localStorage.getItem.mockReturnValue('test-uid');
    get.mockImplementation(() => Promise.reject(new Error('Firebase error')));

    render(<FreeOngoingJobs />);
    
    await waitFor(() => {
      expect(screen.getByText('No ongoing jobs found.')).toBeInTheDocument();
    });
  });

  test('renders navigation links correctly', () => {
    localStorage.getItem.mockReturnValue('test-uid');
    get.mockImplementation(() => Promise.resolve({ exists: () => false }));

    render(<FreeOngoingJobs />);
    
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/Freelancer');
  });
});
