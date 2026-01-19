import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Toast from './Toast';
import { ToastProvider, useToast } from './ToastContext';
import ToastContainer from './ToastContainer';

describe('Toast Component', () => {
  const mockToast = {
    id: 'test-1',
    message: 'Test message',
    type: 'info' as const,
    duration: 5000
  };

  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the toast message', () => {
    render(<Toast toast={mockToast} onClose={onClose} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders with success styling', () => {
    const successToast = { ...mockToast, type: 'success' as const };
    render(<Toast toast={successToast} onClose={onClose} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders with error styling', () => {
    const errorToast = { ...mockToast, type: 'error' as const };
    render(<Toast toast={errorToast} onClose={onClose} />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });

  it('renders with warning styling', () => {
    const warningToast = { ...mockToast, type: 'warning' as const };
    render(<Toast toast={warningToast} onClose={onClose} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<Toast toast={mockToast} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close notification/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledWith('test-1');
  });

  it('has proper accessibility attributes', () => {
    render(<Toast toast={mockToast} onClose={onClose} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
  });
});

describe('ToastContext', () => {
  const TestComponent = () => {
    const { addToast, toasts } = useToast();

    return (
      <div>
        <button onClick={() => addToast('Test toast', 'success')}>Add Toast</button>
        <div data-testid="toast-count">{toasts.length}</div>
      </div>
    );
  };

  it('provides toast context to children', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });

  it('adds toast when addToast is called', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Toast'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
  });

  it('throws error when useToast is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');

    consoleError.mockRestore();
  });
});

describe('ToastContainer', () => {
  it('renders nothing when there are no toasts', () => {
    render(
      <ToastProvider>
        <ToastContainer />
      </ToastProvider>
    );

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('renders toasts when they exist', () => {
    const TestComponent = () => {
      const { addToast } = useToast();

      React.useEffect(() => {
        addToast('Test toast message', 'info');
      }, [addToast]);

      return <ToastContainer />;
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByText('Test toast message')).toBeInTheDocument();
  });
});
