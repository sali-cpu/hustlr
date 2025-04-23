import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUp from './SignUp';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock Firebase Authentication
jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({})),
  OAuthProvider: jest.fn().mockImplementation(() => ({})),
  signInWithPopup: jest.fn(),
}));

// Mock Firebase Database
jest.mock('firebase/database', () => ({
  get: jest.fn(),
  set: jest.fn(),
  ref: jest.fn(),
}));

// Mock Firebase Config
jest.mock('../firebaseConfig', () => ({
  googleAuth: {},
  microsoftAuth: {},
  google_db: {},
  microsoft_db: {},
}));

// Mock image imports
jest.mock('../images/google_icon.png', () => 'google_icon.png');
jest.mock('../images/micro_icon.png', () => 'micro_icon.png');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('SignUp Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

  test('renders role options and sign-in buttons', () => {
    renderComponent();

    expect(screen.getByText('Sign up to Hustlr')).toBeInTheDocument();
    expect(screen.getByLabelText('Client')).toBeInTheDocument();
    expect(screen.getByLabelText('Freelancer')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Microsoft')).toBeInTheDocument();
  });

  test('signs in with Google and creates user if not exists', async () => {
    const { signInWithPopup } = require('firebase/auth');
    const { get, set } = require('firebase/database');

    signInWithPopup.mockResolvedValue({
      user: { uid: '123', displayName: 'Google User', email: 'user@test.com' }
    });

    get.mockResolvedValue({ exists: () => false });

    renderComponent();

    fireEvent.click(screen.getByLabelText('Freelancer'));

    fireEvent.click(screen.getByText('Sign in with Google'));

    await waitFor(() => {
      expect(set).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/Freelancer');
    });
  });

  test('signs in with Microsoft and redirects existing user to SignIn', async () => {
    const { signInWithPopup } = require('firebase/auth');
    const { get } = require('firebase/database');

    signInWithPopup.mockResolvedValue({
      user: { uid: '456', displayName: 'MS User', email: 'ms@test.com' }
    });

    get.mockResolvedValue({ exists: () => true });

    renderComponent();

    fireEvent.click(screen.getByText('Sign in with Microsoft'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/SignIn');
    });
  });

  test('admin email is redirected to admin page after sign up', async () => {
    const { signInWithPopup } = require('firebase/auth');
    const { get } = require('firebase/database');

    signInWithPopup.mockResolvedValue({
      user: { uid: 'admin123', displayName: 'Admin', email: '2680440@students.wits.ac.za' }
    });

    get.mockResolvedValue({ exists: () => false });

    renderComponent();

    fireEvent.click(screen.getByText('Sign in with Google'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/Admin');
    });
  });

  test('alerts if no role is selected during signup', async () => {
    const { signInWithPopup } = require('firebase/auth');
    const { get } = require('firebase/database');

    global.alert = jest.fn(); // mock alert

    signInWithPopup.mockResolvedValue({
      user: { uid: '123', displayName: 'Google User', email: 'user@test.com' }
    });

    get.mockResolvedValue({ exists: () => false });

    renderComponent();

    fireEvent.click(screen.getByText('Sign in with Google'));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Please select a role before signing up.");
    });
  });
});
