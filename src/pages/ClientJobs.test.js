import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientJobs from './ClientJobs';
import { ref, get, push, set, update, remove, onValue } from 'firebase/database';
import { db, applications_db } from '../firebaseConfig';
import '@testing-library/jest-dom';

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

  test('shows empty state when no jobs', () => {
    onValue.mockImplementation((ref, callback) => {
      callback({ val: () => null });
    });

    render(<ClientJobs />);
    expect(screen.getByText("You haven't posted any jobs yet.")).toBeInTheDocument();
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
    
    const milestoneInputs = screen.getAllByLabelText('Description:');
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
