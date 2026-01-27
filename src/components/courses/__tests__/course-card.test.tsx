import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CourseCard, CourseCardSkeleton } from '../course-card';
import type { Course } from '@/lib/courses';

const mockCourse: Course = {
  id: 'course-123',
  title: 'Introduction to TypeScript',
  slug: 'intro-to-typescript',
  shortDescription: 'Learn TypeScript from scratch',
  status: 'published',
  price: {
    amount: 4999,
    currency: 'USD',
  },
  instructor: {
    id: 'user-1',
    email: 'instructor@example.com',
    name: 'John Doe',
  },
  modules: ['mod-1', 'mod-2', 'mod-3'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

describe('CourseCard', () => {
  it('renders course title', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText('Introduction to TypeScript')).toBeInTheDocument();
  });

  it('renders course description', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText('Learn TypeScript from scratch')).toBeInTheDocument();
  });

  it('renders status badge for published courses', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('renders status badge for draft courses', () => {
    const draftCourse = { ...mockCourse, status: 'draft' as const };
    render(<CourseCard course={draftCourse} />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders status badge for archived courses', () => {
    const archivedCourse = { ...mockCourse, status: 'archived' as const };
    render(<CourseCard course={archivedCourse} />);
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('renders module count', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText('3 modules')).toBeInTheDocument();
  });

  it('renders 0 modules when modules array is empty', () => {
    const courseWithNoModules = { ...mockCourse, modules: [] };
    render(<CourseCard course={courseWithNoModules} />);
    expect(screen.getByText('0 modules')).toBeInTheDocument();
  });

  it('renders formatted price', () => {
    render(<CourseCard course={mockCourse} />);
    // Price is 4999 cents = $49.99
    expect(screen.getByText('$49.99')).toBeInTheDocument();
  });

  it('renders Free for zero price', () => {
    const freeCourse = { ...mockCourse, price: { amount: 0, currency: 'USD' } };
    render(<CourseCard course={freeCourse} />);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('renders View and Edit buttons by default', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByRole('link', { name: 'View' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument();
  });

  it('hides action buttons when showActions is false', () => {
    render(<CourseCard course={mockCourse} showActions={false} />);
    expect(screen.queryByRole('link', { name: 'View' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();
  });

  it('links to correct course detail page', () => {
    render(<CourseCard course={mockCourse} />);
    const viewLink = screen.getByRole('link', { name: 'View' });
    expect(viewLink).toHaveAttribute('href', '/dashboard/courses/course-123');
  });

  it('links to correct course edit page', () => {
    render(<CourseCard course={mockCourse} />);
    const editLink = screen.getByRole('link', { name: 'Edit' });
    expect(editLink).toHaveAttribute('href', '/dashboard/courses/course-123/edit');
  });

  it('handles course without description', () => {
    const courseWithoutDescription = { ...mockCourse, shortDescription: undefined };
    render(<CourseCard course={courseWithoutDescription} />);
    expect(screen.getByText('Introduction to TypeScript')).toBeInTheDocument();
    expect(screen.queryByText('Learn TypeScript from scratch')).not.toBeInTheDocument();
  });

  it('handles course without modules', () => {
    const courseWithoutModules = { ...mockCourse, modules: undefined };
    render(<CourseCard course={courseWithoutModules} />);
    expect(screen.getByText('0 modules')).toBeInTheDocument();
  });
});

describe('CourseCardSkeleton', () => {
  it('renders skeleton elements', () => {
    const { container } = render(<CourseCardSkeleton />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders skeleton with proper structure', () => {
    const { container } = render(<CourseCardSkeleton />);
    const skeletonElements = container.querySelectorAll('.bg-muted');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });
});
