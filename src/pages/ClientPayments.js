import React from 'react';
import { render, screen } from '@testing-library/react';
import ClientPayments from './ClientPayments';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock firebaseConfig.js to prevent actual Firebase calls
jest.mock('../firebaseConfig', () => ({
  googleApp: {},
  googleAuth: {},
  google_db: {},
  microsoftApp: {},
  microsoftAuth: {},
  microsoft_db: {}
}));

describe('ClientPayments Component', () => {
  it('renders without crashing', () => {
    render(
      <Router>
        <ClientPayments />
      </Router>
    );

    // Update with a text that exists in your ClientPayments page
    expect(screen.getByText(/Payments/i)).toBeInTheDocument();
  });
});
