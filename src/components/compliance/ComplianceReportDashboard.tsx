'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ComplianceReport } from '@/types/compliance';

interface ComplianceReportDashboardProps {
  orgId?: string;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-4 text-center">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function DonutChart({ completionRate }: { completionRate: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={8}
        />
        <circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text x={50} y={55} textAnchor="middle" fontSize={16} fontWeight="bold" fill="#374151">
          {completionRate}%
        </text>
      </svg>
      <p className="text-xs text-muted-foreground mt-1">Completion Rate</p>
    </div>
  );
}

export function ComplianceReportDashboard({ orgId }: ComplianceReportDashboardProps) {
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    try {
      const url = orgId
        ? `/api/compliance/report?orgId=${orgId}`
        : '/api/compliance/report';
      const response = await fetch(url);
      if (!response.ok) return;
      const data = (await response.json()) as { doc: ComplianceReport };
      setReport(data.doc);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading report...</p>;
  }

  if (!report) {
    return <p className="text-sm text-muted-foreground">No report available.</p>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Compliance Report</h3>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Assignments" value={report.totalAssignments} />
        <StatCard label="Completed" value={report.completedCount} />
        <StatCard label="Overdue" value={report.overdueCount} />
        <StatCard label="Pending" value={report.pendingCount} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Completion Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <DonutChart completionRate={report.completionRate} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Overdue Rate</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <DonutChart completionRate={report.overdueRate} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
