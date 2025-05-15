import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FreeSettings from './FreeSettings';

// Mock components
jest.mock('../components/HeaderClient', () => () => <div>MockHeaderClient</div>);
jest.mock('../components/FooterClient', () => () => <div>MockFooterClient</div>);

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

describe('FreeSettings Component', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <FreeSettings />
      </MemoryRouter>
    );
  });

  test('renders header and footer components', () => {
    expect(screen.getByText('MockHeaderClient')).toBeInTheDocument();
    expect(screen.getByText('MockFooterClient')).toBeInTheDocument();
  });

  test('renders settings heading and back button', () => {
    expect(screen.getByRole('heading', { level: 2, name: /Settings/i })).toBeInTheDocument();
    const backButton = screen.getByRole('button', { name: /←/ });
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('renders search input', () => {
    expect(screen.getByPlaceholderText(/Search for a setting/i)).toBeInTheDocument();
  });

  test('renders all setting options', () => {
    const settingNames = [
      /Account/i,
      /Notifications/i,
      /Appearance/i,
      /Privacy & Security/i,
      /Help and Support/i,
      /About/i,
    ];

    settingNames.forEach((name) => {
      expect(screen.getByRole('button', { name }) || screen.getByRole('link', { name })).toBeInTheDocument();
    });
  });

  test('Account link navigates to /AboutSF', () => {
    const accountLink = screen.getByRole('link', { name: /Account/i });
    expect(accountLink).toHaveAttribute('href', '/AboutSF');
  });
});
