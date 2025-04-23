

import React from 'react';
import { render, screen } from '@testing-library/react';
import FooterClient from './FooterClient';
import '@testing-library/jest-dom';


describe('FooterClient component', () => {
  test('renders the footer text', () => {
    render(<FooterClient />);
    const footerText = screen.getByText(/© 2025 YourPlatform. All rights reserved./i);
    expect(footerText).toBeInTheDocument();
  });

  test('has correct styling properties', () => {
    render(<FooterClient />);
    const footer = screen.getByRole('contentinfo'); // <footer> has "contentinfo" role
    expect(footer).toHaveStyle({
      backgroundColor: '#f8fafc',
      textAlign: 'center',
      padding: '1rem',
      marginTop: 'auto',
    });
  });
});
