import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ListingCatalog } from '../ListingCatalog';
import { ListingDetail } from '../ListingDetail';
import { MarketplaceAnalyticsDashboard } from '../MarketplaceAnalytics';

describe('ListingCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<ListingCatalog />);
    expect(screen.getByText('Loading marketplace...')).toBeInTheDocument();
  });

  it('renders listing cards after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          docs: [
            {
              id: 'listing-1',
              title: 'React Course',
              description: 'Learn React',
              sellerId: 'user-1',
              sellerName: 'Alice',
              courseId: 'course-1',
              courseTitle: 'React Basics',
              price: 49.99,
              currency: 'USD',
              licenseType: 'unlimited',
              licenseDurationDays: null,
              status: 'active',
              category: 'Programming',
              tags: ['react'],
              previewUrl: '',
              thumbnailUrl: '',
              rating: 4.5,
              reviewCount: 10,
              purchaseCount: 25,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
        }),
    });

    render(<ListingCatalog />);

    await waitFor(() => {
      expect(screen.getByText('React Course')).toBeInTheDocument();
      expect(screen.getByText('$49.99')).toBeInTheDocument();
      expect(screen.getByText('Unlimited')).toBeInTheDocument();
      expect(screen.getByText('25 purchases')).toBeInTheDocument();
    });
  });

  it('shows empty state when no listings', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<ListingCatalog />);

    await waitFor(() => {
      expect(screen.getByText('No listings available.')).toBeInTheDocument();
    });
  });
});

describe('ListingDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<ListingDetail listingId="listing-1" />);
    expect(screen.getByText('Loading listing...')).toBeInTheDocument();
  });

  it('renders listing details and reviews', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/reviews')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              docs: [
                {
                  id: 'review-1',
                  listingId: 'listing-1',
                  reviewerId: 'user-2',
                  reviewerName: 'Bob',
                  rating: 5,
                  comment: 'Great!',
                  createdAt: '2026-02-10T00:00:00Z',
                },
              ],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            doc: {
              id: 'listing-1',
              title: 'React Course Template',
              description: 'Comprehensive course',
              sellerName: 'Alice',
              price: 49.99,
              licenseType: 'unlimited',
              tags: ['react'],
              purchaseCount: 25,
            },
          }),
      });
    });

    render(<ListingDetail listingId="listing-1" />);

    await waitFor(() => {
      expect(screen.getByText('React Course Template')).toBeInTheDocument();
      expect(screen.getByText('by Alice')).toBeInTheDocument();
      expect(screen.getByText('$49.99')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Great!')).toBeInTheDocument();
    });
  });

  it('shows not found when listing missing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Not found' }),
    });

    render(<ListingDetail listingId="nonexistent" />);

    await waitFor(() => {
      expect(screen.getByText('Listing not found.')).toBeInTheDocument();
    });
  });
});

describe('MarketplaceAnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<MarketplaceAnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders analytics after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          doc: {
            totalListings: 50,
            activeListings: 30,
            totalPurchases: 200,
            totalRevenue: 9950.0,
            averageRating: 4.3,
            topCategories: [
              { category: 'Programming', count: 20 },
              { category: 'Design', count: 10 },
            ],
          },
        }),
    });

    render(<MarketplaceAnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('$9950.00')).toBeInTheDocument();
      expect(screen.getByText('4.3')).toBeInTheDocument();
      expect(screen.getByText('Programming')).toBeInTheDocument();
    });
  });

  it('shows empty analytics state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Not found' }),
    });

    render(<MarketplaceAnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No analytics available.')).toBeInTheDocument();
    });
  });
});
