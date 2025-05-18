import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FreelancerPayments from '../pages/FreelancerPayments';
import { ref, get, update } from 'firebase/database';
import { applications_db } from '../firebaseConfig';

// Mock Firebase and localStorage
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
}));

jest.mock('../firebaseConfig', () => ({
  applications_db: {},
}));

jest.mock('../components/HeaderClient', () => () => <div>HeaderClient</div>);
jest.mock('../components/FooterClient', () => () => <div>FooterClient</div>);

describe('FreelancerPayments Component', () => {
  const mockSnapshot = {
    exists: () => true,
    forEach: (cb) => {
      cb({
        key: 'parentKey',
        forEach: (cb2) => {
          cb2({
            key: 'jobKey',
            val: () => ({
              applicant_userUID: 'test-uid',
              jobTitle: 'Test Job',
              job_milestones: [
                {
                  description: 'Milestone 1',
                  amount: 100,
                  status: 'Pending',
                  duedate: '2025-05-20',
                },
              ],
            }),
          });
        },
      });
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('userUID', 'test-uid');
    localStorage.setItem('freelancerWallet', '250.50');

    get.mockResolvedValue(mockSnapshot);
    update.mockResolvedValue({});
  });

  test('renders headers and wallet correctly', async () => {
    render(<FreelancerPayments />);
    expect(screen.getByText('HeaderClient')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Balance: \$250.50/)).toBeInTheDocument();
    });
  });

  test('displays job milestone after data load', async () => {
    render(<FreelancerPayments />);
    await waitFor(() => {
      expect(screen.getByText('Test Job')).toBeInTheDocument();
      expect(screen.getByText('Milestone 1')).toBeInTheDocument();
      expect(screen.getByText('$100')).toBeInTheDocument();
    });
  });

  test('can filter by job title', async () => {
    render(<FreelancerPayments />);
    await waitFor(() => screen.getByText('Test Job'));

    fireEvent.change(screen.getByPlaceholderText(/Search by freelancer or job title/), {
      target: { value: 'Another Job' },
    });

    expect(screen.queryByText('Test Job')).not.toBeInTheDocument();
  });

  test('can mark milestone as In-Progress and Done', async () => {
    render(<FreelancerPayments />);
    await waitFor(() => screen.getByText('Milestone 1'));

    const inProgressBtn = screen.getByText('Mark as In-Progress');
    fireEvent.click(inProgressBtn);

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(expect.anything(), { status: 'In-Progress' })
    );

    const doneBtn = screen.getByText('Mark as Done');
    fireEvent.click(doneBtn);

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(expect.anything(), { status: 'Done' })
    );
  });

  test('filters status correctly', async () => {
    render(<FreelancerPayments />);
    await waitFor(() => screen.getByText('Milestone 1'));

    fireEvent.change(screen.getByDisplayValue('All'), {
      target: { value: 'Paid' },
    });

    expect(screen.queryByText('Milestone 1')).not.toBeInTheDocument();
  });

  test('exports CSV file', async () => {
    const createElementSpy = jest.spyOn(document, 'createElement');
    render(<FreelancerPayments />);

    await waitFor(() => screen.getByText('Milestone 1'));
    fireEvent.click(screen.getByText('Export CSV'));

    await waitFor(() =>
      expect(createElementSpy).toHaveBeenCalledWith('a')
    );
  });

  test('applies date filters correctly', async () => {
    render(<FreelancerPayments />);
    await waitFor(() => screen.getByText('Milestone 1'));

    fireEvent.change(screen.getByLabelText('', { selector: 'input[type="date"]' }), {
      target: { value: '2025-05-21' },
    });

    expect(screen.queryByText('Milestone 1')).not.toBeInTheDocument();
  });
});
