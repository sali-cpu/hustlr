// src/pages/FreelancerPayments.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FreelancerPayments from './FreelancerPayments';

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
    const statusBefore = screen.getByText('Pending');
    expect(statusBefore).toBeInTheDocument();

    const toggleButton = screen.getByText('Mark as Done');
    fireEvent.click(toggleButton);

    const statusAfter = screen.getByText('Done');
    expect(statusAfter).toBeInTheDocument();
  });
});
