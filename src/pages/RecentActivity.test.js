// RecentActivity.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RecentActivity from './RecentActivity';

// Add this import for .toBeInTheDocument()
import '@testing-library/jest-dom';

const STORAGE_KEY = 'recent_activity';

const mockActivities = [
  { path: '/', timestamp: new Date().toISOString() },
  { path: '/ClientJobs', timestamp: new Date(Date.now() - 10000).toISOString() },
];

describe('RecentActivity component', () => {
  beforeEach(() => {
    // Set localStorage before each test
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockActivities));
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  test('renders heading and clear button', () => {
    render(
      <MemoryRouter>
        <RecentActivity />
      </MemoryRouter>
    );
    expect(screen.getByText('🕒 Recent Activity')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear history/i })).toBeInTheDocument();
  });

  test('renders activity list from localStorage', () => {
    render(
      <MemoryRouter>
        <RecentActivity />
      </MemoryRouter>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Client Jobs')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  test('clears history when "Clear History" button is clicked', () => {
    render(
      <MemoryRouter>
        <RecentActivity />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /clear history/i }));
    
    expect(screen.getByText('No recent activity found.')).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  test('renders fallback message when there is no activity', () => {
    localStorage.removeItem(STORAGE_KEY); // ensure no data
    render(
      <MemoryRouter>
        <RecentActivity />
      </MemoryRouter>
    );
    expect(screen.getByText('No recent activity found.')).toBeInTheDocument();
  });
});
