import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConTasksFreelancer from '../pages/ConTasksFreelancer';
import * as firebase from 'firebase/database';
import '@testing-library/jest-dom';

// Mock firebaseConfig import
jest.mock('../firebaseConfig', () => ({
  applications_db: {},
}));

// Mock Firebase database functions
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn(),
}));

// Mock header/footer components
jest.mock('../components/HeaderFreelancer', () => () => <div data-testid="header">Header</div>);
jest.mock('../components/FooterClient', () => () => <div data-testid="footer">Footer</div>);

describe('ConTasksFreelancer Component', () => {
  const mockData = {
    jobGroup1: {
      app1: {
        applicant_userUID: 'freelancer001',
        jobTitle: 'Logo Design',
        motivation: 'Excited to work on this!',
        name: 'Alice',
        surname: 'Brown',
        deadline: '2025-06-15',
        job_milestones: {
          ms1: { description: 'Draft', amount: 100, status: 'pending' },
          ms2: { description: 'Final', amount: 200, status: 'in-progress' },
        }
      },
      app2: {
        applicant_userUID: 'freelancer001',
        jobTitle: 'Old Project',
        motivation: 'Was completed',
        name: 'Alice',
        surname: 'Brown',
        deadline: '2025-03-01',
        job_milestones: {
          ms1: { description: 'Phase 1', amount: 100, status: 'completed' },
          ms2: { description: 'Phase 2', amount: 200, status: 'completed' },
        }
      },
      app3: {
        applicant_userUID: 'otherUser',
        jobTitle: 'Not Mine',
        motivation: 'Ignore',
        name: 'Bob',
        surname: 'Smith',
        job_milestones: {}
      }
    }
  };

  beforeEach(() => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'userUID') return 'freelancer001';
      return null;
    });

    firebase.ref.mockReturnValue('mockRef');
    firebase.onValue.mockImplementation((ref, callback) => {
      callback({
        exists: () => true,
        val: () => mockData,
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders headers and footers', () => {
    render(<ConTasksFreelancer />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('displays both active and previous jobs correctly', async () => {
    render(<ConTasksFreelancer />);
    expect(await screen.findByText('Logo Design')).toBeInTheDocument();
    expect(screen.getByText('Old Project')).toBeInTheDocument();
  });

  it('shows correct milestone and job details when expanded', async () => {
    render(<ConTasksFreelancer />);
    const toggleBtn = await screen.findByText('View Details');
    fireEvent.click(toggleBtn);

    expect(await screen.findByText(/Excited to work on this!/)).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Amount: R100')).toBeInTheDocument();
    expect(screen.getByText('Status: pending')).toBeInTheDocument();
  });

  it('shows no jobs message when there are no jobs', async () => {
    firebase.onValue.mockImplementation((ref, callback) => {
      callback({
        exists: () => false,
        val: () => null,
      });
    });

    render(<ConTasksFreelancer />);
    expect(await screen.findByText('No active jobs available.')).toBeInTheDocument();
    expect(screen.getByText('No previous jobs found.')).toBeInTheDocument();
  });
});
