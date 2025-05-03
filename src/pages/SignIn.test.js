import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignIn from '../pages/SignIn';
import { BrowserRouter } from 'react-router-dom';

// Mock images
jest.mock('../images/google_icon.png', () => 'google_icon.png');
jest.mock('../images/micro_icon.png', () => 'micro_icon.png');

// Mock firebase auth and database
jest.mock('../firebaseConfig', () => ({
  googleAuth: {},
  microsoftAuth: {},
  google_db: {},
  microsoft_db: {},
}));

// Mock firebase modules
jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    setCustomParameters: jest.fn(),
  })),
  OAuthProvider: jest.fn().mockImplementation(() => ({
    setCustomParameters: jest.fn(),
  })),
  signInWithPopup: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
}));

import { signInWithPopup } from 'firebase/auth';
import { get } from 'firebase/database';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('SignIn Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders Google and Microsoft sign-in buttons', () => {
    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );

    expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in with Microsoft/i)).toBeInTheDocument();
  });

  test('signs in user with Google and navigates based on role', async () => {
    signInWithPopup.mockResolvedValue({
      user: { uid: '123', displayName: 'Test User', email: 'test@example.com' },
    });

    get.mockResolvedValue({
      exists: () => true,
      val: () => ({ role: 'client' }),
    });

    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/Sign in with Google/i));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
      expect(get).toHaveBeenCalled();
      expect(localStorage.getItem('userUID')).toBe('123');
      expect(mockNavigate).toHaveBeenCalledWith('/Client');
    });
  });

  test('shows alert and redirects to SignUp if user not found in DB', async () => {
    window.alert = jest.fn();

    signInWithPopup.mockResolvedValue({
      user: { uid: '456', displayName: 'No User', email: 'nouser@example.com' },
    });

    get.mockResolvedValue({ exists: () => false });

    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/Sign in with Google/i));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('User not found. Redirecting to Sign Up.');
      expect(mockNavigate).toHaveBeenCalledWith('/SignUp');
    });
  });

  test('handles sign-in failure', async () => {
    window.alert = jest.fn();

    signInWithPopup.mockRejectedValue(new Error('Popup closed'));

    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/Sign in with Google/i));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Sign-in failed. Try again.');
    });
  });
});
