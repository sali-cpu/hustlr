import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminReports from '../pages/AdminReports'; // adjust if path is different
import * as firebaseDatabase from 'firebase/database';
import '@testing-library/jest-dom/extend-expect';

// Mock firebaseConfig
jest.mock('../firebaseConfig', () => ({
  db: {},
  applications_db: {},
}));

// Mock firebase/database
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
}));

describe('AdminReports Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with mocked data', async () => {
    // Mock users data
    const usersData = {
      user1: {
        role: 'Client',
        bio: 'Experienced client',
        profession: 'Project Manager',
        skills: ['Planning'],
        totalJobs: 2,
      },
      user2: {
        role: 'Freelancer',
        bio: 'Skilled dev',
        profession: 'Developer',
        skills: ['React'],
        totalJobs: 3,
      },
    };

    // Mock jobs
    const jobsData = {
      job1: {
        title: 'Build website',
        description: 'E-commerce site',
        clientUID: 'user1',
      },
    };

    // Mock applications
    const applicationsData = {
      job1: {
        user2: {
          status: 'accepted',
          name: 'John Doe',
          job_milestones: {
            m1: { title: 'Design', description: 'UI design', status: 'Done' },
            m2: { title: 'Development', description: 'React dev', status: 'Paid' },
          },
        },
      },
    };

    // Simulate call order: get users → get jobs → get applications
    firebaseDatabase.get
      .mockResolvedValueOnce({ exists: () => true, val: () => usersData }) // users
      .mockResolvedValueOnce({ exists: () => true, val: () => jobsData }) // jobs
      .mockResolvedValueOnce({ exists: () => true, val: () => applicationsData }); // apps

    render(<AdminReports />);

    await waitFor(() => {
      expect(screen.getByText('Admin Contracts Management')).toBeInTheDocument();
      expect(screen.getByText('Clients')).toBeInTheDocument();
      expect(screen.getByText('Client 0')).toBeInTheDocument();
      expect(screen.getByText('Build website')).toBeInTheDocument();
      expect(screen.getByText('Freelancer: John Doe')).toBeInTheDocument();
      expect(screen.getByText('Design: UI design')).toBeInTheDocument();
      expect(screen.getByText('Development: React dev')).toBeInTheDocument();
    });
  });

  test('renders message if no clients found', async () => {
    firebaseDatabase.get
      .mockResolvedValueOnce({ exists: () => false }) // users
      .mockResolvedValueOnce({ exists: () => false }) // jobs
      .mockResolvedValueOnce({ exists: () => false }); // apps

    render(<AdminReports />);

    await waitFor(() => {
      expect(screen.getByText('No clients found.')).toBeInTheDocument();
    });
  });
});
