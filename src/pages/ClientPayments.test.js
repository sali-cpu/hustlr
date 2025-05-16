import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import ClientPayments from './ClientPayments';
import { ref, get, update } from 'firebase/database';

// Mock Firebase and localStorage
jest.mock('firebase/database');
jest.spyOn(window.localStorage.__proto__, 'getItem');
jest.spyOn(window.localStorage.__proto__, 'setItem');

describe('ClientPayments Component', () => {
  const mockPayments = [
    {
      id: '1_ms_0',
      jobSnapKey: 'job1',
      index: 0,
      jobTitle: 'Website Development',
      client: 'Freelancer 1',
      milestone: 'Design phase',
      amount: 500,
      status: 'Done',
      dueDate: '2023-12-01'
    }
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock localStorage
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'clientWallet') return '1000';
      if (key === 'userUID') return 'client123';
      if (key === 'freelancerDoneMilestones') return JSON.stringify({'1_ms_0': true});
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
                applicant_userUID: 'client123',
                jobTitle: 'Website Development',
                clientName: 'Freelancer 1',
                job_milestones: [
                  {
                    description: 'Design phase',
                    amount: 500,
                    status: 'Done',
                    dueDate: '2023-12-01'
                  }
                ]
              })
            });
          }
        });
      }
    });
  });

  test('renders with initial wallet balance', async () => {
    render(<ClientPayments />);
    await waitFor(() => {
      expect(screen.getByText('Balance: $1000.00')).toBeInTheDocument();
    });
  });

  test('handles deposit correctly', async () => {
    window.prompt = jest.fn().mockReturnValue('200');
    render(<ClientPayments />);
    
    fireEvent.click(screen.getByText('Deposit'));
    
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('clientWallet', '1200');
      expect(screen.getByText('Deposit successful')).toBeInTheDocument();
    });
  });

  test('handles invalid deposit amount', async () => {
    window.prompt = jest.fn().mockReturnValue('invalid');
    window.alert = jest.fn();
    render(<ClientPayments />);
    
    fireEvent.click(screen.getByText('Deposit'));
    
    expect(window.alert).toHaveBeenCalledWith('Invalid amount entered.');
  });

  test('displays payments data', async () => {
    render(<ClientPayments />);
    
    await waitFor(() => {
      expect(screen.getByText('Website Development')).toBeInTheDocument();
      expect(screen.getByText('Freelancer 1')).toBeInTheDocument();
      expect(screen.getByText('Design phase')).toBeInTheDocument();
      expect(screen.getByText('$500')).toBeInTheDocument();
    });
  });

  test('handles payment correctly', async () => {
    render(<ClientPayments />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Pay'));
    });
    
    expect(update).toHaveBeenCalled();
    expect(localStorage.setItem).toHaveBeenCalledWith('clientWallet', '500');
    expect(localStorage.setItem).toHaveBeenCalledWith('freelancerWallet', '500');
  });

  test('shows insufficient funds message', async () => {
    localStorage.getItem.mockImplementation((key) => 
      key === 'clientWallet' ? '100' : null
    );
    window.alert = jest.fn();
    
    render(<ClientPayments />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Pay'));
    });
    
    expect(window.alert).toHaveBeenCalledWith('Insufficient funds.');
  });
});
