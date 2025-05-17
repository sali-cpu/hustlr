import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Freelancers from '../pages/Freelancer';

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
  test('handles search form submission', () => {
  render(
    <Router>
      <Freelancers />
    </Router>
  );

  const searchInput = screen.getByPlaceholderText(/Search for any service/i);
  const searchForm = searchInput.closest('form');
  const preventDefault = jest.fn();

  fireEvent.change(searchInput, { target: { value: 'jobs' } });
  fireEvent.submit(searchForm, { preventDefault });

  expect(preventDefault).toHaveBeenCalled();
});

test('shows all categories when no search term', () => {
  render(
    <Router>
      <Freelancers />
    </Router>
  );

  // Close welcome box first
  fireEvent.click(screen.getByText('×'));

  // Should show all 5 categories by default
  expect(screen.getAllByTestId('category-card').length).toBe(5);
});

test('filters categories by keywords', () => {
  render(
    <Router>
      <Freelancers />
    </Router>
  );

  const searchInput = screen.getByPlaceholderText(/Search for any service/i);
  
  // Search using a keyword ('csv' is in Payments keywords)
  fireEvent.change(searchInput, { target: { value: 'csv' } });
  
  // Should only show Payments category
  expect(screen.getByText(/Payments/i)).toBeInTheDocument();
  expect(screen.queryByText(/Jobs/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Reports/i)).not.toBeInTheDocument();
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
