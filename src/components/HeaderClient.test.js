import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import HeaderClient from "./HeaderClient";
import React from "react";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock Firebase
jest.mock('../firebaseConfig', () => ({
  applications_db: {},
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn(),
}));

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
describe('HeaderClient', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should not call Firebase when no UID is present', () => {
    // Mock localStorage to return null (no UID)
    localStorage.getItem.mockReturnValueOnce(null);
    
    // Mock Firebase functions
    const { ref, onValue } = require('firebase/database');
    
    render(<HeaderClient />);
    
    // Verify localStorage was called
    expect(localStorage.getItem).toHaveBeenCalledWith('userUID');
    
    // Verify Firebase functions were NOT called
    expect(ref).not.toHaveBeenCalled();
    expect(onValue).not.toHaveBeenCalled();
  });

  it('should call Firebase when UID is present', () => {
    // Mock localStorage to return a UID
    const mockUID = 'test-uid';
    localStorage.getItem.mockReturnValueOnce(mockUID);
    
    // Mock Firebase functions
    const { ref, onValue } = require('firebase/database');
    ref.mockReturnValueOnce('mock-ref');
    onValue.mockImplementationOnce((ref, callback) => {
      callback({ val: () => 'mock-icon-url' });
    });
    
    render(<HeaderClient />);
    
    // Verify localStorage was called
    expect(localStorage.getItem).toHaveBeenCalledWith('userUID');
    
    // Verify Firebase functions were called
    expect(ref).toHaveBeenCalledWith(applications_db, `Information/${mockUID}/selectedIcon`);
    expect(onValue).toHaveBeenCalled();
  });
});
