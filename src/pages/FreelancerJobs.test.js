import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FreelancerJobs from './FreelancerJobs';
import '@testing-library/jest-dom';
import * as firebaseDatabase from 'firebase/database';

global.MutationObserver = class {
  constructor(callback) {}
  disconnect() {}
  observe(element, initObject) {}
};

jest.mock('firebase/database', () => ({
  onValue: jest.fn(),
  ref: jest.fn(),
  set: jest.fn(),
  push: jest.fn(),
  update: jest.fn(),
  get: jest.fn()
}));

jest.mock('../firebaseConfig', () => ({
  db: {},
}));

jest.mock('../components/HeaderFreelancer', () => () => <div>Mock Header</div>);

describe('FreelancerJobs Component', () => {
  const mockJobs = {
    job1: {
      title: 'Website Design',
      description: 'Redesign homepage',
      category: 'Web Design',
      budget: 500,
      deadline: '2025-05-01'
    },
    job2: {
      title: 'App UI Mockup',
      description: 'Design app interface',
      category: 'Design',
      budget: 300,
      deadline: '2025-06-01'
    },
    job3: {
      title: 'Admin Assistant',
      description: 'Office help needed',
      category: 'Admin',
      budget: 200,
      deadline: '2025-04-15'
    }
  };

  beforeEach(() => {
    firebaseDatabase.get.mockResolvedValue({
      exists: () => true,
      val: () => mockJobs
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders header and UI sections', async () => {
    render(<FreelancerJobs />);
    expect(screen.getByText('Mock Header')).toBeInTheDocument();
    expect(screen.getByText('Freelancer Job Board')).toBeInTheDocument();
    expect(screen.getByText('Filter Jobs')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('Apply').length).toBeGreaterThan(0);
    });
  });

  // Add to the describe block in the test file

test('handles rejected applications correctly', async () => {
  // Mock localStorage
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
    if (key === "userUID") return "testUser123";
    return null;
  });

  // Mock rejected applications
  firebaseDatabase.onValue.mockImplementation((ref, callback) => {
    if (ref.path.includes('rejected_applications')) {
      callback({
        val: () => ({
          job1: {
            applicant1: {
              applicant_userUID: "testUser123",
              status: "rejected"
            }
          }
        })
      });
    }
  });

  // Mock jobs data
  firebaseDatabase.get.mockResolvedValue({
    exists: () => true,
    val: () => ({
      job1: {
        title: 'Rejected Job',
        description: 'This job was rejected',
        category: 'Design',
        budget: 300,
        deadline: '2025-06-01'
      }
    })
  });

  render(<FreelancerJobs />);
  
  await waitFor(() => {
    expect(screen.getByText('Rejected Jobs')).toBeInTheDocument();
    expect(screen.getByText('Rejected Job')).toBeInTheDocument();
    expect(screen.getByText('❌ Rejected')).toBeInTheDocument();
  });
});

test('handles jobs fetch error', async () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  firebaseDatabase.get.mockRejectedValueOnce(new Error('Fetch error'));

  render(<FreelancerJobs />);
  
  await waitFor(() => {
    expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
  });
  errorSpy.mockRestore();
});

test('shows error alert when application submission fails', async () => {
  window.alert = jest.fn();
  firebaseDatabase.push.mockRejectedValueOnce(new Error('Submission failed'));

  render(<FreelancerJobs />);
  
  await waitFor(() => {
    fireEvent.click(screen.getAllByText('Apply')[0]);
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your surname'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('e.g., JavaScript, React, Firebase'), { target: { value: 'React' } });
    fireEvent.change(screen.getByPlaceholderText('Write your motivation here...'), { target: { value: 'Motivation' } });
    
    fireEvent.click(screen.getByText('Submit'));
    
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Failed to submit application'));
  });
});

test('renders modal form correctly', async () => {
  render(<FreelancerJobs />);
  
  await waitFor(() => {
    fireEvent.click(screen.getAllByText('Apply')[0]);
    
    expect(screen.getByLabelText('Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Surname:')).toBeInTheDocument();
    expect(screen.getByLabelText('Skills (comma separated):')).toBeInTheDocument();
    expect(screen.getByLabelText('Motivation:')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });
});

test('shows no available jobs when filtered list is empty', async () => {
  firebaseDatabase.get.mockResolvedValueOnce({
    exists: () => true,
    val: () => ({
      job1: {
        title: 'Web Job',
        description: 'Description',
        category: 'Web',
        budget: 500,
        deadline: '2025-05-01'
      }
    })
  });

  render(<FreelancerJobs />);
  
  await waitFor(() => {
    // Set filters that won't match any jobs
    fireEvent.change(screen.getByPlaceholderText('Search by job title'), {
      target: { value: 'Non-existent job' }
    });
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'Admin Support' }
    });
    
    expect(screen.getByText('No available jobs')).toBeInTheDocument();
  });
});

  test('renders job cards and apply buttons', async () => {
    render(<FreelancerJobs />);
    await waitFor(() => {
      const applyButtons = screen.getAllByText('Apply');
      expect(applyButtons.length).toBeGreaterThan(0);
    });
  });

  test('filters jobs by search term and category', async () => {
  render(<FreelancerJobs />);
  
  await waitFor(() => {
    // Test search filtering
    fireEvent.change(screen.getByPlaceholderText('Search by job title'), {
      target: { value: 'Website' }
    });
    expect(screen.getByText('Website Design')).toBeInTheDocument();
    expect(screen.queryByText('App UI Mockup')).not.toBeInTheDocument();

    // Test category filtering
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'Design' }
    });
    expect(screen.getByText('App UI Mockup')).toBeInTheDocument();
    expect(screen.queryByText('Website Design')).toBeInTheDocument();
    expect(screen.queryByText('Admin Assistant')).not.toBeInTheDocument();
  });
});

test('handles application data changes', async () => {
  render(<FreelancerJobs />);
  
  await waitFor(() => {
    fireEvent.click(screen.getAllByText('Apply')[0]);
    
    const nameInput = screen.getByPlaceholderText('Enter your name');
    fireEvent.change(nameInput, { target: { value: 'Test Name' } });
    expect(nameInput.value).toBe('Test Name');
    
    const surnameInput = screen.getByPlaceholderText('Enter your surname');
    fireEvent.change(surnameInput, { target: { value: 'Test Surname' } });
    expect(surnameInput.value).toBe('Test Surname');
    
    const skillsInput = screen.getByPlaceholderText('e.g., JavaScript, React, Firebase');
    fireEvent.change(skillsInput, { target: { value: 'React, Node' } });
    expect(skillsInput.value).toBe('React, Node');
    
    const motivationInput = screen.getByPlaceholderText('Write your motivation here...');
    fireEvent.change(motivationInput, { target: { value: 'Test motivation' } });
    expect(motivationInput.value).toBe('Test motivation');
  });
});

test('correctly categorizes application statuses', async () => {
  // Mock localStorage
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
    if (key === "userUID") return "testUser123";
    return null;
  });

  // Mock applications data with all status types
  firebaseDatabase.get.mockImplementation((ref) => {
    if (ref.path.includes('accepted_applications')) {
      return Promise.resolve({
        exists: () => true,
        val: () => ({
          job1: { // Accepted
            applicant1: { applicant_userUID: "testUser123", status: "accepted" }
          },
          job2: { // Rejected
            applicant1: { applicant_userUID: "testUser123", status: "rejected" }
          },
          job3: { // Pending
            applicant1: { applicant_userUID: "testUser123", status: "pending" }
          }
        })
      });
    }
    return Promise.resolve({
      exists: () => true,
      val: () => ({
        job1: { title: 'Accepted Job', category: 'Web' },
        job2: { title: 'Rejected Job', category: 'Design' },
        job3: { title: 'Pending Job', category: 'Admin' }
      })
    });
  });

  render(<FreelancerJobs />);
  
  await waitFor(() => {
    expect(screen.getByText('✅ Accepted')).toBeInTheDocument();
    expect(screen.getByText('❌ Rejected')).toBeInTheDocument();
    expect(screen.getByText('⏳ Application Pending')).toBeInTheDocument();
  });
});

test('handles application submission errors', async () => {
  firebaseDatabase.push.mockRejectedValueOnce(new Error('Submission failed'));
  window.alert = jest.fn();

  render(<FreelancerJobs />);
  
  await waitFor(() => {
    fireEvent.click(screen.getAllByText('Apply')[0]);
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your surname'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('e.g., JavaScript, React, Firebase'), { target: { value: 'React' } });
    fireEvent.change(screen.getByPlaceholderText('Write your motivation here...'), { target: { value: 'Motivation' } });
    
    fireEvent.click(screen.getByText('Submit'));
    
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Failed to submit application'));
  });
});

test('displays accepted jobs section correctly', async () => {
  // Mock accepted jobs
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
    if (key === "userUID") return "testUser123";
    return null;
  });

  firebaseDatabase.get.mockImplementation((ref) => {
    if (ref.path.includes('accepted_applications')) {
      return Promise.resolve({
        exists: () => true,
        val: () => ({
          job1: {
            applicant1: { applicant_userUID: "testUser123", status: "accepted" }
          }
        })
      });
    }
    return Promise.resolve({
      exists: () => true,
      val: () => ({
        job1: {
          title: 'Accepted Job',
          description: 'Accepted description',
          category: 'Web',
          budget: 500,
          deadline: '2025-05-01'
        }
      })
    });
  });

  render(<FreelancerJobs />);
  
  await waitFor(() => {
    expect(screen.getByText('Accepted Jobs')).toBeInTheDocument();
    expect(screen.getByText('Accepted Job')).toBeInTheDocument();
    expect(screen.getByText('✅ Accepted')).toBeInTheDocument();
  });
});

test('displays rejected jobs section correctly', async () => {
  // Mock rejected jobs
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
    if (key === "userUID") return "testUser123";
    return null;
  });

  firebaseDatabase.get.mockImplementation((ref) => {
    if (ref.path.includes('accepted_applications')) {
      return Promise.resolve({
        exists: () => true,
        val: () => ({
          job1: {
            applicant1: { applicant_userUID: "testUser123", status: "rejected" }
          }
        })
      });
    }
    return Promise.resolve({
      exists: () => true,
      val: () => ({
        job1: {
          title: 'Rejected Job',
          description: 'Rejected description',
          category: 'Design',
          budget: 300,
          deadline: '2025-06-01'
        }
      })
    });
  });

  render(<FreelancerJobs />);
  
  await waitFor(() => {
    expect(screen.getByText('Rejected Jobs')).toBeInTheDocument();
    expect(screen.getByText('Rejected Job')).toBeInTheDocument();
    expect(screen.getByText('❌ Rejected')).toBeInTheDocument();
  });
});

test('displays milestones section correctly', async () => {
  // Mock job with milestones
  firebaseDatabase.get.mockResolvedValueOnce({
    exists: () => true,
    val: () => ({
      job1: {
        title: 'Job with Milestones',
        description: 'Description',
        category: 'Web',
        budget: 1000,
        deadline: '2025-05-01',
        milestones: [
          { description: 'Phase 1', amount: 400, status: 'pending' },
          { description: 'Phase 2', amount: 600, status: 'pending' }
        ]
      }
    })
  });

  render(<FreelancerJobs />);
  
  await waitFor(() => {
    expect(screen.getByText('Milestones:')).toBeInTheDocument();
    expect(screen.getByText('Milestone 1: Phase 1')).toBeInTheDocument();
    expect(screen.getByText('Amount: $400')).toBeInTheDocument();
    expect(screen.getByText('Milestone 2: Phase 2')).toBeInTheDocument();
    expect(screen.getByText('Amount: $600')).toBeInTheDocument();
  });
});

test('shows "No available jobs" when filtered list is empty', async () => {
  firebaseDatabase.get.mockResolvedValueOnce({
    exists: () => false
  });

  render(<FreelancerJobs />);
  
  await waitFor(() => {
    expect(screen.getByText('No available jobs')).toBeInTheDocument();
    expect(screen.getByText('No accepted jobs')).toBeInTheDocument();
    expect(screen.getByText('No rejected jobs')).toBeInTheDocument();
  });
});

test('shows validation errors for empty form fields', async () => {
  render(<FreelancerJobs />);
  
  await waitFor(() => {
    fireEvent.click(screen.getAllByText('Apply')[0]);
    fireEvent.click(screen.getByText('Submit'));

    expect(screen.getByText('Please fill in the name field.')).toBeInTheDocument();
    expect(screen.getByText('Please fill in the surname field.')).toBeInTheDocument();
    expect(screen.getByText('Please fill in the skills field.')).toBeInTheDocument();
    expect(screen.getByText('Please fill in the motivation field.')).toBeInTheDocument();
  });
});

test('displays milestones when they exist', async () => {
  const mockJobsWithMilestones = {
    job1: {
      title: 'Website Design',
      description: 'Redesign homepage',
      category: 'Web Design',
      budget: 500,
      deadline: '2025-05-01',
      milestones: [
        { description: 'Design mockup', amount: 200, status: 'pending' },
        { description: 'Final delivery', amount: 300, status: 'pending' }
      ]
    }
  };

  firebaseDatabase.get.mockResolvedValueOnce({
    exists: () => true,
    val: () => mockJobsWithMilestones
  });

  render(<FreelancerJobs />);
  
  await waitFor(() => {
    expect(screen.getByText('Milestones:')).toBeInTheDocument();
    expect(screen.getByText('Milestone 1: Design mockup')).toBeInTheDocument();
    expect(screen.getByText('Amount: $200')).toBeInTheDocument();
    expect(screen.getByText('Status: $pending')).toBeInTheDocument();
  });
});

test('displays correct status labels', async () => {
  const mockAcceptedJobs = {
    job1: {
      title: 'Accepted Job',
      description: 'This job was accepted',
      category: 'Web Design',
      budget: 500,
      deadline: '2025-05-01'
    }
  };

  const mockRejectedJobs = {
    job2: {
      title: 'Rejected Job',
      description: 'This job was rejected',
      category: 'Design',
      budget: 300,
      deadline: '2025-06-01'
    }
  };

  // Mock the applications data
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
    if (key === "userUID") return "testUser123";
    return null;
  });

  firebaseDatabase.get.mockImplementation((ref) => {
    if (ref.path.includes('accepted_applications')) {
      return Promise.resolve({
        exists: () => true,
        val: () => ({
          job1: {
            applicant1: {
              applicant_userUID: "testUser123",
              status: "accepted"
            }
          },
          job2: {
            applicant1: {
              applicant_userUID: "testUser123",
              status: "rejected"
            }
          }
        })
      });
    }
    return Promise.resolve({
      exists: () => true,
      val: () => ({ ...mockAcceptedJobs, ...mockRejectedJobs })
    });
  });

  render(<FreelancerJobs />);
  
  await waitFor(() => {
    expect(screen.getByText('✅ Accepted')).toBeInTheDocument();
    expect(screen.getByText('❌ Rejected')).toBeInTheDocument();
  });
});

  test('opens and closes application modal', async () => {
    render(<FreelancerJobs />);
    await waitFor(() => {
      const applyButtons = screen.getAllByText('Apply');
      fireEvent.click(applyButtons[0]);

      expect(screen.getByText(/Apply for/i)).toBeInTheDocument();

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(screen.queryByText(/Apply for/i)).not.toBeInTheDocument();
    });
  });

  test('shows pending status for applied jobs', async () => {
  // Mock the applications data
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
    if (key === "userUID") return "testUser123";
    return null;
  });

  firebaseDatabase.get.mockImplementation((ref) => {
    if (ref.path.includes('accepted_applications')) {
      return Promise.resolve({
        exists: () => true,
        val: () => ({
          job1: {
            applicant1: {
              applicant_userUID: "testUser123",
              status: "pending"
            }
          }
        })
      });
    }
    return Promise.resolve({
      exists: () => true,
      val: () => mockJobs
    });
  });

  render(<FreelancerJobs />);
  
  await waitFor(() => {
    expect(screen.getByText('⏳ Application Pending')).toBeInTheDocument();
  });
});

  test('fills and submits application form', async () => {
    render(<FreelancerJobs />);
    await waitFor(() => {
      fireEvent.click(screen.getAllByText('Apply')[0]);

      fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your surname'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByPlaceholderText('e.g., JavaScript, React, Firebase'), { target: { value: 'React, Firebase' } });
      fireEvent.change(screen.getByPlaceholderText('Write your motivation here...'), { target: { value: 'I am passionate.' } });

      fireEvent.click(screen.getByText('Submit'));

      expect(firebaseDatabase.push).toHaveBeenCalled();
    });
  });

  test('handles already applied job gracefully', async () => {
    render(<FreelancerJobs />);
    await waitFor(() => {
      const applyButtons = screen.getAllByText('Apply');
      fireEvent.click(applyButtons[0]);

      fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'Jane' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your surname'), { target: { value: 'Smith' } });
      fireEvent.change(screen.getByPlaceholderText('e.g., JavaScript, React, Firebase'), { target: { value: 'Node, Express' } });
      fireEvent.change(screen.getByPlaceholderText('Write your motivation here...'), { target: { value: 'I want this job.' } });

      fireEvent.click(screen.getByText('Submit'));

      fireEvent.click(applyButtons[0]);

      expect(screen.getByText("You have already applied to this job.")).toBeInTheDocument();
    });
  });

  test('handles firebase errors gracefully', async () => {
    firebaseDatabase.get.mockRejectedValueOnce(new Error('Firebase error'));

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<FreelancerJobs />);

    await waitFor(() => {
      expect(screen.getByText('Freelancer Job Board')).toBeInTheDocument();
    });

    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Firebase error'));
    errorSpy.mockRestore();
  });
});
