import { render, screen, waitFor } from '@testing-library/react';
import ClientOngoingJobs from './ClientOngoingJobs';
import { get } from 'firebase/database';

// Mock Firebase and localStorage
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
}));

jest.mock('../firebaseConfig', () => ({
  db: {},
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

describe('ClientOngoingJobs', () => {
  beforeEach(() => {
    localStorage.getItem.mockClear();
    get.mockClear();
  });

  test('renders loading state initially', () => {
    localStorage.getItem.mockReturnValue('test-uid');
    get.mockImplementation(() => Promise.resolve({ exists: () => false }));

    render(<ClientOngoingJobs />);
    expect(screen.getByText('Ongoing Jobs')).toBeInTheDocument();
  });

  test('shows no jobs message when no jobs found', async () => {
    localStorage.getItem.mockReturnValue('test-uid');
    get.mockImplementation(() => Promise.resolve({ exists: () => false }));

    render(<ClientOngoingJobs />);
    
    await waitFor(() => {
      expect(screen.getByText('No ongoing jobs found.')).toBeInTheDocument();
    });
  });

  test('displays error message when user UID is not found', async () => {
    localStorage.getItem.mockReturnValue(null);
    
    render(<ClientOngoingJobs />);
    
    await waitFor(() => {
      expect(screen.getByText('No ongoing jobs found.')).toBeInTheDocument();
    });
  });

  test('displays ongoing jobs when data is available', async () => {
    localStorage.getItem.mockReturnValue('test-client-uid');
    
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
                clientUID: 'test-client-uid',
                jobTitle: 'Website Development',
                job_milestones: [
                  { description: 'Design', amount: '1000', status: 'Done', dueDate: '2023-01-01' },
                  { description: 'Development', amount: '2000', status: 'Pending', dueDate: '2023-02-01' },
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

    render(<ClientOngoingJobs />);
    
    await waitFor(() => {
      expect(screen.getByText('Website Development')).toBeInTheDocument();
      expect(screen.getByText('Design')).toBeInTheDocument();
      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Total: $3,000')).toBeInTheDocument();
      expect(screen.getByText('Paid: $1,000')).toBeInTheDocument();
      expect(screen.getByText('Completed: 1/2')).toBeInTheDocument();
    });
  });

  test('handles Firebase error gracefully', async () => {
    localStorage.getItem.mockReturnValue('test-uid');
    get.mockImplementation(() => Promise.reject(new Error('Firebase error')));

    render(<ClientOngoingJobs />);
    
    await waitFor(() => {
      expect(screen.getByText('No ongoing jobs found.')).toBeInTheDocument();
    });
  });

  test('renders navigation links correctly', () => {
    localStorage.getItem.mockReturnValue('test-uid');
    get.mockImplementation(() => Promise.resolve({ exists: () => false }));

    render(<ClientOngoingJobs />);
    
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/Client');
  });
});
