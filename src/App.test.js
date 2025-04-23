import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock components that are used in routes
jest.mock('./components/Header', () => () => <div>Mock Header</div>);
jest.mock('./components/Footer', () => () => <div>Mock Footer</div>);
jest.mock('./pages/Land', () => () => <div>Land Page</div>);
jest.mock('./pages/Home', () => () => <div>Home Page</div>);
jest.mock('./pages/SignUp', () => () => <div>SignUp Page</div>);
jest.mock('./pages/SignIn', () => () => <div>SignIn Page</div>);
jest.mock('./pages/Client', () => () => <div>Client Page</div>);
jest.mock('./pages/Freelancer', () => () => <div>Freelancer Page</div>);
jest.mock('./pages/AdminCorrect', () => () => <div>Admin Page</div>);
jest.mock('./pages/ClientJobs', () => () => <div>Client Jobs Page</div>);
jest.mock('./pages/ClientPayments', () => () => <div>Client Payments Page</div>);
jest.mock('./pages/FreelancerJobs', () => () => <div>Freelancer Jobs Page</div>);

const renderWithRoute = (initialRoute) => {
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>
  );
};

describe('App Routing', () => {
  test('renders Home page and layout on root path', () => {
    renderWithRoute('/');
    expect(screen.getByText('Mock Header')).toBeInTheDocument();
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.getByText('Mock Footer')).toBeInTheDocument();
  });

  test('renders SignUp page at /SignUp', () => {
    renderWithRoute('/SignUp');
    expect(screen.getByText('SignUp Page')).toBeInTheDocument();
  });

  test('renders SignIn page at /SignIn', () => {
    renderWithRoute('/SignIn');
    expect(screen.getByText('SignIn Page')).toBeInTheDocument();
  });

  test('renders Land page at /Land', () => {
    renderWithRoute('/Land');
    expect(screen.getByText('Land Page')).toBeInTheDocument();
  });

  test('renders Client page at /Client', () => {
    renderWithRoute('/Client');
    expect(screen.getByText('Client Page')).toBeInTheDocument();
  });

  test('renders Freelancer page at /Freelancer', () => {
    renderWithRoute('/Freelancer');
    expect(screen.getByText('Freelancer Page')).toBeInTheDocument();
  });

  test('renders Admin page at /Admin', () => {
    renderWithRoute('/Admin');
    expect(screen.getByText('Admin Page')).toBeInTheDocument();
  });

  test('renders ClientJobs page at /ClientJobs', () => {
    renderWithRoute('/ClientJobs');
    expect(screen.getByText('Client Jobs Page')).toBeInTheDocument();
  });

  test('renders ClientPayments page at /ClientPayments', () => {
    renderWithRoute('/ClientPayments');
    expect(screen.getByText('Client Payments Page')).toBeInTheDocument();
  });

  test('renders FreelancerJobs page at /FreelancerJobs', () => {
    renderWithRoute('/FreelancerJobs');
    expect(screen.getByText('Freelancer Jobs Page')).toBeInTheDocument();
  });
});
