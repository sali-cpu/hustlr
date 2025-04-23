import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Client from '../pages/Client';

// Mock images
jest.mock('../images/cute.jpg', () => '');
jest.mock('../images/Job.png', () => '');
jest.mock('../images/Payment.png', () => '');
jest.mock('../images/Quick Stats.png', () => '');
jest.mock('../images/contract.png', () => '');
jest.mock('../images/Reports.png', () => '');
jest.mock('../images/HeroJPG.jpg', () => '');

// Mock components
jest.mock('../components/HeaderClient', () => () => <div>Mock Header</div>);
jest.mock('../components/FooterClient', () => () => <div>Mock Footer</div>);

describe('Client Component', () => {
  test('renders welcome message initially', () => {
    render(
      <Router>
        <Client />
      </Router>
    );

    expect(screen.getByText(/Welcome, Client!/i)).toBeInTheDocument();
    expect(screen.getByText(/Our platform connects you with skilled freelancers/i)).toBeInTheDocument();
  });

  test('hides welcome message and shows categories after closing message', () => {
    render(
      <Router>
        <Client />
      </Router>
    );

    fireEvent.click(screen.getByText('×'));

    expect(screen.queryByText(/Welcome, Client!/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Jobs/i)).toBeInTheDocument();
    expect(screen.getByText(/Contracts & Tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/Quick Stats/i)).toBeInTheDocument();
  });

  test('renders search box', () => {
    render(
      <Router>
        <Client />
      </Router>
    );

    expect(screen.getByPlaceholderText(/Search for any service/i)).toBeInTheDocument();
  });
});
