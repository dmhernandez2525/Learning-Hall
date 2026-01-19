import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskLink from './taskLink';
import type { Task } from '../../types';

describe('TaskLink Component', () => {
  const mockTask: Task = {
    id: 1,
    name: 'Test Task',
    body: 'Task body content',
    duration: 30,
    completed: false,
    author_id: 1,
    subject_id: 1
  };

  const defaultProps = {
    task: mockTask,
    receiveTask: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<TaskLink {...defaultProps} />);
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });

  it('displays the task name', () => {
    render(<TaskLink {...defaultProps} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('displays the task duration', () => {
    render(<TaskLink {...defaultProps} />);
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('shows checkmark for completed tasks', () => {
    const completedTask = { ...mockTask, completed: true };
    render(<TaskLink {...defaultProps} task={completedTask} />);
    expect(screen.getByLabelText('Completed')).toBeInTheDocument();
  });

  it('shows X mark for incomplete tasks', () => {
    render(<TaskLink {...defaultProps} />);
    expect(screen.getByLabelText('Not completed')).toBeInTheDocument();
  });

  it('calls receiveTask with task body when clicked', () => {
    const receiveTask = vi.fn();
    render(<TaskLink {...defaultProps} receiveTask={receiveTask} />);

    const button = screen.getByRole('button', { name: /open task/i });
    fireEvent.click(button);

    expect(receiveTask).toHaveBeenCalledWith('Task body content');
  });

  it('has proper accessibility attributes', () => {
    render(<TaskLink {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Open task: Test Task');

    // The time element is inside the button, check its aria-label
    const time = screen.getByLabelText('Duration: 30 minutes');
    expect(time).toBeInTheDocument();
  });
});
