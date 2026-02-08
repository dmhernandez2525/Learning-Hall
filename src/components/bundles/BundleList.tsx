'use client';

import { useState, useEffect, useCallback } from 'react';
import { BundleCard } from './BundleCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Package, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

interface Bundle {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  thumbnail?: { url: string } | null;
  courseCount: number;
  courses: Array<{
    id: string;
    title: string;
    slug: string;
    thumbnail?: { url: string } | null;
  }>;
  pricing: {
    amount: number;
    compareAtPrice?: number;
    savings?: number;
    savingsPercent?: number;
    currency?: string;
  };
  badges?: Array<{ text: string; color?: string }>;
  isFeatured?: boolean;
}

interface BundleListProps {
  featured?: boolean;
  limit?: number;
  showPagination?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
  onAddToCart?: (bundleId: string) => void;
}

export function BundleList({
  featured,
  limit = 12,
  showPagination = true,
  columns = 3,
  className,
  onAddToCart,
}: BundleListProps) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const fetchBundles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
      });

      if (featured) {
        params.set('featured', 'true');
      }

      const response = await fetch(`/api/bundles?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bundles');
      }

      const data = await response.json();
      setBundles(data.bundles);
      setTotalPages(data.totalPages);
      setHasNextPage(data.hasNextPage);
      setHasPrevPage(data.hasPrevPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bundles');
    } finally {
      setLoading(false);
    }
  }, [featured, limit, page]);

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 gap-6', gridCols[columns], className)}>
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('text-center py-12', className)}>
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchBundles}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (bundles.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Bundles Available</h3>
        <p className="text-muted-foreground">
          Check back later for course bundles and special offers.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className={cn('grid grid-cols-1 gap-6', gridCols[columns])}>
        {bundles.map((bundle) => (
          <BundleCard
            key={bundle.id}
            bundle={bundle}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={!hasPrevPage}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-1 px-4">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNextPage}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
