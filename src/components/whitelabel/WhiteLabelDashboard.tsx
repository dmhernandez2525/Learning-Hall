'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, RefreshCw, Paintbrush, Settings, Globe } from 'lucide-react';
import { BrandingSettings } from './BrandingSettings';
import { FeatureToggles } from './FeatureToggles';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  branding: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    borderRadius?: string;
    customCSS?: string;
    hidePoweredBy?: boolean;
    logo?: { url: string } | null;
    logoDark?: { url: string } | null;
    logoIcon?: { url: string } | null;
    favicon?: { url: string } | null;
  };
  domain?: {
    custom?: string;
    verified?: boolean;
    sslEnabled?: boolean;
  };
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
}

interface WhiteLabelDashboardProps {
  className?: string;
}

export function WhiteLabelDashboard({ className }: WhiteLabelDashboardProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const fetchTenant = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tenant/settings');
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to load settings');
      }
      const result = await response.json();
      setTenant(result.tenant);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  const handleSaveBranding = async (updates: Partial<Tenant['branding']>) => {
    try {
      const response = await fetch('/api/tenant/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branding: { ...tenant?.branding, ...updates } }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to save');
      }
      const result = await response.json();
      setTenant(result.tenant);
      setSaveMessage('Branding settings saved successfully');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      throw err;
    }
  };

  const handleSaveFeatures = async (updates: Partial<Tenant['features']>) => {
    try {
      const response = await fetch('/api/tenant/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: { ...tenant?.features, ...updates } }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to save');
      }
      const result = await response.json();
      setTenant(result.tenant);
      setSaveMessage('Feature settings saved successfully');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading white-label settings...</p>
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
          <Button variant="outline" onClick={fetchTenant} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!tenant) return null;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Paintbrush className="w-6 h-6 text-primary" />
            White-Label Settings
          </h1>
          <p className="text-muted-foreground">
            Customize your platform&apos;s look and feel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'px-3 py-1 rounded-full text-sm font-medium',
            tenant.plan === 'free' && 'bg-slate-100 text-slate-700',
            tenant.plan === 'pro' && 'bg-blue-100 text-blue-700',
            tenant.plan === 'enterprise' && 'bg-purple-100 text-purple-700'
          )}>
            {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)} Plan
          </span>
          <Button variant="outline" size="icon" onClick={fetchTenant}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {saveMessage && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {saveMessage}
        </div>
      )}

      {/* Domain Info */}
      {tenant.domain?.custom && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Custom Domain</p>
                <p className="text-sm text-muted-foreground">
                  {tenant.domain.custom}
                  {tenant.domain.verified && (
                    <span className="ml-2 text-green-600">Verified</span>
                  )}
                  {tenant.domain.sslEnabled && (
                    <span className="ml-2 text-green-600">SSL Active</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="branding">
        <TabsList>
          <TabsTrigger value="branding" className="gap-2">
            <Paintbrush className="w-4 h-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Settings className="w-4 h-4" />
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="mt-6">
          <BrandingSettings
            branding={tenant.branding || {}}
            onSave={handleSaveBranding}
          />
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <FeatureToggles
            features={tenant.features || {}}
            plan={tenant.plan}
            onSave={handleSaveFeatures}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
