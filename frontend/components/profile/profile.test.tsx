import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Profile from './profile';
import type { User } from '../../types';

// Mock the form components
vi.mock('../subject/newSubjectComponent', () => ({
  default: () => <div data-testid="subject-form">Subject Form</div>
}));

vi.mock('../course/courseContainer', () => ({
  default: () => <div data-testid="course-form">Course Form</div>
}));

vi.mock('../task/taskformcomponent', () => ({
  default: () => <div data-testid="task-form">Task Form</div>
}));

describe('Profile Component', () => {
  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com'
  };

  const defaultProps = {
    currentUser: mockUser,
    currentTask: 'Profile',
    signOut: vi.fn(),
    receiveTask: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Profile {...defaultProps} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('displays the username', () => {
    render(<Profile {...defaultProps} />);
    expect(screen.getByText(/Hello testuser/)).toBeInTheDocument();
  });

  it('shows Course form when currentTask is Course', () => {
    render(<Profile {...defaultProps} currentTask="Course" />);
    expect(screen.getByTestId('course-form')).toBeInTheDocument();
  });

  it('shows Subject form when currentTask is Subject', () => {
    render(<Profile {...defaultProps} currentTask="Subject" />);
    expect(screen.getByTestId('subject-form')).toBeInTheDocument();
  });

  it('shows Task form when currentTask is Task', () => {
    render(<Profile {...defaultProps} currentTask="Task" />);
    expect(screen.getByTestId('task-form')).toBeInTheDocument();
  });

  it('calls receiveTask with "Course" when Create Course button is clicked', () => {
    const receiveTask = vi.fn();
    render(<Profile {...defaultProps} receiveTask={receiveTask} />);

    const button = screen.getByRole('button', { name: /create a new course/i });
    fireEvent.click(button);

    expect(receiveTask).toHaveBeenCalledWith('Course');
  });

  it('calls receiveTask with "Subject" when Create Subject button is clicked', () => {
    const receiveTask = vi.fn();
    render(<Profile {...defaultProps} receiveTask={receiveTask} />);

    const button = screen.getByRole('button', { name: /create a new subject/i });
    fireEvent.click(button);

    expect(receiveTask).toHaveBeenCalledWith('Subject');
  });

  it('calls receiveTask with "Task" when Create Task button is clicked', () => {
    const receiveTask = vi.fn();
    render(<Profile {...defaultProps} receiveTask={receiveTask} />);

    const button = screen.getByRole('button', { name: /create a new task/i });
    fireEvent.click(button);

    expect(receiveTask).toHaveBeenCalledWith('Task');
  });

  it('calls signOut when Sign Out button is clicked', () => {
    const signOut = vi.fn();
    render(<Profile {...defaultProps} signOut={signOut} />);

    const button = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(button);

    expect(signOut).toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    render(<Profile {...defaultProps} />);

    expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Profile page');
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Profile actions');
  });
});
