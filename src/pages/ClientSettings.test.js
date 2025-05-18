import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ClientSettings from './ClientSettings';
import '@testing-library/jest-dom';

// Mock components and hooks
jest.mock('../components/HeaderClient', () => () => <div>Header</div>);
jest.mock('../components/FooterClient', () => () => <div>Footer</div>);
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('ClientSettings Component', () => {
  test('renders all main elements', () => {
    render(
      <BrowserRouter>
        <ClientSettings />
      </BrowserRouter>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search for a setting...')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('renders all settings options', () => {
    render(
      <BrowserRouter>
        <ClientSettings />
      </BrowserRouter>
    );

    const settingsItems = [
      'Account',
      'Notifications',
      'Appearance',
      'Privacy & Security',
      'Help and Support',
      'About'
    ];

    settingsItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  test('back button calls navigate', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);

    render(
      <BrowserRouter>
        <ClientSettings />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '←' }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('search form prevents default submission', () => {
    const preventDefault = jest.fn();
    render(
      <BrowserRouter>
        <ClientSettings />
      </BrowserRouter>
    );

    const form = screen.getByRole('search');
    fireEvent.submit(form, { preventDefault });
    expect(preventDefault).toHaveBeenCalled();
  });

  test('account link navigates to correct route', () => {
    render(
      <BrowserRouter>
        <ClientSettings />
      </BrowserRouter>
    );

    const accountLink = screen.getByRole('link', { name: /Account/ });
    expect(accountLink).toHaveAttribute('href', '/AboutSC');
  });

  test('all buttons have correct structure', () => {
    render(
      <BrowserRouter>
        <ClientSettings />
      </BrowserRouter>
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      if (button.textContent !== '←') { // Skip back button
        expect(button).toHaveClass('settings-button');
        expect(button.querySelector('.arrow')).toHaveTextContent('›');
      }
    });
  });

  test('back button calls navigate', () => {
  const mockNavigate = jest.fn();
  jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);

  render(
    <BrowserRouter>
      <ClientSettings />
    </BrowserRouter>
  );

  fireEvent.click(screen.getByRole('button', { name: '←' }));
  expect(mockNavigate).toHaveBeenCalledWith(-1);
});

  test('matches accessibility requirements', () => {
    render(
      <BrowserRouter>
        <ClientSettings />
      </BrowserRouter>
    );

    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Settings Options');
    expect(screen.getByRole('search')).toBeInTheDocument();
  });
});
