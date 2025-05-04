import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import SignUp from './SignUp';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { googleAuth, microsoftAuth } from '../firebaseConfig';
import { get, ref, set } from 'firebase/database';
import { GoogleAuthProvider, OAuthProvider, signInWithPopup } from 'firebase/auth';

// Mock Firebase methods and dependencies
jest.mock('../firebaseConfig', () => ({
  googleAuth: {},
  microsoftAuth: {},
  google_db: {},
  microsoft_db: {},
}));

jest.mock('firebase/auth', () => {
  const mockUser = {
    uid: 'testuid',
    displayName: 'Test User',
    email: 'test@example.com',
  };

  return {
    GoogleAuthProvider: jest.fn(() => ({
      setCustomParameters: jest.fn(),
    })),
    OAuthProvider: jest.fn(() => ({
      setCustomParameters: jest.fn(),
    })),
    signInWithPopup: jest.fn(() => Promise.resolve({
      user: mockUser,
    })),
  };
});

jest.mock('firebase/database', () => ({
  get: jest.fn(),
  ref: jest.fn(),
  set: jest.fn(),
  child: jest.fn(),
}));

// Helper to wrap component with router context
const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('SignUp Component', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);
    localStorage.clear();
  });

  it('renders without crashing', () => {
    renderWithRouter(<SignUp />);
    expect(screen.getByText('Sign up to Hustlr')).toBeInTheDocument();
    expect(screen.getByText('Hustlr.')).toBeInTheDocument();
  });

  it('shows radio buttons for Client and Freelancer', () => {
    renderWithRouter(<SignUp />);
    expect(screen.getByLabelText('Client')).toBeInTheDocument();
    expect(screen.getByLabelText('Freelancer')).toBeInTheDocument();
    expect(screen.queryByLabelText('Admin')).not.toBeInTheDocument();
  });

  it('shows sign-in buttons for Google and Microsoft', () => {
    renderWithRouter(<SignUp />);
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with microsoft/i })).toBeInTheDocument();
  });

  describe('Google Sign-In', () => {
    it('shows alert if no role is selected', async () => {
      window.alert = jest.fn();
      renderWithRouter(<SignUp />);
      
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
      });

      expect(window.alert).toHaveBeenCalledWith('Please select a role before signing up.');
    });

    it('handles successful sign-up for new Client', async () => {
      get.mockResolvedValueOnce({ exists: () => false });
      set.mockResolvedValueOnce({});
      
      renderWithRouter(<SignUp />);
      fireEvent.click(screen.getByLabelText('Client'));

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
      });

      expect(signInWithPopup).toHaveBeenCalledWith(googleAuth, expect.any(Object));
      expect(localStorage.setItem).toHaveBeenCalledWith('userUID', 'testuid');
      expect(localStorage.setItem).toHaveBeenCalledWith('userName', 'Test User');
      expect(localStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@example.com');
      expect(set).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/Client');
    });

    it('redirects to sign-in if user already exists', async () => {
      get.mockResolvedValueOnce({ exists: () => true });
      
      renderWithRouter(<SignUp />);
      fireEvent.click(screen.getByLabelText('Client'));

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
      });

      expect(mockNavigate).toHaveBeenCalledWith('/SignIn');
    });

    it('handles sign-in errors', async () => {
      signInWithPopup.mockRejectedValueOnce(new Error('Auth failed'));
      window.alert = jest.fn();
      
      renderWithRouter(<SignUp />);
      fireEvent.click(screen.getByLabelText('Client'));

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
      });

      expect(window.alert).toHaveBeenCalledWith('404 error signing in!');
    });
  });

  describe('Microsoft Sign-In', () => {
    it('shows alert if no role is selected', async () => {
      window.alert = jest.fn();
      renderWithRouter(<SignUp />);
      
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sign in with microsoft/i }));
      });

      expect(window.alert).toHaveBeenCalledWith('Please select a role before signing up.');
    });

    it('handles successful sign-up for new Freelancer', async () => {
      get.mockResolvedValueOnce({ exists: () => false });
      set.mockResolvedValueOnce({});
      
      renderWithRouter(<SignUp />);
      fireEvent.click(screen.getByLabelText('Freelancer'));

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sign in with microsoft/i }));
      });

      expect(signInWithPopup).toHaveBeenCalledWith(microsoftAuth, expect.any(Object));
      expect(localStorage.setItem).toHaveBeenCalledWith('userUID', 'testuid');
      expect(localStorage.setItem).toHaveBeenCalledWith('userName', 'Test User');
      expect(localStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@example.com');
      expect(set).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/Freelancer');
    });

    it('redirects to sign-in if user already exists', async () => {
      get.mockResolvedValueOnce({ exists: () => true });
      
      renderWithRouter(<SignUp />);
      fireEvent.click(screen.getByLabelText('Freelancer'));

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sign in with microsoft/i }));
      });

      expect(mockNavigate).toHaveBeenCalledWith('/SignIn');
    });

    it('handles sign-in errors', async () => {
      signInWithPopup.mockRejectedValueOnce(new Error('Auth failed'));
      window.alert = jest.fn();
      
      renderWithRouter(<SignUp />);
      fireEvent.click(screen.getByLabelText('Freelancer'));

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sign in with microsoft/i }));
      });

      expect(window.alert).toHaveBeenCalledWith('Sign-in failed. Please try again.');
    });
  });

  it('has a link to sign-in page', () => {
    renderWithRouter(<SignUp />);
    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/SignIn');
  });

  it('has terms of service link', () => {
    renderWithRouter(<SignUp />);
    const termsLink = screen.getByRole('link', { name: /terms of service/i });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', 'terms.html');
  });
});
