import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SignIn from './SignIn';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock Firebase modules
jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({})),
  OAuthProvider: jest.fn().mockImplementation(() => ({})),
  signInWithPopup: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
}));

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock Firebase config imports
jest.mock('../firebaseConfig', () => ({
  googleAuth: {},
  microsoftAuth: {},
  google_db: {},
  microsoft_db: {},
}));

// Mock image imports
jest.mock('../images/google_icon.png', () => 'google_icon.png');
jest.mock('../images/micro_icon.png', () => 'micro_icon.png');

describe('SignIn Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const renderWithRouter = () => {
    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );
  };

  test('renders all sign-in buttons and text content', () => {
    renderWithRouter();

    expect(screen.getByText('Sign in to Hustlr')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Microsoft')).toBeInTheDocument();
    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();
  });

  test('calls Google sign-in function on button click', async () => {
    const { signInWithPopup } = require('firebase/auth');
    const { get } = require('firebase/database');

    signInWithPopup.mockResolvedValue({
      user: { uid: '123', displayName: 'Test User', email: 'test@example.com' }
    });

    get.mockResolvedValue({
      exists: () => true,
      val: () => ({ role: 'client' })
    });

    renderWithRouter();

    fireEvent.click(screen.getByText('Sign in with Google'));

    expect(signInWithPopup).toHaveBeenCalled();
    expect(get).toHaveBeenCalled();
  });

  test('redirects to signup page if user is not found in database', async () => {
    const { signInWithPopup } = require('firebase/auth');
    const { get } = require('firebase/database');

    signInWithPopup.mockResolvedValue({
      user: { uid: '123', displayName: 'Test User', email: 'test@example.com' }
    });

    get.mockResolvedValue({
      exists: () => false
    });

    renderWithRouter();

    fireEvent.click(screen.getByText('Sign in with Google'));
    // Wait for async call to resolve
    await Promise.resolve();

    expect(mockNavigate).toHaveBeenCalledWith('/SignUp');
  });

  test('calls Microsoft sign-in function on button click', async () => {
    const { signInWithPopup } = require('firebase/auth');
    const { get } = require('firebase/database');

    signInWithPopup.mockResolvedValue({
      user: { uid: '456', displayName: 'MS User', email: 'ms@example.com' }
    });

    get.mockResolvedValue({
      exists: () => true,
      val: () => ({ role: 'freelancer' })
    });

    renderWithRouter();

    fireEvent.click(screen.getByText('Sign in with Microsoft'));

    expect(signInWithPopup).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/Freelancer');
  });
});
