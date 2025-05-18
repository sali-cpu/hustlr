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
  const mockSetIsSaved = jest.fn();
  const mockSetFormData = jest.fn();
  
  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'userUID') return 'test-uid';
      if (key === 'nameSur') return 'Test User';
      return null;
    });

    // Mock useState
    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [{ 
        bio: '', 
        profession: '', 
        totalJobs: '', 
        selectedIcon: 'icon1.png' 
      }, mockSetFormData])
      .mockImplementationOnce(() => [false, mockSetIsSaved]);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders welcome message with name from localStorage', () => {
    render(<AboutSC />);
    expect(screen.getByText(/Welcome Test User/i)).toBeInTheDocument();
  });

  test('handleChange updates form data when isSaved is false', () => {
    render(<AboutSC />);
    const bioTextarea = screen.getByLabelText(/Bio/i);
    fireEvent.change(bioTextarea, { target: { value: 'New bio', name: 'bio' } });
    expect(mockSetFormData).toHaveBeenCalled();
  });

  test('handleChange does not update form data when isSaved is true', () => {
    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [{}, mockSetFormData])
      .mockImplementationOnce(() => [true, mockSetIsSaved]);
    
    render(<AboutSC />);
    const bioTextarea = screen.getByLabelText(/Bio/i);
    fireEvent.change(bioTextarea, { target: { value: 'New bio', name: 'bio' } });
    expect(mockSetFormData).not.toHaveBeenCalled();
  });

  test('selectIcon updates selected icon when isSaved is false', () => {
    render(<AboutSC />);
    const icons = screen.getAllByRole('img', { name: /icon/i });
    fireEvent.click(icons[1]);
    expect(mockSetFormData).toHaveBeenCalled();
  });

  test('selectIcon does not update selected icon when isSaved is true', () => {
    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [{}, mockSetFormData])
      .mockImplementationOnce(() => [true, mockSetIsSaved]);
    
    render(<AboutSC />);
    const icons = screen.getAllByRole('img', { name: /icon/i });
    fireEvent.click(icons[1]);
    expect(mockSetFormData).not.toHaveBeenCalled();
  });

  test('handleSave calls Firebase set with correct data and handles success', async () => {
    set.mockResolvedValueOnce();
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<AboutSC />);
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/Bio/i), { 
      target: { value: 'Test bio', name: 'bio' } 
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Save Settings/i }));

    await waitFor(() => {
      // Verify Firebase was called correctly
      expect(ref).toHaveBeenCalledWith(applications_db, 'Information/test-uid');
      expect(set).toHaveBeenCalled();
      
      // Verify success handling
      expect(mockSetIsSaved).toHaveBeenCalledWith(true);
      expect(alertMock).toHaveBeenCalledWith('User info saved successfully!');
    });
    alertMock.mockRestore();
  });

  test('handleSave shows alert when no userUID is found', () => {
    Storage.prototype.getItem = jest.fn(() => null);
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AboutSC />);
    fireEvent.click(screen.getByRole('button', { name: /Save Settings/i }));

    expect(alertMock).toHaveBeenCalledWith('User UID not found in local storage!');
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

  test('renders all input fields and initial UI', () => {
    render(<AboutSC />);
    expect(screen.getByText(/Account Settings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Profession/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total Jobs Done/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Profile Icon/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Settings/i })).toBeInTheDocument();
  });
});
