import React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';

// Mock createRoot
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
  })),
}));

test('renders App component in root div', () => {
  // Setup mock root
  document.body.innerHTML = '<div id="root"></div>';
  require('./index'); // run the index.js file

  expect(ReactDOM.createRoot).toHaveBeenCalled();
});
