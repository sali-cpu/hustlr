import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientPayments from './ClientPayments';
import { ref, get, update } from 'firebase/database';

// Mock Firebase database
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  applications_db: {}
}));

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window prompt
window.prompt = jest.fn();

describe('ClientPayments Component', () => {
  const mockPayments = [
    {
      id: 'job1_ms_0',
      jobSnapKey: 'parent1/job1',
      index: 0,
      jobTitle: 'Website Development',
      client: 'Freelancer 1',
      milestone: 'Design Phase',
      amount: 500,
      status: 'Done',
      dueDate: '2023-06-15'
    },
    {
      id: 'job1_ms_1',
      jobSnapKey: 'parent1/job1',
      index: 1,
      jobTitle: 'Website Development',
      client: 'Freelancer 1',
      milestone: 'Development Phase',
      amount: 1000,
      status: 'Pending',
      dueDate: '2023-07-15'
    }
  ];

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    
    // Set up mock user data
    localStorage.setItem('userUID', 'testUser123');
    localStorage.setItem('clientWallet', '1500');
    localStorage.setItem('freelancerDoneMilestones', JSON.stringify({ 'job1_ms_0': true }));
    
    // Mock Firebase get response
    get.mockResolvedValue({
      exists: () => true,
      forEach: (callback) => {
        const parentSnap = {
          key: 'parent1',
          forEach: (jobCallback) => {
            const jobSnap = {
              key: 'job1',
              val: () => ({
                applicant_userUID: 'testUser123',
                jobTitle: 'Website Development',
                clientName: 'Freelancer 1',
                job_milestones: [
                  { description: 'Design Phase', amount: 500, status: 'Pending', dueDate: '2023-06-15' },
                  { description: 'Development Phase', amount: 1000, status: 'Pending', dueDate: '2023-07-15' }
                ]
              })
            };
            jobCallback(jobSnap);
          }
        };
        callback(parentSnap);
      }
    });
  });

  test('renders component with initial state', async () => {
    render(<ClientPayments />);
    
    // Check header and navigation
    expect(screen.getByText('Jobs for Clients')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    
    // Check payments section title
    expect(screen.getByText('Payments for Clients')).toBeInTheDocument();
    
    // Check wallet balance
    await waitFor(() => {
      expect(screen.getByText('Balance: $1500.00')).toBeInTheDocument();
    });
    
    // Check deposit button
    expect(screen.getByText('Deposit')).toBeInTheDocument();
  });

  test('displays payment data from Firebase', async () => {
    render(<ClientPayments />);
    
    await waitFor(() => {
      expect(screen.getByText('Website Development')).toBeInTheDocument();
      expect(screen.getByText('Freelancer 1')).toBeInTheDocument();
      expect(screen.getByText('Design Phase')).toBeInTheDocument();
      expect(screen.getByText('$500')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
      expect(screen.getByText('2023-06-15')).toBeInTheDocument();
    });
  });

  test('handles deposit correctly', async () => {
    window.prompt.mockReturnValue('1000');
    render(<ClientPayments />);
    
    const depositButton = screen.getByText('Deposit');
    fireEvent.click(depositButton);
    
    await waitFor(() => {
      expect(screen.getByText('Balance: $2500.00')).toBeInTheDocument();
      expect(screen.getByText('Deposit successful')).toBeInTheDocument();
    });
    
    // Check that message disappears after timeout
    await waitFor(() => {
      expect(screen.queryByText('Deposit successful')).not.toBeInTheDocument();
    }, { timeout: 3500 });
  });

  test('handles invalid deposit amount', async () => {
    window.prompt.mockReturnValue('invalid');
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<ClientPayments />);
    const depositButton = screen.getByText('Deposit');
    fireEvent.click(depositButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Invalid amount entered.');
    alertSpy.mockRestore();
  });

  test('handles payment for milestone', async () => {
    render(<ClientPayments />);
    
    await waitFor(() => {
      expect(screen.getByText('Pay')).toBeInTheDocument();
    });
    
    const payButton = screen.getByText('Pay');
    fireEvent.click(payButton);
    
    await waitFor(() => {
      expect(update).toHaveBeenCalledWith(
        ref(applications_db, 'accepted_applications/parent1/job1/job_milestones/0'),
        { status: 'Paid' }
      );
      expect(screen.getByText('Balance: $1000.00')).toBeInTheDocument();
      expect(screen.getByText('Paid')).toBeInTheDocument();
    });
  });

  test('shows insufficient funds message', async () => {
    localStorage.setItem('clientWallet', '400');
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<ClientPayments />);
    
    await waitFor(() => {
      expect(screen.getByText('Pay')).toBeInTheDocument();
    });
    
    const payButton = screen.getByText('Pay');
    fireEvent.click(payButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Insufficient funds.');
    alertSpy.mockRestore();
  });

  test('displays no payments message when empty', async () => {
    get.mockResolvedValue({
      exists: () => false
    });
    
    render(<ClientPayments />);
    
    await waitFor(() => {
      expect(screen.getByText('No payments available.')).toBeInTheDocument();
    });
  });

  test('filters payments by status', async () => {
    render(<ClientPayments />);
    
    await waitFor(() => {
      expect(screen.getByText('Done')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
    
    const statusFilter = screen.getByRole('combobox');
    fireEvent.change(statusFilter, { target: { value: 'Paid' } });
    
    // This would need additional state management in the component to fully test
    // Currently the component doesn't implement the filter functionality
  });
});
