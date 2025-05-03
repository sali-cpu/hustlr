import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientJobs from '../pages/ClientJobs';
import { db, applications_db } from '../firebaseConfig';
import { ref, onValue, get, push, set, update, remove } from 'firebase/database';
import '@testing-library/jest-dom';

// Mock localStorage
beforeAll(() => {
  global.localStorage.setItem('userUID', 'test-user');
  global.localStorage.setItem('userEmail', 'test@example.com');
  global.MutationObserver = class {
    constructor(callback) {}
    disconnect() {}
    observe() {}
    takeRecords() { return []; }
  };
});

jest.mock('../firebaseConfig', () => ({
  db: {},
  applications_db: {},
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn(),
  get: jest.fn(),
  push: jest.fn(() => ({ key: 'mockKey' })),
  set: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve()),
  remove: jest.fn(() => Promise.resolve()),
}));

jest.mock('../components/HeaderClient', () => () => <div>Mock HeaderClient</div>);
jest.mock('../components/FooterClient', () => () => <div>Mock FooterClient</div>);

describe('ClientJobs Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with no jobs', () => {
    onValue.mockImplementation((ref, callback) => {
      callback({ val: () => null });
    });

    render(<ClientJobs />);
    expect(screen.getByText('Jobs for Clients')).toBeInTheDocument();
    expect(screen.getByText("You haven't posted any jobs yet.")).toBeInTheDocument();
  });

  it('renders a job and allows editing', async () => {
    const mockJobData = {
      job1: {
        title: 'Test Job',
        description: 'Test Description',
        category: 'Web Development',
        budget: 1000,
        deadline: '2025-12-31',
        clientUID: 'test-user',
        milestones: [
          { description: 'Design Phase', amount: 300 },
          { description: 'Development Phase', amount: 500 },
        ],
      },
    };

    onValue.mockImplementation((ref, callback) => {
      callback({ val: () => mockJobData });
    });

    render(<ClientJobs />);
    await waitFor(() => expect(screen.getByText('Test Job')).toBeInTheDocument());
    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('Design Phase')).toBeInTheDocument();
    expect(screen.getByText('Development Phase')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByDisplayValue('Test Job')).toBeInTheDocument();
  });

  it('submits a new job', async () => {
    onValue.mockImplementation((ref, callback) => {
      callback({ val: () => null });
    });

    render(<ClientJobs />);

    fireEvent.change(screen.getByLabelText('Job Title'), { target: { value: 'New Job' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Job Desc' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Design' } });
    fireEvent.change(screen.getByLabelText('Budget (USD)'), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText('Deadline'), { target: { value: '2025-06-30' } });
    
    fireEvent.click(screen.getByText('Create Job'));

    await waitFor(() => {
      expect(set).toHaveBeenCalled();
    });
  });

  it('displays applicants when viewing them', async () => {
    const mockJobData = {
      job1: {
        title: 'Job A',
        description: 'Desc',
        category: 'Design',
        budget: 200,
        deadline: '2025-01-01',
        clientUID: 'test-user',
      },
    };

    const mockApplicants = {
      app1: {
        applicant_userUID: 'user123',
        name: 'Jane',
        surname: 'Doe',
        skills: 'React',
        motivation: 'I love React',
      },
    };

    onValue.mockImplementation((ref, callback) => {
      callback({ val: () => mockJobData });
    });

    get.mockResolvedValue({
      exists: () => true,
      val: () => mockApplicants,
    });

    render(<ClientJobs />);

    await waitFor(() => expect(screen.getByText('Job A')).toBeInTheDocument());
    fireEvent.click(screen.getByText('View'));

    await waitFor(() => expect(screen.getByText('Jane Doe')).toBeInTheDocument());
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('I love React')).toBeInTheDocument();
  });
});
