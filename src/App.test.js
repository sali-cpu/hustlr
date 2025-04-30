import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App Routing', () => {
  test('renders Home page by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
  });

  test('renders SignUp page', () => {
    render(
      <MemoryRouter initialEntries={['/SignUp']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/SignUp/i)).toBeInTheDocument();
  });

  test('renders SignIn page', () => {
    render(
      <MemoryRouter initialEntries={['/SignIn']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/SignIn/i)).toBeInTheDocument();
  });
});
