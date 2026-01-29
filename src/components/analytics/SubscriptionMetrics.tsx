'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Users,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Crown,
} from 'lucide-react';

interface SubscriptionMetricsProps {
  metrics: {
    activeSubscriptions: number;
    mrr: number;
    arr: number;
    churnRate: number;
    canceledLast30Days: number;
    planDistribution: Record<string, number>;
  };
  className?: string;
}

export function SubscriptionMetrics({ metrics, className }: SubscriptionMetricsProps) {
  const formatMoney = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);

  const totalDistribution = Object.values(metrics.planDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-500" />
          Subscription Metrics
        </CardTitle>
        <CardDescription>Monthly recurring revenue and subscriber health</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">MRR</span>
            </div>
            <p className="text-xl font-bold text-green-800">{formatMoney(metrics.mrr)}</p>
          </div>

          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">ARR</span>
            </div>
            <p className="text-xl font-bold text-blue-800">{formatMoney(metrics.arr)}</p>
          </div>

          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200">
            <div className="flex items-center gap-2 text-purple-700 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Active</span>
            </div>
            <p className="text-xl font-bold text-purple-800">{metrics.activeSubscriptions}</p>
          </div>

          <div className={cn(
            'p-3 rounded-lg border',
            metrics.churnRate > 5
              ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
              : 'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200'
          )}>
            <div className={cn(
              'flex items-center gap-2 mb-1',
              metrics.churnRate > 5 ? 'text-red-700' : 'text-slate-700'
            )}>
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Churn</span>
            </div>
            <p className={cn(
              'text-xl font-bold',
              metrics.churnRate > 5 ? 'text-red-800' : 'text-slate-800'
            )}>
              {metrics.churnRate}%
            </p>
          </div>
        </div>

        {/* Churn Details */}
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">30-Day Churn</span>
            <span className="text-sm text-muted-foreground">
              {metrics.canceledLast30Days} cancellations
            </span>
          </div>
          <Progress value={Math.min(metrics.churnRate, 100)} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.churnRate <= 3 && 'Excellent retention rate'}
            {metrics.churnRate > 3 && metrics.churnRate <= 5 && 'Good retention, room for improvement'}
            {metrics.churnRate > 5 && metrics.churnRate <= 10 && 'Consider investigating churn causes'}
            {metrics.churnRate > 10 && 'High churn - action needed'}
          </p>
        </div>

        {/* Plan Distribution */}
        {Object.keys(metrics.planDistribution).length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Subscribers by Plan</h4>
            <div className="space-y-2">
              {Object.entries(metrics.planDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([planId, count]) => {
                  const percentage = totalDistribution > 0 ? Math.round((count / totalDistribution) * 100) : 0;
                  return (
                    <div key={planId} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium truncate">{planId}</span>
                          <span className="text-muted-foreground">{count} ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="h-1.5" />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
