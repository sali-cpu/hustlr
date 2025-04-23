import React from 'react';
import { render, screen } from '@testing-library/react';
import ClientJobs from './ClientJobs';
import { BrowserRouter as Router } from 'react-router-dom';

describe('ClientJobs Component', () => {
  it('renders the job listings section', () => {
    render(
      <Router>
        <ClientJobs />
      </Router>
    );

    // Adjust based on what's actually in ClientJobs
    expect(screen.getByText(/Available Jobs/i)).toBeInTheDocument();
  });
});
