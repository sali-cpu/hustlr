// 👇 DEFINE MOCK FUNCTION ONCE
const mockedUsedNavigate = jest.fn();

// 👇 MOCK REACT-ROUTER-DOM BEFORE ANY IMPORTS
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

import React from "react";
import { render, screen, fireEvent } from '@testing-library/react';
import SignUp from './SignUp'; // ✅ adjust if file name is different
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import * as firebaseAuth from 'firebase/auth';

// 👇 MOCK FIREBASE
jest.mock('firebase/auth', () => {
  const originalModule = jest.requireActual('firebase/auth');
  return {
    ...originalModule,
    signInWithPopup: jest.fn(),
    getAuth: jest.fn(() => ({})),
    GoogleAuthProvider: jest.fn(),
    OAuthProvider: jest.fn(),
    initializeApp: jest.fn(() => ({})),
  };
});

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

// 👇 YOUR TESTS START HERE
describe('SignUp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all role radio buttons', () => {
    renderWithRouter(<SignUp />);
    expect(screen.getByLabelText(/admin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/client/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/freelancer/i)).toBeInTheDocument();
  });

  test('selects a role and ensures only one is selected', () => {
    renderWithRouter(<SignUp />);
    const adminRadio = screen.getByLabelText(/admin/i);
    const clientRadio = screen.getByLabelText(/client/i);
    fireEvent.click(adminRadio);
    expect(adminRadio).toBeChecked();
    fireEvent.click(clientRadio);
    expect(clientRadio).toBeChecked();
    expect(adminRadio).not.toBeChecked();
  });

  test('renders sign-in buttons', () => {
    renderWithRouter(<SignUp />);
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with microsoft/i })).toBeInTheDocument();
  });

  test('alerts if role not selected before Google sign-in', () => {
    window.alert = jest.fn();
    renderWithRouter(<SignUp />);
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    expect(window.alert).toHaveBeenCalledWith('Please select a role before logging in.');
  });

  test('alerts if role not selected before Microsoft sign-in', () => {
    window.alert = jest.fn();
    renderWithRouter(<SignUp />);
    fireEvent.click(screen.getByRole('button', { name: /sign in with microsoft/i }));
    expect(window.alert).toHaveBeenCalledWith('Please select a role before signing in.');
  });

  test('calls Firebase on Google sign-in', async () => {
    const mockUser = { uid: '123', displayName: 'Test User' };
    firebaseAuth.signInWithPopup.mockResolvedValueOnce({ user: mockUser });
    renderWithRouter(<SignUp />);
    fireEvent.click(screen.getByLabelText(/freelancer/i));
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
  });

  test('calls Firebase on Microsoft sign-in', async () => {
    const mockUser = { uid: '456', displayName: 'Test Microsoft User' };
    firebaseAuth.signInWithPopup.mockResolvedValueOnce({ user: mockUser });
    renderWithRouter(<SignUp />);
    fireEvent.click(screen.getByLabelText(/client/i));
    fireEvent.click(screen.getByRole('button', { name: /sign in with microsoft/i }));
    expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
  });
});
