'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Filter, ShoppingCart, BookOpen, TrendingDown, ArrowDown } from 'lucide-react';

interface FunnelStage {
  name: string;
  count: number;
  conversionRate: number;
  dropoffRate: number;
}

interface FunnelData {
  enrollment: FunnelStage[];
  learning: FunnelStage[];
  purchase: FunnelStage[];
}

interface FunnelChartProps {
  tenantId?: string;
  period?: 'week' | 'month' | 'quarter';
  className?: string;
}

function FunnelVisualization({
  stages,
  loading,
}: {
  stages: FunnelStage[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">No funnel data available</div>
    );
  }

  const maxCount = stages[0]?.count || 1;

  return (
    <div className="space-y-2">
      {stages.map((stage, index) => {
        const width = Math.max((stage.count / maxCount) * 100, 20);
        const isLast = index === stages.length - 1;

        return (
          <div key={stage.name}>
            <div className="flex items-center gap-4">
              <div
                className="relative h-14 bg-primary/10 rounded-lg overflow-hidden transition-all"
                style={{ width: `${width}%` }}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-primary/80 rounded-lg"
                  style={{ width: `${stage.conversionRate}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <span className="font-medium text-sm z-10">{stage.name}</span>
                  <span className="text-sm z-10">
                    {stage.count.toLocaleString()} ({stage.conversionRate}%)
                  </span>
                </div>
              </div>
            </div>

            {!isLast && stage.dropoffRate > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-1 pl-4">
                <ArrowDown className="h-3 w-3" />
                <TrendingDown className="h-3 w-3 text-red-500" />
                <span className="text-red-500">{stage.dropoffRate}% dropoff</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FunnelStats({ stages }: { stages: FunnelStage[] }) {
  if (stages.length < 2) return null;

  const firstStage = stages[0];
  const lastStage = stages[stages.length - 1];
  const overallConversion =
    firstStage.count > 0 ? ((lastStage.count / firstStage.count) * 100).toFixed(1) : '0';

  const avgDropoff =
    stages.reduce((sum, s) => sum + s.dropoffRate, 0) / Math.max(stages.length - 1, 1);

  const highestDropoffStage = stages.reduce((prev, curr) =>
    curr.dropoffRate > prev.dropoffRate ? curr : prev
  );

  return (
    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
      <div className="text-center">
        <p className="text-2xl font-bold text-green-600">{overallConversion}%</p>
        <p className="text-xs text-muted-foreground">Overall Conversion</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-yellow-600">{avgDropoff.toFixed(1)}%</p>
        <p className="text-xs text-muted-foreground">Avg. Dropoff</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-red-600">{highestDropoffStage.dropoffRate}%</p>
        <p className="text-xs text-muted-foreground">
          Highest Dropoff ({highestDropoffStage.name})
        </p>
      </div>
    </div>
  );
}

export function FunnelChart({ tenantId, period = 'month', className }: FunnelChartProps) {
  const [funnels, setFunnels] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enrollment' | 'learning' | 'purchase'>(
    'enrollment'
  );

  const fetchFunnels = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (tenantId) params.set('tenantId', tenantId);

      const response = await fetch(`/api/analytics/funnel?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFunnels(data.funnels);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [tenantId, period]);

  useEffect(() => {
    fetchFunnels();
  }, [fetchFunnels]);

  const getActiveStages = () => {
    if (!funnels) return [];
    return funnels[activeTab] || [];
  };

  const getIcon = () => {
    switch (activeTab) {
      case 'enrollment':
        return <ShoppingCart className="h-5 w-5" />;
      case 'learning':
        return <BookOpen className="h-5 w-5" />;
      case 'purchase':
        return <Filter className="h-5 w-5" />;
    }
  };

  const getDescription = () => {
    switch (activeTab) {
      case 'enrollment':
        return 'Track user journey from course view to purchase';
      case 'learning':
        return 'Track learner progress through lessons and quizzes';
      case 'purchase':
        return 'Track checkout funnel and conversion';
    }
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          Conversion Funnels
        </CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="enrollment" className="gap-1">
              <ShoppingCart className="h-4 w-4" />
              Enrollment
            </TabsTrigger>
            <TabsTrigger value="learning" className="gap-1">
              <BookOpen className="h-4 w-4" />
              Learning
            </TabsTrigger>
            <TabsTrigger value="purchase" className="gap-1">
              <Filter className="h-4 w-4" />
              Purchase
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <FunnelVisualization stages={getActiveStages()} loading={loading} />
            {!loading && <FunnelStats stages={getActiveStages()} />}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
