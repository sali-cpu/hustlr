import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import FQStats from './FQStats';
import { get, ref } from 'firebase/database';
import { applications_db } from '../firebaseConfig';

// Mock Firebase and subcomponents
jest.mock('firebase/database', () => ({
  get: jest.fn(),
  ref: jest.fn(),
}));

jest.mock('../firebaseConfig', () => ({
  applications_db: {},
}));

jest.mock('../components/HeaderFreelancer', () => () => <div>MockHeader</div>);
jest.mock('../components/FooterClient', () => () => <div>MockFooter</div>);

describe('FQStats Component', () => {
  const mockUserUID = 'test-user-123';
  
  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => mockUserUID);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders header and footer', () => {
    render(<FQStats />);
    expect(screen.getByText('MockHeader')).toBeInTheDocument();
    expect(screen.getByText('MockFooter')).toBeInTheDocument();
  });

  test('renders with default stats when no data is available', async () => {
    get.mockResolvedValue({ exists: () => false });
    
    render(<FQStats />);
    
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument(); // jobsApplied
      expect(screen.getByText('0%')).toBeInTheDocument(); // completionRate
    });
  });

  test('fetches and displays freelancer stats correctly', async () => {
    const mockApplications = {
      'job1': {
        'app1': { applicant_userUID: mockUserUID, status: 'pending' },
        'app2': { applicant_userUID: 'other-user', status: 'accepted' }
      },
      'job2': {
        'app3': { applicant_userUID: mockUserUID, status: 'accepted' }
      },
      'job3': {
        'app4': { applicant_userUID: mockUserUID, status: 'completed' }
      }
    };

    get.mockResolvedValue({
      exists: () => true,
      val: () => mockApplications
    });

    render(<FQStats />);
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // jobsApplied (app1 and app3)
      expect(screen.getByText('1')).toBeInTheDocument(); // activeJobs (app3)
      expect(screen.getByText('1')).toBeInTheDocument(); // completedJobs (app4)
    });
  });

  test('calculates stats from milestones correctly', async () => {
  const mockApplications = {
    job123: {
      app456: {
        applicant_userUID: 'test-user-123',
        status: 'accepted',
        job_milestones: {
          milestone1: { status: 'Done', amount: '100' },
          milestone2: { status: 'Done', amount: '150' },
          milestone3: { status: 'Done', amount: '200' }
        }
      }
    }
  };

  get.mockResolvedValue({
    exists: () => true,
    val: () => mockApplications
  });

  render(<FQStats />);

  await waitFor(() => {
    expect(screen.getByText('1')).toBeInTheDocument(); // jobsApplied
    expect(screen.getByText('1')).toBeInTheDocument(); // completedJobs
    expect(screen.getByText('$450')).toBeInTheDocument(); // totalEarned
    expect(screen.getByText('0')).toBeInTheDocument(); // activeJobs should be 0 after job completion
  });
});


  test('handles errors when fetching data', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    get.mockRejectedValue(new Error('Failed to fetch'));
    
    render(<FQStats />);
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error fetching freelancer stats:', 'Failed to fetch');
    });
    
    consoleError.mockRestore();
  });

  test('shows alert when no userUID is found', async () => {
    Storage.prototype.getItem = jest.fn(() => null);
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<FQStats />);
    
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('No userUID found.');
    });
    
    alertMock.mockRestore();
  });

  // Keep your existing tests
  test('renders the page title and navigation', () => {
    render(<FQStats />);
    expect(screen.getByRole('heading', { level: 1, name: /Freelancer Reports/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
  });

  test('renders statistics sections with appropriate headings', () => {
    render(<FQStats />);
    expect(screen.getByRole('heading', { name: /Jobs Applied to/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Active Jobs/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Completed Jobs/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Total Earned/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Completion Rate/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Earnings Trend/i })).toBeInTheDocument();
  });

  test('renders accessible chart for completion rate', () => {
    render(<FQStats />);
    const completionChart = screen.getByRole('img', { name: /completion rate/i });
    expect(completionChart).toBeInTheDocument();
  });

  test('renders accessible chart for earnings trend', () => {
    render(<FQStats />);
    const earningsChart = screen.getByRole('img', { name: /earnings growth over time/i });
    expect(earningsChart).toBeInTheDocument();
  });

  test('renders meter and progress bars with correct ARIA labels', () => {
    render(<FQStats />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-label', expect.stringContaining('jobs applied'));
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThanOrEqual(2);
    progressBars.forEach(bar => {
      expect(bar).toHaveAttribute('aria-label', expect.stringContaining('out of'));
    });
  });
});
