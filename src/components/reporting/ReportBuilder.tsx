'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ReportDefinition } from '@/types/reporting';

interface ReportBuilderProps {
  organizationId?: string;
}

export function ReportBuilder({ organizationId }: ReportBuilderProps) {
  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [reportType, setReportType] = useState<ReportDefinition['reportType']>('enrollment');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (organizationId) params.set('organizationId', organizationId);

    const res = await fetch(`/api/reports/definitions?${params}`);
    if (res.ok) {
      const data = await res.json();
      setReports(data.docs ?? []);
    }
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const handleCreate = async () => {
    if (!name.trim() || !organizationId) return;

    const res = await fetch('/api/reports/definitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        organizationId,
        reportType,
        columns: [{ key: 'id', label: 'ID', dataType: 'string', sortable: true }],
      }),
    });

    if (res.ok) {
      setName('');
      setShowForm(false);
      void fetchReports();
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading reports...</p>;

  const typeLabels: Record<string, string> = {
    enrollment: 'Enrollment',
    completion: 'Completion',
    compliance: 'Compliance',
    revenue: 'Revenue',
    engagement: 'Engagement',
    custom: 'Custom',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Report Builder</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
        >
          {showForm ? 'Cancel' : 'New Report'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border p-4 space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Report name"
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportDefinition['reportType'])}
            className="w-full rounded border px-3 py-2 text-sm"
          >
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button
            onClick={() => void handleCreate()}
            className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            Create Report
          </button>
        </div>
      )}

      {reports.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reports configured.</p>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{r.name}</h3>
                  <p className="text-sm text-muted-foreground">{r.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-secondary px-2 py-0.5 text-xs">
                    {typeLabels[r.reportType] ?? r.reportType}
                  </span>
                  <span className="rounded bg-secondary px-2 py-0.5 text-xs">
                    {r.status}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{r.columns.length} columns</span>
                <span>{r.filters.length} filters</span>
                {r.schedule && <span>Scheduled: {r.schedule.frequency}</span>}
                {r.lastRunAt && <span>Last run: {new Date(r.lastRunAt).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
