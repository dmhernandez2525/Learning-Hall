'use client';

import { useState, useCallback, useEffect } from 'react';
import type { AccessibilityAudit } from '@/types/accessibility';

const levelColors: Record<string, string> = { A: '#10b981', AA: '#3b82f6', AAA: '#8b5cf6' };

export function AuditResults() {
  const [audits, setAudits] = useState<AccessibilityAudit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAudits = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/accessibility/audits');
    if (res.ok) {
      const data = await res.json();
      setAudits(data.docs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchAudits();
  }, [fetchAudits]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading audits...</p>;

  if (audits.length === 0) {
    return <p className="text-sm text-muted-foreground">No accessibility audits yet.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Accessibility Audits</h2>
      <div className="space-y-2">
        {audits.map((a) => (
          <div key={a.id} className="rounded-lg border p-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Score: {a.score}/100</span>
                <span
                  className="rounded px-2 py-0.5 text-xs text-white"
                  style={{ backgroundColor: levelColors[a.wcagLevel] ?? '#6b7280' }}
                >
                  WCAG {a.wcagLevel}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{a.issues.length} issues found</p>
            </div>
            <span className="rounded bg-secondary px-2 py-0.5 text-xs">{a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
