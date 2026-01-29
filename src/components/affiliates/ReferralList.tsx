'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  MousePointerClick,
  UserPlus,
  ShoppingCart,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

interface Referral {
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
}

interface ReferralListProps {
  referrals: Referral[];
  className?: string;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  clicked: {
    icon: MousePointerClick,
    color: 'bg-blue-100 text-blue-700',
    label: 'Clicked',
  },
  signed_up: {
    icon: UserPlus,
    color: 'bg-green-100 text-green-700',
    label: 'Signed Up',
  },
  converted: {
    icon: ShoppingCart,
    color: 'bg-purple-100 text-purple-700',
    label: 'Converted',
  },
  paid: {
    icon: CheckCircle2,
    color: 'bg-emerald-100 text-emerald-700',
    label: 'Paid',
  },
  refunded: {
    icon: XCircle,
    color: 'bg-red-100 text-red-700',
    label: 'Refunded',
  },
  disputed: {
    icon: Clock,
    color: 'bg-amber-100 text-amber-700',
    label: 'Disputed',
  },
};

const commissionStatusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Pending' },
  approved: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Approved' },
  cleared: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Cleared' },
  paid: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Paid' },
  refunded: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Refunded' },
  rejected: { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Rejected' },
};

export function ReferralList({ referrals, className }: ReferralListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMoney = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);

  if (referrals.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
          <CardDescription>Track your affiliate referrals and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MousePointerClick className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No referrals yet</p>
            <p className="text-sm">Share your affiliate links to start earning!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Referrals</CardTitle>
        <CardDescription>Track your affiliate referrals and their status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {referrals.map((referral) => {
            const status = statusConfig[referral.status] || statusConfig.clicked;
            const StatusIcon = status.icon;
            const commissionStatus = referral.commission?.status
              ? commissionStatusConfig[referral.commission.status]
              : null;

            return (
              <div
                key={referral.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card"
              >
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', status.color)}>
                  <StatusIcon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className={status.color}>
                      {status.label}
                    </Badge>
                    {referral.purchase?.type && (
                      <Badge variant="outline" className="capitalize">
                        {referral.purchase.type}
                      </Badge>
                    )}
                    {commissionStatus && (
                      <Badge variant="outline" className={commissionStatus.color}>
                        {commissionStatus.label}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-1 text-sm text-muted-foreground">
                    {referral.tracking?.landingPage && (
                      <span className="block truncate">
                        Landing: {referral.tracking.landingPage}
                      </span>
                    )}
                    {referral.tracking?.utmSource && (
                      <span className="block">
                        Source: {referral.tracking.utmSource}
                        {referral.tracking.utmCampaign && ` / ${referral.tracking.utmCampaign}`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Clicked: {formatDate(referral.clickedAt)}</span>
                    {referral.signedUpAt && (
                      <span>Signed up: {formatDate(referral.signedUpAt)}</span>
                    )}
                    {referral.convertedAt && (
                      <span>Converted: {formatDate(referral.convertedAt)}</span>
                    )}
                  </div>
                </div>

                {referral.commission?.amount !== undefined && referral.commission.amount > 0 && (
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-green-600">
                      {formatMoney(referral.commission.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">Commission</p>
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
