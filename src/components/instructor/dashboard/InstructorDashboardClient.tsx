'use client';

import { useCallback, useEffect, useState } from 'react';
import { Menu, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CoursePerformanceTable } from './CoursePerformanceTable';
import { DashboardCharts } from './DashboardCharts';
import { DashboardStatsGrid } from './DashboardStatsGrid';
import { InsightsPanel } from './InsightsPanel';
import { InstructorSidebar } from './InstructorSidebar';
import { NotificationsPanel } from './NotificationsPanel';
import type {
  DashboardRangeKey,
  EnrollmentNotification,
  InstructorDashboardData,
} from '@/lib/instructor-dashboard/types';

interface InstructorDashboardClientProps {
  initialData: InstructorDashboardData;
}

const POLLING_ERROR_MESSAGE =
  'Live enrollment polling is temporarily unavailable. Retrying automatically.';

function mergeNotifications(
  current: EnrollmentNotification[],
  incoming: EnrollmentNotification[]
): EnrollmentNotification[] {
  const byId = new Map<string, EnrollmentNotification>();

  current.forEach((entry) => byId.set(entry.enrollmentId, entry));
  incoming.forEach((entry) => byId.set(entry.enrollmentId, entry));

  return [...byId.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 30);
}

export function InstructorDashboardClient({ initialData }: InstructorDashboardClientProps) {
  const [data, setData] = useState<InstructorDashboardData>(initialData);
  const [selectedRange, setSelectedRange] = useState<DashboardRangeKey>(initialData.dateRange.key);
  const [pollCursor, setPollCursor] = useState<string>(initialData.notificationsCursor);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const fetchDashboard = useCallback(async (range: DashboardRangeKey) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/instructor/dashboard?range=${range}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh dashboard data.');
      }

      const nextData = (await response.json()) as InstructorDashboardData;
      setData(nextData);
      setPollCursor(nextData.notificationsCursor);
      setUnreadCount(0);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Dashboard request failed.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRangeChange = (range: DashboardRangeKey) => {
    setSelectedRange(range);
    void fetchDashboard(range);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const response = await fetch(
        `/api/instructor/dashboard?range=${selectedRange}&format=csv`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Unable to export dashboard data.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `instructor-dashboard-${selectedRange}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      const message = exportError instanceof Error ? exportError.message : 'CSV export failed.';
      setError(message);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const intervalId = window.setInterval(async () => {
      try {
        const response = await fetch(
          `/api/instructor/dashboard?notificationsOnly=true&since=${encodeURIComponent(pollCursor)}`,
          { cache: 'no-store' }
        );

        if (!response.ok) {
          return;
        }

        setError((current) => (current === POLLING_ERROR_MESSAGE ? null : current));

        const payload = await response.json() as {
          notifications: EnrollmentNotification[];
          cursor: string;
        };

        if (payload.notifications.length > 0) {
          setData((current) => ({
            ...current,
            notifications: mergeNotifications(current.notifications, payload.notifications),
          }));
          setUnreadCount((count) => count + payload.notifications.length);
        }

        setPollCursor(payload.cursor);
      } catch {
        setError((current) => current ?? POLLING_ERROR_MESSAGE);
      }
    }, 20000);

    return () => window.clearInterval(intervalId);
  }, [pollCursor]);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden mb-4"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar backdrop"
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[290px] bg-background border-r p-4 transition-transform lg:fixed lg:top-[5rem] lg:h-[calc(100vh-5rem)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-3 lg:hidden">
          <p className="text-sm font-semibold">Dashboard Controls</p>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <InstructorSidebar
          selectedRange={selectedRange}
          quickActions={data.quickActions}
          isExporting={isExporting}
          onRangeChange={(range) => {
            handleRangeChange(range);
            setSidebarOpen(false);
          }}
          onExport={handleExport}
        />
      </aside>

      <main className="space-y-6 lg:pl-[312px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Instructor Dashboard</h1>
            <p className="text-sm text-muted-foreground">{data.dateRange.label}</p>
          </div>
          <Button variant="outline" onClick={() => fetchDashboard(selectedRange)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-3 text-sm text-red-700">{error}</CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Refreshing dashboard metrics...
            </CardContent>
          </Card>
        ) : (
          <>
            <DashboardStatsGrid totals={data.totals} />
            <DashboardCharts
              enrollmentsTimeline={data.enrollmentsTimeline}
              ratingTrend={data.ratingTrend}
              coursePerformance={data.coursePerformance}
              revenueByCourse={data.revenueByCourse}
            />
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <CoursePerformanceTable courses={data.coursePerformance} />
              </div>
              <div className="space-y-4">
                <NotificationsPanel
                  notifications={data.notifications}
                  unreadCount={unreadCount}
                  onMarkAllRead={() => setUnreadCount(0)}
                />
                <InsightsPanel insights={data.insights} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
