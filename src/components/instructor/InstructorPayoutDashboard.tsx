'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, RefreshCw, Wallet } from 'lucide-react';
import { EarningsOverview } from './EarningsOverview';
import { PayoutHistory } from './PayoutHistory';

interface CourseEarning {
  courseId: string;
  title: string;
  revenue: number;
  sales: number;
  instructorEarnings: number;
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
  courses?: Array<{
    course: { id: string; title: string } | string;
    sales: number;
    revenue: number;
    refunds: number;
    revenueShare: number;
    earnings: number;
  }>;
  processedAt?: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
  createdAt: string;
}

interface InstructorPayoutDashboardProps {
  className?: string;
}

export function InstructorPayoutDashboard({ className }: InstructorPayoutDashboardProps) {
  const [earnings, setEarnings] = useState<{
    totalEarnings: number;
    pendingPayout: number;
    courses: CourseEarning[];
  } | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payoutSummary, setPayoutSummary] = useState({
    totalPaid: 0,
    totalPending: 0,
    completedCount: 0,
    pendingCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchEarnings = useCallback(async () => {
    try {
      const response = await fetch(`/api/instructor/earnings?days=${days}`);
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to load earnings');
      }
      const result = await response.json();
      setEarnings({
        totalEarnings: result.totalEarnings,
        pendingPayout: result.pendingPayout,
        courses: result.courses,
      });
    } catch (err) {
      throw err;
    }
  }, [days]);

  const fetchPayouts = useCallback(async (pageNum: number, append = false) => {
    try {
      const response = await fetch(`/api/instructor/payouts?page=${pageNum}&limit=10`);
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to load payouts');
      }
      const result = await response.json();

      if (append) {
        setPayouts(prev => [...prev, ...result.payouts]);
      } else {
        setPayouts(result.payouts);
      }
      setPayoutSummary(result.summary);
      setHasMore(result.pagination.page < result.pagination.totalPages);
    } catch (err) {
      throw err;
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchEarnings(), fetchPayouts(1)]);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchEarnings, fetchPayouts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      await fetchPayouts(page + 1, true);
      setPage(page + 1);
    } catch {
      // Ignore errors on load more
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading earnings data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={fetchData} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-green-600" />
            Instructor Earnings
          </h1>
          <p className="text-muted-foreground">
            Track your revenue share and payouts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={String(days)} onValueChange={(v) => setDays(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Earnings Overview */}
      {earnings && (
        <EarningsOverview
          totalEarnings={earnings.totalEarnings}
          pendingPayout={earnings.pendingPayout}
          courses={earnings.courses}
        />
      )}

      {/* Payout History */}
      <PayoutHistory
        payouts={payouts}
        summary={payoutSummary}
        loading={loadingMore}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />
    </div>
  );
}
