import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignIn from './signin';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SignIn', () => {
  const defaultProps = {
    user: { username: '', password: '' },
    errors: [] as string[],
    signIn: vi.fn(),
    clearErrors: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sign in form', () => {
    renderWithRouter(<SignIn {...defaultProps} />);

    expect(screen.getByText('Get back to learning')).toBeInTheDocument();
    expect(screen.getByText('Login to your account')).toBeInTheDocument();
  });

  it('renders username and password inputs', () => {
    renderWithRouter(<SignIn {...defaultProps} />);

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');

    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it('renders login button', () => {
    renderWithRouter(<SignIn {...defaultProps} />);

    const loginButton = screen.getByDisplayValue('Log In');
    expect(loginButton).toBeInTheDocument();
  });

  it('renders demo button', () => {
    renderWithRouter(<SignIn {...defaultProps} />);

    const demoButton = screen.getByText('DEMO');
    expect(demoButton).toBeInTheDocument();
  });

  it('renders link to sign up page', () => {
    renderWithRouter(<SignIn {...defaultProps} />);

    const signUpLink = screen.getByText('click here sign up.');
    expect(signUpLink).toHaveAttribute('href', '/signUp');
  });

  it('updates username state when typing', () => {
    renderWithRouter(<SignIn {...defaultProps} />);

    const usernameInput = screen.getByPlaceholderText('Username') as HTMLInputElement;
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });

    expect(usernameInput.value).toBe('testuser');
  });

  it('updates password state when typing', () => {
    renderWithRouter(<SignIn {...defaultProps} />);

    const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(passwordInput.value).toBe('password123');
  });

  it('calls signIn with form data on submit', () => {
    const mockSignIn = vi.fn();
    renderWithRouter(<SignIn {...defaultProps} signIn={mockSignIn} />);

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const form = document.querySelector('.auth_form') as HTMLFormElement;

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    expect(mockSignIn).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123',
    });
  });

  it('displays errors when present', () => {
    const propsWithErrors = {
      ...defaultProps,
      errors: ['Invalid username or password', 'Please try again'],
    };

    renderWithRouter(<SignIn {...propsWithErrors} />);

    expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
    expect(screen.getByText('Please try again')).toBeInTheDocument();
  });

  it('has errors container with correct class when errors present', () => {
    const propsWithErrors = {
      ...defaultProps,
      errors: ['Error message'],
    };

    const { container } = renderWithRouter(<SignIn {...propsWithErrors} />);
    const errorsContainer = container.querySelector('.heyYou');
    expect(errorsContainer).toBeInTheDocument();
  });

  it('has no-errors class when no errors', () => {
    const { container } = renderWithRouter(<SignIn {...defaultProps} />);
    const noErrorsContainer = container.querySelector('.has-no-errors');
    expect(noErrorsContainer).toBeInTheDocument();
  });
});
