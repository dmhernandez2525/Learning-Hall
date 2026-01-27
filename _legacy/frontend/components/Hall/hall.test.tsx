import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Hall from './hall';

// Mock the dropdown nav container
vi.mock('../dropDownNav/dropDownNavContainer', () => ({
  default: () => <div data-testid="dropdown-nav">DropDown Nav</div>
}));

// Mock markdown-to-jsx
vi.mock('markdown-to-jsx', () => ({
  compiler: (text: string) => <span>{text}</span>
}));

// Mock profile component
vi.mock('../profile/profileComponent', () => ({
  default: () => <div data-testid="profile-component">Profile Component</div>
}));

describe('Hall Component', () => {
  const defaultProps = {
    currentTask: 'no task',
    receiveTask: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up DOM elements that the component expects
    document.body.innerHTML = `
      <div id="mySidenav" class="sidenav"></div>
      <div id="Main" class="main-hall-as"></div>
    `;
  });

  it('renders without crashing', () => {
    render(<Hall {...defaultProps} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders the dropdown nav container', () => {
    render(<Hall {...defaultProps} />);
    expect(screen.getByTestId('dropdown-nav')).toBeInTheDocument();
  });

  it('shows profile component when currentTask is in the words array', () => {
    render(<Hall {...defaultProps} currentTask="Profile" />);
    expect(screen.getByTestId('profile-component')).toBeInTheDocument();
  });

  it('shows markdown content when currentTask is not in the words array', () => {
    const task = '# Hello World';
    render(<Hall {...defaultProps} currentTask={task} />);
    expect(screen.getByText('# Hello World')).toBeInTheDocument();
  });

  it('calls receiveTask when Profile button is clicked', () => {
    const receiveTask = vi.fn();
    render(<Hall {...defaultProps} receiveTask={receiveTask} />);

    const profileButton = screen.getByRole('button', { name: /go to profile/i });
    fireEvent.click(profileButton);

    expect(receiveTask).toHaveBeenCalledWith('Profile');
  });

  it('renders Learn button', () => {
    render(<Hall {...defaultProps} />);
    expect(screen.getByRole('button', { name: /toggle course outline/i })).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<Hall {...defaultProps} />);

    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Main navigation');
    expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Task content');
  });
});
