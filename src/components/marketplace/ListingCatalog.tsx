'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MarketplaceListing } from '@/types/marketplace';

interface ListingCatalogProps {
  onSelect?: (listing: MarketplaceListing) => void;
  onPurchase?: (listingId: string) => void;
}

const licenseLabels: Record<MarketplaceListing['licenseType'], string> = {
  'single-use': 'Single Use',
  unlimited: 'Unlimited',
  'time-limited': 'Time Limited',
};

export function ListingCatalog({ onSelect, onPurchase }: ListingCatalogProps) {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchListings = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      const response = await fetch(`/api/marketplace/listings?${params.toString()}`);
      if (!response.ok) return;
      const data = (await response.json()) as { docs: MarketplaceListing[] };
      setListings(data.docs);
    } finally {
      setIsLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    void fetchListings();
  }, [fetchListings]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading marketplace...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Content Marketplace</h3>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border px-3 py-1.5 text-sm"
        />
        <input
          type="text"
          placeholder="Category..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border px-3 py-1.5 text-sm"
        />
      </div>

      {listings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No listings available.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Card
              key={listing.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelect?.(listing)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">{listing.title}</CardTitle>
                  <span className="text-sm font-bold text-green-600">
                    ${listing.price.toFixed(2)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {listing.description}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline">{licenseLabels[listing.licenseType]}</Badge>
                  {listing.category && (
                    <Badge variant="secondary">{listing.category}</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {listing.rating > 0
                      ? `${listing.rating}/5 (${listing.reviewCount} reviews)`
                      : 'No reviews yet'}
                  </span>
                  <span>{listing.purchaseCount} purchases</span>
                </div>
                {onPurchase && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPurchase(listing.id);
                    }}
                  >
                    Purchase
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
