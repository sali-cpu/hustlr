import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientReports from '../pages/ClientReports';
import '@testing-library/jest-dom/extend-expect';

// Mocking HeaderClient and FooterClient to avoid rendering issues
jest.mock('../components/HeaderClient', () => () => <div>MockHeader</div>);
jest.mock('../components/FooterClient', () => () => <div>MockFooter</div>);

describe('ClientReports Component', () => {
  beforeEach(() => {
    render(<ClientReports />);
  });

  it('renders form and default values', () => {
    expect(screen.getByText('Client Performance Reports')).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date/i)).toHaveValue('2025-01-01');
    expect(screen.getByLabelText(/End Date/i)).toHaveValue('2025-04-30');
    expect(screen.getByDisplayValue('financial')).toBeInTheDocument();
  });

  it('toggles mock data checkbox', () => {
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('generates financial report from mock data', async () => {
    fireEvent.click(screen.getByRole('button', { name: /Generate Report/i }));

    await waitFor(() => {
      expect(screen.getByText(/Total Spent: USD/)).toBeInTheDocument();
      expect(screen.getByText(/Web Development: 46%/)).toBeInTheDocument();
      expect(screen.getByText('Monthly Trends')).toBeInTheDocument();
    });
  });

  it('generates jobs report from mock data', async () => {
    fireEvent.change(screen.getByLabelText(/Report Type/i), {
      target: { value: 'jobs' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Generate Report/i }));

    await waitFor(() => {
      expect(screen.getByText(/completed: 12 \(75%\)/)).toBeInTheDocument();
      expect(screen.getByText(/Completion Timelines/)).toBeInTheDocument();
    });
  });

  it('generates freelancer report from mock data', async () => {
    fireEvent.change(screen.getByLabelText(/Report Type/i), {
      target: { value: 'freelancer' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Generate Report/i }));

    await waitFor(() => {
      expect(screen.getByText(/Sarah Johnson: 100% completion/)).toBeInTheDocument();
      expect(screen.getByText('Freelancer Stats')).toBeInTheDocument();
    });
  });
});
