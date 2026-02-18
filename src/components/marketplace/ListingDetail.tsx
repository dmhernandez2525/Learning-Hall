'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MarketplaceListing, MarketplaceReview } from '@/types/marketplace';

interface ListingDetailProps {
  listingId: string;
  onPurchase?: (listingId: string) => void;
}

export function ListingDetail({ listingId, onPurchase }: ListingDetailProps) {
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [reviews, setReviews] = useState<MarketplaceReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [listingRes, reviewsRes] = await Promise.all([
        fetch(`/api/marketplace/listings/${listingId}`),
        fetch(`/api/marketplace/listings/${listingId}/reviews`),
      ]);

      if (listingRes.ok) {
        const listingData = (await listingRes.json()) as { doc: MarketplaceListing };
        setListing(listingData.doc);
      }
      if (reviewsRes.ok) {
        const reviewsData = (await reviewsRes.json()) as { docs: MarketplaceReview[] };
        setReviews(reviewsData.docs);
      }
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading listing...</p>;
  }

  if (!listing) {
    return <p className="text-sm text-muted-foreground">Listing not found.</p>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{listing.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">by {listing.sellerName}</p>
            </div>
            <span className="text-xl font-bold text-green-600">
              ${listing.price.toFixed(2)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">{listing.description}</p>
          <div className="flex flex-wrap gap-2">
            {listing.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>License: {listing.licenseType}</span>
            {listing.licenseDurationDays && (
              <span>{listing.licenseDurationDays} days</span>
            )}
            <span>{listing.purchaseCount} purchases</span>
          </div>
          {onPurchase && (
            <Button onClick={() => onPurchase(listing.id)}>Purchase Now</Button>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold">
          Reviews ({reviews.length})
        </h4>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{review.reviewerName}</span>
                  <span className="text-sm text-yellow-500">
                    {'*'.repeat(review.rating)}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-xs text-muted-foreground mt-1">{review.comment}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
