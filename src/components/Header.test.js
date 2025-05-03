import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import '@testing-library/jest-dom';


describe('Header Component', () => {
  test('renders header title', () => {
    render(<Header />, { wrapper: MemoryRouter });
    expect(screen.getByText(/Hustlr\./i)).toBeInTheDocument();
  });

  test('renders Join and Sign In links', () => {
    render(<Header />, { wrapper: MemoryRouter });
    expect(screen.getByText(/Join/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
  });

  test('sidebar is hidden by default', () => {
    render(<Header />, { wrapper: MemoryRouter });
    const sidebar = screen.getByRole('navigation', { hidden: true }) || document.getElementById('sidebar');
    expect(sidebar.className).not.toContain('show');
  });

  test('sidebar shows when toggle is clicked', () => {
    render(<Header />, { wrapper: MemoryRouter });
    const toggle = screen.getByText('☰');
    fireEvent.click(toggle);
    const sidebar = document.getElementById('sidebar');
    expect(sidebar.className).toContain('show');
  });

  test('sidebar contains buttons when shown', () => {
    render(<Header />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByText('☰'));
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });
});
