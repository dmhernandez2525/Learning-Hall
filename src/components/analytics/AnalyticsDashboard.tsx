'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Activity,
  Filter,
  Users,
  BookOpen,
  RefreshCw,
  Download,
} from 'lucide-react';

import { OverviewCards } from './OverviewCard';
import { EngagementChart } from './EngagementChart';
import { FunnelChart } from './FunnelChart';
import { CohortTable } from './CohortTable';
import { LearningMetrics } from './LearningMetrics';
import { UserSegments } from './UserSegments';

interface OverviewMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  newEnrollments: number;
  completionRate: number;
  avgTimeOnPlatform: number;
  revenue: number;
  revenueGrowth: number;
}

interface AnalyticsDashboardProps {
  tenantId?: string;
  isAdmin?: boolean;
  className?: string;
}

type Period = 'day' | 'week' | 'month' | 'quarter' | 'year';

export function AnalyticsDashboard({
  tenantId,
  isAdmin = false,
  className,
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState<Period>('month');
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (tenantId) params.set('tenantId', tenantId);

      const response = await fetch(`/api/analytics/overview?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOverviewMetrics(data.metrics);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [tenantId, period]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleExport = async () => {
    try {
      const data = {
        exportDate: new Date().toISOString(),
        period,
        overview: overviewMetrics,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${period}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track performance, engagement, and learning outcomes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24h</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="overview" className="gap-1">
            <LayoutDashboard className="h-4 w-4 hidden md:inline" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="engagement" className="gap-1">
            <Activity className="h-4 w-4 hidden md:inline" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="funnels" className="gap-1">
            <Filter className="h-4 w-4 hidden md:inline" />
            Funnels
          </TabsTrigger>
          <TabsTrigger value="learning" className="gap-1">
            <BookOpen className="h-4 w-4 hidden md:inline" />
            Learning
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="users" className="gap-1">
              <Users className="h-4 w-4 hidden md:inline" />
              Users
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <OverviewCards metrics={overviewMetrics || undefined} loading={loading} />
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="mt-6">
          <EngagementChart
            tenantId={tenantId}
            period={period === 'day' ? 'week' : period === 'year' ? 'quarter' : period}
          />
        </TabsContent>

        {/* Funnels Tab */}
        <TabsContent value="funnels" className="mt-6">
          <FunnelChart
            tenantId={tenantId}
            period={period === 'day' ? 'week' : period === 'year' ? 'quarter' : period}
          />
        </TabsContent>

        {/* Learning Tab */}
        <TabsContent value="learning" className="mt-6">
          <LearningMetrics tenantId={tenantId} />
        </TabsContent>

        {/* Users Tab (Admin only) */}
        {isAdmin && (
          <TabsContent value="users" className="mt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <UserSegments tenantId={tenantId} />
              <CohortTable tenantId={tenantId} />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
