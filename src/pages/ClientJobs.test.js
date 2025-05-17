import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ClientJobs from '../pages/ClientJobs';
import '@testing-library/jest-dom';
import { db, applications_db } from '../firebaseConfig';
import { ref, onValue, get, push, set, update, remove } from 'firebase/database';

// Mock components
jest.mock('../components/HeaderClient', () => () => <div>Mock HeaderClient</div>);
jest.mock('../components/FooterClient', () => () => <div>Mock FooterClient</div>);

// Mock Firebase database
jest.mock('../firebaseConfig', () => ({
  db: {},
  applications_db: {}
}));

jest.mock('firebase/database', () => {
  const jobsData = {};
  const applicationsData = {};
  const acceptedApplicationsData = {};
  const rejectedApplicationsData = {};
  
  return {
    ref: jest.fn((db, path) => ({ db, path })),
    onValue: jest.fn((ref, callback) => {
      if (ref.path === 'jobs') {
        callback({ val: () => jobsData });
      }
      return jest.fn(); // Return mock unsubscribe function
    }),
    get: jest.fn((ref) => {
      if (ref.path.includes('applications/')) {
        const jobId = ref.path.split('/')[1];
        return Promise.resolve({
          exists: () => !!applicationsData[jobId],
          val: () => applicationsData[jobId] || null
        });
      }
      return Promise.resolve({
        exists: () => false,
        val: () => null
      });
    }),
    push: jest.fn((ref) => {
      const newKey = `mock_${Math.random().toString(36).substr(2, 9)}`;
      return { key: newKey };
    }),
    set: jest.fn((ref, data) => {
      const key = ref.key || ref.path.split('/').pop();
      if (ref.path.includes('jobs')) {
        jobsData[key] = data;
      } else if (ref.path.includes('applications')) {
        if (!applicationsData[ref.path.split('/')[1]]) {
          applicationsData[ref.path.split('/')[1]] = {};
        }
        applicationsData[ref.path.split('/')[1]][key] = data;
      } else if (ref.path.includes('accepted_applications')) {
        if (!acceptedApplicationsData[ref.path.split('/')[1]]) {
          acceptedApplicationsData[ref.path.split('/')[1]] = {};
        }
        acceptedApplicationsData[ref.path.split('/')[1]][key] = data;
      } else if (ref.path.includes('rejected_applications')) {
        if (!rejectedApplicationsData[ref.path.split('/')[1]]) {
          rejectedApplicationsData[ref.path.split('/')[1]] = {};
        }
        rejectedApplicationsData[ref.path.split('/')[1]][key] = data;
      }
      return Promise.resolve();
    }),
    update: jest.fn((ref, data) => {
      const key = ref.path.split('/').pop();
      if (ref.path.includes('applications')) {
        const jobId = ref.path.split('/')[1];
        applicationsData[jobId][key] = { ...applicationsData[jobId][key], ...data };
      }
      return Promise.resolve();
    }),
    remove: jest.fn((ref) => {
      const key = ref.path.split('/').pop();
      delete jobsData[key];
      return Promise.resolve();
    })
  };
});

describe('ClientJobs Component', () => {
  beforeAll(() => {
    localStorage.setItem('userUID', 'test-user-123');
    localStorage.setItem('userEmail', 'client@example.com');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without jobs and shows empty message', () => {
    render(<ClientJobs />);
    expect(screen.getByText("You haven't posted any jobs yet.")).toBeInTheDocument();
  });

  it('handles milestone changes', async () => {
  render(<ClientJobs />);
  
  // Get all milestone inputs
  const milestoneDescriptions = screen.getAllByLabelText(/Description:/);
  const milestoneAmounts = screen.getAllByLabelText(/Amount:/);
  
  // Change first milestone description
  fireEvent.change(milestoneDescriptions[0], { 
    target: { value: 'New Milestone Description' } 
  });
  
  // Verify the change was handled
  expect(milestoneDescriptions[0]).toHaveValue('New Milestone Description');
  
  // Change first milestone amount
  fireEvent.change(milestoneAmounts[0], { 
    target: { value: '500' } 
  });
  
  // Verify the change was handled
  expect(milestoneAmounts[0]).toHaveValue('500');
});

it('handles editing a job with existing milestones', async () => {
  const mockJob = {
    id: 'job1',
    title: 'Existing Job',
    description: 'Job description',
    category: 'Design',
    budget: 1000,
    deadline: '2025-12-31',
    clientUID: 'test-user-123',
    milestones: [
      { description: 'Design', amount: '300' },
      { description: 'Development', amount: '500' },
      { description: 'Testing', amount: '200' }
    ]
  };

  render(<ClientJobs />);
  
  // Simulate clicking edit on a job
  act(() => {
    handleEditClick(mockJob);
  });

  // Verify form is populated correctly
  expect(screen.getByLabelText('Job Title')).toHaveValue('Existing Job');
  expect(screen.getByLabelText('Description')).toHaveValue('Job description');
  
  // Verify milestones are populated
  const milestoneDescriptions = screen.getAllByLabelText(/Description:/);
  expect(milestoneDescriptions[0]).toHaveValue('Design');
  expect(milestoneDescriptions[1]).toHaveValue('Development');
  expect(milestoneDescriptions[2]).toHaveValue('Testing');
});

it('handles editing a job without milestones', async () => {
  const mockJob = {
    id: 'job2',
    title: 'Job Without Milestones',
    description: 'No milestones',
    category: 'Writing',
    budget: 500,
    deadline: '2025-06-30',
    clientUID: 'test-user-123'
    // No milestones property
  };

  render(<ClientJobs />);
  
  act(() => {
    handleEditClick(mockJob);
  });

  // Verify form is populated
  expect(screen.getByLabelText('Job Title')).toHaveValue('Job Without Milestones');
  
  // Verify default milestones are created
  const milestoneDescriptions = screen.getAllByLabelText(/Description:/);
  expect(milestoneDescriptions[0]).toHaveValue('');
  expect(milestoneDescriptions[1]).toHaveValue('');
  expect(milestoneDescriptions[2]).toHaveValue('');
});

it('scrolls to form when editing', async () => {
  const mockScroll = jest.fn();
  const mockJob = {
    id: 'job3',
    title: 'Scroll Test Job',
    description: 'Test scrolling',
    category: 'Marketing',
    budget: 800,
    deadline: '2025-09-15',
    clientUID: 'test-user-123'
  };

  // Mock the form section ref
  const formSectionRef = { current: { scrollIntoView: mockScroll } };
  
  // You'll need to modify your component to accept ref as a prop for testing
  render(<ClientJobs formSectionRef={formSectionRef} />);
  
  act(() => {
    handleEditClick(mockJob);
  });

  expect(mockScroll).toHaveBeenCalledWith({ behavior: 'smooth' });
});

  it('displays form validation errors', async () => {
    render(<ClientJobs />);
    fireEvent.click(screen.getByText('Create Job'));
    expect(await screen.findByText('Please fill in all fields.')).toBeInTheDocument();
  });

  it('creates a new job successfully with milestones', async () => {
    render(<ClientJobs />);
    
    fireEvent.change(screen.getByLabelText('Job Title'), { target: { value: 'New Website' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Build a React site' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Web Development' } });
    fireEvent.change(screen.getByLabelText('Budget (USD)'), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText('Deadline'), { target: { value: '2025-12-31' } });
    
    // Fill in milestones
    const milestoneDescriptions = screen.getAllByLabelText(/Milestone \d Description:/);
    const milestoneAmounts = screen.getAllByLabelText(/Amount:/);
    
    fireEvent.change(milestoneDescriptions[0], { target: { value: 'Design' } });
    fireEvent.change(milestoneAmounts[0], { target: { value: '300' } });
    fireEvent.change(milestoneDescriptions[1], { target: { value: 'Development' } });
    fireEvent.change(milestoneAmounts[1], { target: { value: '500' } });
    fireEvent.change(milestoneDescriptions[2], { target: { value: 'Testing' } });
    fireEvent.change(milestoneAmounts[2], { target: { value: '200' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Create Job'));
    });

    expect(set).toHaveBeenCalled();
    expect(screen.queryByText('Please fill in all fields.')).not.toBeInTheDocument();
  });

  it('edits an existing job with milestones', async () => {
    const mockJobs = {
      'job1': {
        title: 'Old Job',
        description: 'Old description',
        category: 'Design',
        budget: 500,
        deadline: '2025-01-01',
        clientUID: 'test-user-123',
        milestones: [
          { description: 'Initial', amount: '200' },
          { description: 'Final', amount: '300' },
          { description: '', amount: '' }
        ]
      }
    };

    onValue.mockImplementation((ref, callback) => {
      if (ref.path === 'jobs') {
        callback({ val: () => mockJobs });
      }
      return jest.fn();
    });

    render(<ClientJobs />);

    await waitFor(() => {
      expect(screen.getByText('Old Job')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    // Verify form is populated with job data
    expect(screen.getByLabelText('Job Title')).toHaveValue('Old Job');
    
    // Verify milestones are populated
    const milestoneDescriptions = screen.getAllByLabelText(/Milestone \d Description:/);
    expect(milestoneDescriptions[0]).toHaveValue('Initial');
    expect(milestoneDescriptions[1]).toHaveValue('Final');
    expect(milestoneDescriptions[2]).toHaveValue('');

    // Make changes to milestones
    fireEvent.change(milestoneDescriptions[2], { target: { value: 'Testing' } });
    const milestoneAmounts = screen.getAllByLabelText(/Amount:/);
    fireEvent.change(milestoneAmounts[2], { target: { value: '200' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Save Changes'));
    });

    expect(update).toHaveBeenCalled();
  });

  it('shows and handles applicants with proper status', async () => {
    const mockJobs = {
      'job1': {
        title: 'Job With Applicants',
        description: 'Has applicants',
        category: 'Marketing',
        budget: 1000,
        deadline: '2025-01-01',
        clientUID: 'test-user-123'
      }
    };

    const mockApplications = {
      'app1': {
        name: 'John',
        surname: 'Doe',
        motivation: 'I want this job',
        skills: 'Marketing, SEO',
        status: 'pending',
        applicant_userUID: 'freelancer-123',
        email: 'john@example.com'
      },
      'app2': {
        name: 'Jane',
        surname: 'Smith',
        motivation: 'I need this job',
        skills: 'Content writing',
        status: 'accepted',
        applicant_userUID: 'freelancer-456',
        email: 'jane@example.com'
      }
    };

    onValue.mockImplementation((ref, callback) => {
      if (ref.path === 'jobs') {
        callback({ val: () => mockJobs });
      }
      return jest.fn();
    });

    get.mockImplementation((ref) => {
      if (ref.path.includes('applications/job1')) {
        return Promise.resolve({
          exists: () => true,
          val: () => mockApplications
        });
      }
      return Promise.resolve({
        exists: () => false,
        val: () => null
      });
    });

    render(<ClientJobs />);

    await waitFor(() => {
      expect(screen.getByText('Job With Applicants')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View'));

    await waitFor(() => {
      expect(screen.getByText('Applicants for "Job With Applicants"')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('You have accepted this applicant for the job.')).toBeInTheDocument();
    });

    // Test accepting an applicant
    const acceptButtons = screen.getAllByText('Accept');
    await act(async () => {
      fireEvent.click(acceptButtons[0]);
    });

    expect(update).toHaveBeenCalledTimes(2); // Once for accept, once for rejecting others
    expect(set).toHaveBeenCalled(); // For accepted_applications

    // Test rejecting an applicant
    const rejectButtons = screen.getAllByText('Reject');
    await act(async () => {
      fireEvent.click(rejectButtons[0]);
    });

    expect(update).toHaveBeenCalled();
    expect(set).toHaveBeenCalled(); // For rejected_applications
  });

  it('shows email contact for accepted applicants', async () => {
    const mockJobs = {
      'job1': {
        title: 'Job With Accepted Applicant',
        description: 'Has accepted applicant',
        category: 'Marketing',
        budget: 1000,
        deadline: '2025-01-01',
        clientUID: 'test-user-123'
      }
    };

    const mockApplications = {
      'app1': {
        name: 'John',
        surname: 'Doe',
        motivation: 'I want this job',
        skills: 'Marketing, SEO',
        status: 'accepted',
        applicant_userUID: 'freelancer-123',
        email: 'john@example.com'
      }
    };

    onValue.mockImplementation((ref, callback) => {
      if (ref.path === 'jobs') {
        callback({ val: () => mockJobs });
      }
      return jest.fn();
    });

    get.mockImplementation((ref) => {
      if (ref.path.includes('applications/job1')) {
        return Promise.resolve({
          exists: () => true,
          val: () => mockApplications
        });
      }
      return Promise.resolve({
        exists: () => false,
        val: () => null
      });
    });

    render(<ClientJobs />);

    await waitFor(() => {
      expect(screen.getByText('Job With Accepted Applicant')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View'));

    await waitFor(() => {
      expect(screen.getByText('Please contact them at:')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('handles back button from applicants view', async () => {
    const mockJobs = {
      'job1': {
        title: 'Job With Applicants',
        description: 'Has applicants',
        category: 'Marketing',
        budget: 1000,
        deadline: '2025-01-01',
        clientUID: 'test-user-123'
      }
    };

    onValue.mockImplementation((ref, callback) => {
      if (ref.path === 'jobs') {
        callback({ val: () => mockJobs });
      }
      return jest.fn();
    });

    render(<ClientJobs />);

    await waitFor(() => {
      expect(screen.getByText('Job With Applicants')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View'));
    fireEvent.click(screen.getByText('Back to Job Form'));

    expect(screen.getByText('Post a New Job')).toBeInTheDocument();
  });

  //Lines to test 65-105
  it('loads applicants successfully', async () => {
  const mockJobId = 'job1';
  const mockJobTitle = 'Test Job';
  const mockApplications = {
    'app1': {
      applicant_userUID: 'user1',
      name: 'John',
      surname: 'Doe',
      motivation: 'I want this job',
      skills: 'React, Node',
      status: 'pending',
      email: 'john@example.com'
    },
    'app2': {
      applicant_userUID: 'user2',
      name: 'Jane',
      surname: 'Smith',
      motivation: 'I need this job',
      skills: 'Design',
      status: 'accepted',
      email: 'jane@example.com'
    }
  };

  get.mockResolvedValueOnce({
    exists: () => true,
    val: () => mockApplications
  });

  render(<ClientJobs />);
  
  await act(async () => {
    handleViewApplicants(mockJobId, mockJobTitle);
  });

  expect(setViewingApplicantsJobId).toHaveBeenCalledWith(mockJobId);
  expect(setSelectedJobTitle).toHaveBeenCalledWith(mockJobTitle);
  expect(setApplicants).toHaveBeenCalledWith([
    {
      id: 'app1',
      user_UID: 'user1',
      name: 'John',
      surname: 'Doe',
      motivation: 'I want this job',
      skills: 'React, Node',
      status: 'pending',
      email: 'client@example.com' // From localStorage mock
    },
    {
      id: 'app2',
      user_UID: 'user2',
      name: 'Jane',
      surname: 'Smith',
      motivation: 'I need this job',
      skills: 'Design',
      status: 'accepted',
      email: 'client@example.com'
    }
  ]);
});

it('handles no applicants case', async () => {
  const mockJobId = 'job2';
  const mockJobTitle = 'Empty Job';

  get.mockResolvedValueOnce({
    exists: () => false,
    val: () => null
  });

  render(<ClientJobs />);
  
  await act(async () => {
    handleViewApplicants(mockJobId, mockJobTitle);
  });

  expect(setApplicants).toHaveBeenCalledWith([]);
});

it('handles error when loading applicants', async () => {
  const mockJobId = 'job3';
  const mockJobTitle = 'Error Job';
  const errorMessage = 'Failed to fetch';

  get.mockRejectedValueOnce(new Error(errorMessage));
  window.alert = jest.fn();

  render(<ClientJobs />);
  
  await act(async () => {
    handleViewApplicants(mockJobId, mockJobTitle);
  });

  expect(window.alert).toHaveBeenCalledWith(
    expect.stringContaining("Failed to load applicants.")
  );
});

it('filters out rejected applicants', async () => {
  const mockJobId = 'job4';
  const mockJobTitle = 'Filter Job';
  const mockApplications = {
    'app1': {
      status: 'pending'
    },
    'app2': {
      status: 'accepted'
    },
    'app3': {
      status: 'rejected'
    }
  };

  get.mockResolvedValueOnce({
    exists: () => true,
    val: () => mockApplications
  });

  render(<ClientJobs />);
  
  await act(async () => {
    handleViewApplicants(mockJobId, mockJobTitle);
  });

  // Should only include pending and accepted
  expect(setApplicants).toHaveBeenCalledWith([
    expect.objectContaining({ id: 'app1' }),
    expect.objectContaining({ id: 'app2' })
  ]);
  expect(setApplicants.mock.calls[0][0]).toHaveLength(2);
});

it('handles missing applicant fields with defaults', async () => {
  const mockJobId = 'job5';
  const mockJobTitle = 'Defaults Job';
  const mockApplications = {
    'app1': {
      status: 'pending'
    }
  };

  get.mockResolvedValueOnce({
    exists: () => true,
    val: () => mockApplications
  });

  render(<ClientJobs />);
  
  await act(async () => {
    handleViewApplicants(mockJobId, mockJobTitle);
  });

  expect(setApplicants).toHaveBeenCalledWith([
    expect.objectContaining({
      user_UID: '',
      name: '',
      surname: '',
      motivation: '',
      skills: '',
      status: 'pending',
      email: 'client@example.com'
    })
  ]);
});

it('scrolls to form when viewing applicants', async () => {
  const mockJobId = 'job6';
  const mockJobTitle = 'Scroll Job';
  const mockScroll = jest.fn();

  // Mock the form section ref
  const formSectionRef = { current: { scrollIntoView: mockScroll } };
  
  get.mockResolvedValueOnce({
    exists: () => false,
    val: () => null
  });

  render(<ClientJobs formSectionRef={formSectionRef} />);
  
  await act(async () => {
    handleViewApplicants(mockJobId, mockJobTitle);
  });

  expect(mockScroll).toHaveBeenCalledWith({ behavior: 'smooth' });
});

});
