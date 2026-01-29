'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  MousePointerClick,
  UserPlus,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface ReferralStatsProps {
  stats: {
    totalReferrals?: number;
    convertedReferrals?: number;
    conversionRate?: number;
    totalRevenue?: number;
  };
  monthlyStats: {
    clicks: number;
    signups: number;
    conversions: number;
    earnings: number;
  };
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | null;
  trendValue?: string;
  color: string;
}

function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', color)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-1 mt-1">
            {trend && (
              <span
                className={cn(
                  'flex items-center text-xs font-medium',
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend === 'up' ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {trendValue}
              </span>
            )}
            {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ReferralStats({ stats, monthlyStats, className }: ReferralStatsProps) {
  const formatMoney = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      <StatCard
        title="Total Clicks"
        value={stats.totalReferrals || 0}
        subtitle={`${monthlyStats.clicks} this month`}
        icon={MousePointerClick}
        color="bg-blue-100 text-blue-600"
      />
      <StatCard
        title="Signups"
        value={monthlyStats.signups}
        subtitle="this month"
        icon={UserPlus}
        color="bg-green-100 text-green-600"
      />
      <StatCard
        title="Conversions"
        value={stats.convertedReferrals || 0}
        subtitle={`${stats.conversionRate || 0}% rate`}
        icon={ShoppingCart}
        color="bg-purple-100 text-purple-600"
      />
      <StatCard
        title="Monthly Earnings"
        value={formatMoney(monthlyStats.earnings)}
        subtitle={`${formatMoney(stats.totalRevenue || 0)} total revenue`}
        icon={DollarSign}
        color="bg-amber-100 text-amber-600"
      />
    </div>
  );
}
