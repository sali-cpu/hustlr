import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Freelancers from '../pages/Freelancers';

// Mock images to prevent errors
jest.mock('../images/logo.png', () => '');
jest.mock('../images/cute.jpg', () => '');
jest.mock('../images/HeroJPG.jpg', () => '');
jest.mock('../images/Job.png', () => '');
jest.mock('../images/Payment.png', () => '');
jest.mock('../images/Quick Stats.png', () => '');
jest.mock('../images/contract.png', () => '');
jest.mock('../images/Reports.png', () => '');

// Mock headers and footer
jest.mock('../components/HeaderFreelancer', () => () => <div>Mock Header</div>);
jest.mock('../components/FooterClient', () => () => <div>Mock Footer</div>);

describe('Freelancers Component', () => {
  test('renders welcome box by default', () => {
    render(
      <Router>
        <Freelancers />
      </Router>
    );

    expect(screen.getByText(/Welcome, Freelancer!/i)).toBeInTheDocument();
    expect(screen.getByText(/Access gigs, manage your profile/i)).toBeInTheDocument();
  });

  test('hides welcome box and shows categories after closing', () => {
    render(
      <Router>
        <Freelancers />
      </Router>
    );

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(screen.queryByText(/Welcome, Freelancer!/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Jobs/i)).toBeInTheDocument();
    expect(screen.getByText(/Payments/i)).toBeInTheDocument();
    expect(screen.getByText(/Quick Stats/i)).toBeInTheDocument();
  });

  test('search box is always visible', () => {
    render(
      <Router>
        <Freelancers />
      </Router>
    );

    expect(screen.getByPlaceholderText(/Search for any service/i)).toBeInTheDocument();
  });
});
