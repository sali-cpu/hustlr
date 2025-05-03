// FreelancerPayments.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FreelancerPayments from '../pages/FreelancerPayments'; // Adjust path as needed
import '@testing-library/jest-dom';

describe('FreelancerPayments Component', () => {
  test('renders the component and displays payment data', () => {
    render(<FreelancerPayments />);

    expect(screen.getByText('Jobs for Clients')).toBeInTheDocument();
    expect(screen.getByText('Payments for Freelancers')).toBeInTheDocument();
    expect(screen.getByText('Website Redesign')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('UI Mockups')).toBeInTheDocument();
    expect(screen.getByText('$300')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('2025-04-20')).toBeInTheDocument();
  });

  test('toggles status between Pending and Done', () => {
    render(<FreelancerPayments />);

    const statusElement = screen.getByText('Pending');
    expect(statusElement).toBeInTheDocument();

    const toggleButton = screen.getByText('Mark as Done');
    fireEvent.click(toggleButton);

    expect(screen.getByText('Done')).toBeInTheDocument();

    // Click again to toggle back to Pending
    fireEvent.click(screen.getByText('Mark as Done'));
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  test('renders filter inputs and Export CSV button', () => {
    render(<FreelancerPayments />);

    expect(screen.getByPlaceholderText('Search by freelancer or job title')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('button', { name: /Export CSV/i })[0]).toBeInTheDocument();
  });
});
