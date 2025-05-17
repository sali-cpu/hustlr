import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AboutSF from './AboutSF';
import { ref, set } from 'firebase/database';
import { applications_db } from '../firebaseConfig';

// Mock components, images, and Firebase
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

describe('AboutSF Component', () => {
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
    render(<AboutSF />);
    expect(screen.getByText(/Welcome Test User/i)).toBeInTheDocument();
  });

  test('handleChange does not update state when isSaved is true', () => {
    // Mock useState to simulate isSaved=true
    const setFormDataMock = jest.fn();
    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [{}, setFormDataMock])  // formData state
      .mockImplementationOnce(() => [true, jest.fn()]);     // isSaved=true

    render(<AboutSF />);
    const bioInput = screen.getByLabelText(/Bio/i);
    fireEvent.change(bioInput, { target: { value: 'New bio' } });
    
    expect(setFormDataMock).not.toHaveBeenCalled();
  });

  test('handleSave shows alert when no userUID is found', () => {
    Storage.prototype.getItem = jest.fn(() => null);
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AboutSF />);
    fireEvent.click(screen.getByRole('button', { name: /Save Settings/i }));

    expect(alertMock).toHaveBeenCalledWith('User UID not found in local storage!');
    alertMock.mockRestore();
  });

  test('handleSave calls Firebase set with correct data', async () => {
    render(<AboutSF />);
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/Skills/i), { 
      target: { value: 'React, Node', name: 'skills' } 
    });
    fireEvent.change(screen.getByLabelText(/Bio/i), { 
      target: { value: 'Test bio', name: 'bio' } 
    });
    fireEvent.click(screen.getAllByRole('img', { name: /icon/i })[2]);

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Save Settings/i }));

    await waitFor(() => {
      expect(ref).toHaveBeenCalledWith(applications_db, 'Information/test-uid');
      expect(set).toHaveBeenCalledWith(expect.anything(), {
        skills: 'React, Node',
        bio: 'Test bio',
        profession: '',
        totalJobs: '',
        selectedIcon: 'icon3.png'
      });
    });
  });

  test('handleSave shows success alert on successful save', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AboutSF />);
    fireEvent.click(screen.getByRole('button', { name: /Save Settings/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('User info saved successfully!');
    });
    alertMock.mockRestore();
  });

  test('handleSave shows error alert on Firebase failure', async () => {
    const error = new Error('Firebase error');
    set.mockRejectedValueOnce(error);
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AboutSF />);
    fireEvent.click(screen.getByRole('button', { name: /Save Settings/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Error saving user info:', error.message);
    });
    alertMock.mockRestore();
  });

  test('renders Link component around save button', () => {
    render(<AboutSF />);
    const saveButton = screen.getByRole('button', { name: /Save Settings/i });
    expect(saveButton.closest('div')).toBeInTheDocument();
  });

  // Keep existing tests
  test('renders all form elements correctly', () => {
    render(<AboutSF />);
    expect(screen.getByText(/Account Settings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Skills/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Profession/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total Jobs Done/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Profile Icon/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Settings/i })).toBeInTheDocument();
  });

  test('allows updating form inputs', () => {
    render(<AboutSF />);
    const nameInput = screen.getByLabelText(/Skills/i);
    fireEvent.change(nameInput, { target: { value: 'Alice' } });
    expect(nameInput.value).toBe('Alice');

    const bioInput = screen.getByLabelText(/Bio/i);
    fireEvent.change(bioInput, { target: { value: 'Creative designer' } });
    expect(bioInput.value).toBe('Creative designer');
  });

  test('allows selecting an icon before saving', () => {
    render(<AboutSF />);
    const icons = screen.getAllByRole('img', { name: /icon/i });
    fireEvent.click(icons[1]);
    expect(icons[1]).toHaveClass('selected');
  });

  test('disables inputs and icon selection after saving', () => {
    render(<AboutSF />);
    const saveBtn = screen.getByRole('button', { name: /Save Settings/i });
    fireEvent.click(saveBtn);

    expect(screen.getByLabelText(/Skills/i)).toBeDisabled();
    expect(screen.getByLabelText(/Bio/i)).toBeDisabled();
    expect(screen.getByLabelText(/Profession/i)).toBeDisabled();
    expect(screen.getByLabelText(/Total Jobs Done/i)).toBeDisabled();

    expect(screen.queryByText(/Select Profile Icon/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Save Settings/i)).not.toBeInTheDocument();
    expect(screen.getByAltText(/Selected Icon/i)).toBeInTheDocument();
  });
});
