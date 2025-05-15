import React from 'react';
import { render, screen } from '@testing-library/react';
import FQStats from './FQStats';

// Mock subcomponents
jest.mock('../components/HeaderFreelancer', () => () => <div>MockHeader</div>);
jest.mock('../components/FooterClient', () => () => <div>MockFooter</div>);

describe('FQStats Component', () => {
  beforeEach(() => {
    render(<FQStats />);
  });

  test('renders header and footer', () => {
    expect(screen.getByText('MockHeader')).toBeInTheDocument();
    expect(screen.getByText('MockFooter')).toBeInTheDocument();
  });

  test('renders the page title and navigation', () => {
    expect(screen.getByRole('heading', { level: 1, name: /Freelancer Reports/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
  });

  test('renders statistics sections with appropriate headings', () => {
    expect(screen.getByRole('heading', { name: /Jobs Applied to/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Active Jobs/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Completed Jobs/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Total Earned/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Completion Rate/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Earnings Trend/i })).toBeInTheDocument();
  });

  test('renders accessible chart for completion rate', () => {
    const completionChart = screen.getByRole('img', { name: /completion rate/i });
    expect(completionChart).toBeInTheDocument();
  });

  test('renders accessible chart for earnings trend', () => {
    const earningsChart = screen.getByRole('img', { name: /earnings growth over time/i });
    expect(earningsChart).toBeInTheDocument();
  });

  test('renders meter and progress bars with correct ARIA labels', () => {
    expect(screen.getByRole('meter')).toHaveAttribute('aria-label', expect.stringContaining('jobs applied'));
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThanOrEqual(2);
    progressBars.forEach(bar => {
      expect(bar).toHaveAttribute('aria-label', expect.stringContaining('out of'));
    });
  });
});
