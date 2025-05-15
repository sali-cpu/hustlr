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

  test('renders job cards and apply buttons', async () => {
    render(<FreelancerJobs />);
    await waitFor(() => {
      const applyButtons = screen.getAllByText('Apply');
      expect(applyButtons.length).toBeGreaterThan(0);
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
