import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientJobs from './ClientJobs';
import { ref, get, push, set, update, remove, onValue } from 'firebase/database';
import { db, applications_db } from '../firebaseConfig';
import '@testing-library/jest-dom';

onSnapshot: jest.fn((query, callback) => {
  callback({
    docs: [],
    forEach: jest.fn(), // in case component loops over it
  });
  return jest.fn(); // unsubscribe
}),

jest.mock('firebase/database', () => ({
  ref: jest.fn((db, path) => ({ path })),
  get: jest.fn(() => Promise.resolve({ exists: () => false })),
  push: jest.fn(() => ({ key: 'mock-key' })),
  set: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve()),
  remove: jest.fn(() => Promise.resolve()),
  onValue: jest.fn(),
}));

beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Mock localStorage
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'userUID') return 'test-user-uid';
    if (key === 'userEmail') return 'test@example.com';
    return null;
  });
});


// Mock components and Firebase
jest.mock('../components/HeaderClient', () => () => <div>Header</div>);
jest.mock('../components/FooterClient', () => () => <div>Footer</div>);
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
  push: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  onValue: jest.fn(),
}));
jest.mock('../firebaseConfig', () => ({
  db: {},
  applications_db: {}
}));

jest.mock('firebase/firestore', () => ({
  onSnapshot: jest.fn((query, callback) => {
    callback({ docs: [] }); // mimic snapshot with empty docs
    return jest.fn(); // mock unsubscribe
  }),
}));

beforeEach(() => {
  // Mock localStorage
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'userUID') return 'test-user-uid';
    return null;
  });
});

describe('ClientJobs Component', () => {
  const mockUserUID = 'test-user-123';
  const mockUserEmail = 'test@example.com';
  
  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'userUID') return mockUserUID;
      if (key === 'userEmail') return mockUserEmail;
      return null;
    });

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders basic structure', () => {
    render(<ClientJobs />);
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
    expect(screen.getByText('Jobs for Clients')).toBeInTheDocument();
    expect(screen.getByText('Your Posted Jobs')).toBeInTheDocument();
    expect(screen.getByText('Post a New Job')).toBeInTheDocument();
  });

test('shows empty state when no jobs', async () => {
  render(<ClientJobs />);

  await waitFor(() => {
    expect(screen.getByText("You haven't posted any jobs yet.")).toBeInTheDocument();
  });
});


  test('displays jobs list', async () => {
    const mockJobs = {
      job1: { 
        title: 'Test Job 1', 
        description: 'Description 1',
        category: 'Web Development',
        budget: 1000,
        deadline: '2025-01-01',
        clientUID: mockUserUID
      }
    };

    onValue.mockImplementation((ref, callback) => {
      callback({ val: () => mockJobs });
    });

    render(<ClientJobs />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Job 1')).toBeInTheDocument();
      expect(screen.getByText('Web Development')).toBeInTheDocument();
      expect(screen.getByText('$1,000')).toBeInTheDocument();
    });
  });

  test('handles form input changes', () => {
    render(<ClientJobs />);
    
    const titleInput = screen.getByLabelText('Job Title');
    fireEvent.change(titleInput, { target: { value: 'New Job' } });
    expect(titleInput.value).toBe('New Job');

    const categorySelect = screen.getByLabelText('Category');
    fireEvent.change(categorySelect, { target: { value: 'Design' } });
    expect(categorySelect.value).toBe('Design');
  });

  test('handles milestone changes', () => {
    render(<ClientJobs />);
    
    const milestoneInputs = screen.getAllByLabelText(/Description:/i);
    fireEvent.change(milestoneInputs[0], { target: { value: 'First milestone' } });
    expect(milestoneInputs[0].value).toBe('First milestone');
  });

  test('validates form submission', async () => {
    render(<ClientJobs />);
    
    fireEvent.click(screen.getByText('Create Job'));
    
    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields.')).toBeInTheDocument();
    });
  });

  describe('applicant handling', () => {
    const mockJobId = 'job123';
    const mockApplicants = {
      app1: {
        name: 'John',
        surname: 'Doe',
        skills: 'React, Node',
        motivation: 'I want this job',
        status: 'pending',
        applicant_userUID: 'user123'
      }
    };

    beforeEach(() => {
      get.mockImplementation((ref) => {
        if (ref.path.includes('applications')) {
          return Promise.resolve({ exists: () => true, val: () => mockApplicants });
        }
        return Promise.resolve({ exists: () => false });
      });
    });

    test('views applicants', async () => {
      render(<ClientJobs />);
      
      // First we need to mock some jobs
      const mockJobs = {
        job123: { 
          title: 'Test Job', 
          clientUID: mockUserUID 
        }
      };
      onValue.mockImplementation((ref, callback) => {
        callback({ val: () => mockJobs });
      });

      render(<ClientJobs />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('View'));
      });

      await waitFor(() => {
        expect(screen.getByText('Applicants for "Test Job"')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    test('accepts applicant', async () => {
      update.mockResolvedValueOnce();
      set.mockResolvedValueOnce();
      remove.mockResolvedValueOnce();

      render(<ClientJobs />);
      
      // Trigger viewing applicants first
      const mockJobs = {
        job123: { 
          title: 'Test Job', 
          clientUID: mockUserUID 
        }
      };
      onValue.mockImplementation((ref, callback) => {
        callback({ val: () => mockJobs });
      });

      render(<ClientJobs />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('View'));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('Accept'));
      });

      await waitFor(() => {
        expect(update).toHaveBeenCalled();
        expect(set).toHaveBeenCalled();
        expect(remove).toHaveBeenCalled();
      });
    });
  });

  test('deletes job', async () => {
    window.confirm = jest.fn(() => true);
    remove.mockResolvedValueOnce();

    const mockJobs = {
      job123: { 
        title: 'Test Job', 
        clientUID: mockUserUID 
      }
    };
    onValue.mockImplementation((ref, callback) => {
      callback({ val: () => mockJobs });
    });

    render(<ClientJobs />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(remove).toHaveBeenCalled();
  });

  test('edits job', async () => {
    const mockJobs = {
      job123: { 
        title: 'Test Job', 
        description: 'Test Description',
        category: 'Web Development',
        budget: 1000,
        deadline: '2025-01-01',
        clientUID: mockUserUID
      }
    };
    onValue.mockImplementation((ref, callback) => {
      callback({ val: () => mockJobs });
    });

    render(<ClientJobs />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Edit'));
    });

    expect(screen.getByDisplayValue('Test Job')).toBeInTheDocument();
    expect(screen.getByText('Update Job Details')).toBeInTheDocument();
  });

  test('cancels edit', async () => {
    const mockJobs = {
      job123: { 
        title: 'Test Job', 
        clientUID: mockUserUID 
      }
    };
    onValue.mockImplementation((ref, callback) => {
      callback({ val: () => mockJobs });
    });

    render(<ClientJobs />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Edit'));
    });

    fireEvent.click(screen.getByText('Cancel Edit'));
    expect(screen.getByText('Post a New Job')).toBeInTheDocument();
  });
});
test('renders ClientJobs component and accesses userUID from localStorage', () => {
  render(<ClientJobs />);
  
  // Assert that the page renders main elements (simple way to confirm execution)
  expect(screen.getByText(/Jobs for Clients/i)).toBeInTheDocument();

  // Optional: You could also verify the mock was called
  expect(localStorage.getItem).toHaveBeenCalledWith('userUID');
});

// Update the delete test in your test file
test('deletes job', async () => {
  // Mock window.confirm
  window.confirm = jest.fn(() => true);
  
  // Mock jobs data
  const mockJobs = {
    job123: { 
      title: 'Test Job', 
      clientUID: 'test-user-uid' // This must match your mock userUID
    }
  };

  // Mock the onValue implementation for jobs
  onValue.mockImplementation((ref, callback) => {
    if (ref.path.includes('jobs')) {
      callback({ val: () => mockJobs });
    }
  });

  // Mock the remove function to resolve successfully
  remove.mockImplementation(() => Promise.resolve());

  render(<ClientJobs />);
  
  // Wait for the component to load and render the job
  await waitFor(() => {
    expect(screen.getByText('Test Job')).toBeInTheDocument();
  });

  // Click the delete button
  fireEvent.click(screen.getByText('Delete'));

  // Verify confirm was called
  expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this job?');

  // Wait for the delete operation to complete
  await waitFor(() => {
    // Verify remove was called for all relevant paths
    expect(remove).toHaveBeenCalledTimes(4); // job + applications + accepted + rejected
    
    // You can also verify specific paths if needed
    expect(ref).toHaveBeenCalledWith(db, 'jobs/job123');
    expect(ref).toHaveBeenCalledWith(applications_db, 'applications/job123');
  });
});
