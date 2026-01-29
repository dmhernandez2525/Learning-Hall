'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';

interface CourseBreakdown {
  course: {
    id: string;
    title: string;
  } | string;
  sales: number;
  revenue: number;
  refunds: number;
  revenueShare: number;
  earnings: number;
}

interface Payout {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'on_hold';
  period: {
    month: number;
    year: number;
    startDate?: string;
    endDate?: string;
  };
  earnings: {
    gross: number;
    platformFee: number;
    processingFee: number;
    refunds: number;
    adjustments: number;
    net: number;
  };
  courses?: CourseBreakdown[];
  processedAt?: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
  createdAt: string;
}

interface PayoutHistoryProps {
  payouts: Payout[];
  summary: {
    totalPaid: number;
    totalPending: number;
    completedCount: number;
    pendingCount: number;
  };
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: {
    icon: Clock,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    label: 'Pending',
  },
  processing: {
    icon: Loader2,
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
  on_hold: {
    icon: AlertCircle,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    label: 'On Hold',
  },
};

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function PayoutHistory({
  payouts,
  summary,
  loading,
  onLoadMore,
  hasMore,
  className,
}: PayoutHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatMoney = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);

  const formatPeriod = (period: Payout['period']) => {
    return `${monthNames[period.month - 1]} ${period.year}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-700">Total Paid</p>
                <p className="text-2xl font-bold text-green-800">{formatMoney(summary.totalPaid)}</p>
                <p className="text-xs text-green-600">{summary.completedCount} payouts completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-700">Pending</p>
                <p className="text-2xl font-bold text-amber-800">{formatMoney(summary.totalPending)}</p>
                <p className="text-xs text-amber-600">{summary.pendingCount} payouts pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            Payout History
          </CardTitle>
          <CardDescription>Your monthly revenue share payouts</CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Banknote className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No payouts yet</p>
              <p className="text-sm">Payouts are processed monthly</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payouts.map((payout) => {
                const status = statusConfig[payout.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                const isExpanded = expandedId === payout.id;

                return (
                  <div key={payout.id} className="border rounded-lg overflow-hidden">
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : payout.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', status.color.split(' ')[0], status.color.split(' ')[1])}>
                            <StatusIcon className={cn('w-5 h-5', payout.status === 'processing' && 'animate-spin')} />
                          </div>
                          <div>
                            <p className="font-semibold">{formatPeriod(payout.period)}</p>
                            <p className="text-sm text-muted-foreground">
                              Created {formatDate(payout.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={status.color}>
                            {status.label}
                          </Badge>
                          <span className="font-bold text-lg tabular-nums">
                            {formatMoney(payout.earnings.net)}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t bg-muted/30 p-4 space-y-4">
                        {/* Earnings Breakdown */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">Earnings Breakdown</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Gross Revenue</span>
                              <span>{formatMoney(payout.earnings.gross)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Platform Fee</span>
                              <span className="text-red-600">-{formatMoney(payout.earnings.platformFee)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Processing Fee</span>
                              <span className="text-red-600">-{formatMoney(payout.earnings.processingFee)}</span>
                            </div>
                            {payout.earnings.refunds > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Refunds</span>
                                <span className="text-red-600">-{formatMoney(payout.earnings.refunds)}</span>
                              </div>
                            )}
                            {payout.earnings.adjustments !== 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Adjustments</span>
                                <span className={payout.earnings.adjustments < 0 ? 'text-red-600' : ''}>
                                  {payout.earnings.adjustments < 0 ? '-' : ''}
                                  {formatMoney(Math.abs(payout.earnings.adjustments))}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between font-medium col-span-2 pt-2 border-t">
                              <span>Net Payout</span>
                              <span className="text-green-600">{formatMoney(payout.earnings.net)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Course Breakdown */}
                        {payout.courses && payout.courses.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">By Course</h4>
                            <div className="space-y-2">
                              {payout.courses.map((course, idx) => {
                                const courseTitle = typeof course.course === 'object'
                                  ? course.course.title
                                  : 'Unknown Course';
                                return (
                                  <div key={idx} className="flex items-center justify-between text-sm p-2 bg-background rounded">
                                    <span className="truncate">{courseTitle}</span>
                                    <div className="flex items-center gap-4 shrink-0">
                                      <span className="text-muted-foreground">{course.sales} sales</span>
                                      <span className="font-medium">{formatMoney(course.earnings)}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Failure Reason */}
                        {payout.status === 'failed' && payout.failureReason && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            <span className="font-medium">Failure Reason:</span> {payout.failureReason}
                          </div>
                        )}

                        {/* Dates */}
                        <div className="text-xs text-muted-foreground space-y-1">
                          {payout.processedAt && (
                            <p>Processed: {formatDate(payout.processedAt)}</p>
                          )}
                          {payout.completedAt && (
                            <p>Completed: {formatDate(payout.completedAt)}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {hasMore && (
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={onLoadMore} disabled={loading}>
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Load More
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
