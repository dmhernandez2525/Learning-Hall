import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NavBar from './nav';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('NavBar', () => {
  beforeEach(() => {
    (window as any).logoUrl = '/test-logo.png';
  });

  describe('when user is not logged in', () => {
    it('renders hero section on home path', () => {
      renderWithRouter(
        <NavBar currentUser={null} signOut={vi.fn()} history="/" />
      );

      expect(screen.getByText(/Increase productivity and engagement/i)).toBeInTheDocument();
      expect(screen.getByText('logIn')).toBeInTheDocument();
    });

    it('renders sign up links on home path', () => {
      renderWithRouter(
        <NavBar currentUser={null} signOut={vi.fn()} history="/" />
      );

      const premiumLink = screen.getByText('get premium tools');
      expect(premiumLink).toHaveAttribute('href', '/signUp');

      const freeLink = screen.getByText('Continue with the free plan');
      expect(freeLink).toHaveAttribute('href', '/signUp');
    });

    it('renders testimonial text on home path', () => {
      renderWithRouter(
        <NavBar currentUser={null} signOut={vi.fn()} history="/" />
      );

      expect(
        screen.getByText(/I learned more real-world skills in 12 weeks/i)
      ).toBeInTheDocument();
    });

    it('renders auth form div on non-home path', () => {
      const { container } = renderWithRouter(
        <NavBar currentUser={null} signOut={vi.fn()} history="/signIn" />
      );

      const authFormDiv = container.querySelector('.auth-form-div');
      expect(authFormDiv).toBeInTheDocument();
    });

    it('renders logo in navbar on non-home path', () => {
      renderWithRouter(
        <NavBar currentUser={null} signOut={vi.fn()} history="/signIn" />
      );

      const logo = screen.getByAltText('Learning Hall Logo');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('when user is logged in', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    };

    it('renders hidden div on home path', () => {
      const { container } = renderWithRouter(
        <NavBar currentUser={mockUser} signOut={vi.fn()} history="/" />
      );

      const hiddenDiv = container.querySelector('.navBarDoNotUse');
      expect(hiddenDiv).toBeInTheDocument();
      expect(hiddenDiv).toHaveTextContent('do not use');
    });

    it('displays username greeting on non-home path', () => {
      renderWithRouter(
        <NavBar currentUser={mockUser} signOut={vi.fn()} history="/profile" />
      );

      expect(screen.getByText(/Hello testuser/)).toBeInTheDocument();
    });

    it('renders sign out button on non-home path', () => {
      renderWithRouter(
        <NavBar currentUser={mockUser} signOut={vi.fn()} history="/profile" />
      );

      const signOutButton = screen.getByText('Sign Out');
      expect(signOutButton).toBeInTheDocument();
    });

    it('calls signOut function when sign out button is clicked', () => {
      const mockSignOut = vi.fn();
      renderWithRouter(
        <NavBar currentUser={mockUser} signOut={mockSignOut} history="/profile" />
      );

      const signOutButton = screen.getByText('Sign Out');
      fireEvent.click(signOutButton);

      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });
});
