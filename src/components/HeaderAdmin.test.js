import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HeaderAdmin from './HeaderAdmin';
import '@testing-library/jest-dom';

describe('HeaderAdmin Component', () => {
  beforeEach(() => {
    document.body.className = ''; // Clear classList before each test
  });

  test('renders the logo and navigation links', () => {
    render(<HeaderAdmin />);
    expect(screen.getByText('Hustlr.')).toBeInTheDocument();
    expect(screen.getByText('Ongoing Projects')).toBeInTheDocument();
    expect(screen.getByText('Earnings')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Recent Activities')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  test('toggles mobile menu on button click', () => {
    render(<HeaderAdmin />);

    const openButton = screen.getByTestId('menu-open');
    const closeButton = screen.getByTestId('menu-close');

    expect(document.body.classList.contains('show-mobile-menu')).toBe(false);

    fireEvent.click(openButton);
    expect(document.body.classList.contains('show-mobile-menu')).toBe(true);

    fireEvent.click(closeButton);
    expect(document.body.classList.contains('show-mobile-menu')).toBe(false);
  });
});
