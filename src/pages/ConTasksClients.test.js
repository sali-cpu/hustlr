import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ConTasksClients from '../pages/ConTasksClients';
import * as firebase from 'firebase/database';
import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('../firebaseConfig', () => ({
  db: {},
}));

jest.mock('firebase/database', () => {
  const originalModule = jest.requireActual('firebase/database');
  return {
    ...originalModule,
    ref: jest.fn(),
    onValue: jest.fn(),
  };
});

// Mock Header and Footer
jest.mock('../components/HeaderClient', () => () => <div data-testid="header">Header</div>);
jest.mock('../components/FooterClient', () => () => <div data-testid="footer">Footer</div>);

describe('ConTasksClients', () => {
  const mockContracts = {
    job1: {
      title: 'Design Logo',
      description: 'Create a modern logo',
      budget: 500,
      deadline: '2025-06-01',
      clientUID: 'client123',
      freelancerUID: 'freelancer456',
      partnerName: 'John Doe',
      milestones: [
        { description: 'Sketches', amount: 200, status: 'completed' },
        { description: 'Final Design', amount: 300, status: 'pending' },
      ],
      status: 'active',
    },
    job2: {
      title: 'Build Website',
      description: 'E-commerce platform',
      budget: 2000,
      deadline: '2025-05-10',
      clientUID: 'client123',
      freelancerUID: 'freelancer789',
      partnerName: 'Jane Smith',
      milestones: [
        { description: 'Frontend', amount: 1000, status: 'completed' },
        { description: 'Backend', amount: 1000, status: 'completed' },
      ],
      status: 'completed',
    },
  };

  beforeEach(() => {
    jest.spyOn(Storage.prototype, 'getItem')
      .mockImplementation((key) => {
        if (key === 'userUID') return 'client123';
        if (key === 'userRole') return 'client';
        return null;
      });

    firebase.ref.mockReturnValue('ref');
    firebase.onValue.mockImplementation((ref, callback) => {
      callback({ val: () => mockContracts });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders header and footer', async () => {
    render(<ConTasksClients />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('displays current and previous jobs based on status', async () => {
    render(<ConTasksClients />);
    expect(await screen.findByText('Design Logo')).toBeInTheDocument(); // active job
    expect(await screen.findByText('Build Website')).toBeInTheDocument(); // previous job
  });

  it('expands and collapses job details when clicked', async () => {
    render(<ConTasksClients />);
    const toggleButton = await screen.findByText('Design Logo');

    fireEvent.click(toggleButton);
    expect(await screen.findByText(/Create a modern logo/)).toBeInTheDocument();
    expect(screen.getByText(/R500/)).toBeInTheDocument();
    expect(screen.getByText('Sketches - R200 - completed')).toBeInTheDocument();

    fireEvent.click(toggleButton); // collapse
    await waitFor(() => {
      expect(screen.queryByText(/Create a modern logo/)).not.toBeInTheDocument();
    });
  });

  it('shows empty message if no contracts for current or previous', () => {
    firebase.onValue.mockImplementation((ref, callback) => {
      callback({ val: () => ({}) });
    });

    render(<ConTasksClients />);
    expect(screen.getByText('No active jobs found.')).toBeInTheDocument();
    expect(screen.getByText('No previous jobs found.')).toBeInTheDocument();
  });
});
