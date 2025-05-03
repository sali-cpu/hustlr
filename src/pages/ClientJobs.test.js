import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientJobs from '../pages/ClientJobs';
import { db, applications_db } from '../firebaseConfig';
import { onValue, get } from 'firebase/database';
import '@testing-library/jest-dom';


beforeAll(() => {
  global.MutationObserver = class {
    constructor(callback) {}
    disconnect() {}
    observe() {}
    takeRecords() { return []; }
  };
});


// Mocks
jest.mock('../firebaseConfig', () => ({
  db: {},
  applications_db: {},
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn((ref, callback) => {
    callback({ val: () => null }); // mock snapshot
    return () => {}; // <- Mock unsubscribe function
  }),
  get: jest.fn(() => Promise.resolve({ exists: () => false })),
  push: jest.fn(() => ({ key: 'mockKey' })),
  set: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));


jest.mock('../components/HeaderClient', () => () => <div>Mock HeaderClient</div>);
jest.mock('../components/FooterClient', () => () => <div>Mock FooterClient</div>);

describe('ClientJobs Component', () => {
  beforeEach(() => {
    localStorage.setItem('userUID', 'test-user');
  });

  it('renders correctly with no jobs', () => {
    onValue.mockImplementation((ref, callback) => {
      callback({ val: () => null });
    });

    render(<ClientJobs />);
    expect(screen.getByText("Jobs for Clients")).toBeInTheDocument();
    expect(screen.getByText("You haven't posted any jobs yet.")).toBeInTheDocument();
  });

  it('renders a job and allows editing', async () => {
    const mockJob = {
      title: 'Test Job',
      description: 'Test Description',
      category: 'Web Development',
      budget: 1000,
      deadline: '2025-12-31',
      clientUID: 'test-user',
      milestones: [{ description: 'Design', amount: 500 }]
    };

    onValue.mockImplementation((ref, callback) => {
      callback({ val: () => ({ job123: mockJob }) });
    });

    render(<ClientJobs />);

    expect(await screen.findByText('Test Job')).toBeInTheDocument();
    expect(screen.getByText(/Design/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Edit/i));

    expect(await screen.findByDisplayValue('Test Job')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });

  it('shows error when submitting with empty fields', () => {
    onValue.mockImplementation((ref, callback) => {
      callback({ val: () => null });
    });

    render(<ClientJobs />);

    fireEvent.click(screen.getByText(/Create Job/i));
    expect(screen.getByRole('alert')).toHaveTextContent('⚠️ Please fill in all fields.');
  });

  it('displays applicants when "View" is clicked', async () => {
    const mockJob = {
      title: 'Viewable Job',
      description: 'Description',
      category: 'Writing',
      budget: 400,
      deadline: '2025-01-01',
      clientUID: 'test-user',
    };

    const mockApplicants = {
      applicant1: {
        applicant_userUID: 'app1',
        name: 'Alice',
        surname: 'Smith',
        motivation: 'I am great',
        skills: 'Writing',
      }
    };

    onValue.mockImplementation((ref, callback) => {
      callback({ val: () => ({ job567: mockJob }) });
    });

    get.mockResolvedValue({
      exists: () => true,
      val: () => mockApplicants
    });

    render(<ClientJobs />);

    fireEvent.click(await screen.findByText(/View/i));

    await waitFor(() => {
      expect(screen.getByText(/Applicants for "Viewable Job"/)).toBeInTheDocument();
    });

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText(/I am great/)).toBeInTheDocument();
    expect(screen.getByText(/Writing/)).toBeInTheDocument();
  });

  it('deletes a job with confirmation', async () => {
    window.confirm = jest.fn(() => true);
    const mockJob = {
      title: 'Delete Me',
      description: 'Test',
      category: 'Design',
      budget: 250,
      deadline: '2025-05-01',
      clientUID: 'test-user'
    };

    onValue.mockImplementation((ref, callback) => {
      callback({ val: () => ({ job999: mockJob }) });
    });

    render(<ClientJobs />);

    fireEvent.click(await screen.findByText(/Delete/i));

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this job?');
    });
  });
});
