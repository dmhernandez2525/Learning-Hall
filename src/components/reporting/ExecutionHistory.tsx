'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ReportExecution } from '@/types/reporting';

interface ExecutionHistoryProps {
  reportId?: string;
}

export function ExecutionHistory({ reportId }: ExecutionHistoryProps) {
  const [executions, setExecutions] = useState<ReportExecution[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExecutions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (reportId) params.set('reportId', reportId);

    const res = await fetch(`/api/reports/executions?${params}`);
    if (res.ok) {
      const data = await res.json();
      setExecutions(data.docs ?? []);
    }
    setLoading(false);
  }, [reportId]);

  useEffect(() => {
    void fetchExecutions();
  }, [fetchExecutions]);

  const handleExecute = async () => {
    if (!reportId) return;
    const res = await fetch(`/api/reports/definitions/${reportId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exportFormat: 'csv' }),
    });
    if (res.ok) void fetchExecutions();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading executions...</p>;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Execution History</h2>
        {reportId && (
          <button
            onClick={() => void handleExecute()}
            className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            Run Now
          </button>
        )}
      </div>

      {executions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No executions yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-2 font-medium">Report</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Format</th>
              <th className="pb-2 font-medium">Rows</th>
              <th className="pb-2 font-medium">Started</th>
              <th className="pb-2 font-medium">Completed</th>
            </tr>
          </thead>
          <tbody>
            {executions.map((ex) => (
              <tr key={ex.id} className="border-b">
                <td className="py-2">{ex.reportName || ex.reportId}</td>
                <td className="py-2">
                  <span className={`rounded px-2 py-0.5 text-xs ${statusColors[ex.status] ?? ''}`}>
                    {ex.status}
                  </span>
                </td>
                <td className="py-2 uppercase">{ex.exportFormat}</td>
                <td className="py-2">{ex.rowCount}</td>
                <td className="py-2">{new Date(ex.startedAt).toLocaleString()}</td>
                <td className="py-2">
                  {ex.completedAt ? new Date(ex.completedAt).toLocaleString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
