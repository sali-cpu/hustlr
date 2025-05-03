import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FreelancerPayments from './FreelancerPayments';
import '@testing-library/jest-dom';

describe('FreelancerPayments Component', () => {
  test('renders the page title', () => {
    render(<FreelancerPayments />);
    const title = screen.getByText(/Jobs for Clients/i);
    expect(title).toBeInTheDocument();
  });

  test('displays payment data in table', () => {
    render(<FreelancerPayments />);
    expect(screen.getByText('Website Redesign')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('$300')).toBeInTheDocument();
  });

  test('toggles status from Pending to Done when button is clicked', () => {
    render(<FreelancerPayments />);

    // Use getAllByText to handle multiple matching elements
    const statusBefore = screen.getAllByText('Pending')[0]; // Get the first match
    expect(statusBefore).toBeInTheDocument();

    const toggleButton = screen.getByText('Mark as Done');
    fireEvent.click(toggleButton);

    // After the click, check if the status has changed to 'Done'
    const statusAfter = screen.getAllByText('Done')[0]; // Get the first match
    expect(statusAfter).toBeInTheDocument();
  });
});
