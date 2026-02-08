'use client';

import { useState, useEffect, useCallback } from 'react';
import { BundleCard } from './BundleCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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

interface FeaturedBundlesProps {
  limit?: number;
  showViewAll?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  onAddToCart?: (bundleId: string) => void;
}

export function FeaturedBundles({
  limit = 3,
  showViewAll = true,
  title = 'Featured Bundles',
  subtitle = 'Save more when you buy courses together',
  className,
  onAddToCart,
}: FeaturedBundlesProps) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeaturedBundles = useCallback(async () => {
    try {
      const response = await fetch(`/api/bundles?featured=true&limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setBundles(data.bundles);
      }
    } catch {
      // Silently fail for featured section
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFeaturedBundles();
  }, [fetchFeaturedBundles]);

  if (loading) {
    return (
      <section className={cn('py-12', className)}>
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            {showViewAll && <Skeleton className="h-10 w-28" />}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (bundles.length === 0) {
    return null;
  }

  return (
    <section className={cn('py-12', className)}>
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {showViewAll && (
            <Button variant="outline" asChild>
              <Link href="/bundles">
                View All Bundles
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle) => (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
