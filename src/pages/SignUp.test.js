import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SignUp from './SignUp';
import { BrowserRouter } from 'react-router-dom';

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

// Helper to wrap component with router context
const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('SignUp Component', () => {
  it('renders without crashing', () => {
    renderWithRouter(<SignUp />);
    expect(screen.getByText('Sign up to Hustlr')).toBeInTheDocument();
  });

  it('shows radio buttons for Client and Freelancer', () => {
    renderWithRouter(<SignUp />);
    expect(screen.getByLabelText('Client')).toBeInTheDocument();
    expect(screen.getByLabelText('Freelancer')).toBeInTheDocument();
  });

  it('triggers Google sign-in when button is clicked', async () => {
    renderWithRouter(<SignUp />);
    fireEvent.click(screen.getByLabelText('Client'));
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    // No assertion here, just checking the event doesn't crash
  });

  it('triggers Microsoft sign-in when button is clicked', async () => {
    renderWithRouter(<SignUp />);
    fireEvent.click(screen.getByLabelText('Freelancer'));
    fireEvent.click(screen.getByRole('button', { name: /sign in with microsoft/i }));
    // Again, this is more a functional call test
  });

  it('shows alert if no role is selected when signing in', () => {
    window.alert = jest.fn(); // mock alert
    renderWithRouter(<SignUp />);
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    expect(window.alert).toHaveBeenCalledWith('Please select a role before signing up.');
  });
});
