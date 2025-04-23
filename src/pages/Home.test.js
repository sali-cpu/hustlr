import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from './Home';
import '@testing-library/jest-dom';

jest.mock('../components/Header', () => () => <div>Mock Header</div>);
jest.mock('../components/Footer', () => () => <div>Mock Footer</div>);

// Mock image imports (usually handled by webpack)
jest.mock('../images/HeroJPG.jpg', () => 'hero1.jpg');
jest.mock('../images/HeroJPG2.jpg', () => 'hero2.jpg');
jest.mock('../images/HeroJPG3.jpg', () => 'hero3.jpg');
jest.mock('../images/HeroJPG4.jpg', () => 'hero4.jpg');
jest.mock('../images/jobJPG.jpg', () => 'job.jpg');
jest.mock('../images/taskJp.jpg', () => 'task.jpg');
jest.mock('../images/payment.jpg', () => 'payment.jpg');
jest.mock('../images/google-logo.png', () => 'google-logo.png');
jest.mock('../images/netflix-logo.jpg', () => 'netflix-logo.jpg');
jest.mock('../images/pg-logo.jpg', () => 'pg-logo.jpg');
jest.mock('../images/paypal-logo.jpg', () => 'paypal-logo.jpg');
jest.mock('../images/payoneer-logo.jpg', () => 'payoneer-logo.jpg');

describe('Home Landing Page', () => {
  test('renders hero slider images', () => {
    render(<Home />);
    const heroImages = screen.getAllByAltText(/Hero/i);
    expect(heroImages.length).toBeGreaterThanOrEqual(8); // 8 images in loop
  });

  test('renders CTA text and buttons', () => {
    render(<Home />);
    expect(screen.getByText('Empowering Freelancers & Clients')).toBeInTheDocument();
    expect(screen.getByText('Seamlessly manage contracts, payments & Projects')).toBeInTheDocument();
    expect(screen.getByText('Find work')).toBeInTheDocument();
    expect(screen.getByText('Hire talent')).toBeInTheDocument();
  });

  test('renders trusted-by company logos', () => {
    render(<Home />);
    const logos = screen.getAllByAltText(/Logo/i);
    expect(logos.length).toBe(5);
  });

  test('renders category section and cards', () => {
    render(<Home />);
    expect(screen.getByText('Explore Categories')).toBeInTheDocument();
    expect(screen.getByText('Post and Apply for Jobs')).toBeInTheDocument();
    expect(screen.getByText('Manage Tasks & Milestones')).toBeInTheDocument();
    expect(screen.getByText('Secure Milestone-Based Payment')).toBeInTheDocument();
  });

  test('search input is present and can be typed into', () => {
    render(<Home />);
    const searchInput = screen.getByPlaceholderText('Search for any service...');
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: 'Design' } });
    expect(searchInput.value).toBe('Design');
  });
});
