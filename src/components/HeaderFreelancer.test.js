import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeaderFreelancer from './HeaderFreelancer';

describe('HeaderFreelancer Component', () => {
  beforeAll(() => {
    document.body.classList.add = jest.fn();
    document.body.classList.remove = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<HeaderFreelancer />);
    expect(screen.getByText('Hustlr.')).toBeInTheDocument();
  });

  it('finds both mobile menu buttons', () => {
    render(<HeaderFreelancer />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2); // Should find both buttons
    expect(buttons[0]).toHaveClass('fas', 'fa-times');
    expect(buttons[1]).toHaveClass('fas', 'fa-bars');
  });

  it('toggles mobile menu when buttons are clicked', () => {
    render(<HeaderFreelancer />);
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons[0]; // First button is close button
    const menuButton = buttons[1]; // Second button is menu button
    
    // Initial state - menu closed
    expect(document.body.classList.add).not.toHaveBeenCalled();
    
    // Click menu button to open
    fireEvent.click(menuButton);
    expect(document.body.classList.add).toHaveBeenCalledWith('show-mobile-menu');
    
    // Click close button to close
    fireEvent.click(closeButton);
    expect(document.body.classList.remove).toHaveBeenCalledWith('show-mobile-menu');
  });

  it('renders all navigation links', () => {
    render(<HeaderFreelancer />);
    expect(screen.getByText('Ongoing Projects')).toBeInTheDocument();
    expect(screen.getByText('Earnings')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Recent Activities')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('has correct href attributes for navigation links', () => {
    render(<HeaderFreelancer />);
    
    expect(screen.getByText('Earnings').closest('a')).toHaveAttribute('href', '/FreelancerPayments');
    expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/FreeSettings');
    expect(screen.getByText('Recent Activities').closest('a')).toHaveAttribute('href', '/RecentActivity');
    expect(screen.getByText('Sign Out').closest('a')).toHaveAttribute('href', '/');
  });
});
