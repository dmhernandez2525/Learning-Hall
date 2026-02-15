'use client';

import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DashboardInsight } from '@/lib/instructor-dashboard/types';

interface InsightsPanelProps {
  insights: DashboardInsight[];
}

function InsightIcon({ severity }: { severity: DashboardInsight['severity'] }) {
  if (severity === 'warning') {
    return <AlertTriangle className="h-4 w-4 text-amber-600" />;
  }

  if (severity === 'success') {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  }

  return <Info className="h-4 w-4 text-blue-600" />;
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Actionable Insights</CardTitle>
        <CardDescription>Recommendations generated from current analytics.</CardDescription>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Analytics are stable. Keep monitoring this range for changes.
          </p>
        ) : (
          <ul className="space-y-3">
            {insights.map((insight) => (
              <li key={insight.id} className="rounded-md border p-3">
                <div className="flex items-start gap-2">
                  <InsightIcon severity={insight.severity} />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-5">{insight.title}</p>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                    {insight.actionLabel && insight.actionHref && (
                      <Button asChild variant="link" className="h-auto p-0 text-xs">
                        <Link href={insight.actionHref}>{insight.actionLabel}</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

