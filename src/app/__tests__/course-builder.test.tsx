import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Suspense } from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock confirm
global.confirm = vi.fn(() => true);

// Mock the page with resolved params
import CourseBuilderPage from '../(dashboard)/dashboard/courses/[id]/builder/page';

const mockCourse = {
  id: 'course-123',
  title: 'Test Course',
};

const mockModules = [
  {
    id: 'module-1',
    title: 'Getting Started',
    description: 'Introduction',
    position: 0,
    lessons: [
      { id: 'lesson-1', title: 'Welcome', position: 0, contentType: 'video', isPreview: true },
      { id: 'lesson-2', title: 'Setup', position: 1, contentType: 'text', isPreview: false },
    ],
  },
  {
    id: 'module-2',
    title: 'Advanced Topics',
    position: 1,
    lessons: [],
  },
];

function renderWithSuspense(courseId: string) {
  return render(
    <Suspense fallback={<div>Loading...</div>}>
      <CourseBuilderPage params={Promise.resolve({ id: courseId })} />
    </Suspense>
  );
}

describe('CourseBuilderPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/courses/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ doc: mockCourse }),
        });
      }
      if (url.includes('/api/modules')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ docs: mockModules }),
        });
      }
      return Promise.resolve({ ok: false });
    });
  });

  it('renders course builder heading', async () => {
    await act(async () => {
      renderWithSuspense('course-123');
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Course Builder' })).toBeInTheDocument();
    });
  });

  it('renders course title after loading', async () => {
    await act(async () => {
      renderWithSuspense('course-123');
    });

    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });
  });

  it('renders modules list', async () => {
    await act(async () => {
      renderWithSuspense('course-123');
    });

    await waitFor(() => {
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
      expect(screen.getByText('Advanced Topics')).toBeInTheDocument();
    });
  });

  it('renders lessons within modules', async () => {
    await act(async () => {
      renderWithSuspense('course-123');
    });

    await waitFor(() => {
      expect(screen.getByText('Welcome')).toBeInTheDocument();
      expect(screen.getByText('Setup')).toBeInTheDocument();
    });
  });

  it('shows preview badge for preview lessons', async () => {
    await act(async () => {
      renderWithSuspense('course-123');
    });

    await waitFor(() => {
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });
  });

  it('opens add module modal when clicking Add Module', async () => {
    await act(async () => {
      renderWithSuspense('course-123');
    });

    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add Module' }));
    });

    expect(screen.getByRole('heading', { name: 'Add Module' })).toBeInTheDocument();
  });

  it('opens add lesson modal when clicking Add Lesson', async () => {
    await act(async () => {
      renderWithSuspense('course-123');
    });

    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    const addLessonButtons = screen.getAllByRole('button', { name: 'Add Lesson' });

    await act(async () => {
      fireEvent.click(addLessonButtons[0]);
    });

    expect(screen.getByRole('heading', { name: 'Add Lesson' })).toBeInTheDocument();
  });

  it('closes modal when clicking Cancel', async () => {
    await act(async () => {
      renderWithSuspense('course-123');
    });

    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add Module' }));
    });

    expect(screen.getByRole('heading', { name: 'Add Module' })).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    });

    expect(screen.queryByRole('heading', { name: 'Add Module' })).not.toBeInTheDocument();
  });

  it('renders empty state when no modules', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/courses/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ doc: mockCourse }),
        });
      }
      if (url.includes('/api/modules')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ docs: [] }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    await act(async () => {
      renderWithSuspense('course-123');
    });

    await waitFor(() => {
      expect(screen.getByText('No modules yet. Add your first module to get started.')).toBeInTheDocument();
    });
  });

  it('renders error state when course not found', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/courses/')) {
        return Promise.resolve({ ok: false });
      }
      if (url.includes('/api/modules')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ docs: [] }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    await act(async () => {
      renderWithSuspense('nonexistent');
    });

    await waitFor(() => {
      expect(screen.getByText('Course not found')).toBeInTheDocument();
    });
  });

  it('has back to course link', async () => {
    await act(async () => {
      renderWithSuspense('course-123');
    });

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Back to Course' })).toBeInTheDocument();
    });
  });
});
