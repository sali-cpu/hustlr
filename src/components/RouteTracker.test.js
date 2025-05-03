// RouteTracker.test.js
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import RouteTracker from './RouteTracker';

const STORAGE_KEY = 'recent_activity';

const TestWrapper = ({ initialEntries }) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <RouteTracker />
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/about" element={<div>About</div>} />
        <Route path="/contact" element={<div>Contact</div>} />
      </Routes>
    </MemoryRouter>
  );
};

beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
});

afterEach(() => {
  localStorage.clear();
  jest.useRealTimers();
});

test('adds new route to localStorage', () => {
  render(<TestWrapper initialEntries={['/about']} />);
  
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
  expect(stored.length).toBe(1);
  expect(stored[0].path).toBe('/about');
});

test('does not duplicate the same route consecutively', () => {
  const sameRoute = [
    { path: '/about', timestamp: new Date().toISOString() },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sameRoute));
  render(<TestWrapper initialEntries={['/about']} />);
  
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
  expect(stored.length).toBe(1);
});

test('caps recent activity to MAX_ENTRIES', () => {
  const manyEntries = Array.from({ length: 12 }, (_, i) => ({
    path: `/page${i}`,
    timestamp: new Date().toISOString(),
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(manyEntries));

  render(<TestWrapper initialEntries={['/newpage']} />);

  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
  expect(stored.length).toBeLessThanOrEqual(10);
  expect(stored[0].path).toBe('/newpage'); // new one should be first
});

test('records multiple unique navigations', () => {
  render(<TestWrapper initialEntries={['/', '/about', '/contact']} />);
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
  expect(stored[0].path).toBe('/contact');
  expect(stored[1].path).toBe('/about');
  expect(stored[2].path).toBe('/');
});
