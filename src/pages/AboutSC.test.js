import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AboutSC from './AboutSC';

// Mock child components and images
jest.mock('../components/HeaderFreelancer', () => () => <div>Header</div>);
jest.mock('../components/FooterClient', () => () => <div>Footer</div>);
jest.mock('../images/s1.png', () => 'icon1.png');
jest.mock('../images/s2.png', () => 'icon2.png');
jest.mock('../images/s3.png', () => 'icon3.png');
jest.mock('../images/s4.png', () => 'icon4.png');
jest.mock('../images/s6.png', () => 'icon5.png');

describe('AboutSC Component', () => {
  test('renders all input fields and initial UI', () => {
    render(<AboutSC />);
    expect(screen.getByText(/Account Settings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Skills/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Profession/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total Jobs Done/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Profile Icon/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Settings/i })).toBeInTheDocument();
  });

  test('handles input changes', () => {
    render(<AboutSC />);
    const nameInput = screen.getByLabelText(/Skills/i);
    fireEvent.change(nameInput, { target: { value: 'John' } });
    expect(nameInput.value).toBe('John');

    const bioInput = screen.getByLabelText(/Bio/i);
    fireEvent.change(bioInput, { target: { value: 'A developer' } });
    expect(bioInput.value).toBe('A developer');
  });

  test('allows selecting a profile icon', () => {
    render(<AboutSC />);
    const icons = screen.getAllByRole('img', { name: /icon/i });
    fireEvent.click(icons[2]);
    expect(icons[2]).toHaveClass('selected');
  });

  test('disables form inputs after saving', () => {
    render(<AboutSC />);
    const saveButton = screen.getByRole('button', { name: /Save Settings/i });

    fireEvent.click(saveButton);

    // Inputs should be disabled
    expect(screen.getByLabelText(/Skills/i)).toBeDisabled();
    expect(screen.getByLabelText(/Bio/i)).toBeDisabled();

    // Icons should not be clickable anymore (they should be hidden after save)
    expect(screen.queryByText(/Select Profile Icon/i)).not.toBeInTheDocument();

    // Save button should disappear
    expect(screen.queryByText(/Save Settings/i)).not.toBeInTheDocument();

    // Top icon should be visible
    expect(screen.getByAltText(/Selected Icon/i)).toBeInTheDocument();
  });

  test('handleChange returns early when isSaved is true', () => {
    render(<AboutSC />);
    
    // First save the form
    const saveButton = screen.getByRole('button', { name: /Save Settings/i });
    fireEvent.click(saveButton);
    
    const nameInput = screen.getByLabelText(/Skills/i);
    const initialValue = nameInput.value;
    
    // Try to change the input
    fireEvent.change(nameInput, { target: { value: 'New Value' } });
    
    // Verify the value didn't change
    expect(nameInput.value).toBe(initialValue);
  });
});
