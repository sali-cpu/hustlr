import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

  afterEach(() => {
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
      expect(push).toHaveBeenCalled();
      expect(set).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        title: 'New Job',
      }));
    });
  });

  it('handles Firebase error when submitting job', async () => {
    set.mockRejectedValue(new Error('Firebase write error'));

    onValue.mockImplementation((ref, callback) => {
      callback({ val: () => null });
    });

    render(<ClientJobs />);

    fireEvent.change(screen.getByLabelText('Job Title'), { target: { value: 'Fail Job' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Fail Desc' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'FailCat' } });
    fireEvent.change(screen.getByLabelText('Budget (USD)'), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText('Deadline'), { target: { value: '2025-11-11' } });

    fireEvent.click(screen.getByText('Create Job'));

    await waitFor(() => {
      expect(set).toHaveBeenCalled();
    });

    it('deletes a job after confirmation', async () => {
  const mockJobData = {
    job1: {
      title: 'To Be Deleted',
      description: 'Desc',
      category: 'Design',
      budget: 200,
      deadline: '2025-01-01',
      clientUID: 'test-user',
    },
  };

  onValue.mockImplementation((ref, callback) => {
    callback({ val: () => mockJobData });
  });

  render(<ClientJobs />);
  await waitFor(() => screen.getByText('To Be Deleted'));

  window.confirm = jest.fn(() => true); // simulate confirmation
  fireEvent.click(screen.getByText('Delete'));

  await waitFor(() => {
    expect(remove).toHaveBeenCalled();
  });
});

it('cancels job deletion if user declines confirmation', async () => {
  const mockJobData = {
    job2: {
      title: 'Not Deleted',
      description: 'Desc',
      category: 'Design',
      budget: 300,
      deadline: '2025-02-01',
      clientUID: 'test-user',
    },
  };

  onValue.mockImplementation((ref, callback) => {
    callback({ val: () => mockJobData });
  });

  render(<ClientJobs />);
  await waitFor(() => screen.getByText('Not Deleted'));

  window.confirm = jest.fn(() => false); // simulate cancel
  fireEvent.click(screen.getByText('Delete'));

  expect(remove).not.toHaveBeenCalled();
});

it('updates an existing job', async () => {
  const mockJobData = {
    job3: {
      title: 'Original Job',
      description: 'Original Desc',
      category: 'Writing',
      budget: 400,
      deadline: '2025-05-01',
      clientUID: 'test-user',
    },
  };

  onValue.mockImplementation((ref, callback) => {
    callback({ val: () => mockJobData });
  });

  render(<ClientJobs />);
  await waitFor(() => screen.getByText('Original Job'));

  fireEvent.click(screen.getByText('Edit'));

  fireEvent.change(screen.getByLabelText('Job Title'), { target: { value: 'Updated Job' } });
  fireEvent.click(screen.getByText('Update Job'));

  await waitFor(() => {
    expect(update).toHaveBeenCalled();
  });
});

it('adds and removes milestones', async () => {
  onValue.mockImplementation((ref, callback) => {
    callback({ val: () => null });
  });

  render(<ClientJobs />);
  fireEvent.click(screen.getByText('Add Milestone'));

  const descriptionInput = screen.getByPlaceholderText('Milestone description');
  const amountInput = screen.getByPlaceholderText('Amount');

  fireEvent.change(descriptionInput, { target: { value: 'Milestone 1' } });
  fireEvent.change(amountInput, { target: { value: '100' } });

  fireEvent.click(screen.getByText('Remove'));

  // no milestone inputs should remain
  expect(screen.queryByPlaceholderText('Milestone description')).not.toBeInTheDocument();
});

it('handles invalid input and shows alerts', async () => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  onValue.mockImplementation((ref, callback) => {
    callback({ val: () => null });
  });

  render(<ClientJobs />);
  fireEvent.click(screen.getByText('Create Job'));

  expect(window.alert).toHaveBeenCalled();
});

it('cancels editing of a job', async () => {
  const mockJobData = {
    job4: {
      title: 'Cancelable Job',
      description: 'Some Desc',
      category: 'Other',
      budget: 800,
      deadline: '2025-12-01',
      clientUID: 'test-user',
    },
  };

  onValue.mockImplementation((ref, callback) => {
    callback({ val: () => mockJobData });
  });

  render(<ClientJobs />);
  await waitFor(() => screen.getByText('Cancelable Job'));

  fireEvent.click(screen.getByText('Edit'));
  fireEvent.click(screen.getByText('Cancel'));

  expect(screen.getByText('Cancelable Job')).toBeInTheDocument();
});

it('handles empty applicants list gracefully', async () => {
  const mockJobData = {
    job5: {
      title: 'Job With No Applicants',
      description: 'No one yet',
      category: 'Design',
      budget: 100,
      deadline: '2025-03-01',
      clientUID: 'test-user',
    },
  };

  onValue.mockImplementation((ref, callback) => {
    callback({ val: () => mockJobData });
  });

  get.mockResolvedValue({
    exists: () => false,
    val: () => null,
  });

  render(<ClientJobs />);
  await waitFor(() => screen.getByText('Job With No Applicants'));

  fireEvent.click(screen.getByText('View'));

  await waitFor(() => {
    expect(screen.getByText('No applicants yet')).toBeInTheDocument();
  });
});


    // Optional: check if an error message or fallback UI appears
    // expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('handles a job without milestones gracefully', async () => {
    const mockJobData = {
      job1: {
        title: 'No Milestones',
        description: 'Desc',
        category: 'Misc',
        budget: 100,
        deadline: '2025-10-10',
        clientUID: 'test-user',
      },
    };

    onValue.mockImplementation((ref, callback) => {
      callback({ val: () => mockJobData });
    });

    render(<ClientJobs />);
    await waitFor(() => expect(screen.getByText('No Milestones')).toBeInTheDocument());
    expect(screen.getByText('Misc')).toBeInTheDocument();
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
