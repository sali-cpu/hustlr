import React from 'react';
import { render, screen } from '@testing-library/react';
import Land from './Land';
import '@testing-library/jest-dom';

// Mock image imports
jest.mock('../images/jobJPG.jpg', () => 'job.jpg');
jest.mock('../images/taskJp.jpg', () => 'task.jpg');
jest.mock('../images/payment.jpg', () => 'payment.jpg');

describe('Land Component', () => {
  test('renders the "Explore Categories" title', () => {
    render(<Land />);
    expect(screen.getByText('Explore Categories')).toBeInTheDocument();
  });

  test('renders all category cards with text and images', () => {
    render(<Land />);
    
    expect(screen.getByText('Post and Apply for Jobs')).toBeInTheDocument();
    expect(screen.getByAltText('Job Icon')).toBeInTheDocument();

    expect(screen.getByText('Manage Tasks & Milestones')).toBeInTheDocument();
    expect(screen.getByAltText('Tasks Icon')).toBeInTheDocument();

    expect(screen.getByText('Secure Milestone-Based Payment')).toBeInTheDocument();
    expect(screen.getByAltText('Payment Icon')).toBeInTheDocument();
  });

  test('renders exactly 3 category cards', () => {
    render(<Land />);
    const categoryCards = screen.getAllByRole('img');
    expect(categoryCards.length).toBe(3);
  });
});
