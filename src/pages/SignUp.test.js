import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUp from './SignUp';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { signInWithPopup } from 'firebase/auth';
import { set } from 'firebase/database';

// Mock Firebase methods and dependencies
jest.mock('../firebaseConfig', () => ({
  googleAuth: {},
  microsoftAuth: {},
  google_db: {},
  microsoft_db: {},
}));

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn(() => ({
    setCustomParameters: jest.fn(),
  })),
  OAuthProvider: jest.fn(() => ({
    setCustomParameters: jest.fn(),
  })),
  signInWithPopup: jest.fn(() => Promise.resolve({
    user: {
      uid: 'testuid',
      displayName: 'Test User',
      email: 'test@example.com',
    },
  })),
}));

jest.mock('firebase/database', () => ({
  get: jest.fn(() => Promise.resolve({ exists: () => false })),
  ref: jest.fn(),
  set: jest.fn(() => Promise.resolve()),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Helper to wrap component with router context
const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('SignUp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithRouter(<SignUp />);
    expect(screen.getByText('Sign up to Hustlr')).toBeInTheDocument();
  });

  it('shows radio buttons for Client and Freelancer', () => {
    renderWithRouter(<SignUp />);
    expect(screen.getByLabelText('Client')).toBeInTheDocument();
    expect(screen.getByLabelText('Freelancer')).toBeInTheDocument();
  });

  it('triggers Google sign-in and calls signInWithPopup', async () => {
    renderWithRouter(<SignUp />);
    fireEvent.click(screen.getByLabelText('Client'));
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    await waitFor(() => expect(signInWithPopup).toHaveBeenCalled());
  });

  it('triggers Microsoft sign-in and calls signInWithPopup', async () => {
    renderWithRouter(<SignUp />);
    fireEvent.click(screen.getByLabelText('Freelancer'));
    fireEvent.click(screen.getByRole('button', { name: /sign in with microsoft/i }));
    await waitFor(() => expect(signInWithPopup).toHaveBeenCalled());
  });

  it('shows alert if no role is selected when signing in', () => {
    window.alert = jest.fn(); // mock alert
    renderWithRouter(<SignUp />);
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    expect(window.alert).toHaveBeenCalledWith('Please select a role before signing up.');
  });

  it('writes user to database if user does not exist', async () => {
    renderWithRouter(<SignUp />);
    fireEvent.click(screen.getByLabelText('Client'));
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    await waitFor(() => expect(set).toHaveBeenCalled());
  });

  it('navigates to dashboard after successful sign-in', async () => {
    renderWithRouter(<SignUp />);
    fireEvent.click(screen.getByLabelText('Client'));
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/client-dashboard')); // Replace with actual path
  });
});
