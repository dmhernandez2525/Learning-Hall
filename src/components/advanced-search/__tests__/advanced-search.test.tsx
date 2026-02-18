import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SavedSearchList } from '../SavedSearchList';
import { SearchAnalyticsDashboard } from '../SearchAnalyticsDashboard';

describe('SavedSearchList', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<SavedSearchList />);
    expect(screen.getByText('Loading saved searches...')).toBeInTheDocument();
  });

  it('renders saved searches after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 'ss-1', name: 'JavaScript Courses',
          query: 'javascript', resultCount: 15,
          filters: [{ field: 'type', operator: 'equals', value: 'course' }],
        }],
      }),
    });

    render(<SavedSearchList />);
    await waitFor(() => {
      expect(screen.getByText('JavaScript Courses')).toBeInTheDocument();
      expect(screen.getByText('1 filters')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<SavedSearchList />);
    await waitFor(() => {
      expect(screen.getByText('No saved searches yet.')).toBeInTheDocument();
    });
  });
});

describe('SearchAnalyticsDashboard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<SearchAnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders analytics after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        doc: {
          totalSearches: 245, avgResultCount: 12,
          topQueries: { javascript: 50, react: 35 },
          searchesByType: { course: 120, lesson: 80, discussion: 45 },
        },
      }),
    });

    render(<SearchAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('245')).toBeInTheDocument();
      expect(screen.getByText('Searches by Type')).toBeInTheDocument();
    });
  });

  it('shows empty state when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, json: () => Promise.resolve({ error: 'err' }),
    });
    render(<SearchAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('No analytics available.')).toBeInTheDocument();
    });
  });
});
