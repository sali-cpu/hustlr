import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FreelancerJobs from './FreelancerJobs';
import '@testing-library/jest-dom';
import * as firebaseDatabase from 'firebase/database';

// Mock MutationObserver
global.MutationObserver = class {
  constructor(callback) {}
  disconnect() {}
  observe(element, initObject) {}
};

// Enhanced Firebase mocks
jest.mock('firebase/database', () => ({
  get: jest.fn(),
  ref: jest.fn((db, path) => ({ db, path })),
  push: jest.fn(() => ({
    then: jest.fn(callback => callback()) // Mock the Promise chain
  })),
  onValue: jest.fn(),
  set: jest.fn(),
  update: jest.fn()
}));

jest.mock('../firebaseConfig', () => ({
  db: {},
  applications_db: {} // Add this if missing
}));

jest.mock('../components/HeaderFreelancer', () => () => <div>Mock Header</div>);

describe('FreelancerJobs Component', () => {
  const mockJobs = {
    job1: {
      title: 'Website Design',
      description: 'Redesign homepage',
      category: 'Web Design',
      budget: 500,
      deadline: '2025-05-01',
      milestones: [
        { description: 'Design phase', amount: '200' },
        { description: 'Implementation', amount: '300' }
      ]
    },
    job2: {
      title: 'App UI Mockup',
      description: 'Design app interface',
      category: 'Design',
      budget: 300,
      deadline: '2025-06-01'
    }
  };

  const mockApplications = {
    job1: {
      app1: {
        applicant_userUID: 'test123',
        status: 'pending'
      }
    }
  };

  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'userUID') return 'test123';
      return null;
    });

    // Mock Firebase responses
    firebaseDatabase.get.mockImplementation((ref) => {
      if (ref.path === 'jobs') {
        return Promise.resolve({ exists: () => true, val: () => mockJobs });
      }
      if (ref.path.includes('accepted_applications')) {
        return Promise.resolve({ exists: () => false });
      }
      return Promise.resolve({ exists: () => false });
    });

    // Mock push to return a thenable
    firebaseDatabase.push.mockImplementation(() => ({
      then: (callback) => {
        callback();
        return { catch: jest.fn() };
      }
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders header and UI sections', async () => {
    render(<FreelancerJobs />);
    expect(screen.getByText('Mock Header')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Website Design')).toBeInTheDocument();
    });
  });

  test('fills and submits application form', async () => {
    render(<FreelancerJobs />);
    
    await waitFor(() => {
      expect(screen.getByText('Website Design')).toBeInTheDocument();
    });

    // Click apply button
    fireEvent.click(screen.getAllByText('Apply')[0]);

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Enter your name'), { 
      target: { value: 'John' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your surname'), { 
      target: { value: 'Doe' } 
    });
    fireEvent.change(screen.getByPlaceholderText('e.g., JavaScript, React, Firebase'), { 
      target: { value: 'React, Firebase' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Write your motivation here...'), { 
      target: { value: 'I am passionate.' } 
    });

    // Mock window.alert
    window.alert = jest.fn();

    // Submit form
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(firebaseDatabase.push).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('✅ Thank you for applying. You will hear a response soon.');
    });
  });

  test('shows validation errors', async () => {
    render(<FreelancerJobs />);
    
    await waitFor(() => {
      expect(screen.getByText('Website Design')).toBeInTheDocument();
    });

    // Click apply button
    fireEvent.click(screen.getAllByText('Apply')[0]);

    // Submit empty form
    fireEvent.click(screen.getByText('Submit'));

    // Check for validation errors
    expect(screen.getByText('Please fill in the name field.')).toBeInTheDocument();
    expect(screen.getByText('Please fill in the surname field.')).toBeInTheDocument();
  });
});
