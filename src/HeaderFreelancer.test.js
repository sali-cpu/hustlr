import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HeaderFreelancer from './HeaderFreelancer';

describe('HeaderFreelancer Component', () => {
  afterEach(() => {
    // Clean up class changes on <body> between tests
    document.body.classList.remove("show-mobile-menu");
  });

  test('renders logo Hustlr.', () => {
    render(<HeaderFreelancer />);
    expect(screen.getByText(/Hustlr\./i)).toBeInTheDocument();
  });

  test('renders navigation items', () => {
    render(<HeaderFreelancer />);
    expect(screen.getByText(/Ongoing Projects/i)).toBeInTheDocument();
    expect(screen.getByText(/Earnings/i)).toBeInTheDocument();
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent Activities/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
  });

  test('opens mobile menu and adds class to body', () => {
    render(<HeaderFreelancer />);
    const openButton = screen.getByRole('button', { name: '' }); // grabs first button with no label (your fa-bars)

    fireEvent.click(openButton);
    expect(document.body.classList.contains('show-mobile-menu')).toBe(true);
  });

  test('closes mobile menu and removes class from body', () => {
    render(<HeaderFreelancer />);
    const openButton = screen.getByRole('button', { name: '' });
    fireEvent.click(openButton); // open
    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton); // close
    expect(document.body.classList.contains('show-mobile-menu')).toBe(false);
  });
});
