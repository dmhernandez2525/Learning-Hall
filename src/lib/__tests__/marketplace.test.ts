import { describe, it, expect } from 'vitest';
import {
  formatListing,
  formatPurchase,
  formatReview,
} from '../marketplace';

describe('formatListing', () => {
  it('maps a full listing document', () => {
    const doc: Record<string, unknown> = {
      id: 'listing-1',
      title: 'React Course Template',
      description: 'A comprehensive React course',
      seller: { id: 'user-1', name: 'Alice', email: 'alice@test.com' },
      course: { id: 'course-1', title: 'React Basics' },
      price: 49.99,
      currency: 'USD',
      licenseType: 'unlimited',
      licenseDurationDays: null,
      status: 'active',
      category: 'Programming',
      tags: ['react', 'frontend'],
      previewUrl: 'https://example.com/preview',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      rating: 4.5,
      reviewCount: 12,
      purchaseCount: 42,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatListing(doc);
    expect(result.id).toBe('listing-1');
    expect(result.title).toBe('React Course Template');
    expect(result.sellerId).toBe('user-1');
    expect(result.sellerName).toBe('Alice');
    expect(result.courseTitle).toBe('React Basics');
    expect(result.price).toBe(49.99);
    expect(result.licenseType).toBe('unlimited');
    expect(result.tags).toEqual(['react', 'frontend']);
    expect(result.rating).toBe(4.5);
    expect(result.purchaseCount).toBe(42);
  });

  it('handles string references', () => {
    const doc: Record<string, unknown> = {
      id: 'listing-2',
      seller: 'user-2',
      course: 'course-2',
      price: 0,
      status: 'draft',
    };

    const result = formatListing(doc);
    expect(result.sellerId).toBe('user-2');
    expect(result.sellerName).toBe('');
    expect(result.courseId).toBe('course-2');
    expect(result.courseTitle).toBe('');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'listing-3' };
    const result = formatListing(doc);
    expect(result.title).toBe('');
    expect(result.price).toBe(0);
    expect(result.currency).toBe('USD');
    expect(result.licenseType).toBe('single-use');
    expect(result.licenseDurationDays).toBeNull();
    expect(result.tags).toEqual([]);
    expect(result.rating).toBe(0);
  });
});

describe('formatPurchase', () => {
  it('maps a purchase document', () => {
    const doc: Record<string, unknown> = {
      id: 'purchase-1',
      listing: 'listing-1',
      buyer: 'user-2',
      seller: 'user-1',
      price: 49.99,
      currency: 'USD',
      licenseType: 'unlimited',
      licenseExpiresAt: null,
      status: 'completed',
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatPurchase(doc);
    expect(result.id).toBe('purchase-1');
    expect(result.listingId).toBe('listing-1');
    expect(result.buyerId).toBe('user-2');
    expect(result.price).toBe(49.99);
    expect(result.status).toBe('completed');
    expect(result.licenseExpiresAt).toBeNull();
  });

  it('maps populated object references', () => {
    const doc: Record<string, unknown> = {
      id: 'purchase-2',
      listing: { id: 'listing-2' },
      buyer: { id: 'user-3' },
      seller: { id: 'user-4' },
      price: 29.99,
      status: 'pending',
      licenseExpiresAt: '2026-06-01T00:00:00Z',
      createdAt: '2026-02-15T00:00:00Z',
    };

    const result = formatPurchase(doc);
    expect(result.listingId).toBe('listing-2');
    expect(result.buyerId).toBe('user-3');
    expect(result.sellerId).toBe('user-4');
    expect(result.licenseExpiresAt).toBe('2026-06-01T00:00:00Z');
  });
});

describe('formatReview', () => {
  it('maps a review document', () => {
    const doc: Record<string, unknown> = {
      id: 'review-1',
      listing: 'listing-1',
      reviewer: { id: 'user-5', name: 'Bob', email: 'bob@test.com' },
      rating: 5,
      comment: 'Excellent course content!',
      createdAt: '2026-02-10T00:00:00Z',
    };

    const result = formatReview(doc);
    expect(result.id).toBe('review-1');
    expect(result.listingId).toBe('listing-1');
    expect(result.reviewerId).toBe('user-5');
    expect(result.reviewerName).toBe('Bob');
    expect(result.rating).toBe(5);
    expect(result.comment).toBe('Excellent course content!');
  });

  it('falls back to email if name missing', () => {
    const doc: Record<string, unknown> = {
      id: 'review-2',
      listing: 'listing-1',
      reviewer: { id: 'user-6', email: 'jane@test.com' },
      rating: 4,
      comment: '',
      createdAt: '2026-02-10T00:00:00Z',
    };

    const result = formatReview(doc);
    expect(result.reviewerName).toBe('jane@test.com');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'review-3' };
    const result = formatReview(doc);
    expect(result.rating).toBe(0);
    expect(result.comment).toBe('');
  });
});
