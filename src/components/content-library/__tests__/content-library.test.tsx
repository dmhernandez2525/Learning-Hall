import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ContentBrowser } from '../ContentBrowser';
import { VersionHistory } from '../VersionHistory';
import { ContentLibraryAnalyticsDashboard } from '../ContentLibraryAnalyticsDashboard';

describe('ContentBrowser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<ContentBrowser />);
    expect(screen.getByText('Loading content...')).toBeInTheDocument();
  });

  it('renders content items after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          docs: [
            {
              id: 'ci-1',
              title: 'Security Policy',
              description: 'Company policy',
              contentType: 'document',
              status: 'approved',
              versionCount: 3,
              tags: ['security'],
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
        }),
    });

    render(<ContentBrowser />);

    await waitFor(() => {
      expect(screen.getByText('Security Policy')).toBeInTheDocument();
      expect(screen.getByText('approved')).toBeInTheDocument();
      expect(screen.getByText('v3')).toBeInTheDocument();
    });
  });

  it('shows empty state when no items', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<ContentBrowser />);

    await waitFor(() => {
      expect(screen.getByText('No content items found.')).toBeInTheDocument();
    });
  });
});

describe('VersionHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<VersionHistory contentItemId="ci-1" />);
    expect(screen.getByText('Loading versions...')).toBeInTheDocument();
  });

  it('renders versions after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          docs: [
            {
              id: 'ver-1',
              contentItemId: 'ci-1',
              versionNumber: 3,
              changelog: 'Updated section 5',
              fileUrl: '/files/v3.pdf',
              fileSize: 512000,
              createdBy: 'user-1',
              createdAt: '2026-02-01T00:00:00Z',
            },
          ],
        }),
    });

    render(<VersionHistory contentItemId="ci-1" />);

    await waitFor(() => {
      expect(screen.getByText('v3')).toBeInTheDocument();
      expect(screen.getByText('Updated section 5')).toBeInTheDocument();
    });
  });

  it('shows empty state when no versions', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<VersionHistory contentItemId="ci-1" />);

    await waitFor(() => {
      expect(screen.getByText('No versions yet.')).toBeInTheDocument();
    });
  });
});

describe('ContentLibraryAnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<ContentLibraryAnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders analytics after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          doc: {
            totalItems: 50,
            approvedItems: 35,
            pendingReview: 8,
            totalVersions: 120,
            itemsByType: { document: 20, video: 15, image: 10 },
          },
        }),
    });

    render(<ContentLibraryAnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('35')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('Items by Type')).toBeInTheDocument();
    });
  });

  it('shows empty state when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Not found' }),
    });

    render(<ContentLibraryAnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No analytics available.')).toBeInTheDocument();
    });
  });
});
