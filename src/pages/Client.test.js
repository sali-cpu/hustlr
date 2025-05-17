import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Client from '../pages/Client';
import { ref, onValue } from 'firebase/database';
import { applications_db } from '../firebaseConfig';

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn(),
}));

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

  describe('Client Component Search Functionality', () => {
  beforeEach(() => {
    // Clear localStorage to ensure fresh state
    localStorage.clear();
  });

  test('filters categories based on search term matching name', () => {
    render(
      <Router>
        <Client />
      </Router>
    );

    // Close welcome message first
    fireEvent.click(screen.getByText('×'));

    const searchInput = screen.getByPlaceholderText(/Search for any service/i);
    fireEvent.change(searchInput, { target: { value: 'jobs' } });

    expect(screen.getByText(/Jobs/i)).toBeInTheDocument();
    expect(screen.queryByText(/Contracts & Tasks/i)).not.toBeInTheDocument();
  });

  test('filters categories based on search term matching keywords', () => {
    render(
      <Router>
        <Client />
      </Router>
    );

    // Close welcome message first
    fireEvent.click(screen.getByText('×'));

    const searchInput = screen.getByPlaceholderText(/Search for any service/i);
    fireEvent.change(searchInput, { target: { value: 'csv' } }); // 'csv' is a keyword in Payments

    expect(screen.getByText(/Payments/i)).toBeInTheDocument();
    expect(screen.queryByText(/Jobs/i)).not.toBeInTheDocument();
  });

  test('shows "No matching categories found" when search has no results', () => {
    render(
      <Router>
        <Client />
      </Router>
    );

    // Close welcome message first
    fireEvent.click(screen.getByText('×'));

    const searchInput = screen.getByPlaceholderText(/Search for any service/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent term' } });

    expect(screen.getByText(/No matching categories found/i)).toBeInTheDocument();
    expect(screen.queryByText(/Jobs/i)).not.toBeInTheDocument();
  });
});
test('shows all categories when search term is empty', () => {
  render(
    <Router>
      <Client />
    </Router>
  );

  fireEvent.click(screen.getByText('×'));
  
  const searchInput = screen.getByPlaceholderText(/Search for any service/i);
  fireEvent.change(searchInput, { target: { value: '' } });

  expect(screen.getByText(/Jobs/i)).toBeInTheDocument();
  expect(screen.getByText(/Contracts & Tasks/i)).toBeInTheDocument();
  expect(screen.getByText(/Payments/i)).toBeInTheDocument();
});

test('search icon button exists', () => {
  render(
    <Router>
      <Client />
    </Router>
  );
  
  expect(screen.getByRole('button', { name: /🔍/ })).toBeInTheDocument();
});

test('sets hasSeenWelcome in localStorage when closing welcome message', () => {
  render(
    <Router>
      <Client />
    </Router>
  );
  
  fireEvent.click(screen.getByText('×'));
  expect(localStorage.getItem('hasSeenWelcome')).toBe('true');
});

});
describe('Profile Icon Functionality', () => {
  beforeEach(() => {
    // Clear localStorage and reset all mocks
    localStorage.clear();
    jest.clearAllMocks();
    
    // Mock localStorage to return a userUID
    Storage.prototype.getItem = jest.fn((key) => 
      key === 'userUID' ? 'test-uid' : null
    );
  });

  test('sets up profile icon listener on mount', () => {
    render(
      <Router>
        <Client />
      </Router>
    );

    expect(ref).toHaveBeenCalledWith(applications_db, 'Information/test-uid/selectedIcon');
    expect(onValue).toHaveBeenCalledTimes(1);
  });

  test('updates profile icon when Firebase value changes', () => {
    // Mock the onValue callback
    let callback;
    onValue.mockImplementation((ref, cb) => {
      callback = cb;
    });

    render(
      <Router>
        <Client />
      </Router>
    );

    // Simulate Firebase value change
    const mockSnapshot = {
      val: () => 'mocked-icon-url.png'
    };
    callback(mockSnapshot);

    // Verify the profile icon is rendered
    expect(screen.getByAltText('Profile Icon')).toHaveAttribute('src', 'mocked-icon-url.png');
  });

  test('does not set up listener when no userUID exists', () => {
    // Mock no userUID
    Storage.prototype.getItem = jest.fn(() => null);

    render(
      <Router>
        <Client />
      </Router>
    );

    expect(ref).not.toHaveBeenCalled();
    expect(onValue).not.toHaveBeenCalled();
  });

  test('handles null value from Firebase', () => {
    let callback;
    onValue.mockImplementation((ref, cb) => {
      callback = cb;
    });

    render(
      <Router>
        <Client />
      </Router>
    );

    // Simulate Firebase returning null
    const mockSnapshot = {
      val: () => null
    };
    callback(mockSnapshot);

    // Verify no profile icon is rendered
    expect(screen.queryByAltText('Profile Icon')).not.toBeInTheDocument();
  });
});
