import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminReports from './AdminReports';
import { ref, get } from 'firebase/database';
import { applications_db } from '../firebaseConfig';
import HeaderAdmin from "../components/HeaderAdmin";

// Mock Firebase and components
jest.mock('firebase/database');
jest.mock('../components/HeaderAdmin', () => () => <div>HeaderAdmin</div>);

describe('AdminReports Component', () => {
  const mockUsers = {
    user1: {
      displayName: 'Client One',
      bio: 'Client bio',
      profession: 'Business Owner',
      skills: '',
      totalJobs: 5,
      role: 'Client'
    },
    user2: {
      displayName: 'Freelancer One',
      bio: 'Freelancer bio',
      profession: 'Web Developer',
      skills: 'JavaScript, React',
      totalJobs: 10,
      role: 'Freelancer'
    },
    user3: {
      displayName: 'Client Two',
      bio: 'Another client',
      profession: 'Entrepreneur',
      skills: '',
      totalJobs: 2,
      role: 'Client'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  test('renders loading state initially', () => {
    render(<AdminReports />);
    expect(screen.getByText('Admin User Management')).toBeInTheDocument();
  });

  test('fetches and displays users correctly', async () => {
    get.mockResolvedValue({
      exists: () => true,
      val: () => mockUsers
    });

    render(<AdminReports />);

    await waitFor(() => {
      // Check clients section
      expect(screen.getByText('Clients')).toBeInTheDocument();
      expect(screen.getByText('Business Owner')).toBeInTheDocument();
      expect(screen.getByText('Client bio')).toBeInTheDocument();
      expect(screen.getByText('Total Jobs: 5')).toBeInTheDocument();

      // Check freelancers section
      expect(screen.getByText('Freelancers')).toBeInTheDocument();
      expect(screen.getByText('Web Developer')).toBeInTheDocument();
      expect(screen.getByText('Freelancer bio')).toBeInTheDocument();
      expect(screen.getByText('Skills: JavaScript, React')).toBeInTheDocument();
      expect(screen.getByText('Total Jobs: 10')).toBeInTheDocument();
    });
  });

  test('handles no users found scenario', async () => {
    get.mockResolvedValue({
      exists: () => false,
      val: () => null
    });

    render(<AdminReports />);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('No users found.');
      expect(screen.getByText('No clients found.')).toBeInTheDocument();
      expect(screen.getByText('No freelancers found.')).toBeInTheDocument();
    });
  });

  test('handles fetch error', async () => {
    const errorMessage = 'Failed to fetch users';
    get.mockRejectedValue(new Error(errorMessage));

    render(<AdminReports />);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Error fetching users:', errorMessage);
    });
  });

  test('displays default values for missing data', async () => {
    const mockUsersWithMissingData = {
      user1: {
        displayName: 'Client One',
        role: 'Client'
      },
      user2: {
        displayName: 'Freelancer One',
        role: 'Freelancer'
      }
    };

    get.mockResolvedValue({
      exists: () => true,
      val: () => mockUsersWithMissingData
    });

    render(<AdminReports />);

    await waitFor(() => {
      expect(screen.getByText('Unknown Profession')).toBeInTheDocument();
      expect(screen.getByText('Bio: N/A')).toBeInTheDocument();
      expect(screen.getByText('Skills: N/A')).toBeInTheDocument();
      expect(screen.getByText('Total Jobs: 0')).toBeInTheDocument();
    });
  });

  test('correctly separates clients and freelancers', async () => {
    get.mockResolvedValue({
      exists: () => true,
      val: () => mockUsers
    });

    render(<AdminReports />);

    await waitFor(() => {
      const clientCards = screen.getAllByText(/Client:/i);
      const freelancerCards = screen.getAllByText(/Freelancer:/i);
      
      expect(clientCards).toHaveLength(2); // Two clients in mock data
      expect(freelancerCards).toHaveLength(1); // One freelancer in mock data
    });
  });
});
