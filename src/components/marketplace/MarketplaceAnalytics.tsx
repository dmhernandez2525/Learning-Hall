'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MarketplaceAnalytics as AnalyticsData } from '@/types/marketplace';

interface MarketplaceAnalyticsProps {
  sellerId?: string;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-4 text-center">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

interface CategoryChartProps {
  categories: Array<{ category: string; count: number }>;
}

function CategoryChart({ categories }: CategoryChartProps) {
  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No category data.</p>;
  }

  const maxCount = Math.max(...categories.map((c) => c.count));
  const barMaxWidth = 200;

  return (
    <div className="space-y-2">
      {categories.map((cat) => {
        const width = maxCount > 0 ? (cat.count / maxCount) * barMaxWidth : 0;
        return (
          <div key={cat.category} className="flex items-center gap-2 text-xs">
            <span className="w-24 truncate text-right">{cat.category}</span>
            <svg width={barMaxWidth + 10} height={18}>
              <rect x={0} y={2} width={width} height={14} fill="#3b82f6" rx={2} />
              <text x={width + 4} y={13} fontSize={11} fill="#6b7280">
                {cat.count}
              </text>
            </svg>
          </div>
        );
      })}
    </div>
  );
}

export function MarketplaceAnalyticsDashboard({ sellerId }: MarketplaceAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const url = sellerId
        ? `/api/marketplace/analytics?sellerId=${sellerId}`
        : '/api/marketplace/analytics';
      const response = await fetch(url);
      if (!response.ok) return;
      const data = (await response.json()) as { doc: AnalyticsData };
      setAnalytics(data.doc);
    } finally {
      setIsLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading analytics...</p>;
  }

  if (!analytics) {
    return <p className="text-sm text-muted-foreground">No analytics available.</p>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Marketplace Analytics</h3>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Listings" value={analytics.totalListings} />
        <StatCard label="Active Listings" value={analytics.activeListings} />
        <StatCard label="Total Purchases" value={analytics.totalPurchases} />
        <StatCard
          label="Total Revenue"
          value={`$${analytics.totalRevenue.toFixed(2)}`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">
              {analytics.averageRating > 0 ? analytics.averageRating : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart categories={analytics.topCategories} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
