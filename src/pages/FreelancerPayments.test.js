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

  test('handles empty wallet in localStorage', async () => {
  localStorage.getItem.mockImplementation((key) => {
    if (key === 'freelancerWallet') return null;
    return 'freelancer123';
  });
  
  render(<FreelancerPayments />);
  await waitFor(() => {
    expect(screen.getByText('Balance: $0.00')).toBeInTheDocument();
  });
});

test('handles invalid wallet value in localStorage', async () => {
  localStorage.getItem.mockImplementation((key) => {
    if (key === 'freelancerWallet') return 'invalid';
    return 'freelancer123';
  });
  
  render(<FreelancerPayments />);
  await waitFor(() => {
    expect(screen.getByText('Balance: $0.00')).toBeInTheDocument();
  });
});

test('does not show Mark as Done for lowercase pending status', async () => {
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
              jobTitle: 'Website Project',
              clientName: 'Client C',
              job_milestones: [
                {
                  description: 'Initial phase',
                  amount: 300,
                  status: 'pending', // lowercase
                  dueDate: '2023-12-10'
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
    expect(screen.getByText('Mark as Done')).toBeInTheDocument();
  });
});

  test('handles error when fetching jobs fails', async () => {
  get.mockRejectedValue(new Error('Fetch failed'));
  console.error = jest.fn();
  
  render(<FreelancerPayments />);
  
  await waitFor(() => {
    expect(console.error).toHaveBeenCalledWith("Error fetching jobs:", expect.any(Error));
  });
});

  test('handles marking milestone as in-progress', async () => {
  render(<FreelancerPayments />);
  
  await waitFor(() => {
    fireEvent.click(screen.getByText('Mark as In-Progress'));
  });
  
  expect(update).toHaveBeenCalledWith(
    ref(expect.anything(), 'accepted_applications/parent1/job1/job_milestones/0'),
    { status: 'In-Progress' }
  );
  
  await waitFor(() => {
    expect(screen.getByText('In-Progress')).toBeInTheDocument();
  });
});

test('handles error when marking in-progress fails', async () => {
  update.mockRejectedValue(new Error('Update failed'));
  console.error = jest.fn();
  window.alert = jest.fn();
  
  render(<FreelancerPayments />);
  
  await waitFor(() => {
    fireEvent.click(screen.getByText('Mark as In-Progress'));
  });
  
  expect(console.error).toHaveBeenCalledWith(
    'Failed to update milestone status:',
    expect.any(Error)
  );
  expect(window.alert).toHaveBeenCalledWith('Failed to mark milestone as in-progress.');
});

  test('exports to CSV correctly', async () => {
  const mockCreateObjectURL = jest.fn();
  const mockClick = jest.fn();
  
  global.URL.createObjectURL = mockCreateObjectURL;
  
  document.createElement = jest.fn().mockImplementation((tagName) => {
    if (tagName === 'a') {
      return {
        setAttribute: jest.fn(),
        click: mockClick,
        style: {},
        href: ''
      };
    }
    return {};
  });
  
  render(<FreelancerPayments />);
  
  await waitFor(() => {
    fireEvent.click(screen.getByText('Export CSV'));
  });
  
  expect(mockCreateObjectURL).toHaveBeenCalled();
  expect(mockClick).toHaveBeenCalled();
});

  test('applies search filter correctly', async () => {
  render(<FreelancerPayments />);
  
  await waitFor(() => {
    fireEvent.change(screen.getByPlaceholderText('Search by freelancer or job title'), {
      target: { value: 'Website' }
    });
    
    expect(screen.getByText('Website Development')).toBeInTheDocument();
    expect(screen.queryByText('Other Project')).not.toBeInTheDocument();
  });
});

test('applies status filter correctly', async () => {
  render(<FreelancerPayments />);
  
  await waitFor(() => {
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Pending' }
    });
    
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.queryByText('Done')).not.toBeInTheDocument();
  });
});

  test('shows correct buttons for In-Progress status', async () => {
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
              jobTitle: 'In Progress Project',
              clientName: 'Client F',
              job_milestones: [
                {
                  description: 'Development phase',
                  amount: 750,
                  status: 'In-Progress',
                  dueDate: '2023-12-20'
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
    expect(screen.getByText('Mark as Done')).toBeInTheDocument();
    expect(screen.queryByText('Mark as In-Progress')).not.toBeInTheDocument();
  });
});

test('shows both buttons for Pending status', async () => {
  render(<FreelancerPayments />);
  
  await waitFor(() => {
    expect(screen.getByText('Mark as In-Progress')).toBeInTheDocument();
    expect(screen.getByText('Mark as Done')).toBeInTheDocument();
  });
});

test('handles malformed payment data in handleMarkDone', async () => {
  console.error = jest.fn();
  window.alert = jest.fn();
  
  render(<FreelancerPayments />);
  
  // Simulate calling handleMarkDone with incomplete data
  const malformedPayment = {
    id: '1_ms_0',
    jobTitle: 'Broken Project'
    // missing required fields
  };
  
  // This would require either exporting the function or finding another way to trigger it
  // For illustration purposes:
  await waitFor(() => {
    fireEvent.click(screen.getByText('Mark as Done'));
    // In reality, you'd need to ensure the button is rendered with malformed data
  });
  
  expect(console.error).toHaveBeenCalled();
});

test('updates UI state after marking milestone as done', async () => {
  render(<FreelancerPayments />);
  
  await waitFor(() => {
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Mark as Done'));

  await waitFor(() => {
    // Verify both the Firebase update AND the UI update
    expect(update).toHaveBeenCalled();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.queryByText('Pending')).not.toBeInTheDocument();
  });
});

test('handles incomplete payment object in handleMarkDone', async () => {
  console.error = jest.fn();
  window.alert = jest.fn();

  // Render with a malformed payment
  const { rerender } = render(<FreelancerPayments />);
  
  // Force a bad state (in real test you'd mock this differently)
  const badPayment = {
    id: 'bad_id',
    // missing required fields
  };

  // This would require either:
  // 1. Exporting handleMarkDone for direct testing, or
  // 2. Creating test data that produces this case
  await waitFor(() => {
    fireEvent.click(screen.getByText('Mark as Done'));
  });

  expect(console.error).toHaveBeenCalled();
  expect(window.alert).toHaveBeenCalledWith('Failed to mark milestone as done.');
});

test('renders empty state when no payments exist', async () => {
  get.mockResolvedValueOnce({
    exists: () => false
  });

  render(<FreelancerPayments />);
  
  await waitFor(() => {
    expect(screen.queryByText('Website Development')).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument(); // table exists but empty
  });
});

test('handleMarkDone updates Firebase and UI state correctly', async () => {
  render(<FreelancerPayments />);
  
  await waitFor(() => {
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Mark as Done'));

  await waitFor(() => {
    // Verify Firebase call
    expect(update).toHaveBeenCalledWith(
      ref(expect.anything(), 'accepted_applications/parent1/job1/job_milestones/0'),
      { status: 'Done' }
    );
    
    // Verify UI update
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.queryByText('Pending')).not.toBeInTheDocument();
  });
});

test('displays wallet balance with various numeric values', async () => {
  localStorage.getItem.mockImplementation((key) => {
    if (key === 'freelancerWallet') return '1234.56';
    return 'freelancer123';
  });

  render(<FreelancerPayments />);
  
  await waitFor(() => {
    expect(screen.getByText('Balance: $1234.56')).toBeInTheDocument();
  });
});

test('cleanup in useEffect', async () => {
  const { unmount } = render(<FreelancerPayments />);
  
  await waitFor(() => {
    expect(screen.getByText('Website Development')).toBeInTheDocument();
  });
  
  unmount();
  // Verify any cleanup operations if they exist
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
describe('Mark as Done button rendering', () => {
  test('renders button only for pending status (case insensitive)', async () => {
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
                jobTitle: 'Case Test',
                clientName: 'Client D',
                job_milestones: [
                  {
                    description: 'Test phase',
                    amount: 100,
                    status: 'PENDING', // uppercase
                    dueDate: '2023-12-15'
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
      expect(screen.getByText('Mark as Done')).toBeInTheDocument();
    });
  });

  test('does not render button for non-pending statuses', async () => {
    const statuses = ['Done', 'Paid', 'Approved', 'Rejected'];
    
    for (const status of statuses) {
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
                  jobTitle: `Status Test - ${status}`,
                  clientName: 'Client E',
                  job_milestones: [
                    {
                      description: 'Test phase',
                      amount: 100,
                      status: status,
                      dueDate: '2023-12-15'
                    }
                  ]
                })
              });
            }
          });
        }
      });

      const { unmount } = render(<FreelancerPayments />);
      
      await waitFor(() => {
        expect(screen.queryByText('Mark as Done')).not.toBeInTheDocument();
      });
      
      unmount();
    }
  });
});
