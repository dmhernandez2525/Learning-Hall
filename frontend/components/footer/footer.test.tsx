import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import Footer from './footer';

// Wrapper component to provide Router context
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Footer', () => {
  beforeEach(() => {
    // Set up window.logoUrl mock
    (window as any).logoUrl = '/test-logo.png';
  });

  it('renders the footer element', () => {
    renderWithRouter(<Footer />);
    const footer = document.querySelector('footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('footer');
  });

  it('renders the logo with correct alt text', () => {
    renderWithRouter(<Footer />);
    const logo = screen.getByAltText('Learning Hall Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/test-logo.png');
  });

  it('renders ABOUT section with external links', () => {
    renderWithRouter(<Footer />);

    expect(screen.getByText('ABOUT')).toBeInTheDocument();

    const portfolioLink = screen.getByText('Portfolio');
    expect(portfolioLink).toHaveAttribute('href', 'https://brainydeveloper.com/');

    const angelListLink = screen.getByText('Angel List');
    expect(angelListLink).toHaveAttribute('href', 'https://angel.co/daniel-hernandez-2525');

    const githubLink = screen.getByText('Github');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/dmhernandez2525');
  });

  it('renders CONNECT section with navigation links', () => {
    renderWithRouter(<Footer />);

    expect(screen.getByText('CONNECT')).toBeInTheDocument();

    const signInLink = screen.getByText('Sign In');
    expect(signInLink).toHaveAttribute('href', '/signIn');

    const signUpLink = screen.getByText('Sign Up');
    expect(signUpLink).toHaveAttribute('href', '/signUp');

    const homeLink = screen.getByText('Home');
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
