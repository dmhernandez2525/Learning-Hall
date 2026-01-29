'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BookOpen, Package, Repeat, Gift } from 'lucide-react';

interface ProductTypeBreakdownProps {
  data: Record<string, { revenue: number; count: number }>;
  className?: string;
}

const productTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  course_purchase: { label: 'Course Sales', icon: BookOpen, color: 'bg-blue-500' },
  bundle_purchase: { label: 'Bundle Sales', icon: Package, color: 'bg-purple-500' },
  subscription: { label: 'Subscriptions', icon: Repeat, color: 'bg-green-500' },
  subscription_renewal: { label: 'Renewals', icon: Repeat, color: 'bg-emerald-500' },
  gift: { label: 'Gift Purchases', icon: Gift, color: 'bg-pink-500' },
  other: { label: 'Other', icon: BookOpen, color: 'bg-gray-500' },
};

export function ProductTypeBreakdown({ data, className }: ProductTypeBreakdownProps) {
  const formatMoney = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);

  const entries = Object.entries(data);
  const totalRevenue = entries.reduce((sum, [, d]) => sum + d.revenue, 0);

  if (entries.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Revenue by Product Type</CardTitle>
          <CardDescription>No revenue data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by revenue descending
  const sortedEntries = entries.sort((a, b) => b[1].revenue - a[1].revenue);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Revenue by Product Type</CardTitle>
        <CardDescription>Breakdown of revenue sources</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stacked bar */}
        <div className="h-4 rounded-full overflow-hidden flex bg-muted">
          {sortedEntries.map(([type, data]) => {
            const config = productTypeConfig[type] || productTypeConfig.other;
            const widthPercent = totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0;
            return (
              <div
                key={type}
                className={cn('h-full transition-all', config.color)}
                style={{ width: `${widthPercent}%` }}
                title={`${config.label}: ${formatMoney(data.revenue)}`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid gap-3">
          {sortedEntries.map(([type, data]) => {
            const config = productTypeConfig[type] || productTypeConfig.other;
            const Icon = config.icon;
            const percentage = totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0;

            return (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn('w-3 h-3 rounded-full', config.color)} />
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{config.label}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{formatMoney(data.revenue)}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {percentage}% ({data.count} {data.count === 1 ? 'sale' : 'sales'})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
