import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CQStats from './CQStats';
import { ref, get } from 'firebase/database';
import { db, applications_db } from '../firebaseConfig';
import '@testing-library/jest-dom';

// Mock components and Firebase
jest.mock('../components/HeaderClient', () => () => <div>Header</div>);
jest.mock('../components/FooterClient', () => () => <div>Footer</div>);
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
}));
jest.mock('../firebaseConfig', () => ({
  db: {},
  applications_db: {}
}));

describe('CQStats Component', () => {
  const mockUserUID = 'test-user-123';
  
  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => mockUserUID);
    jest.clearAllMocks();
  });

  test('renders basic structure', () => {
    render(<CQStats />);
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Client Reports' })).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('shows warning when no userUID is found', () => {
    Storage.prototype.getItem = jest.fn(() => null);
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    render(<CQStats />);
    
    expect(consoleWarn).toHaveBeenCalledWith('No userUID found.');
    consoleWarn.mockRestore();
  });

  test('displays default stats when no data is available', async () => {
    get.mockImplementation((dbRef) => {
      if (dbRef && dbRef.path === 'jobs') {
        return Promise.resolve({ exists: () => false });
      }
      return Promise.resolve({ exists: () => false });
    });

    render(<CQStats />);
    
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument(); // jobsPosted
      expect(screen.getByText('$0')).toBeInTheDocument(); // totalSpent
      expect(screen.getByText('0%')).toBeInTheDocument(); // completionRate
    });
  });

  test('fetches and displays job stats correctly', async () => {
    const mockJobs = {
      job1: { clientUID: mockUserUID, title: 'Test Job 1' },
      job2: { clientUID: 'other-user', title: 'Test Job 2' },
      job3: { clientUID: mockUserUID, title: 'Test Job 3' }
    };

    const mockAcceptedApps = {
      job1: {
        app1: { status: 'accepted' },
        app2: { status: 'rejected' }
      },
      job3: {
        app3: { status: 'accepted' }
      }
    };

    get.mockImplementation((dbRef) => {
      if (dbRef && dbRef.path === 'jobs') {
        return Promise.resolve({
          exists: () => true,
          val: () => mockJobs
        });
      }
      if (dbRef && dbRef.path === 'accepted_applications') {
        return Promise.resolve({
          exists: () => true,
          val: () => mockAcceptedApps
        });
      }
      return Promise.resolve({ exists: () => false });
    });

    render(<CQStats />);
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // jobsPosted
      expect(screen.getByText('2')).toBeInTheDocument(); // activeJobs
    });
  });

  test('handles Firebase errors gracefully', async () => {
    const error = new Error('Firebase error');
    get.mockRejectedValueOnce(error);
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<CQStats />);
    
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Error fetching job/application stats:', error.message);
    });
    alertMock.mockRestore();
  });

  test('renders all statistics sections', () => {
    render(<CQStats />);
    
    const sections = [
      'Jobs Posted',
      'Active Jobs',
      'Completed Jobs',
      'Total Spent',
      'Completion Rate',
      'Payments Trend'
    ];
    
    sections.forEach(section => {
      expect(screen.getByRole('heading', { name: section })).toBeInTheDocument();
    });
  });

  test('renders accessible progress indicators', () => {
    render(<CQStats />);
    
    expect(screen.getByRole('meter')).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar').length).toBe(2);
  });

  test('renders accessible charts', () => {
    render(<CQStats />);
    
    expect(screen.getByRole('img', { name: /completion rate/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /earnings growth/i })).toBeInTheDocument();
  });

  test('matches snapshot with default state', () => {
    const { asFragment } = render(<CQStats />);
    expect(asFragment()).toMatchSnapshot();
  });
});
