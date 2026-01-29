'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  Loader2,
  Lock,
  Shield,
} from 'lucide-react';

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
}

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  onSubscribe?: (planId: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const planIcons: Record<string, typeof Crown> = {
  free: Sparkles,
  basic: Zap,
  pro: Crown,
  enterprise: Shield,
};

export function SubscriptionPlanCard({
  plan,
  isCurrentPlan = false,
  onSubscribe,
  disabled = false,
  className,
}: SubscriptionPlanCardProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (amount: number, currency = 'usd') =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);

  const getIntervalLabel = () => {
    const { interval, intervalCount = 1 } = plan.pricing;
    if (interval === 'one_time') return 'one-time';
    if (interval === 'year') return intervalCount > 1 ? `/ ${intervalCount} years` : '/ year';
    return intervalCount > 1 ? `/ ${intervalCount} months` : '/ month';
  };

  const handleSubscribe = () => {
    if (!onSubscribe || isCurrentPlan || pending) return;
    setError(null);
    startTransition(async () => {
      try {
        await onSubscribe(plan.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to subscribe');
      }
    });
  };

  const PlanIcon = planIcons[plan.slug] || Sparkles;
  const isFree = plan.pricing.amount === 0;

  return (
    <Card
      className={cn(
        'relative flex flex-col transition-all duration-200',
        plan.isRecommended && 'border-primary ring-2 ring-primary/20 scale-[1.02]',
        isCurrentPlan && 'border-green-500 bg-green-50/50',
        className
      )}
    >
      {/* Badge */}
      {(plan.badge || plan.isRecommended) && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm',
              plan.isRecommended
                ? 'bg-primary text-primary-foreground'
                : 'bg-amber-500 text-white'
            )}
          >
            {plan.badge || 'Recommended'}
          </span>
        </div>
      )}

      <CardHeader className={cn('text-center pb-2', (plan.badge || plan.isRecommended) && 'pt-8')}>
        <div className="mx-auto mb-3">
          <div
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center',
              plan.isRecommended ? 'bg-primary/10' : 'bg-muted'
            )}
          >
            <PlanIcon
              className={cn(
                'w-7 h-7',
                plan.isRecommended ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          </div>
        </div>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        {plan.description && (
          <CardDescription className="mt-1">{plan.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Pricing */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">
              {isFree ? 'Free' : formatPrice(plan.pricing.amount, plan.pricing.currency)}
            </span>
            {!isFree && (
              <span className="text-muted-foreground text-sm">{getIntervalLabel()}</span>
            )}
          </div>
          {plan.pricing.trialDays && plan.pricing.trialDays > 0 && (
            <p className="text-sm text-primary font-medium mt-1">
              {plan.pricing.trialDays}-day free trial
            </p>
          )}
        </div>

        {/* Features List */}
        <ul className="space-y-3 flex-1">
          {/* Access Type */}
          <li className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>
              {plan.access?.type === 'all_courses'
                ? 'Access to all courses'
                : plan.access?.type === 'specific_courses'
                ? 'Access to selected courses'
                : 'Course access included'}
            </span>
          </li>

          {/* Standard Features */}
          {plan.features?.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              {feature.included ? (
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
              )}
              <span className={!feature.included ? 'text-muted-foreground' : ''}>
                {feature.feature}
              </span>
            </li>
          ))}

          {/* Built-in features based on access config */}
          {plan.access?.certificatesIncluded && (
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Certificates of completion</span>
            </li>
          )}
          {plan.access?.downloadableContent && (
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Downloadable resources</span>
            </li>
          )}
          {plan.access?.prioritySupport && (
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Priority support</span>
            </li>
          )}

          {/* Limits */}
          {plan.limits?.maxCourses && (
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                {plan.limits.maxCourses === -1
                  ? 'Unlimited courses'
                  : `Up to ${plan.limits.maxCourses} courses`}
              </span>
            </li>
          )}
        </ul>

        {/* CTA Button */}
        <div className="mt-6 space-y-2">
          {isCurrentPlan ? (
            <div className="text-center py-3 bg-green-100 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
                <Check className="w-5 h-5" />
                Current Plan
              </div>
            </div>
          ) : (
            <Button
              onClick={handleSubscribe}
              disabled={disabled || pending}
              variant={plan.isRecommended ? 'default' : 'outline'}
              className="w-full"
              size="lg"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : isFree ? (
                'Get Started'
              ) : (
                'Subscribe Now'
              )}
            </Button>
          )}

          {/* Security Note */}
          {!isFree && !isCurrentPlan && (
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>Secure checkout via Stripe</span>
            </div>
          )}

          {/* Error */}
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
