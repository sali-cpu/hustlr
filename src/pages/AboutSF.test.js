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
    expect(screen.getByText(/Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Surname:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bio:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Profession:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total Jobs Done:/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Profile Icon:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Settings/i })).toBeInTheDocument();
  });

  test('allows updating form inputs', () => {
    render(<AboutSF />);
    const nameInput = screen.getByLabelText(/Name:/i);
    fireEvent.change(nameInput, { target: { value: 'Alice' } });
    expect(nameInput.value).toBe('Alice');

    const bioInput = screen.getByLabelText(/Bio:/i);
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

    expect(screen.getByLabelText(/Name:/i)).toBeDisabled();
    expect(screen.getByLabelText(/Surname:/i)).toBeDisabled();
    expect(screen.getByLabelText(/Bio:/i)).toBeDisabled();
    expect(screen.getByLabelText(/Profession:/i)).toBeDisabled();
    expect(screen.getByLabelText(/Total Jobs Done:/i)).toBeDisabled();

    const icons = screen.getAllByRole('img', { name: /icon/i });
    fireEvent.click(icons[2]);
    expect(icons[2]).not.toHaveClass('selected');

    expect(screen.queryByText(/Save Settings/i)).not.toBeInTheDocument();
    expect(screen.getByAltText(/Selected Icon/i)).toBeInTheDocument();
  });
});
