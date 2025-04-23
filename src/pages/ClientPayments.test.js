import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ClientPayments from './ClientPayments';
import '@testing-library/jest-dom';

describe('ClientPayments Component', () => {
  test('renders the main headers and navigation', () => {
    render(<ClientPayments />);

    expect(screen.getByText('Jobs for Clients')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Payments for Clients')).toBeInTheDocument();
  });

  test('renders the filter inputs', () => {
    render(<ClientPayments />);

    expect(screen.getByPlaceholderText('Search by freelancer or job title')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(1); // only the search input
    expect(screen.getAllByRole('button')).toHaveLength(2); // Export CSV and Mark as Paid
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  test('renders the payments table with example data', () => {
    render(<ClientPayments />);

    expect(screen.getByText('Website Redesign')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('UI Mockups')).toBeInTheDocument();
    expect(screen.getByText('$300')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('2025-04-20')).toBeInTheDocument();
  });

  test('clicks the "Mark as Paid" button', () => {
    render(<ClientPayments />);

    const markPaidBtn = screen.getByText('Mark as Paid');
    expect(markPaidBtn).toBeInTheDocument();

    fireEvent.click(markPaidBtn);

    // No actual effect yet — just verify clickability
    expect(markPaidBtn).toBeEnabled();
  });
});
