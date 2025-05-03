import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from './Home';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock components
jest.mock('../components/Header', () => () => <div>Mock Header</div>);
jest.mock('../components/Footer', () => () => <div>Mock Footer</div>);

// Mock images
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

const renderWithRouter = (ui) => render(<Router>{ui}</Router>);

describe('Home Landing Page', () => {
  test('renders hero slider images', () => {
    renderWithRouter(<Home />);
    const heroImages = screen.getAllByAltText(/Hero/i);
    expect(heroImages.length).toBe(8);
  });

  test('renders main headline and subtext', () => {
    renderWithRouter(<Home />);
    expect(screen.getByText('Empowering Freelancers & Clients')).toBeInTheDocument();
    expect(screen.getByText('Seamlessly manage contracts, payments & Projects')).toBeInTheDocument();
  });

  test('sidebar toggle button adds "show" class to sidebar', () => {
    // Create dummy elements for testing toggle behavior
    const toggle = document.createElement('button');
    toggle.id = 'dashboard-toggle';
  
    const sidebar = document.createElement('div');
    sidebar.id = 'sidebar';
  
    document.body.appendChild(toggle);
    document.body.appendChild(sidebar);
  
    renderWithRouter(<Home />);
  
    // Sidebar should NOT have 'show' initially
    expect(sidebar.classList.contains('show')).toBe(false);
  
    // Simulate click
    toggle.click();
  
    // Sidebar should now have 'show'
    expect(sidebar.classList.contains('show')).toBe(true);
  
    // Cleanup DOM
    document.body.removeChild(toggle);
    document.body.removeChild(sidebar);
  });
  

  test('renders CTA buttons', () => {
    renderWithRouter(<Home />);
    expect(screen.getByText('Find work')).toBeInTheDocument();
    expect(screen.getByText('Hire talent')).toBeInTheDocument();
  });

  test('renders trusted-by company logos', () => {
    renderWithRouter(<Home />);
    const logos = screen.getAllByAltText(/Logo/i);
    expect(logos.length).toBe(5);
  });

  test('renders category cards with correct text', () => {
    renderWithRouter(<Home />);
    expect(screen.getByText('Explore Categories')).toBeInTheDocument();
    expect(screen.getByText('Post and Apply for Jobs')).toBeInTheDocument();
    expect(screen.getByText('Manage Tasks & Milestones')).toBeInTheDocument();
    expect(screen.getByText('Secure Milestone-Based Payment')).toBeInTheDocument();
  });

  test('search input can be interacted with', () => {
    renderWithRouter(<Home />);
    const input = screen.getByPlaceholderText('Search for any service...');
    fireEvent.change(input, { target: { value: 'Logo Design' } });
    expect(input.value).toBe('Logo Design');
  });
});
