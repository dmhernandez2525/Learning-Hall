'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Crown,
  Settings,
  ExternalLink,
} from 'lucide-react';

interface Subscription {
  id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
  plan: {
    id: string;
    name: string;
    pricing: {
      amount: number;
      currency?: string;
      interval: 'month' | 'year' | 'one_time';
    };
  };
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: string;
  usage?: {
    coursesEnrolled?: number;
    downloadsUsed?: number;
    aiQuestionsUsed?: number;
  };
  stripeSubscriptionId?: string;
}

interface SubscriptionManagerProps {
  className?: string;
}

const statusConfig = {
  active: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Active',
  },
  trialing: {
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    label: 'Trial',
  },
  past_due: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Past Due',
  },
  canceled: {
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    label: 'Canceled',
  },
  incomplete: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    label: 'Incomplete',
  },
};

export function SubscriptionManager({ className }: SubscriptionManagerProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/subscriptions/current');
      if (!response.ok) throw new Error('Failed to fetch subscription');
      const data = await response.json();
      setSubscription(data.subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setActionError(null);
    startTransition(async () => {
      try {
        const response = await fetch('/api/subscriptions/cancel', {
          method: 'POST',
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to cancel subscription');
        }
        fetchSubscription();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Failed to cancel');
      }
    });
  };

  const handleReactivate = () => {
    setActionError(null);
    startTransition(async () => {
      try {
        const response = await fetch('/api/subscriptions/reactivate', {
          method: 'POST',
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to reactivate subscription');
        }
        fetchSubscription();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Failed to reactivate');
      }
    });
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/subscriptions/billing-portal', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to open billing portal');
      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to open billing');
    }
  };

  const formatPrice = (amount: number, currency = 'usd') =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

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
          <Button variant="outline" onClick={fetchSubscription} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>You don&apos;t have an active subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Subscribe to a plan to unlock full access to courses and features.
          </p>
          <Button asChild>
            <a href="/pricing">View Plans</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const status = statusConfig[subscription.status];
  const StatusIcon = status.icon;
  const daysRemaining = Math.ceil(
    (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              {subscription.plan.name}
            </CardTitle>
            <CardDescription className="mt-1">
              Your current subscription
            </CardDescription>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
              status.bgColor,
              status.color
            )}
          >
            <StatusIcon className="w-4 h-4" />
            {status.label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price and Billing Info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Billing</p>
              <p className="font-semibold">
                {formatPrice(subscription.plan.pricing.amount, subscription.plan.pricing.currency)}
                <span className="text-muted-foreground font-normal">
                  /{subscription.plan.pricing.interval}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {subscription.cancelAtPeriodEnd ? 'Expires' : 'Renews'}
              </p>
              <p className="font-semibold">
                {formatDate(subscription.currentPeriodEnd)}
                <span className="text-muted-foreground font-normal ml-1">
                  ({daysRemaining} days)
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Cancel Warning */}
        {subscription.cancelAtPeriodEnd && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Subscription Ending</p>
                <p className="text-sm text-yellow-700">
                  Your subscription will end on {formatDate(subscription.currentPeriodEnd)}.
                  You&apos;ll lose access to premium features after this date.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReactivate}
                  disabled={pending}
                  className="mt-2"
                >
                  {pending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Reactivate Subscription
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Usage (if applicable) */}
        {subscription.usage && Object.keys(subscription.usage).length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Usage This Period</h4>
            {subscription.usage.coursesEnrolled !== undefined && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Courses Enrolled</span>
                  <span className="text-muted-foreground">
                    {subscription.usage.coursesEnrolled} used
                  </span>
                </div>
                <Progress value={Math.min((subscription.usage.coursesEnrolled / 10) * 100, 100)} />
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {actionError && (
          <p className="text-sm text-destructive">{actionError}</p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={handleManageBilling}>
            <Settings className="w-4 h-4 mr-2" />
            Manage Billing
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>

          {!subscription.cancelAtPeriodEnd && subscription.status === 'active' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  Cancel Subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your subscription will remain active until {formatDate(subscription.currentPeriodEnd)}.
                    After that, you&apos;ll lose access to premium features. You can reactivate anytime before it expires.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Cancel Subscription
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
