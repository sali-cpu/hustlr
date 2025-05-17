import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientReports from './ClientReports';
import '@testing-library/jest-dom';

// Mock components
jest.mock('../components/HeaderClient', () => () => <div>Header</div>);
jest.mock('../components/FooterClient', () => () => <div>Footer</div>);

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      financial_summary: {
        total_spent: 20000,
        currency: "USD",
        by_category: [{ name: "Test", amount: 10000, percentage: 50 }]
      }
    }),
  })
);

describe('ClientReports Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders basic structure', () => {
    render(<ClientReports />);
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
    expect(screen.getByText('Client Performance Reports')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date:')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date:')).toBeInTheDocument();
    expect(screen.getByLabelText('Report Type:')).toBeInTheDocument();
  });

  test('handles form input changes', () => {
    render(<ClientReports />);
    
    const startDate = screen.getByLabelText('Start Date:');
    fireEvent.change(startDate, { target: { value: '2025-01-01' } });
    expect(startDate.value).toBe('2025-01-01');

    const reportType = screen.getByLabelText('Report Type:');
    fireEvent.change(reportType, { target: { value: 'jobs' } });
    expect(reportType.value).toBe('jobs');
  });

  test('toggles mock data usage', () => {
    render(<ClientReports />);
    const toggle = screen.getByLabelText('Use Mock Data');
    expect(toggle.checked).toBe(true);
    
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);
  });

  describe('with mock data', () => {
    test('generates financial report', async () => {
      render(<ClientReports />);
      
      fireEvent.click(screen.getByRole('button', { name: 'Generate Report' }));
      
      await waitFor(() => {
        expect(screen.getByText('Total Spent: USD 18,500')).toBeInTheDocument();
        expect(screen.getByText('Web Development: 46% ($8,500)')).toBeInTheDocument();
      });
    });

    test('generates jobs report', async () => {
      render(<ClientReports />);
      
      fireEvent.change(screen.getByLabelText('Report Type:'), { 
        target: { value: 'jobs' } 
      });
      fireEvent.click(screen.getByRole('button', { name: 'Generate Report' }));
      
      await waitFor(() => {
        expect(screen.getByText('completed: 12 (75%)')).toBeInTheDocument();
        expect(screen.getByText('Job ID')).toBeInTheDocument();
      });
    });

    test('generates freelancer report', async () => {
      render(<ClientReports />);
      
      fireEvent.change(screen.getByLabelText('Report Type:'), { 
        target: { value: 'freelancer' } 
      });
      fireEvent.click(screen.getByRole('button', { name: 'Generate Report' }));
      
      await waitFor(() => {
        expect(screen.getByText('Sarah Johnson: 100% completion')).toBeInTheDocument();
        expect(screen.getByText('Avg Rating')).toBeInTheDocument();
      });
    });
  });

  describe('with API data', () => {
    beforeEach(() => {
      render(<ClientReports />);
      fireEvent.click(screen.getByLabelText('Use Mock Data')); // Toggle off mock data
    });

    test('successfully fetches API data', async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Generate Report' }));
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/reports?report_type=financial')
        );
        expect(screen.getByText('Total Spent: USD 20,000')).toBeInTheDocument();
      });
    });

    test('handles API fetch error', async () => {
      fetch.mockImplementationOnce(() => 
        Promise.reject(new Error('API Error'))
      );
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      fireEvent.click(screen.getByRole('button', { name: 'Generate Report' }));
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching report:', expect.any(Error));
      });
      consoleSpy.mockRestore();
    });
  });

  test('shows loading state during report generation', async () => {
    render(<ClientReports />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Generate Report' }));
    
    expect(screen.getByText('Generating...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Generating...')).not.toBeInTheDocument();
    });
  });
});
