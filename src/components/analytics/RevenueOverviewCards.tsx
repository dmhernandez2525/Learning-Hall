'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  RotateCcw,
  ShoppingCart,
  Percent,
} from 'lucide-react';

interface RevenueOverviewProps {
  stats: {
    totalRevenue: number;
    netRevenue: number;
    totalRefunds: number;
    transactionCount: number;
    averageOrderValue: number;
    refundRate: number;
  };
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, subtitle, icon: Icon, iconColor, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className={cn(
            'flex items-center text-xs mt-1',
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            <TrendingUp className={cn('w-3 h-3 mr-1', !trend.isPositive && 'rotate-180')} />
            {trend.value}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RevenueOverviewCards({ stats, className }: RevenueOverviewProps) {
  const formatMoney = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6', className)}>
      <StatCard
        title="Total Revenue"
        value={formatMoney(stats.totalRevenue)}
        icon={DollarSign}
        iconColor="bg-green-100 text-green-600"
      />
      <StatCard
        title="Net Revenue"
        value={formatMoney(stats.netRevenue)}
        subtitle="After fees & refunds"
        icon={TrendingUp}
        iconColor="bg-blue-100 text-blue-600"
      />
      <StatCard
        title="Transactions"
        value={stats.transactionCount.toLocaleString()}
        icon={CreditCard}
        iconColor="bg-purple-100 text-purple-600"
      />
      <StatCard
        title="Avg Order Value"
        value={formatMoney(stats.averageOrderValue)}
        icon={ShoppingCart}
        iconColor="bg-amber-100 text-amber-600"
      />
      <StatCard
        title="Total Refunds"
        value={formatMoney(stats.totalRefunds)}
        icon={RotateCcw}
        iconColor="bg-red-100 text-red-600"
      />
      <StatCard
        title="Refund Rate"
        value={`${stats.refundRate}%`}
        icon={Percent}
        iconColor="bg-slate-100 text-slate-600"
      />
    </div>
  );
}
