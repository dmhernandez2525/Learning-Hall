import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignUp from './signup';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SignUp', () => {
  const defaultProps = {
    user: {
      username: '',
      email: '',
      password: '',
      preferred_name: '',
      pronunciation: '',
      user_role: '',
    },
    errors: [] as string[],
    signUp: vi.fn(),
    clearErrors: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sign up form', () => {
    renderWithRouter(<SignUp {...defaultProps} />);

    expect(screen.getByText('Sign up to start Learning')).toBeInTheDocument();
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });

  it('renders all form inputs', () => {
    renderWithRouter(<SignUp {...defaultProps} />);

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Preferred Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Pronunciation')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('User Role')).toBeInTheDocument();
  });

  it('renders continue button', () => {
    renderWithRouter(<SignUp {...defaultProps} />);

    const continueButton = screen.getByDisplayValue('Continue');
    expect(continueButton).toBeInTheDocument();
  });

  it('renders link to sign in page', () => {
    renderWithRouter(<SignUp {...defaultProps} />);

    const signInLink = screen.getByText('click here to login.');
    expect(signInLink).toHaveAttribute('href', '/signIn');
  });

  it('updates username when typing', () => {
    renderWithRouter(<SignUp {...defaultProps} />);

    const usernameInput = screen.getByPlaceholderText('Username') as HTMLInputElement;
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });

    expect(usernameInput.value).toBe('newuser');
  });

  it('updates email when typing', () => {
    renderWithRouter(<SignUp {...defaultProps} />);

    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput.value).toBe('test@example.com');
  });

  it('updates password when typing', () => {
    renderWithRouter(<SignUp {...defaultProps} />);

    const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'securepass' } });

    expect(passwordInput.value).toBe('securepass');
  });

  it('updates preferred name when typing', () => {
    renderWithRouter(<SignUp {...defaultProps} />);

    const preferredNameInput = screen.getByPlaceholderText('Preferred Name') as HTMLInputElement;
    fireEvent.change(preferredNameInput, { target: { value: 'Dan' } });

    expect(preferredNameInput.value).toBe('Dan');
  });

  it('calls signUp with form data on submit', () => {
    const mockSignUp = vi.fn();
    renderWithRouter(<SignUp {...defaultProps} signUp={mockSignUp} />);

    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const form = document.querySelector('.auth_form') as HTMLFormElement;

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
      })
    );
  });

  it('displays errors when present', () => {
    const propsWithErrors = {
      ...defaultProps,
      errors: ['Username is already taken', 'Password is too short'],
    };

    renderWithRouter(<SignUp {...propsWithErrors} />);

    expect(screen.getByText('Username is already taken')).toBeInTheDocument();
    expect(screen.getByText('Password is too short')).toBeInTheDocument();
  });

  it('has errors container with correct class when errors present', () => {
    const propsWithErrors = {
      ...defaultProps,
      errors: ['Error message'],
    };

    const { container } = renderWithRouter(<SignUp {...propsWithErrors} />);
    const errorsContainer = container.querySelector('.heyYou');
    expect(errorsContainer).toBeInTheDocument();
  });

  it('has no-errors class when no errors', () => {
    const { container } = renderWithRouter(<SignUp {...defaultProps} />);
    const noErrorsContainer = container.querySelector('.has-no-errors');
    expect(noErrorsContainer).toBeInTheDocument();
  });
});
