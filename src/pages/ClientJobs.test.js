import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientJobs from './ClientJobs';
import { db } from '../firebaseConfig';
import { set, ref, push } from 'firebase/database';
import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  set: jest.fn(),
  push: jest.fn(),
  remove: jest.fn(),
  onValue: jest.fn(),
}));

describe('ClientJobs Component', () => {
  const userUID = 'user123';
  const mockJobs = [
    {
      id: '1',
      title: 'Web Development Project',
      description: 'Build a website for client X.',
      category: 'Web Development',
      budget: '500',
      deadline: '2025-05-01',
      clientUID: userUID,
    },
    {
      id: '2',
      title: 'Design Project',
      description: 'Design logo and branding for client Y.',
      category: 'Design',
      budget: '300',
      deadline: '2025-06-01',
      clientUID: userUID,
    },
  ];

  beforeEach(() => {
    localStorage.setItem('userUID', userUID);

    // Mock the onValue function to return mock data
    jest.spyOn(db, 'onValue').mockImplementation((ref, callback) => {
      callback({
        val: () => {
          const data = {};
          mockJobs.forEach((job) => {
            data[job.id] = job;
          });
          return data;
        },
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the list of jobs for the client', async () => {
    render(<ClientJobs />);

    // Ensure jobs are displayed
    await waitFor(() => {
      expect(screen.getByText('Your Posted Jobs')).toBeInTheDocument();
      expect(screen.getByText(mockJobs[0].title)).toBeInTheDocument();
      expect(screen.getByText(mockJobs[1].title)).toBeInTheDocument();
    });
  });

  test('can fill and submit the job posting form', async () => {
    render(<ClientJobs />);

    fireEvent.change(screen.getByLabelText(/Job Title/i), { target: { value: 'New Job Title' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New job description' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Writing' } });
    fireEvent.change(screen.getByLabelText(/Budget \(USD\)/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Deadline/i), { target: { value: '2025-07-01' } });

    fireEvent.click(screen.getByText(/Create Job/i));

    await waitFor(() => {
      expect(set).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          title: 'New Job Title',
          description: 'New job description',
          category: 'Writing',
          budget: 1000,
          deadline: '2025-07-01',
          clientUID: userUID,
        })
      );
    });
  });

  test('can edit a job posting', async () => {
    render(<ClientJobs />);

    const editButton = screen.getAllByText(/Edit/i)[0];
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockJobs[0].title)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockJobs[0].description)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Job Title/i), { target: { value: 'Updated Job Title' } });
    fireEvent.click(screen.getByText(/Save Changes/i));

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          title: 'Updated Job Title',
          description: mockJobs[0].description,
          category: mockJobs[0].category,
          budget: parseFloat(mockJobs[0].budget),
          deadline: mockJobs[0].deadline,
        })
      );
    });
  });

  test('can delete a job posting', async () => {
    render(<ClientJobs />);

    const deleteButton = screen.getAllByText(/Delete/i)[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(remove).toHaveBeenCalledWith(expect.any(Object));
    });
  });
});
