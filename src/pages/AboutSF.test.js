import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AboutSF from './AboutSF';

// Mock subcomponents
jest.mock('../components/HeaderFreelancer', () => () => <div>Header</div>);
jest.mock('../components/FooterClient', () => () => <div>Footer</div>);

// Mock images
jest.mock('../images/s1.png', () => 'icon1.png');
jest.mock('../images/s2.png', () => 'icon2.png');
jest.mock('../images/s3.png', () => 'icon3.png');
jest.mock('../images/s4.png', () => 'icon4.png');
jest.mock('../images/s6.png', () => 'icon5.png');

describe('AboutSF Component', () => {
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

  describe('selectIcon function', () => {
  test('does not update selectedIcon when isSaved is true', () => {
    // Mock useState to simulate isSaved=true
    const original = React.useState;
    const setFormDataMock = jest.fn();
    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [{}, setFormDataMock])  // formData state
      .mockImplementationOnce(() => [true, jest.fn()]);     // isSaved=true

    render(<AboutSF />);
    
    // Try to select an icon (should be prevented)
    const icons = screen.getAllByRole('img', { name: /icon/i });
    fireEvent.click(icons[0]);
    
    // Verify setFormData was not called
    expect(setFormDataMock).not.toHaveBeenCalled();
    
    // Restore original useState
    React.useState = original;
  });

  test('updates selectedIcon when isSaved is false', () => {
    render(<AboutSF />);
    
    // Verify initial selected icon (first one by default)
    const icons = screen.getAllByRole('img', { name: /icon/i });
    expect(icons[0]).toHaveClass('selected');
    
    // Select a different icon
    fireEvent.click(icons[2]);
    
    // Verify the new icon is selected
    expect(icons[2]).toHaveClass('selected');
    expect(icons[0]).not.toHaveClass('selected');
  });
});

  test('disables inputs and icon selection after saving', () => {
    render(<AboutSF />);
    const saveBtn = screen.getByRole('button', { name: /Save Settings/i });
    fireEvent.click(saveBtn);

    expect(screen.getByLabelText(/Skills/i)).toBeDisabled();
    expect(screen.getByLabelText(/Bio/i)).toBeDisabled();
    expect(screen.getByLabelText(/Profession/i)).toBeDisabled();
    expect(screen.getByLabelText(/Total Jobs Done/i)).toBeDisabled();

    // Icons should be hidden after saving
    expect(screen.queryByText(/Select Profile Icon/i)).not.toBeInTheDocument();

    expect(screen.queryByText(/Save Settings/i)).not.toBeInTheDocument();
    expect(screen.getByAltText(/Selected Icon/i)).toBeInTheDocument();
  });
});
