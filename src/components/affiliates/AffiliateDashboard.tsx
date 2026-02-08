'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Loader2,
  AlertCircle,
  Users,
  Crown,
  Medal,
  Award,
  Star,
  RefreshCw,
} from 'lucide-react';
import { ReferralStats } from './ReferralStats';
import { BalanceCard } from './BalanceCard';
import { ShareLinks } from './ShareLinks';
import { ReferralList } from './ReferralList';
import { PayoutHistory } from './PayoutHistory';
import { Button } from '@/components/ui/button';

interface AffiliateDashboardData {
  affiliate: {
    code: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    status: 'pending' | 'active' | 'suspended' | 'rejected';
    commissionRates?: {
      courses?: number;
      bundles?: number;
      subscriptions?: number;
      recurringMonths?: number;
    };
  };
  balance: {
    available?: number;
    pending?: number;
    lifetime?: number;
  };
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
  customLinks?: Array<{
    name: string;
    slug: string;
    destination?: string;
    clicks?: number;
    conversions?: number;
  }>;
  recentReferrals: Array<{
    id: string;
    status: 'clicked' | 'signed_up' | 'converted' | 'paid' | 'refunded' | 'disputed';
    tracking?: {
      landingPage?: string;
      utmSource?: string;
      utmCampaign?: string;
    };
    purchase?: {
      type?: 'course' | 'bundle' | 'subscription';
      amount?: number;
    };
    commission?: {
      amount?: number;
      status?: 'pending' | 'approved' | 'cleared' | 'paid' | 'refunded' | 'rejected';
    };
    clickedAt: string;
    signedUpAt?: string;
    convertedAt?: string;
    createdAt: string;
  }>;
  recentPayouts: Array<{
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
  }>;
}

interface AffiliateDashboardProps {
  className?: string;
}

const tierConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  bronze: { icon: Medal, color: 'bg-orange-100 text-orange-700', label: 'Bronze' },
  silver: { icon: Award, color: 'bg-slate-100 text-slate-700', label: 'Silver' },
  gold: { icon: Crown, color: 'bg-amber-100 text-amber-700', label: 'Gold' },
  platinum: { icon: Star, color: 'bg-purple-100 text-purple-700', label: 'Platinum' },
};

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-amber-100 text-amber-700', label: 'Pending Approval' },
  active: { color: 'bg-green-100 text-green-700', label: 'Active' },
  suspended: { color: 'bg-red-100 text-red-700', label: 'Suspended' },
  rejected: { color: 'bg-gray-100 text-gray-700', label: 'Rejected' },
};

export function AffiliateDashboard({ className }: AffiliateDashboardProps) {
  const [data, setData] = useState<AffiliateDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notAffiliate, setNotAffiliate] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/affiliates/dashboard');
      const result = await response.json();

      if (!response.ok) {
        if (result.notAffiliate) {
          setNotAffiliate(true);
          return;
        }
        throw new Error(result.error || 'Failed to load dashboard');
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load affiliate dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
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
          <Button variant="outline" onClick={fetchDashboard} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (notAffiliate) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Join Our Affiliate Program
          </CardTitle>
          <CardDescription>
            Earn commissions by referring students to our courses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-2xl font-bold text-primary">20%</p>
              <p className="text-sm text-muted-foreground">Commission on courses</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-2xl font-bold text-primary">25%</p>
              <p className="text-sm text-muted-foreground">Commission on subscriptions</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-2xl font-bold text-primary">30 days</p>
              <p className="text-sm text-muted-foreground">Cookie duration</p>
            </div>
          </div>
          <Button className="w-full">Apply to Become an Affiliate</Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { affiliate, balance, stats, monthlyStats, customLinks, recentReferrals, recentPayouts } = data;
  const tier = tierConfig[affiliate.tier] || tierConfig.bronze;
  const status = statusConfig[affiliate.status] || statusConfig.pending;
  const TierIcon = tier.icon;

  // Check if affiliate is not active
  if (affiliate.status !== 'active') {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Affiliate Dashboard
            </CardTitle>
            <Badge className={status.color}>{status.label}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
            {affiliate.status === 'pending' && (
              <>
                <p className="font-medium">Your application is being reviewed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We&apos;ll notify you once your affiliate account is approved
                </p>
              </>
            )}
            {affiliate.status === 'suspended' && (
              <>
                <p className="font-medium">Your affiliate account has been suspended</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please contact support for more information
                </p>
              </>
            )}
            {affiliate.status === 'rejected' && (
              <>
                <p className="font-medium">Your application was not approved</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please contact support if you have questions
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Affiliate Dashboard</h1>
          <p className="text-muted-foreground">
            Your affiliate code: <span className="font-mono font-medium">{affiliate.code}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn('gap-1', tier.color)}>
            <TierIcon className="w-3 h-3" />
            {tier.label} Affiliate
          </Badge>
          <Badge variant="outline" className={status.color}>
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <ReferralStats stats={stats} monthlyStats={monthlyStats} />

      {/* Commission Rates */}
      {affiliate.commissionRates && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Commission Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{affiliate.commissionRates.courses || 20}%</p>
                <p className="text-sm text-muted-foreground">Courses</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{affiliate.commissionRates.bundles || 15}%</p>
                <p className="text-sm text-muted-foreground">Bundles</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{affiliate.commissionRates.subscriptions || 25}%</p>
                <p className="text-sm text-muted-foreground">Subscriptions</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{affiliate.commissionRates.recurringMonths || 12}</p>
                <p className="text-sm text-muted-foreground">Months recurring</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ShareLinks affiliateCode={affiliate.code} customLinks={customLinks} />

          <Tabs defaultValue="referrals">
            <TabsList>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
            </TabsList>
            <TabsContent value="referrals" className="mt-4">
              <ReferralList referrals={recentReferrals} />
            </TabsContent>
            <TabsContent value="payouts" className="mt-4">
              <PayoutHistory payouts={recentPayouts} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <BalanceCard balance={balance} />
        </div>
      </div>
    </div>
  );
}
