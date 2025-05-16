import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FreelancerPayments from './FreelancerPayments';
import { ref, get, update } from 'firebase/database';
import '@testing-library/jest-dom';

// Mock Firebase and localStorage
jest.mock('firebase/database');
jest.spyOn(window.localStorage.__proto__, 'getItem');
jest.spyOn(window.localStorage.__proto__, 'setItem');

describe('FreelancerPayments Component', () => {
  const mockPayments = [
    {
      id: '1_ms_0',
      jobTitle: 'Website Development',
      client: 'Client A',
      milestone: 'Design phase',
      amount: 500,
      status: 'Pending',
      dueDate: '2023-12-01',
      parentKey: 'parent1',
      jobKey: 'job1',
      milestoneIndex: 0
    }
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock localStorage
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'freelancerWallet') return '1500';
      if (key === 'userUID') return 'freelancer123';
      return null;
    });

    // Mock Firebase get
    get.mockResolvedValue({
      exists: () => true,
      forEach: (callback) => {
        callback({
          key: 'parent1',
          forEach: (childCallback) => {
            childCallback({
              key: 'job1',
              val: () => ({
                applicant_userUID: 'freelancer123',
                jobTitle: 'Website Development',
                clientName: 'Client A',
                job_milestones: [
                  {
                    description: 'Design phase',
                    amount: 500,
                    status: 'Pending',
                    dueDate: '2023-12-01'
                  }
                ]
              })
            });
          }
        });
      }
    });

    // Mock Firebase update
    update.mockResolvedValue({});
  });

  test('renders the correct page title', async () => {
    render(<FreelancerPayments />);
    expect(screen.getByText('Jobs for Freelancer')).toBeInTheDocument();
  });

  test('displays wallet balance from localStorage', async () => {
    render(<FreelancerPayments />);
    await waitFor(() => {
      expect(screen.getByText('Balance: $1500.00')).toBeInTheDocument();
    });
  });

  test('fetches and displays payment data', async () => {
    render(<FreelancerPayments />);
    
    await waitFor(() => {
      expect(screen.getByText('Website Development')).toBeInTheDocument();
      expect(screen.getByText('Client A')).toBeInTheDocument();
      expect(screen.getByText('$500')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  test('handles marking milestone as done', async () => {
    render(<FreelancerPayments />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Mark as Done'));
    });
    
    expect(update).toHaveBeenCalledWith(
      ref(expect.anything(), 'accepted_applications/parent1/job1/job_milestones/0'),
      { status: 'Done' }
    );
    
    await waitFor(() => {
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  test('handles error when marking milestone fails', async () => {
    update.mockRejectedValue(new Error('Update failed'));
    console.error = jest.fn();
    window.alert = jest.fn();
    
    render(<FreelancerPayments />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Mark as Done'));
    });
    
    expect(console.error).toHaveBeenCalledWith(
      'Failed to update milestone status:',
      expect.any(Error)
    );
    expect(window.alert).toHaveBeenCalledWith('Failed to mark milestone as done.');
  });

  test('does not show Mark as Done button for completed milestones', async () => {
    // Change mock data to have a Done status
    get.mockResolvedValueOnce({
      exists: () => true,
      forEach: (callback) => {
        callback({
          key: 'parent1',
          forEach: (childCallback) => {
            childCallback({
              key: 'job1',
              val: () => ({
                applicant_userUID: 'freelancer123',
                jobTitle: 'Completed Project',
                clientName: 'Client B',
                job_milestones: [
                  {
                    description: 'Final delivery',
                    amount: 1000,
                    status: 'Done',
                    dueDate: '2023-11-15'
                  }
                ]
              })
            });
          }
        });
      }
    });
    
    render(<FreelancerPayments />);
    
    await waitFor(() => {
      expect(screen.queryByText('Mark as Done')).not.toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });
});
