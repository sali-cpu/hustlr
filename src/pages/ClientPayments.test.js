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
  // Mock Firebase response with specific test data
  get.mockResolvedValue({
    exists: () => true,
    forEach: (callback) => {
      callback({
        key: 'parent1',
        forEach: (childCallback) => {
          childCallback({
            key: 'job1',
            val: () => ({
              clientUID: 'client123',
              jobTitle: 'Website Development',
              job_milestones: [
                {
                  description: 'Design phase',
                  amount: 500,
                  status: 'Pending',
                  duedate: '2023-12-01'
                }
              ]
            })
          });
        }
      });
    }
  });

  // Mock localStorage
  localStorage.getItem.mockImplementation((key) => {
    if (key === 'clientWallet') return '1000';
    if (key === 'userUID') return 'client123';
    if (key === 'freelancerDoneMilestones') return JSON.stringify({});
    if (key === 'paidMilestones') return JSON.stringify({});
    return null;
  });

  render(<ClientPayments />);

  // Wait for and verify specific payment data
  await waitFor(() => {
    // Get the specific table row containing our test data
    const jobRow = screen.getByRole('row', {
      name: /website development design phase \$500 pending 2023-12-01/i
    });
    
    // Verify all expected data is present in this specific row
    expect(within(jobRow).getByText('Website Development')).toBeInTheDocument();
    expect(within(jobRow).getByText('Design phase')).toBeInTheDocument();
    expect(within(jobRow).getByText('$500')).toBeInTheDocument();
    expect(within(jobRow).getByText('Pending')).toBeInTheDocument();
    expect(within(jobRow).getByText('2023-12-01')).toBeInTheDocument();
  });
});

  test('handles payment correctly', async () => {
    // Mock Firebase data
    get.mockResolvedValue({
      exists: () => true,
      forEach: (callback) => {
        callback({
          key: 'parent1',
          forEach: (childCallback) => {
            childCallback({
              key: 'job1',
              val: () => ({
                clientUID: 'client123',
                jobTitle: 'Website Development',
                job_milestones: [
                  {
                    description: 'Design phase',
                    amount: 500,
                    status: 'Pending',
                    duedate: '2023-12-01'
                  }
                ]
              })
            });
          }
        });
      }
    });

    // Mock localStorage
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'clientWallet') return '1000';
      if (key === 'userUID') return 'client123';
      if (key === 'freelancerDoneMilestones') return JSON.stringify({'job1_ms_0': true});
      if (key === 'paidMilestones') return JSON.stringify({});
      return null;
    });

    render(<ClientPayments />);

    // Option 1: Using within (recommended)
    const paymentRow = await screen.findByRole('row', {
      name: /website development/i
    });
    const payButton = within(paymentRow).getByRole('button', { name: /pay/i });
    
    // Option 2: Alternative without within
    // const payButton = await screen.findByRole('button', { name: /pay/i });
    
    fireEvent.click(payButton);
    
    await waitFor(() => {
      expect(update).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalledWith('clientWallet', '500');
      expect(localStorage.setItem).toHaveBeenCalledWith('paidMilestones', expect.any(String));
    });
  });

test('shows insufficient funds message', async () => {
  // 1. Mock Firebase data with a payable milestone
  get.mockResolvedValue({
    exists: () => true,
    forEach: (callback) => {
      callback({
        key: 'parent1',
        forEach: (childCallback) => {
          childCallback({
            key: 'job1',
            val: () => ({
              clientUID: 'client123',
              jobTitle: 'Website Development',
              job_milestones: [
                {
                  description: 'Design phase',
                  amount: 500,
                  status: 'Pending',
                  duedate: '2023-12-01'
                }
              ]
            })
          });
        }
      });
    }
  });

  // 2. Mock localStorage with:
  // - Low wallet balance
  // - Milestone marked as "Done"
  // - Not yet paid
  localStorage.getItem.mockImplementation((key) => {
    if (key === 'clientWallet') return '100'; // Insufficient funds
    if (key === 'userUID') return 'client123';
    if (key === 'freelancerDoneMilestones') return JSON.stringify({'job1_ms_0': true});
    if (key === 'paidMilestones') return JSON.stringify({});
    return null;
  });

  // 3. Mock window.alert
  window.alert = jest.fn();

  render(<ClientPayments />);

  // 4. Wait for and click the Pay button
  const payButton = await screen.findByRole('button', {name: /pay/i});
  fireEvent.click(payButton);

  // 5. Verify the alert was shown
  expect(window.alert).toHaveBeenCalledWith('Insufficient funds.');
  
  // 6. Verify no payment was processed
  expect(update).not.toHaveBeenCalled();
  expect(localStorage.setItem).not.toHaveBeenCalledWith('clientWallet', expect.any(String));
});
});
describe('ClientPayments Component Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'userUID') return 'client123';
      return null;
    });
  });

  test('handles case when no wallet exists in localStorage', async () => {
    localStorage.getItem.mockImplementation((key) => 
      key === 'userUID' ? 'client123' : null
    );
    
    render(<ClientPayments />);
    
    await waitFor(() => {
      expect(screen.getByText('Balance: $0.00')).toBeInTheDocument();
    });
  });

  test('handles case when Firebase snapshot does not exist', async () => {
    get.mockResolvedValue({
      exists: () => false,
      forEach: jest.fn()
    });
    
    render(<ClientPayments />);
    
    await waitFor(() => {
      expect(screen.getByText('No payments available.')).toBeInTheDocument();
    });
  });

  test('handles Firebase error when fetching jobs', async () => {
    get.mockRejectedValue(new Error('Firebase error'));
    console.error = jest.fn();
    
    render(<ClientPayments />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching jobs:', expect.any(Error));
    });
  });

  test('handles negative deposit amount', async () => {
    window.prompt = jest.fn().mockReturnValue('-100');
    window.alert = jest.fn();
    render(<ClientPayments />);
    
    fireEvent.click(screen.getByText('Deposit'));
    
    expect(window.alert).toHaveBeenCalledWith('Invalid amount entered.');
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  test('handles zero deposit amount', async () => {
    window.prompt = jest.fn().mockReturnValue('0');
    window.alert = jest.fn();
    render(<ClientPayments />);
    
    fireEvent.click(screen.getByText('Deposit'));
    
    expect(window.alert).toHaveBeenCalledWith('Invalid amount entered.');
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});

describe('ClientPayments Payment Functionality', () => {
  const mockPayment = {
    id: 'job1_ms_0',
    jobSnapKey: 'parent1/job1',
    index: 0,
    jobTitle: 'Website Development',
    milestone: 'Design phase',
    amount: 500,
    status: 'Done',
    dueDate: '2023-12-01'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    get.mockResolvedValue({
      exists: () => true,
      forEach: jest.fn()
    });

    localStorage.getItem.mockImplementation((key) => {
      if (key === 'clientWallet') return '1000';
      if (key === 'userUID') return 'client123';
      if (key === 'freelancerDoneMilestones') return JSON.stringify({'job1_ms_0': true});
      if (key === 'paidMilestones') return JSON.stringify({});
      if (key === 'freelancerWallet') return '0';
      return null;
    });
  });

  test('successfully processes payment when funds are sufficient', async () => {
  // 1. Mock Firebase data with a payable milestone
  get.mockResolvedValue({
    exists: () => true,
    forEach: (callback) => {
      callback({
        key: 'parent1',
        forEach: (childCallback) => {
          childCallback({
            key: 'job1',
            val: () => ({
              clientUID: 'client123',
              jobTitle: 'Website Development',
              job_milestones: [
                {
                  description: 'Design phase',
                  amount: 500,
                  status: 'Pending',
                  duedate: '2023-12-01'
                }
              ]
            })
          });
        }
      });
    }
  });

  // 2. Mock localStorage to create conditions where Pay button appears:
  // - Milestone is "Done" (in freelancerDoneMilestones)
  // - Not yet paid (not in paidMilestones)
  // - Sufficient funds
  localStorage.getItem.mockImplementation((key) => {
    if (key === 'clientWallet') return '1000';
    if (key === 'userUID') return 'client123';
    if (key === 'freelancerDoneMilestones') return JSON.stringify({'job1_ms_0': true});
    if (key === 'paidMilestones') return JSON.stringify({});
    if (key === 'freelancerWallet') return '0';
    return null;
  });

  render(<ClientPayments />);

  // 3. Debug: Print the rendered DOM to see what's actually there
  screen.debug();

  // 4. Wait for the payment row to appear with status "Done"
  const doneStatus = await screen.findByText('Done');
  const paymentRow = doneStatus.closest('tr');

  // 5. Find the Pay button within this specific row
  const payButton = within(paymentRow).getByRole('button', { name: /pay/i });
  
  // 6. Click the button
  fireEvent.click(payButton);
  
  // 7. Verify the payment was processed
  await waitFor(() => {
    expect(update).toHaveBeenCalledWith(
      expect.anything(),
      { status: "Paid" }
    );
    expect(localStorage.setItem).toHaveBeenCalledWith('clientWallet', '500');
    expect(localStorage.setItem).toHaveBeenCalledWith('paidMilestones', expect.any(String));
  });
});

  test('shows error when funds are insufficient', async () => {
    localStorage.getItem.mockImplementation((key) => 
      key === 'clientWallet' ? '100' : null
    );
    window.alert = jest.fn();

    render(<ClientPayments />);
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [[mockPayment], jest.fn()]);

    const payButton = await screen.findByRole('button', { name: /pay/i });
    fireEvent.click(payButton);

    expect(window.alert).toHaveBeenCalledWith('Insufficient funds.');
    expect(update).not.toHaveBeenCalled();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  test('handles payment processing errors', async () => {
    update.mockRejectedValue(new Error('Payment failed'));
    console.error = jest.fn();

    render(<ClientPayments />);
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [[mockPayment], jest.fn()]);

    const payButton = await screen.findByRole('button', { name: /pay/i });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error updating milestone as Paid:',
        expect.any(Error)
      );
    });
  });
});

describe('ClientPayments Filter Functionality', () => {
  const mockPayments = [
    {
      id: '1',
      jobTitle: 'Website Design',
      milestone: 'Homepage design',
      amount: 500,
      status: 'Pending',
      dueDate: '2023-12-01'
    },
    {
      id: '2',
      jobTitle: 'Mobile App',
      milestone: 'Login screen',
      amount: 800,
      status: 'Done',
      dueDate: '2023-12-15'
    },
    {
      id: '3',
      jobTitle: 'API Development',
      milestone: 'User endpoints',
      amount: 1200,
      status: 'Paid',
      dueDate: '2023-11-20'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the payments state
    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [mockPayments, jest.fn()]) // payments state
      .mockImplementationOnce(() => [1000, jest.fn()]) // wallet state
      .mockImplementation(() => ['', jest.fn()]); // filter states
  });

  test('filters payments by search term', async () => {
    // Set search term to 'mobile'
    React.useState.mockImplementationOnce(() => [mockPayments, jest.fn()])
                  .mockImplementationOnce(() => [1000, jest.fn()])
                  .mockImplementationOnce(() => ['mobile', jest.fn()]) // searchTerm
                  .mockImplementation(() => ['All', jest.fn()]); // other filters

    render(<ClientPayments />);

    await waitFor(() => {
      expect(screen.getByText('Mobile App')).toBeInTheDocument();
      expect(screen.queryByText('Website Design')).not.toBeInTheDocument();
      expect(screen.queryByText('API Development')).not.toBeInTheDocument();
    });
  });

  test('filters payments by status', async () => {
    // Set status filter to 'Done'
    React.useState.mockImplementationOnce(() => [mockPayments, jest.fn()])
                  .mockImplementationOnce(() => [1000, jest.fn()])
                  .mockImplementationOnce(() => ['', jest.fn()]) // searchTerm
                  .mockImplementationOnce(() => ['Done', jest.fn()]) // statusFilter
                  .mockImplementation(() => ['', jest.fn()]); // date filters

    render(<ClientPayments />);

    await waitFor(() => {
      expect(screen.getByText('Mobile App')).toBeInTheDocument();
      expect(screen.queryByText('Website Design')).not.toBeInTheDocument();
      expect(screen.queryByText('API Development')).not.toBeInTheDocument();
    });
  });

  test('filters payments by date range', async () => {
    // Set date range to December 2023
    React.useState.mockImplementationOnce(() => [mockPayments, jest.fn()])
                  .mockImplementationOnce(() => [1000, jest.fn()])
                  .mockImplementationOnce(() => ['', jest.fn()]) // searchTerm
                  .mockImplementationOnce(() => ['All', jest.fn()]) // statusFilter
                  .mockImplementationOnce(() => ['2023-12-01', jest.fn()]) // startDate
                  .mockImplementationOnce(() => ['2023-12-31', jest.fn()]); // endDate

    render(<ClientPayments />);

    await waitFor(() => {
      expect(screen.getByText('Website Design')).toBeInTheDocument();
      expect(screen.getByText('Mobile App')).toBeInTheDocument();
      expect(screen.queryByText('API Development')).not.toBeInTheDocument();
    });
  });

  test('shows no payments when filters exclude all', async () => {
    // Set filters that exclude all payments
    React.useState.mockImplementationOnce(() => [mockPayments, jest.fn()])
                  .mockImplementationOnce(() => [1000, jest.fn()])
                  .mockImplementationOnce(() => ['nonexistent', jest.fn()]) // searchTerm
                  .mockImplementation(() => ['All', jest.fn()]); // other filters

    render(<ClientPayments />);

    await waitFor(() => {
      expect(screen.getByText('No payments available.')).toBeInTheDocument();
    });
  });
});
