import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignIn from '../pages/SignIn';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

global.MutationObserver = class {
  constructor(callback) {}
  disconnect() {}
  observe(element, initObject) {}
};

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

  test('Google provider is initialized with correct parameters', () => {
    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );
    expect(GoogleAuthProvider).toHaveBeenCalled();
    expect(GoogleAuthProvider.mock.instances[0].setCustomParameters).toHaveBeenCalledWith({
      prompt: 'select_account',
    });
  });

  test('Microsoft provider is initialized with correct parameters', () => {
    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );
    expect(OAuthProvider).toHaveBeenCalledWith('microsoft.com');
    expect(OAuthProvider.mock.instances[0].setCustomParameters).toHaveBeenCalledWith({
      prompt: 'select_account',
    });
  });

  test('handles network error during sign-in', async () => {
    signInWithPopup.mockResolvedValue({
      user: { uid: '123', displayName: 'Test User', email: 'test@example.com' },
    });
    get.mockRejectedValue(new Error('Network Error'));

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
    jest.spyOn(window, 'alert').mockImplementation(() => {}); // Mock alert function

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
    jest.spyOn(window, 'alert').mockImplementation(() => {}); // Mock alert function

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
describe('Additional SignIn Tests', () => {
  test('goToPage function navigates to correct routes', () => {
    const { goToPage } = render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    ).container.firstChild.props.children.props.children.props.children[1].type;

    goToPage('client');
    expect(mockNavigate).toHaveBeenCalledWith('/Client');
    
    mockNavigate.mockClear();
    goToPage('freelancer');
    expect(mockNavigate).toHaveBeenCalledWith('/Freelancer');
    
    mockNavigate.mockClear();
    goToPage('admin');
    expect(mockNavigate).toHaveBeenCalledWith('/Admin');
    
    mockNavigate.mockClear();
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    goToPage('unknown');
    expect(window.alert).toHaveBeenCalledWith('Role not found for this user.');
  });

  test('redirects to admin page if user is admin', async () => {
    signInWithPopup.mockResolvedValue({
      user: { 
        uid: 'admin123', 
        displayName: 'Admin User', 
        email: 'ahustlr70@gmail.com' 
      },
    });

    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/Sign in with Google/i));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/Admin');
      expect(get).not.toHaveBeenCalled(); // Should not check DB for admin
    });
  });

  test('handles Microsoft sign-in', async () => {
    signInWithPopup.mockResolvedValue({
      user: { uid: 'ms123', displayName: 'MS User', email: 'msuser@example.com' },
    });

    get.mockResolvedValue({
      exists: () => true,
      val: () => ({ role: 'freelancer' }),
    });

    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/Sign in with Microsoft/i));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/Freelancer');
    });
  });
});

