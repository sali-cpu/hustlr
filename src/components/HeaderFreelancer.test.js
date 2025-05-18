import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeaderFreelancer from './HeaderFreelancer';
import { applications_db } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';

// Mock localStorage
const originalLocalStorage = window.localStorage;

// Mock Firebase
jest.mock('../firebaseConfig', () => ({
  applications_db: {},
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn(),
}));

describe('HeaderFreelancer Component', () => {
  beforeAll(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true
    });

    // Mock document.body.classList
    document.body.classList.add = jest.fn();
    document.body.classList.remove = jest.fn();
  });

  afterAll(() => {
    // Restore original localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ... keep all your existing tests ...

  describe('Profile Icon Loading', () => {
    it('does not call Firebase when no UID is present', () => {
      window.localStorage.getItem.mockReturnValueOnce(null);
      
      render(<HeaderFreelancer />);
      
      expect(window.localStorage.getItem).toHaveBeenCalledWith('userUID');
      expect(ref).not.toHaveBeenCalled();
      expect(onValue).not.toHaveBeenCalled();
    });

    it('loads profile icon when UID is present', () => {
      const mockUID = 'test-uid-123';
      const mockIconUrl = 'https://example.com/profile.jpg';
      
      window.localStorage.getItem.mockReturnValueOnce(mockUID);
      ref.mockReturnValueOnce('mock-ref');
      onValue.mockImplementationOnce((ref, callback) => {
        callback({ val: () => mockIconUrl });
      });
      
      render(<HeaderFreelancer />);
      
      expect(window.localStorage.getItem).toHaveBeenCalledWith('userUID');
      expect(ref).toHaveBeenCalledWith(
        applications_db, 
        `Information/${mockUID}/selectedIcon`
      );
      expect(onValue).toHaveBeenCalled();
    });
  });
});
