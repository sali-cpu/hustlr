import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ClientSettings from './ClientSettings';

// Mock subcomponents
jest.mock('../components/HeaderClient', () => () => <div>MockHeaderClient</div>);
jest.mock('../components/FooterClient', () => () => <div>MockFooterClient</div>);

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ClientSettings Component', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <ClientSettings />
      </MemoryRouter>
    );
  });

  test('renders header and footer components', () => {
    expect(screen.getByText('MockHeaderClient')).toBeInTheDocument();
    expect(screen.getByText('MockFooterClient')).toBeInTheDocument();
  });

  test('renders settings title and back button', () => {
    expect(screen.getByRole('heading', { level: 2, name: /Settings/i })).toBeInTheDocument();
    const backButton = screen.getByRole('button', { name: /←/ });
    expect(backButton).toBeInTheDocument();
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('renders search form with input field', () => {
    const searchInput = screen.getByPlaceholderText(/Search for a setting/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('renders settings options list', () => {
    expect(screen.getByRole('navigation', { name: /Settings Options/i })).toBeInTheDocument();

    const options = [
      /Account/i,
      /Notifications/i,
      /Appearance/i,
      /Privacy & Security/i,
      /Help and Support/i,
      /About/i,
    ];

    options.forEach(option => {
      expect(screen.getByRole('button', { name: option }) || screen.getByRole('link', { name: option })).toBeInTheDocument();
    });
  });

  test('Account option links to /AboutSC', () => {
    const accountLink = screen.getByRole('link', { name: /Account/i });
    expect(accountLink).toHaveAttribute('href', '/AboutSC');
  });
});
