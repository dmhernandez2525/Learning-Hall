'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Settings,
  MessageSquare,
  Star,
  Award,
  Trophy,
  Users,
  CreditCard,
  Package,
  Tag,
  Save,
  Loader2,
} from 'lucide-react';

interface FeatureTogglesProps {
  features: {
    enableDiscussions?: boolean;
    enableReviews?: boolean;
    enableCertificates?: boolean;
    enableGamification?: boolean;
    enableAffiliates?: boolean;
    enableSubscriptions?: boolean;
    enableBundles?: boolean;
    enableCoupons?: boolean;
  };
  plan: 'free' | 'pro' | 'enterprise';
  onSave: (updates: Partial<FeatureTogglesProps['features']>) => Promise<void>;
  className?: string;
}

interface FeatureConfig {
  key: keyof FeatureTogglesProps['features'];
  label: string;
  description: string;
  icon: React.ElementType;
  minPlan: 'free' | 'pro' | 'enterprise';
}

const featureConfigs: FeatureConfig[] = [
  {
    key: 'enableDiscussions',
    label: 'Discussions',
    description: 'Allow students to ask questions and discuss course content',
    icon: MessageSquare,
    minPlan: 'free',
  },
  {
    key: 'enableReviews',
    label: 'Course Reviews',
    description: 'Let students rate and review your courses',
    icon: Star,
    minPlan: 'free',
  },
  {
    key: 'enableCertificates',
    label: 'Certificates',
    description: 'Award completion certificates to students',
    icon: Award,
    minPlan: 'free',
  },
  {
    key: 'enableGamification',
    label: 'Gamification',
    description: 'Points, badges, streaks, and leaderboards',
    icon: Trophy,
    minPlan: 'pro',
  },
  {
    key: 'enableAffiliates',
    label: 'Affiliate Program',
    description: 'Allow users to earn commissions by referring students',
    icon: Users,
    minPlan: 'pro',
  },
  {
    key: 'enableSubscriptions',
    label: 'Subscriptions',
    description: 'Offer subscription-based access to courses',
    icon: CreditCard,
    minPlan: 'pro',
  },
  {
    key: 'enableBundles',
    label: 'Course Bundles',
    description: 'Sell multiple courses together at a discount',
    icon: Package,
    minPlan: 'pro',
  },
  {
    key: 'enableCoupons',
    label: 'Discount Coupons',
    description: 'Create promotional codes and discounts',
    icon: Tag,
    minPlan: 'free',
  },
];

const planLevel = { free: 0, pro: 1, enterprise: 2 };

export function FeatureToggles({ features, plan, onSave, className }: FeatureTogglesProps) {
  const [formData, setFormData] = useState(features);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (key: keyof typeof features, value: boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  const canAccessFeature = (minPlan: 'free' | 'pro' | 'enterprise') => {
    return planLevel[plan] >= planLevel[minPlan];
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Feature Toggles
        </CardTitle>
        <CardDescription>Enable or disable platform features for your site</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {featureConfigs.map((config) => {
            const Icon = config.icon;
            const isAccessible = canAccessFeature(config.minPlan);
            const isEnabled = formData[config.key] ?? true;

            return (
              <div
                key={config.key}
                className={cn(
                  'flex items-start justify-between p-4 rounded-lg border',
                  !isAccessible && 'bg-muted/50 opacity-60'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">{config.label}</Label>
                      {config.minPlan !== 'free' && (
                        <Badge variant="outline" className="text-xs">
                          {config.minPlan.charAt(0).toUpperCase() + config.minPlan.slice(1)}+
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {config.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => handleToggle(config.key, checked)}
                  disabled={!isAccessible}
                />
              </div>
            );
          })}
        </div>

        {plan !== 'enterprise' && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
            <p className="font-medium text-purple-800">Unlock More Features</p>
            <p className="text-sm text-purple-600 mt-1">
              Upgrade to {plan === 'free' ? 'Pro or Enterprise' : 'Enterprise'} to access additional features
            </p>
            <Button variant="outline" className="mt-3" size="sm">
              View Upgrade Options
            </Button>
          </div>
        )}

        {hasChanges && (
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
