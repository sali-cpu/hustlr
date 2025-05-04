import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Freelancers from '../pages/Freelancers'; // adjust path if needed
import { BrowserRouter } from 'react-router-dom';

describe('Freelancers Component', () => {
  const renderWithRouter = (ui) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  test('renders welcome box by default', () => {
    renderWithRouter(<Freelancers />);
    expect(screen.getByText('Welcome, Freelancer!')).toBeInTheDocument();
    expect(screen.getByText('Access gigs, manage your profile, and collaborate with clients')).toBeInTheDocument();
  });

  test('closes welcome box when close button is clicked', () => {
    renderWithRouter(<Freelancers />);
    const closeButton = screen.getByRole('button', { name: /×/i });
    fireEvent.click(closeButton);
    expect(screen.queryByText('Welcome, Freelancer!')).not.toBeInTheDocument();
  });

  test('shows categories after closing welcome box', () => {
    renderWithRouter(<Freelancers />);
    fireEvent.click(screen.getByRole('button', { name: /×/i }));
    expect(screen.getByText('Jobs')).toBeInTheDocument();
    expect(screen.getByText('Contracts & Tasks')).toBeInTheDocument();
    expect(screen.getByText('Payments')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Quick Stats')).toBeInTheDocument();
  });
});
