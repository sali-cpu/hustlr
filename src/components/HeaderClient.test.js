import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import HeaderClient from "./HeaderClient";
import React from "react";

// Mock Firebase
jest.mock('../firebaseConfig', () => ({
  applications_db: {},
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn(),
}));

describe('HeaderClient', () => {
  // Store original localStorage
  const originalLocalStorage = global.localStorage;

  beforeAll(() => {
    // Create complete mock of localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true
    });
  });

  afterAll(() => {
    // Restore original localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage
    });
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test("menu toggle opens and closes mobile menu", () => {
    render(<HeaderClient />);

    const buttons = screen.getAllByRole("button");
    const openButton = buttons.find(btn => btn.id === "menopen");
    const closeButton = buttons.find(btn => btn.id === "menclose");

    // Before clicking: class should not exist
    expect(document.body.classList.contains("show-mobile-menu")).toBe(false);

    // Open menu
    fireEvent.click(openButton);
    expect(document.body.classList.contains("show-mobile-menu")).toBe(true);

    // Close menu
    fireEvent.click(closeButton);
    expect(document.body.classList.contains("show-mobile-menu")).toBe(false);
  });

  it('should not call Firebase when no UID is present', () => {
    // Mock localStorage to return null (no UID)
    window.localStorage.getItem.mockReturnValueOnce(null);
    
    // Mock Firebase functions
    const { ref, onValue } = require('firebase/database');
    
    render(<HeaderClient />);
    
    // Verify localStorage was called
    expect(window.localStorage.getItem).toHaveBeenCalledWith('userUID');
    
    // Verify Firebase functions were NOT called
    expect(ref).not.toHaveBeenCalled();
    expect(onValue).not.toHaveBeenCalled();
  });

  it('should call Firebase when UID is present', () => {
    // Mock localStorage to return a UID
    const mockUID = 'test-uid';
    window.localStorage.getItem.mockReturnValueOnce(mockUID);
    
    // Mock Firebase functions
    const { ref, onValue } = require('firebase/database');
    ref.mockReturnValueOnce('mock-ref');
    onValue.mockImplementationOnce((ref, callback) => {
      callback({ val: () => 'mock-icon-url' });
    });
    
    render(<HeaderClient />);
    
    // Verify localStorage was called
    expect(window.localStorage.getItem).toHaveBeenCalledWith('userUID');
    
    // Verify Firebase functions were called
    expect(ref).toHaveBeenCalledWith(expect.anything(), `Information/${mockUID}/selectedIcon`);
    expect(onValue).toHaveBeenCalled();
  });
});
