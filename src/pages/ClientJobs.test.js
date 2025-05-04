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
  
  return {
    ref: jest.fn((db, path) => ({ db, path })),
    onValue: jest.fn((ref, callback) => {
      if (ref.path === 'jobs') {
        callback({ val: () => jobsData });
      }
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

  it('displays form validation errors', async () => {
    render(<ClientJobs />);
    fireEvent.click(screen.getByText('Create Job'));
    expect(await screen.findByText('⚠️ Please fill in all fields.')).toBeInTheDocument();
  });

  it('creates a new job successfully', async () => {
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
  });

  it('edits an existing job', async () => {
    // Mock existing job data
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

    // Mock onValue implementation
    onValue.mockImplementation((ref, callback) => {
      if (ref.path === 'jobs') {
        callback({ val: () => mockJobs });
      }
    });

    render(<ClientJobs />);

    await waitFor(() => {
      expect(screen.getByText('Old Job')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    // Verify form is populated with job data
    expect(screen.getByLabelText('Job Title')).toHaveValue('Old Job');
    expect(screen.getByLabelText('Description')).toHaveValue('Old description');
    
    // Make changes
    fireEvent.change(screen.getByLabelText('Job Title'), { target: { value: 'Updated Job' } });
    fireEvent.change(screen.getByLabelText('Budget (USD)'), { target: { value: '750' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Save Changes'));
    });

    expect(update).toHaveBeenCalled();
  });

  it('deletes a job', async () => {
    const mockJobs = {
      'job1': {
        title: 'Job to Delete',
        description: 'Delete me',
        category: 'Writing',
        budget: 100,
        deadline: '2025-01-01',
        clientUID: 'test-user-123'
      }
    };

    onValue.mockImplementation((ref, callback) => {
      if (ref.path === 'jobs') {
        callback({ val: () => mockJobs });
      }
    });

    render(<ClientJobs />);

    await waitFor(() => {
      expect(screen.getByText('Job to Delete')).toBeInTheDocument();
    });

    window.confirm = jest.fn(() => true);
    fireEvent.click(screen.getByText('Delete'));

    expect(remove).toHaveBeenCalled();
  });

  it('shows and handles applicants', async () => {
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
        applicant_userUID: 'freelancer-123'
      },
      'app2': {
        name: 'Jane',
        surname: 'Smith',
        motivation: 'I need this job',
        skills: 'Content writing',
        status: 'pending',
        applicant_userUID: 'freelancer-456'
      }
    };

    onValue.mockImplementation((ref, callback) => {
      if (ref.path === 'jobs') {
        callback({ val: () => mockJobs });
      }
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
    });

    // Test accepting an applicant
    const acceptButtons = screen.getAllByText('Accept');
    await act(async () => {
      fireEvent.click(acceptButtons[0]);
    });

    expect(update).toHaveBeenCalled();
    expect(set).toHaveBeenCalled();

    // Test rejecting an applicant
    const rejectButtons = screen.getAllByText('Reject');
    await act(async () => {
      fireEvent.click(rejectButtons[1]);
    });

    expect(update).toHaveBeenCalled();
  });

  it('handles milestone validation', async () => {
    render(<ClientJobs />);
    
    fireEvent.change(screen.getByLabelText('Job Title'), { target: { value: 'Job with milestones' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test milestone validation' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Web Development' } });
    fireEvent.change(screen.getByLabelText('Budget (USD)'), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText('Deadline'), { target: { value: '2025-12-31' } });
    
    // Leave one milestone empty
    const milestoneDescriptions = screen.getAllByLabelText(/Milestone \d Description:/);
    const milestoneAmounts = screen.getAllByLabelText(/Amount:/);
    
    fireEvent.change(milestoneDescriptions[0], { target: { value: 'Design' } });
    fireEvent.change(milestoneAmounts[0], { target: { value: '300' } });
    // Skip filling the second milestone
    fireEvent.change(milestoneDescriptions[2], { target: { value: 'Testing' } });
    fireEvent.change(milestoneAmounts[2], { target: { value: '200' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Create Job'));
    });

    expect(await screen.findByText('⚠️ Please fill in all milestone fields.')).toBeInTheDocument();
  });

  it('cancels edit mode', async () => {
    const mockJobs = {
      'job1': {
        title: 'Editable Job',
        description: 'Can be edited',
        category: 'Design',
        budget: 500,
        deadline: '2025-01-01',
        clientUID: 'test-user-123'
      }
    };

    onValue.mockImplementation((ref, callback) => {
      if (ref.path === 'jobs') {
        callback({ val: () => mockJobs });
      }
    });

    render(<ClientJobs />);

    await waitFor(() => {
      expect(screen.getByText('Editable Job')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Cancel Edit'));

    expect(screen.getByText('Post a New Job')).toBeInTheDocument();
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
    });

    render(<ClientJobs />);

    await waitFor(() => {
      expect(screen.getByText('Job With Applicants')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View'));
    fireEvent.click(screen.getByText('Back to Job Form'));

    expect(screen.getByText('Post a New Job')).toBeInTheDocument();
  });
});
