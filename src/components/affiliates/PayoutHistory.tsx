'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowDownToLine,
} from 'lucide-react';

interface Payout {
  id: string;
  amount: number;
  currency?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'canceled';
  method: 'paypal' | 'bank' | 'stripe';
  period: {
    start: string;
    end: string;
  };
  breakdown?: {
    grossAmount?: number;
    fees?: number;
    referralCount?: number;
  };
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}

interface PayoutHistoryProps {
  payouts: Payout[];
  className?: string;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: {
    icon: Clock,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    label: 'Pending',
  },
  processing: {
    icon: ArrowDownToLine,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    label: 'Processing',
  },
  completed: {
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700 border-green-200',
    label: 'Completed',
  },
  failed: {
    icon: XCircle,
    color: 'bg-red-100 text-red-700 border-red-200',
    label: 'Failed',
  },
  canceled: {
    icon: AlertCircle,
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    label: 'Canceled',
  },
};

const methodLabels: Record<string, string> = {
  paypal: 'PayPal',
  bank: 'Bank Transfer',
  stripe: 'Stripe',
};

export function PayoutHistory({ payouts, className }: PayoutHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatMoney = (cents: number, currency = 'usd') =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);

  if (payouts.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Your commission payouts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Banknote className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No payouts yet</p>
            <p className="text-sm">Payouts will appear here once you reach the minimum threshold</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Payout History</CardTitle>
        <CardDescription>Your commission payouts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {payouts.map((payout) => {
            const status = statusConfig[payout.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <div
                key={payout.id}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', status.color.split(' ')[0], status.color.split(' ')[1])}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {formatMoney(payout.amount, payout.currency)}
                        </span>
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        via {methodLabels[payout.method] || payout.method}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{formatDate(payout.createdAt)}</p>
                    {payout.completedAt && (
                      <p className="text-green-600">
                        Completed {formatDate(payout.completedAt)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Breakdown */}
                {payout.breakdown && (
                  <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Period</p>
                      <p className="font-medium">
                        {formatDate(payout.period.start)} - {formatDate(payout.period.end)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Referrals</p>
                      <p className="font-medium">{payout.breakdown.referralCount || 0}</p>
                    </div>
                    {payout.breakdown.fees !== undefined && payout.breakdown.fees > 0 && (
                      <div>
                        <p className="text-muted-foreground">Fees</p>
                        <p className="font-medium text-red-600">
                          -{formatMoney(payout.breakdown.fees, payout.currency)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Failure reason */}
                {payout.status === 'failed' && payout.failureReason && (
                  <div className="mt-3 p-2 rounded bg-red-50 text-sm text-red-700">
                    {payout.failureReason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
