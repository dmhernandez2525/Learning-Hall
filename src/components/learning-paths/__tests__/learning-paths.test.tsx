import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PathCatalog } from '../PathCatalog';

describe('PathCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<PathCatalog onSelect={vi.fn()} />);
    expect(screen.getByText('Loading learning paths...')).toBeInTheDocument();
  });

  it('renders path cards after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [
          {
            id: 'p1',
            title: 'Web Dev Path',
            description: 'Learn web development from scratch',
            slug: 'web-dev',
            stepCount: 5,
            estimatedHours: 40,
            enrollmentCount: 120,
            status: 'published',
          },
        ],
      }),
    });

    render(<PathCatalog onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Web Dev Path')).toBeInTheDocument();
      expect(screen.getByText('5 courses')).toBeInTheDocument();
      expect(screen.getByText('40h estimated')).toBeInTheDocument();
      expect(screen.getByText('120 enrolled')).toBeInTheDocument();
    });
  });

  it('shows empty state when no paths', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<PathCatalog onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('No learning paths available.')).toBeInTheDocument();
    });
  });
});
