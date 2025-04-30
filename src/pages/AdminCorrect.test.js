import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminCorrect from './AdminCorrect';

describe('AdminCorrect Component', () => {
  test('renders logo and Sign Out button', () => {
    render(<AdminCorrect />, { wrapper: MemoryRouter });
    expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  test('renders admin homepage title', () => {
    render(<AdminCorrect />, { wrapper: MemoryRouter });
    expect(screen.getByText(/Admin Homepage/i)).toBeInTheDocument();
  });

  test('displays welcome box by default', () => {
    render(<AdminCorrect />, { wrapper: MemoryRouter });
    expect(screen.getByText(/Welcome, Admin!/i)).toBeInTheDocument();
  });

  test('closes welcome box when close button is clicked', () => {
    render(<AdminCorrect />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByText('×'));
    expect(screen.queryByText(/Welcome, Admin!/i)).not.toBeInTheDocument();
  });

  test('toggles nav menu when menu button is clicked', () => {
    render(<AdminCorrect />, { wrapper: MemoryRouter });

    const menuButton = screen.getByText('☰');
    fireEvent.click(menuButton);

    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/Reports/i)).toBeInTheDocument();
    expect(screen.getByText(/Help/i)).toBeInTheDocument();

    fireEvent.click(menuButton); // close
    expect(screen.queryByText(/Settings/i)).not.toBeVisible(); // may still be in the DOM but hidden
  });
});
