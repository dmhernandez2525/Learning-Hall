'use client';

import { useState, useEffect } from 'react';
import { SubscriptionPlanCard } from './SubscriptionPlanCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';

interface SubscriptionPlanFeature {
  feature: string;
  included: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  features?: SubscriptionPlanFeature[];
  pricing: {
    amount: number;
    currency?: string;
    interval: 'month' | 'year' | 'one_time';
    intervalCount?: number;
    trialDays?: number;
  };
  access?: {
    type: 'all_courses' | 'specific_courses' | 'categories' | 'tiers';
    downloadableContent?: boolean;
    prioritySupport?: boolean;
    certificatesIncluded?: boolean;
  };
  limits?: {
    maxCourses?: number | null;
    maxDownloads?: number | null;
    maxAIQuestions?: number | null;
  };
  badge?: string;
  isRecommended?: boolean;
  displayOrder?: number;
}

interface PricingTableProps {
  initialPlans?: SubscriptionPlan[];
  currentPlanId?: string;
  showBillingToggle?: boolean;
  className?: string;
}

export function PricingTable({
  initialPlans,
  currentPlanId,
  showBillingToggle = true,
  className,
}: PricingTableProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans || []);
  const [loading, setLoading] = useState(!initialPlans);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');

  useEffect(() => {
    if (!initialPlans) {
      fetchPlans();
    }
  }, [initialPlans]);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/subscription-plans');
      if (!response.ok) throw new Error('Failed to fetch plans');
      const data = await response.json();
      setPlans(data.docs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    const response = await fetch('/api/subscriptions/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create checkout session');
    }

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  // Filter plans based on billing cycle
  const filteredPlans = plans.filter((plan) => {
    if (plan.pricing.interval === 'one_time') return true;
    return plan.pricing.interval === billingCycle;
  });

  // Sort by display order
  const sortedPlans = [...filteredPlans].sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );

  // Calculate yearly savings
  const getYearlySavings = () => {
    const monthlyPlans = plans.filter((p) => p.pricing.interval === 'month');
    const yearlyPlans = plans.filter((p) => p.pricing.interval === 'year');

    if (monthlyPlans.length === 0 || yearlyPlans.length === 0) return null;

    const avgMonthlyCost = monthlyPlans.reduce((acc, p) => acc + p.pricing.amount, 0) / monthlyPlans.length;
    const avgYearlyCost = yearlyPlans.reduce((acc, p) => acc + p.pricing.amount, 0) / yearlyPlans.length;
    const monthlyYearCost = avgMonthlyCost * 12;

    if (monthlyYearCost <= avgYearlyCost) return null;

    const savings = Math.round(((monthlyYearCost - avgYearlyCost) / monthlyYearCost) * 100);
    return savings > 0 ? savings : null;
  };

  const yearlySavings = getYearlySavings();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={fetchPlans} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (sortedPlans.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No subscription plans available at this time.
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Billing Cycle Toggle */}
      {showBillingToggle && plans.some((p) => p.pricing.interval === 'year') && (
        <div className="flex items-center justify-center gap-4 mb-8">
          <Label
            htmlFor="billing-toggle"
            className={billingCycle === 'month' ? 'font-medium' : 'text-muted-foreground'}
          >
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={billingCycle === 'year'}
            onCheckedChange={(checked) => setBillingCycle(checked ? 'year' : 'month')}
          />
          <div className="flex items-center gap-2">
            <Label
              htmlFor="billing-toggle"
              className={billingCycle === 'year' ? 'font-medium' : 'text-muted-foreground'}
            >
              Yearly
            </Label>
            {yearlySavings && billingCycle === 'year' && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                Save {yearlySavings}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div
        className={`grid grid-cols-1 gap-6 ${
          sortedPlans.length === 1
            ? 'max-w-md mx-auto'
            : sortedPlans.length === 2
            ? 'md:grid-cols-2 max-w-3xl mx-auto'
            : sortedPlans.length === 3
            ? 'md:grid-cols-3 max-w-5xl mx-auto'
            : 'md:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {sortedPlans.map((plan) => (
          <SubscriptionPlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={plan.id === currentPlanId}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          All plans include a 30-day money-back guarantee. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
