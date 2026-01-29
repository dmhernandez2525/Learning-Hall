'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  CreditCard,
  Loader2,
} from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded' | 'partially_refunded';
  courseTitle?: string;
  createdAt: string;
  receiptUrl?: string;
}

interface PaymentHistoryProps {
  initialPayments?: Payment[];
  showTitle?: boolean;
  limit?: number;
  className?: string;
}

const statusConfig: Record<
  string,
  { icon: typeof CheckCircle2; color: string; label: string }
> = {
  succeeded: {
    icon: CheckCircle2,
    color: 'text-green-600 bg-green-50',
    label: 'Completed',
  },
  pending: {
    icon: Clock,
    color: 'text-yellow-600 bg-yellow-50',
    label: 'Pending',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600 bg-red-50',
    label: 'Failed',
  },
  refunded: {
    icon: RefreshCw,
    color: 'text-gray-600 bg-gray-50',
    label: 'Refunded',
  },
  partially_refunded: {
    icon: RefreshCw,
    color: 'text-orange-600 bg-orange-50',
    label: 'Partial Refund',
  },
};

export function PaymentHistory({
  initialPayments,
  showTitle = true,
  limit = 10,
  className,
}: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments || []);
  const [loading, setLoading] = useState(!initialPayments);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/payments?page=${page}&limit=${limit}`
      );
      if (!response.ok) throw new Error('Failed to fetch payments');

      const data = await response.json();
      setPayments((prev) =>
        page === 1 ? data.payments : [...prev, ...data.payments]
      );
      setHasMore(data.hasNextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    if (!initialPayments) {
      fetchPayments();
    }
  }, [initialPayments, fetchPayments]);

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  if (loading && payments.length === 0) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Payment History
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Payment History
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <XCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchPayments}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Payment History
            {payments.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({payments.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No payments yet</p>
            <p className="text-sm mt-1">
              Your payment history will appear here after your first purchase.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {payments.map((payment) => {
                const status = statusConfig[payment.status] || statusConfig.pending;
                const StatusIcon = status.icon;

                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          status.color
                        )}
                      >
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {payment.courseTitle || 'Course Purchase'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatDate(payment.createdAt)}</span>
                          <span>·</span>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-xs font-medium',
                              status.color
                            )}
                          >
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold tabular-nums">
                          {formatCurrency(payment.amount, payment.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase">
                          {payment.currency}
                        </p>
                      </div>
                      {payment.receiptUrl && (
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View Receipt"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="text-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
