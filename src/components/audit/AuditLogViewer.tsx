'use client';

import { useState, useCallback, useEffect } from 'react';
import type { AuditLogEntry } from '@/types/audit';

export function AuditLogViewer() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/audit/logs');
    if (res.ok) {
      const data = await res.json();
      setEntries(data.docs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading audit logs...</p>;

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No audit log entries.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Audit Log</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium">User</th>
            <th className="pb-2 font-medium">Action</th>
            <th className="pb-2 font-medium">Resource</th>
            <th className="pb-2 font-medium">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} className="border-b">
              <td className="py-2">{e.userName || e.userId}</td>
              <td className="py-2">
                <span className="rounded bg-secondary px-2 py-0.5 text-xs">{e.action}</span>
              </td>
              <td className="py-2">{e.resource}/{e.resourceId}</td>
              <td className="py-2">{new Date(e.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
