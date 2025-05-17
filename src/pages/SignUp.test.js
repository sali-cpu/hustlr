import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import SignUp from './SignUp';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { signInWithPopup, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { get, set, ref } from 'firebase/database';

// Mock Firebase methods and dependencies
jest.mock('../firebaseConfig', () => ({
  googleAuth: {},
  microsoftAuth: {},
  google_db: {},
  microsoft_db: {},
}));

jest.mock('firebase/auth', () => {
  const originalModule = jest.requireActual('firebase/auth');
  return {
    ...originalModule,
    GoogleAuthProvider: jest.fn(() => ({
      setCustomParameters: jest.fn(),
    })),
    OAuthProvider: jest.fn((providerId) => ({
      providerId,
      setCustomParameters: jest.fn(),
    })),
    signInWithPopup: jest.fn(),
  };
});

jest.mock('firebase/database', () => ({
  get: jest.fn(),
  ref: jest.fn((db, path) => ({ db, path })),
  set: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

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
    
    // Reset all mock implementations
    signInWithPopup.mockImplementation(() => Promise.resolve({
      user: {
        uid: 'testuid',
        displayName: 'Test User',
        email: 'test@example.com',
      },
    }));
    
    get.mockImplementation(() => Promise.resolve({ exists: () => false }));
    set.mockImplementation(() => Promise.resolve());
    localStorageMock.setItem.mockImplementation(() => {});
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

  describe('Google Sign-In', () => {
    it('triggers signInWithPopup when Google button clicked', async () => {
      renderWithRouter(<SignUp />);
      fireEvent.click(screen.getByLabelText('Client'));
      fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
      
      await waitFor(() => {
        expect(signInWithPopup).toHaveBeenCalled();
      });
    });

    it('shows alert if no role is selected', async () => {
      window.alert = jest.fn();
      renderWithRouter(<SignUp />);
      
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
      });
      
      expect(window.alert).toHaveBeenCalledWith('Please select a role before signing up.');
    });

    it('writes user to database if user does not exist', async () => {
      renderWithRouter(<SignUp />);
      fireEvent.click(screen.getByLabelText('Client'));
      
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
      });
      
      expect(set).toHaveBeenCalled();
    });

    it('navigates to correct page after successful sign-in', async () => {
      renderWithRouter(<SignUp />);
      fireEvent.click(screen.getByLabelText('Client'));
      
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/Client');
    });

    it('redirects to sign-in if user exists', async () => {
      get.mockImplementationOnce(() => Promise.resolve({ exists: () => true }));
      window.alert = jest.fn();
      
      renderWithRouter(<SignUp />);
      fireEvent.click(screen.getByLabelText('Client'));
      
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
      });
      
      expect(window.alert).toHaveBeenCalledWith('User already exists. Redirecting you to Sign In');
      expect(mockNavigate).toHaveBeenCalledWith('/SignIn');
    });
  });

  describe('Microsoft Sign-In', () => {
    it('triggers signInWithPopup when Microsoft button clicked', async () => {
      renderWithRouter(<SignUp />);
      fireEvent.click(screen.getByLabelText('Freelancer'));
      fireEvent.click(screen.getByRole('button', { name: /sign in with microsoft/i }));
      
      await waitFor(() => {
        expect(signInWithPopup).toHaveBeenCalled();
      });
    });

    it('handles sign-in errors', async () => {
      signInWithPopup.mockImplementationOnce(() => 
        Promise.reject(new Error('Auth failed'))
      );
      window.alert = jest.fn();
      
      renderWithRouter(<SignUp />);
      fireEvent.click(screen.getByLabelText('Freelancer'));
      
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sign in with microsoft/i }));
      });
      
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Sign-in failed'));
    });
  });
});
describe('Additional SignUp Tests', () => {
  test('goToPage shows alert for unknown role', () => {
    // Mock window.alert
    window.alert = jest.fn();
    
    // Get the goToPage function from the component
    const { goToPage } = renderWithRouter(<SignUp />)
      .container.firstChild.props.children.props.children.props.children[1].type;

    // Test unknown role
    goToPage('unknown');
    expect(window.alert).toHaveBeenCalledWith('Unknown role selected.');
  });

  test('goToPage navigates to admin page for admin role', () => {
    // Get the goToPage function from the component
    const { goToPage } = renderWithRouter(<SignUp />)
      .container.firstChild.props.children.props.children.props.children[1].type;

    // Test admin role
    goToPage('admin');
    expect(mockNavigate).toHaveBeenCalledWith('/Admin');
  });

  test('Google sign-in shows error message on failure', async () => {
    // Mock the signInWithPopup to reject
    signInWithPopup.mockRejectedValue(new Error('Google sign-in failed'));
    window.alert = jest.fn();

    renderWithRouter(<SignUp />);
    fireEvent.click(screen.getByLabelText('Client'));
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    });

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Error signing in'));
  });

  test('Microsoft sign-in shows alert when no role is selected', async () => {
    window.alert = jest.fn();
    renderWithRouter(<SignUp />);
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in with microsoft/i }));
    });
    
    expect(window.alert).toHaveBeenCalledWith('Please select a role before signing up.');
  });
});
