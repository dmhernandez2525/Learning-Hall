import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '../(dashboard)/dashboard/page';

describe('DashboardPage', () => {
  it('renders dashboard heading', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/welcome to learning hall/i)).toBeInTheDocument();
  });

  it('renders create course button', () => {
    render(<DashboardPage />);
    const createCourseLinks = screen.getAllByRole('link', { name: /create course/i });
    expect(createCourseLinks.length).toBeGreaterThan(0);
  });

  it('renders stats cards', () => {
    render(<DashboardPage />);

    expect(screen.getByText(/total courses/i)).toBeInTheDocument();
    expect(screen.getByText(/total lessons/i)).toBeInTheDocument();
    expect(screen.getByText(/media files/i)).toBeInTheDocument();
    expect(screen.getByText(/storage used/i)).toBeInTheDocument();
  });

  it('renders quick actions section', () => {
    render(<DashboardPage />);

    expect(screen.getByRole('heading', { name: /quick actions/i })).toBeInTheDocument();
    expect(screen.getByText(/common tasks to get you started/i)).toBeInTheDocument();
  });

  it('renders getting started section', () => {
    render(<DashboardPage />);

    expect(screen.getByRole('heading', { name: /getting started/i })).toBeInTheDocument();
    // Check that steps are displayed
    expect(screen.getByText(/complete these steps/i)).toBeInTheDocument();
  });

  it('renders recent activity section', () => {
    render(<DashboardPage />);

    expect(screen.getByRole('heading', { name: /recent activity/i })).toBeInTheDocument();
    expect(screen.getByText(/no recent activity yet/i)).toBeInTheDocument();
  });

  it('has correct link to create course', () => {
    render(<DashboardPage />);
    const links = screen.getAllByRole('link', { name: /create course/i });
    expect(links[0]).toHaveAttribute('href', '/dashboard/courses/new');
  });
});
