'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RevenueByPeriod {
  period: string;
  revenue: number;
  transactions: number;
}

interface RevenueChartProps {
  data: RevenueByPeriod[];
  period: 'day' | 'week' | 'month';
  className?: string;
}

export function RevenueChart({ data, period, className }: RevenueChartProps) {
  const formatMoney = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
    }).format(cents / 100);

  const formatPeriodLabel = (periodStr: string) => {
    const date = new Date(periodStr);
    switch (period) {
      case 'day':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'week':
        return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'month':
        const [year, month] = periodStr.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      default:
        return periodStr;
    }
  };

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
          <CardDescription>No revenue data available for this period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalTransactions = data.reduce((sum, d) => sum + d.transactions, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>
              {formatMoney(totalRevenue)} total from {totalTransactions} transactions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Simple bar chart */}
        <div className="space-y-3">
          {data.map((item, index) => {
            const widthPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{formatPeriodLabel(item.period)}</span>
                  <span className="font-medium">{formatMoney(item.revenue)}</span>
                </div>
                <div className="h-8 bg-muted rounded-md overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${widthPercent}%` }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {item.transactions} {item.transactions === 1 ? 'sale' : 'sales'}
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
