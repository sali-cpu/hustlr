import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientJobs from './ClientJobs';
import { db, applications_db } from '../firebaseConfig';
import { get, ref, push, set, update, remove, onValue } from 'firebase/database';

// Mock Firebase dependencies
jest.mock('../firebaseConfig', () => ({
  db: {},
  applications_db: {}
}));

jest.mock('firebase/database', () => ({
  get: jest.fn(),
  ref: jest.fn(),
  push: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  onValue: jest.fn()
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

describe('ClientJobs Component', () => {
  const mockJobs = [
    {
      id: 'job1',
      title: 'Test Job 1',
      description: 'Test Description 1',
      category: 'Web Development',
      budget: 1000,
      deadline: '2023-12-31',
      milestones: [
        { description: 'Milestone 1', amount: '500' },
        { description: 'Milestone 2', amount: '500' }
      ],
      clientUID: 'user123'
    }
  ];

  const mockApplicants = [
    {
      id: 'app1',
      user_UID: 'freelancer123',
      name: 'John',
      surname: 'Doe',
      motivation: 'I want this job',
      skills: 'React, JavaScript',
      status: 'pending',
      email: 'freelancer@example.com'
    }
  ];

  beforeEach(() => {
    // Set up localStorage
    window.localStorage.setItem('userUID', 'user123');
    window.localStorage.setItem('userEmail', 'client@example.com');

    // Mock Firebase responses
    onValue.mockImplementation((ref, callback) => {
      callback({ 
        val: () => mockJobs.reduce((acc, job) => ({ ...acc, [job.id]: job }), {}) 
      });
      return jest.fn(); // Return unsubscribe function
    });

    get.mockImplementation((ref) => {
      if (ref.path.includes('applications')) {
        return Promise.resolve({ 
          exists: () => true, 
          val: () => mockApplicants.reduce((acc, app) => ({ ...acc, [app.id]: app }), {}) 
        });
      }
      return Promise.resolve({ exists: () => false });
    });

    push.mockReturnValue({ key: 'newJobId' });
    set.mockResolvedValue();
    update.mockResolvedValue();
    remove.mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  test('renders the component with header', () => {
    render(<ClientJobs />);
    expect(screen.getByText('Jobs for Clients')).toBeInTheDocument();
  });

  test('displays "no jobs" message when no jobs exist', () => {
    onValue.mockImplementationOnce((ref, callback) => {
      callback({ val: () => null });
      return jest.fn();
    });
    
    render(<ClientJobs />);
    expect(screen.getByText("You haven't posted any jobs yet.")).toBeInTheDocument();
  });

  test('displays list of jobs', async () => {
    render(<ClientJobs />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Job 1')).toBeInTheDocument();
      expect(screen.getByText('Web Development')).toBeInTheDocument();
      expect(screen.getByText('$1,000')).toBeInTheDocument();
    });
  });

  test('shows job form when clicking edit button', async () => {
    render(<ClientJobs />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Edit'));
    });

    expect(screen.getByLabelText('Job Title')).toHaveValue('Test Job 1');
    expect(screen.getByLabelText('Description')).toHaveValue('Test Description 1');
  });

  test('shows applicants when clicking view button', async () => {
    render(<ClientJobs />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('View'));
    });

    expect(screen.getByText('Applicants for "Test Job 1"')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('handles form submission for new job', async () => {
    render(<ClientJobs />);
    
    fireEvent.change(screen.getByLabelText('Job Title'), { target: { value: 'New Job' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Design' } });
    fireEvent.change(screen.getByLabelText('Budget (USD)'), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText('Deadline'), { target: { value: '2023-12-31' } });
    
    // Fill in milestones
    const milestoneInputs = screen.getAllByLabelText(/Milestone \d Description:/);
    fireEvent.change(milestoneInputs[0], { target: { value: 'Design phase' } });
    fireEvent.change(screen.getAllByLabelText(/Amount:/)[0], { target: { value: '250' } });
    
    fireEvent.click(screen.getByText('Create Job'));

    await waitFor(() => {
      expect(set).toHaveBeenCalled();
    });
  });

  test('shows error when required fields are missing', async () => {
    render(<ClientJobs />);
    
    fireEvent.click(screen.getByText('Create Job'));

    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields.')).toBeInTheDocument();
    });
  });

  test('handles applicant acceptance', async () => {
    render(<ClientJobs />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('View'));
    });

    fireEvent.click(screen.getByText('Accept'));

    await waitFor(() => {
      expect(update).toHaveBeenCalled();
    });
  });

  test('handles applicant rejection', async () => {
    render(<ClientJobs />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('View'));
    });

    fireEvent.click(screen.getByText('Reject'));

    await waitFor(() => {
      expect(update).toHaveBeenCalled();
    });
  });

  test('handles job deletion', async () => {
    window.confirm = jest.fn(() => true);
    
    render(<ClientJobs />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(remove).toHaveBeenCalled();
    });
  });
});
