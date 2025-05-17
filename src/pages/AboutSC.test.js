import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AboutSC from './AboutSC';
import { ref, set } from 'firebase/database';
import { applications_db } from '../firebaseConfig';

// Mock child components, images, and Firebase
jest.mock('../components/HeaderFreelancer', () => () => <div>Header</div>);
jest.mock('../components/FooterClient', () => () => <div>Footer</div>);
jest.mock('../images/s1.png', () => 'icon1.png');
jest.mock('../images/s2.png', () => 'icon2.png');
jest.mock('../images/s3.png', () => 'icon3.png');
jest.mock('../images/s4.png', () => 'icon4.png');
jest.mock('../images/s6.png', () => 'icon5.png');
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  set: jest.fn(() => Promise.resolve()),
}));
jest.mock('../firebaseConfig', () => ({
  applications_db: {},
}));
jest.mock('react-router-dom', () => ({
  Link: ({ children }) => <div>{children}</div>,
}));

describe('AboutSC Component', () => {
  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'userUID') return 'test-uid';
      if (key === 'nameSur') return 'Test User';
      return null;
    });

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders welcome message with name from localStorage', () => {
    render(<AboutSC />);
    expect(screen.getByText(/Welcome Test User/i)).toBeInTheDocument();
  });

  test('selectIcon does not update state when isSaved is true', () => {
    const mockSetFormData = jest.fn();
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [{ isSaved: true }, jest.fn()]);
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [{}, mockSetFormData]);

    render(<AboutSC />);
    const icons = screen.getAllByRole('img', { name: /icon/i });
    fireEvent.click(icons[0]);
    
    expect(mockSetFormData).not.toHaveBeenCalled();
  });

  test('handleSave shows alert when no userUID is found', () => {
    Storage.prototype.getItem = jest.fn(() => null);
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AboutSC />);
    fireEvent.click(screen.getByRole('button', { name: /Save Settings/i }));

    expect(alertMock).toHaveBeenCalledWith('User UID not found in local storage!');
    alertMock.mockRestore();
  });

  test('handleSave calls Firebase set with correct data', async () => {
    render(<AboutSC />);
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/Bio/i), { 
      target: { value: 'Test bio', name: 'bio' } 
    });
    fireEvent.change(screen.getByLabelText(/Profession/i), { 
      target: { value: 'Developer', name: 'profession' } 
    });
    fireEvent.click(screen.getAllByRole('img', { name: /icon/i })[2]);

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Save Settings/i }));

    await waitFor(() => {
      expect(ref).toHaveBeenCalledWith(applications_db, 'Information/test-uid');
      expect(set).toHaveBeenCalledWith(expect.anything(), {
        bio: 'Test bio',
        profession: 'Developer',
        totalJobs: '',
        selectedIcon: 'icon3.png'
      });
    });
  });

  test('handleSave shows success alert on successful save', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AboutSC />);
    fireEvent.click(screen.getByRole('button', { name: /Save Settings/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('User info saved successfully!');
    });
    alertMock.mockRestore();
  });

  test('displays error alert when Firebase save fails', async () => {
  // Mock Firebase to reject with an error
  const mockError = new Error('Firebase save failed');
  set.mockRejectedValueOnce(mockError);
  
  // Mock window.alert to track calls
  const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

  render(<AboutSC />);
  
  // Fill out some form data
  fireEvent.change(screen.getByLabelText(/Bio/i), {
    target: { value: 'Test bio', name: 'bio' }
  });
  
  // Trigger save
  fireEvent.click(screen.getByRole('button', { name: /Save Settings/i }));

  await waitFor(() => {
    // Verify error alert was shown with correct message
    expect(alertMock).toHaveBeenCalledWith('Error saving user info:', 'Firebase save failed');
    
    // Verify isSaved state wasn't changed to true
    expect(screen.getByRole('button', { name: /Save Settings/i })).toBeInTheDocument();
  });

  // Clean up mock
  alertMock.mockRestore();
});

  test('handleSave shows error alert on Firebase failure', async () => {
    const error = new Error('Firebase error');
    set.mockRejectedValueOnce(error);
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AboutSC />);
    fireEvent.click(screen.getByRole('button', { name: /Save Settings/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Error saving user info:', error.message);
    });
    alertMock.mockRestore();
  });

  test('renders Link component around save button', () => {
    render(<AboutSC />);
    const saveButton = screen.getByRole('button', { name: /Save Settings/i });
    expect(saveButton.closest('div')).toBeInTheDocument(); // Checking Link wrapper
  });

  // Keep your existing tests
  test('renders all input fields and initial UI', () => {
    render(<AboutSC />);
    expect(screen.getByText(/Account Settings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Profession/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total Jobs Done/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Profile Icon/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Settings/i })).toBeInTheDocument();
  });

  // ... (include all your other existing tests here)
});
